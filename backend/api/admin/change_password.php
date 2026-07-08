<?php
// backend/api/admin/change_password.php

require_once __DIR__ . '/../../config/db.php';
require_once __DIR__ . '/../../config/auth_helper.php';

// Secure endpoint - Admins only
$user = getAuthenticatedUser();
if ($user['role_id'] !== 'ADMIN') {
    http_response_code(403);
    echo json_encode(["success" => false, "message" => "Access Denied: Admin authorization required."]);
    exit();
}

$method = $_SERVER['REQUEST_METHOD'];

try {
    if ($method === 'POST') {
        $data = json_decode(file_get_contents("php://input"), true);
        
        $targetUserId = trim($data['user_id'] ?? '');
        $newPassword = trim($data['new_password'] ?? '');
        
        if (empty($newPassword)) {
            http_response_code(400);
            echo json_encode(["success" => false, "message" => "New Password is required."]);
            exit();
        }
        
        if (strlen($newPassword) < 6) {
            http_response_code(400);
            echo json_encode(["success" => false, "message" => "Password must be at least 6 characters long."]);
            exit();
        }
        
        // If user_id is empty, assume changing own password
        if (empty($targetUserId)) {
            $targetUserId = $user['user_id'];
        }
        
        // Check if user exists
        $stmtCheck = $pdo->prepare("SELECT USER_ID, USER_EMAIL FROM MM_USER_LOGIN WHERE USER_ID = ?");
        $stmtCheck->execute([$targetUserId]);
        $targetUser = $stmtCheck->fetch();
        
        if (!$targetUser) {
            http_response_code(404);
            echo json_encode(["success" => false, "message" => "User account not found."]);
            exit();
        }
        
        // Hash password
        $hashedPassword = password_hash($newPassword, PASSWORD_BCRYPT, ['cost' => 12]);
        
        // Update password
        $stmt = $pdo->prepare("UPDATE MM_USER_LOGIN SET USER_PASSWORD = ? WHERE USER_ID = ?");
        $stmt->execute([$hashedPassword, $targetUserId]);
        
        $isOwn = ($targetUserId === $user['user_id']);
        $msg = $isOwn 
            ? "Your password has been changed successfully." 
            : "Password for user '{$targetUser['USER_EMAIL']}' has been updated successfully.";
            
        echo json_encode([
            "success" => true,
            "message" => $msg
        ]);
        
    } else {
        http_response_code(405);
        echo json_encode(["success" => false, "message" => "Method Not Allowed"]);
    }
} catch (\Exception $e) {
    http_response_code(500);
    echo json_encode(["success" => false, "message" => "Server error: " . $e->getMessage()]);
}
?>
