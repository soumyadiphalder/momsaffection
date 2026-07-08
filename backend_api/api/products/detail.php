<?php
// backend/api/products/detail.php

require_once __DIR__ . '/../../config/db.php';
require_once __DIR__ . '/../../config/auth_helper.php';

$method = $_SERVER['REQUEST_METHOD'];

try {
    if ($method === 'GET') {
        $productId = $_GET['product_id'] ?? '';
        
        if (empty($productId)) {
            http_response_code(400);
            echo json_encode(["success" => false, "message" => "product_id is required."]);
            exit();
        }
        
        // Retrieve product specs
        $stmt = $pdo->prepare("SELECT p.*, c.CATEGORY_NAME FROM MM_PRODUCT p JOIN MM_MAS_CATEGORY c ON p.CATEGORY_ID = c.CATEGORY_ID WHERE p.PRODUCT_ID = ?");
        $stmt->execute([$productId]);
        $product = $stmt->fetch();
        
        if (!$product) {
            http_response_code(404);
            echo json_encode(["success" => false, "message" => "Product details not found."]);
            exit();
        }
        
        // Retrieve user feedback/reviews
        $revStmt = $pdo->prepare("
            SELECT r.*, c.CUSTOMER_NAME 
            FROM MM_PRODUCT_REVIEW r 
            JOIN MM_CUSTOMER c ON r.CUSTOMER_ID = c.CUSTOMER_ID 
            WHERE r.PRODUCT_ID = ? 
            ORDER BY r.REVIEW_DATE DESC
        ");
        $revStmt->execute([$productId]);
        $reviews = $revStmt->fetchAll();
        
        // Retrieve alternative suggestions in same category
        $relStmt = $pdo->prepare("SELECT * FROM MM_PRODUCT WHERE CATEGORY_ID = ? AND PRODUCT_ID != ? LIMIT 4");
        $relStmt->execute([$product['CATEGORY_ID'], $productId]);
        $related = $relStmt->fetchAll();
        
        echo json_encode([
            "success" => true,
            "product" => $product,
            "reviews" => $reviews,
            "related" => $related
        ]);
        
    } elseif ($method === 'POST') {
        // Post feedback (Requires login)
        $user = getAuthenticatedUser();
        $userId = $user['user_id'];
        
        $data = json_decode(file_get_contents("php://input"), true);
        
        $productId = trim($data['product_id'] ?? '');
        $rating = intval($data['rating'] ?? 5);
        $review = trim($data['review'] ?? '');
        
        if (empty($productId) || empty($review)) {
            http_response_code(400);
            echo json_encode(["success" => false, "message" => "product_id and review text are required."]);
            exit();
        }
        
        // Authenticate customer reference
        $stmtCust = $pdo->prepare("SELECT CUSTOMER_ID FROM MM_CUSTOMER WHERE USER_ID = ?");
        $stmtCust->execute([$userId]);
        $customer = $stmtCust->fetch();
        
        if (!$customer) {
            http_response_code(403);
            echo json_encode(["success" => false, "message" => "Only customers can submit reviews."]);
            exit();
        }
        
        $customerId = $customer['CUSTOMER_ID'];
        $reviewId = 'rev_' . bin2hex(random_bytes(8));
        
        $stmt = $pdo->prepare("INSERT INTO MM_PRODUCT_REVIEW (REVIEW_ID, PRODUCT_ID, CUSTOMER_ID, RATING, REVIEW, REVIEW_DATE) VALUES (?, ?, ?, ?, ?, NOW())");
        $stmt->execute([$reviewId, $productId, $customerId, $rating, $review]);
        
        echo json_encode(["success" => true, "message" => "Feedback submitted successfully."]);
    } else {
        http_response_code(405);
        echo json_encode(["success" => false, "message" => "Method Not Allowed"]);
    }
} catch (\Exception $e) {
    http_response_code(500);
    echo json_encode(["success" => false, "message" => "Server error: " . $e->getMessage()]);
}
?>
