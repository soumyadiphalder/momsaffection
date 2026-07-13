<?php
// backend/api/auth/google_login.php

require_once __DIR__ . '/../../config/db.php';
require_once __DIR__ . '/../../config/auth_helper.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(["success" => false, "message" => "Method Not Allowed"]);
    exit();
}

$data = json_decode(file_get_contents('php://input'), true);
$credential = trim($data['credential'] ?? '');

if (empty($credential)) {
    http_response_code(400);
    echo json_encode(["success" => false, "message" => "Google credentials are required."]);
    exit();
}

// Verify token with Google's tokeninfo API via cURL
$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, "https://oauth2.googleapis.com/tokeninfo?id_token=" . urlencode($credential));
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, true);
$response = curl_exec($ch);
$http_code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

if ($http_code !== 200 || empty($response)) {
    http_response_code(401);
    echo json_encode(["success" => false, "message" => "Invalid Google account credentials."]);
    exit();
}

$token_data = json_decode($response, true);

$clientId = getenv('GOOGLE_CLIENT_ID') ?: '674668838593-s6esaop1j5qf4or3jaaqkc0eo6jvi0nu.apps.googleusercontent.com';
if (!isset($token_data['aud']) || $token_data['aud'] !== $clientId) {
    http_response_code(400);
    echo json_encode(["success" => false, "message" => "Audience mismatch. Invalid Client ID."]);
    exit();
}

if (!isset($token_data['email']) || !isset($token_data['email_verified']) || ($token_data['email_verified'] !== 'true' && $token_data['email_verified'] !== true)) {
    http_response_code(400);
    echo json_encode(["success" => false, "message" => "Google email not verified or unavailable."]);
    exit();
}

$email = trim($token_data['email']);
$name = trim($token_data['name'] ?? 'Google User');
$picture = trim($token_data['picture'] ?? '');

