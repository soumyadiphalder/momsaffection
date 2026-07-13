<?php
// backend/api/orders/status.php

require_once __DIR__ . '/../../config/db.php';
require_once __DIR__ . '/../../config/auth_helper.php';

$user = getAuthenticatedUser();
$userId = $user['user_id'];
$roleId = $user['role_id'];

$orderId = $_GET['order_id'] ?? '';

if (empty($orderId)) {
    http_response_code(400);
    echo json_encode(["success" => false, "message" => "order_id is required."]);
    exit();
}

try {
    $stmtOrder = $pdo->prepare("SELECT * FROM MM_ORDER WHERE ORDER_ID = ?");
    $stmtOrder->execute([$orderId]);
    $order = $stmtOrder->fetch();
    
    if (!$order) {
        http_response_code(404);
        echo json_encode(["success" => false, "message" => "Order not found."]);
        exit();
    }
    
    // Access control check
    if ($roleId !== 'ADMIN') {
        $stmtCust = $pdo->prepare("SELECT CUSTOMER_ID FROM MM_CUSTOMER WHERE USER_ID = ?");
        $stmtCust->execute([$userId]);
        $customer = $stmtCust->fetch();
        
        if (!$customer || $customer['CUSTOMER_ID'] !== $order['CUSTOMER_ID']) {
            http_response_code(403);
            echo json_encode(["success" => false, "message" => "Unauthorized access to order logs."]);
            exit();
        }
    }
    
    // Fetch items
    $stmtDetails = $pdo->prepare("
        SELECT d.*, p.PRODUCT_NAME, p.PRODUCT_IMAGE
        FROM MM_ORDER_DETAILS d
        JOIN MM_PRODUCT p ON d.PRODUCT_ID = p.PRODUCT_ID
        WHERE d.ORDER_ID = ?
    ");
    $stmtDetails->execute([$orderId]);
    $items = $stmtDetails->fetchAll();
    
    // Fetch payment status details
    $stmtPayment = $pdo->prepare("SELECT * FROM MM_PAYMENT WHERE ORDER_ID = ?");
    $stmtPayment->execute([$orderId]);
    $payment = $stmtPayment->fetch();
    
    // Fetch order state transition logs
    $stmtHistory = $pdo->prepare("SELECT * FROM MM_ORDER_STATUS WHERE ORDER_ID = ? ORDER BY STATUS_DATE ASC");
    $stmtHistory->execute([$orderId]);
    $history = $stmtHistory->fetchAll();
    
    echo json_encode([
        "success" => true,
        "order" => $order,
        "items" => $items,
        "payment" => $payment,
        "status_history" => $history
    ]);
} catch (\Exception $e) {
    http_response_code(500);
    echo json_encode(["success" => false, "message" => "Server error: " . $e->getMessage()]);
}
?>
