<?php
// backend/api/orders/list.php

require_once __DIR__ . '/../../config/db.php';
require_once __DIR__ . '/../../config/auth_helper.php';

$user = getAuthenticatedUser();
$userId = $user['user_id'];

try {
    // Get CUSTOMER_ID
    $stmtCust = $pdo->prepare("SELECT CUSTOMER_ID FROM MM_CUSTOMER WHERE USER_ID = ?");
    $stmtCust->execute([$userId]);
    $customer = $stmtCust->fetch();
    
    if (!$customer) {
        http_response_code(403);
        echo json_encode(["success" => false, "message" => "Only customer users can view order history."]);
        exit();
    }
    
    $customerId = $customer['CUSTOMER_ID'];
    
    // Retrieve orders master records
    $stmtOrders = $pdo->prepare("
        SELECT o.*, p.PAYMENT_STATUS, p.PAYMENT_METHOD
        FROM MM_ORDER o
        LEFT JOIN MM_PAYMENT p ON o.ORDER_ID = p.ORDER_ID
        WHERE o.CUSTOMER_ID = ?
        ORDER BY o.ORDER_DATE DESC
    ");
    $stmtOrders->execute([$customerId]);
    $orders = $stmtOrders->fetchAll();
    
    $result = [];
    foreach ($orders as $order) {
        // Retrieve details of products purchased in this order
        $stmtDetails = $pdo->prepare("
            SELECT d.*, p.PRODUCT_NAME, p.PRODUCT_IMAGE
            FROM MM_ORDER_DETAILS d
            JOIN MM_PRODUCT p ON d.PRODUCT_ID = p.PRODUCT_ID
            WHERE d.ORDER_ID = ?
        ");
        $stmtDetails->execute([$order['ORDER_ID']]);
        $details = $stmtDetails->fetchAll();
        
        $order['items'] = $details;
        $result[] = $order;
    }
    
    echo json_encode([
        "success" => true,
        "orders" => $result
    ]);
} catch (\Exception $e) {
    http_response_code(500);
    echo json_encode(["success" => false, "message" => "Server error: " . $e->getMessage()]);
}
?>
