<?php
// backend/api/admin/reviews.php

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
        // Fetch all customer reviews grouped by product base
        $stmt = $pdo->query("
            SELECT r.*, p.PRODUCT_NAME, p.PRODUCT_IMAGE, c.CUSTOMER_NAME 
            FROM MM_PRODUCT_REVIEW r 
            JOIN MM_PRODUCT p ON r.PRODUCT_ID = p.PRODUCT_ID
            JOIN MM_CUSTOMER c ON r.CUSTOMER_ID = c.CUSTOMER_ID
            ORDER BY r.REVIEW_DATE DESC
        ");
        $reviews = $stmt->fetchAll();
        echo json_encode(["success" => true, "reviews" => $reviews]);
        
    } elseif ($method === 'DELETE') {
        $reviewId = $_GET['review_id'] ?? '';
        
        if (empty($reviewId)) {
            http_response_code(400);
            echo json_encode(["success" => false, "message" => "review_id parameter is required."]);
            exit();
        }
        
        $stmt = $pdo->prepare("DELETE FROM MM_PRODUCT_REVIEW WHERE REVIEW_ID = ?");
        $stmt->execute([$reviewId]);
        
        echo json_encode(["success" => true, "message" => "Review deleted successfully."]);
    } else {
        http_response_code(405);
        echo json_encode(["success" => false, "message" => "Method Not Allowed"]);
    }
} catch (\Exception $e) {
    http_response_code(500);
    echo json_encode(["success" => false, "message" => "Server error: " . $e->getMessage()]);
}
?>
