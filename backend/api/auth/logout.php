<?php
// backend/api/auth/logout.php

require_once __DIR__ . '/../../config/db.php';
require_once __DIR__ . '/../../config/auth_helper.php';

// If authenticated, record last logout timestamp.
$token = getBearerToken();
if ($token) {
    $decoded = validateToken($token);
    if ($decoded && isset($decoded['user_id'])) {
        try {
            $stmt = $pdo->prepare("UPDATE MM_USER_LOGIN SET USER_LAST_LOGOUT = ? WHERE USER_ID = ?");
            $stmt->execute([date('Y-m-d H:i:s'), $decoded['user_id']]);
        } catch (\Exception $e) {
            // Ignore logout update errors, still allow overall logout to succeed.
        }
    }
}

echo json_encode([
    "success" => true,
    "message" => "Logged out successfully."
]);
?>
