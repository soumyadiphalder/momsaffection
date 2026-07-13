<?php
// backend/api/auth/login.php

require_once __DIR__ . '/../../config/db.php';
require_once __DIR__ . '/../../config/auth_helper.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(["success" => false, "message" => "Method Not Allowed"]);
    exit();
}

$data = json_decode(file_get_contents('php://input'), true);
$username = trim($data['username'] ?? '');
$password = $data['password'] ?? '';

if (empty($username) || empty($password)) {
    http_response_code(400);
    echo json_encode(["success" => false, "message" => "Username and password are required."]);
    exit();
}

try {
    $stmt = $pdo->prepare("SELECT * FROM MM_USER_LOGIN WHERE USER_EMAIL = ? OR USER_MOBILE = ? LIMIT 1");
    $stmt->execute([$username, $username]);
    $user = $stmt->fetch();

    if (!$user || !password_verify($password, $user['USER_PASSWORD'])) {
        http_response_code(401);
        echo json_encode(["success" => false, "message" => "Invalid credentials."]);
        exit();
    }

    if ($user['USER_STATUS'] !== 'ACTIVE') {
        http_response_code(403);
        echo json_encode(["success" => false, "message" => "Your account is not active."]);
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
        "message" => "Login successful.",
        "token" => $token,
        "user" => $responseUser
    ]);
} catch (\Exception $e) {
    if ($pdo->inTransaction()) {
        $pdo->rollBack();
    }
    http_response_code(500);
    echo json_encode(["success" => false, "message" => "Server error: " . $e->getMessage()]);
}
?>