try {
    // Check if user already exists
    $stmt = $pdo->prepare("SELECT * FROM MM_USER_LOGIN WHERE USER_EMAIL = ? LIMIT 1");
    $stmt->execute([$email]);
    $user = $stmt->fetch();

    if ($user) {
        // Log in existing user
        if ($user['USER_STATUS'] !== 'ACTIVE') {
            http_response_code(403);
            echo json_encode(["success" => false, "message" => "Your account is blocked."]);
            exit();
        }

        $pdo->beginTransaction();
        $now = date('Y-m-d H:i:s');
        $stmtUpdate = $pdo->prepare("UPDATE MM_USER_LOGIN SET USER_LAST_LOGIN = ? WHERE USER_ID = ?");
        $stmtUpdate->execute([$now, $user['USER_ID']]);
        $pdo->commit();

        $responseUser = [
            'user_id' => $user['USER_ID'],
            'role' => $user['USER_ROLE_ID'],
            'email' => $user['USER_EMAIL'],
            'mobile' => $user['USER_MOBILE'],
            'status' => $user['USER_STATUS'],
            'last_login' => $now,
            'last_logout' => $user['USER_LAST_LOGOUT'] ?? null
        ];

        // Load details depending on role
        if ($user['USER_ROLE_ID'] === 'ADMIN') {
            $stmtAdmin = $pdo->prepare("SELECT ADMIN_NAME, ADMIN_IMAGE, ADMIN_ADDRESS FROM MM_ADMIN WHERE USER_ID = ? LIMIT 1");
            $stmtAdmin->execute([$user['USER_ID']]);
            $admin = $stmtAdmin->fetch();
            if ($admin) {
                $responseUser['name'] = $admin['ADMIN_NAME'];
                $responseUser['image'] = $admin['ADMIN_IMAGE'];
                $responseUser['address'] = $admin['ADMIN_ADDRESS'];
            }
        } else {
            $stmtCust = $pdo->prepare("SELECT CUSTOMER_NAME, CUSTOMER_IMAGE, CUSTOMER_ADDRESS, CUSTOMER_CITY, CUSTOMER_STATE, CUSTOMER_PINCODE, CUSTOMER_GENDER, CUSTOMER_DOB FROM MM_CUSTOMER WHERE USER_ID = ? LIMIT 1");
            $stmtCust->execute([$user['USER_ID']]);
            $customer = $stmtCust->fetch();
            if ($customer) {
                $responseUser['name'] = $customer['CUSTOMER_NAME'];
                $responseUser['image'] = $customer['CUSTOMER_IMAGE'];
                $responseUser['address'] = $customer['CUSTOMER_ADDRESS'];
                $responseUser['city'] = $customer['CUSTOMER_CITY'];
                $responseUser['state'] = $customer['CUSTOMER_STATE'];
                $responseUser['pincode'] = $customer['CUSTOMER_PINCODE'];
                $responseUser['gender'] = $customer['CUSTOMER_GENDER'];
                $responseUser['dob'] = $customer['CUSTOMER_DOB'];
            }
        }

        $token = generateToken($user['USER_ID'], $user['USER_ROLE_ID']);

        echo json_encode([
            "success" => true,
            "message" => "Google Login successful.",
            "token" => $token,
            "user" => $responseUser
        ]);
        exit();

    } else {
        // Register new customer
        $pdo->beginTransaction();

        $userId = 'usr_' . bin2hex(random_bytes(8));
        $customerId = 'cust_' . bin2hex(random_bytes(8));
        $hashedPassword = password_hash(bin2hex(random_bytes(16)), PASSWORD_BCRYPT, ['cost' => 12]);
        
        // Generate unique placeholder mobile number fitting VARCHAR(15)
        $mobile = 'G-' . substr(md5($email), 0, 13);

        // Store picture URL if it's within VARCHAR(255)
        $profileImage = (strlen($picture) <= 255) ? $picture : null;

        // Write login credentials
        $stmtUser = $pdo->prepare("INSERT INTO MM_USER_LOGIN (USER_ID, USER_ROLE_ID, USER_EMAIL, USER_MOBILE, USER_PASSWORD, USER_STATUS) VALUES (?, 'CUSTOMER', ?, ?, ?, 'ACTIVE')");
        $stmtUser->execute([$userId, $email, $mobile, $hashedPassword]);

        // Write customer profile
        $stmtCust = $pdo->prepare("INSERT INTO MM_CUSTOMER (CUSTOMER_ID, USER_ID, CUSTOMER_NAME, CUSTOMER_IMAGE) VALUES (?, ?, ?, ?)");
        $stmtCust->execute([$customerId, $userId, $name, $profileImage]);

        $now = date('Y-m-d H:i:s');
        $stmtUpdate = $pdo->prepare("UPDATE MM_USER_LOGIN SET USER_LAST_LOGIN = ? WHERE USER_ID = ?");
        $stmtUpdate->execute([$now, $userId]);

        $pdo->commit();

        $responseUser = [
            'user_id' => $userId,
            'role' => 'CUSTOMER',
            'email' => $email,
            'mobile' => $mobile,
            'status' => 'ACTIVE',
            'last_login' => $now,
            'last_logout' => null,
            'name' => $name,
            'image' => $profileImage,
            'address' => null,
            'city' => null,
            'state' => null,
            'pincode' => null,
            'gender' => null,
            'dob' => null
        ];

        $token = generateToken($userId, 'CUSTOMER');

        echo json_encode([
            "success" => true,
            "message" => "Google registration and login successful. Welcome!",
            "token" => $token,
            "user" => $responseUser
        ]);
        exit();
    }

} catch (\Exception $e) {
    if ($pdo->inTransaction()) {
        $pdo->rollBack();
    }
    http_response_code(500);
    echo json_encode(["success" => false, "message" => "Server error occurred: " . $e->getMessage()]);
}
?>
