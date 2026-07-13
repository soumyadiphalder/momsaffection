<?php
// backend/api/admin/messages.php

require_once __DIR__ . '/../../config/db.php';
require_once __DIR__ . '/../../config/auth_helper.php';

$user = getAuthenticatedUser();

if ($user['role_id'] !== 'ADMIN') {
    http_response_code(403);
    echo json_encode(["success" => false, "message" => "Access forbidden. Admin role required."]);
    exit();
}

$method = $_SERVER['REQUEST_METHOD'];

try {
    if ($method === 'GET') {
        // Fetch all contact messages
        $stmt = $pdo->query("
            SELECT * FROM MM_CONTACT_US 
            ORDER BY CREATED_AT DESC
        ");
        $messages = $stmt->fetchAll();
        echo json_encode(["success" => true, "messages" => $messages]);
        
    } elseif ($method === 'DELETE') {
        $contactId = $_GET['contact_id'] ?? '';
        
        if (empty($contactId)) {
            http_response_code(400);
            echo json_encode(["success" => false, "message" => "contact_id parameter is required."]);
            exit();
        }
        
        $stmt = $pdo->prepare("DELETE FROM MM_CONTACT_US WHERE CONTACT_ID = ?");
        $stmt->execute([$contactId]);
        
        echo json_encode(["success" => true, "message" => "Message deleted successfully."]);
    } else {
        http_response_code(405);
        echo json_encode(["success" => false, "message" => "Method Not Allowed"]);
    }
} catch (\Exception $e) {
    http_response_code(500);
    echo json_encode(["success" => false, "message" => "Server error: " . $e->getMessage()]);
}
?>
