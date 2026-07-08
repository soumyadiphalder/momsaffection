<?php
// backend/api/auth/forgot_password.php

require_once __DIR__ . '/../../config/db.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(["success" => false, "message" => "Method Not Allowed"]);
    exit();
}

$data = json_decode(file_get_contents("php://input"), true);

$email = trim($data['email'] ?? '');
$mobile = trim($data['mobile'] ?? '');
$oldPassword = trim($data['old_password'] ?? '');
$newPassword = trim($data['new_password'] ?? '');

if (empty($email) || empty($mobile) || empty($oldPassword) || empty($newPassword)) {
    http_response_code(400);
    echo json_encode(["success" => false, "message" => "Email, Mobile, Old Password and New Password are required fields."]);
    exit();
}

if (strlen($newPassword) < 6) {
    http_response_code(400);
    echo json_encode(["success" => false, "message" => "New password must be at least 6 characters long."]);
    exit();
}

try {
    // Look up customer user with matching email and mobile
    $stmt = $pdo->prepare("SELECT * FROM MM_USER_LOGIN WHERE USER_EMAIL = ? AND USER_MOBILE = ? AND USER_ROLE_ID = 'CUSTOMER'");
    $stmt->execute([$email, $mobile]);
    $user = $stmt->fetch();
    
    if (!$user) {
        http_response_code(404);
        echo json_encode(["success" => false, "message" => "No matching customer account found with those credentials."]);
        exit();
    }
    
    if ($user['USER_STATUS'] === 'BLOCKED') {
        http_response_code(403);
        echo json_encode(["success" => false, "message" => "Cannot reset password. This account is currently deactivated."]);
        exit();
    }
    
    // Verify old password
    if (!password_verify($oldPassword, $user['USER_PASSWORD'])) {
        http_response_code(401);
        echo json_encode(["success" => false, "message" => "The old password you entered is incorrect."]);
        exit();
    }
    
    // Hash and update
    $hashedPassword = password_hash($newPassword, PASSWORD_BCRYPT, ['cost' => 12]);
    $updateStmt = $pdo->prepare("UPDATE MM_USER_LOGIN SET USER_PASSWORD = ? WHERE USER_ID = ?");
    $updateStmt->execute([$hashedPassword, $user['USER_ID']]);
    
    echo json_encode(["success" => true, "message" => "Your password has been changed successfully. Please login with your new password."]);
} catch (\Exception $e) {
    http_response_code(500);
    echo json_encode(["success" => false, "message" => "Server error: " . $e->getMessage()]);
}
?>
