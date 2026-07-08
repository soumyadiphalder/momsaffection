<?php
// backend/api/auth/register.php

require_once __DIR__ . '/../../config/db.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(["success" => false, "message" => "Method Not Allowed"]);
    exit();
}

$data = json_decode(file_get_contents("php://input"), true);

if (empty($data['email']) || empty($data['mobile']) || empty($data['name']) || empty($data['password'])) {
    http_response_code(400);
    echo json_encode(["success" => false, "message" => "Missing required fields: email, mobile, name, and password are required."]);
    exit();
}

$email = trim($data['email']);
$mobile = trim($data['mobile']);
$name = trim($data['name']);
$password = $data['password'];

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    http_response_code(400);
    echo json_encode(["success" => false, "message" => "Invalid email address format."]);
    exit();
}

try {
    // Check for duplicate credentials
    $stmt = $pdo->prepare("SELECT USER_ID FROM MM_USER_LOGIN WHERE USER_EMAIL = ? OR USER_MOBILE = ?");
    $stmt->execute([$email, $mobile]);
    if ($stmt->fetch()) {
        http_response_code(400);
        echo json_encode(["success" => false, "message" => "Email or Mobile Number is already registered."]);
        exit();
    }
    
    // Insert record with transactional integrity
    $pdo->beginTransaction();
    
    $userId = 'usr_' . bin2hex(random_bytes(8));
    $customerId = 'cust_' . bin2hex(random_bytes(8));
    $hashedPassword = password_hash($password, PASSWORD_BCRYPT, ['cost' => 12]);
    
    // Write login credentials
    $stmtUser = $pdo->prepare("INSERT INTO MM_USER_LOGIN (USER_ID, USER_ROLE_ID, USER_EMAIL, USER_MOBILE, USER_PASSWORD, USER_STATUS) VALUES (?, 'CUSTOMER', ?, ?, ?, 'ACTIVE')");
    $stmtUser->execute([$userId, $email, $mobile, $hashedPassword]);
    
    // Write customer profile
    $stmtCust = $pdo->prepare("INSERT INTO MM_CUSTOMER (CUSTOMER_ID, USER_ID, CUSTOMER_NAME) VALUES (?, ?, ?)");
    $stmtCust->execute([$customerId, $userId, $name]);
    
    $pdo->commit();
    
    http_response_code(201);
    echo json_encode([
        "success" => true,
        "message" => "Registration successful. Welcome to MomsAffection!"
    ]);
} catch (\Exception $e) {
    if ($pdo->inTransaction()) {
        $pdo->rollBack();
    }
    http_response_code(500);
    echo json_encode(["success" => false, "message" => "Server error occurred: " . $e->getMessage()]);
}
?>
