<?php
// backend/api/orders/place.php

require_once __DIR__ . '/../../config/db.php';
require_once __DIR__ . '/../../config/auth_helper.php';

$user = getAuthenticatedUser();
$userId = $user['user_id'];

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(["success" => false, "message" => "Method Not Allowed"]);
    exit();
}

try {
    // Get CUSTOMER_ID
    $stmtCust = $pdo->prepare("SELECT CUSTOMER_ID FROM MM_CUSTOMER WHERE USER_ID = ?");
    $stmtCust->execute([$userId]);
    $customer = $stmtCust->fetch();
    
    if (!$customer) {
        http_response_code(403);
        echo json_encode(["success" => false, "message" => "Only customer accounts can place orders."]);
        exit();
    }
    
    $customerId = $customer['CUSTOMER_ID'];
    
    // Fetch cart items
    $cartStmt = $pdo->prepare("SELECT * FROM MM_CART WHERE CUSTOMER_ID = ?");
    $cartStmt->execute([$customerId]);
    $cartItems = $cartStmt->fetchAll();
    
    if (empty($cartItems)) {
        http_response_code(400);
        echo json_encode(["success" => false, "message" => "Your cart is empty. Add products before placing an order."]);
        exit();
    }
    
    $pdo->beginTransaction();
    
    // Calculate total order amount and verify stock
    $totalAmount = 0;
    foreach ($cartItems as $item) {
        $pStmt = $pdo->prepare("SELECT PRODUCT_PRICE, PRODUCT_STOCK, PRODUCT_NAME FROM MM_PRODUCT WHERE PRODUCT_ID = ? FOR UPDATE");
        $pStmt->execute([$item['PRODUCT_ID']]);
        $product = $pStmt->fetch();
        
        if (!$product) {
            $pdo->rollBack();
            http_response_code(400);
            echo json_encode(["success" => false, "message" => "Product ID " . $item['PRODUCT_ID'] . " does not exist."]);
            exit();
        }
        
        if ($product['PRODUCT_STOCK'] < $item['QUANTITY']) {
            $pdo->rollBack();
            http_response_code(400);
            echo json_encode(["success" => false, "message" => "Insufficient stock for " . $product['PRODUCT_NAME'] . ". Available: " . $product['PRODUCT_STOCK']]);
            exit();
        }
        
        $totalAmount += $product['PRODUCT_PRICE'] * $item['QUANTITY'];
    }
    
    // 1. Create order entry in MM_ORDER
    $orderId = 'ord_' . bin2hex(random_bytes(8));
    $stmtOrder = $pdo->prepare("INSERT INTO MM_ORDER (ORDER_ID, CUSTOMER_ID, ORDER_DATE, TOTAL_AMOUNT, ORDER_STATUS) VALUES (?, ?, NOW(), ?, 'PENDING')");
    $stmtOrder->execute([$orderId, $customerId, $totalAmount]);
    
    // 2. Insert items into MM_ORDER_DETAILS & deduct stock
    $stmtDetails = $pdo->prepare("INSERT INTO MM_ORDER_DETAILS (ORDER_DETAILS_ID, ORDER_ID, PRODUCT_ID, PRODUCT_PRICE, QUANTITY, TOTAL_PRICE) VALUES (?, ?, ?, ?, ?, ?)");
    $stmtDeduct = $pdo->prepare("UPDATE MM_PRODUCT SET PRODUCT_STOCK = PRODUCT_STOCK - ? WHERE PRODUCT_ID = ?");
    
    foreach ($cartItems as $item) {
        $detailsId = 'od_' . bin2hex(random_bytes(8));
        $itemTotal = $item['PRICE'] * $item['QUANTITY'];
        
        // Write order items
        $stmtDetails->execute([$detailsId, $orderId, $item['PRODUCT_ID'], $item['PRICE'], $item['QUANTITY'], $itemTotal]);
        
        // Deduct stock
        $stmtDeduct->execute([$item['QUANTITY'], $item['PRODUCT_ID']]);
    }
    
    // 3. Set order status logs
    $statusId = 'stat_' . bin2hex(random_bytes(8));
    $stmtStatus = $pdo->prepare("INSERT INTO MM_ORDER_STATUS (STATUS_ID, ORDER_ID, STATUS_NAME, STATUS_DATE, REMARKS) VALUES (?, ?, 'PENDING', NOW(), 'Order placed. Awaiting payment details.')");
    $stmtStatus->execute([$statusId, $orderId,]);
    
    // 4. Create pending payment records
    $paymentId = 'pay_' . bin2hex(random_bytes(8));
    $stmtPayment = $pdo->prepare("INSERT INTO MM_PAYMENT (PAYMENT_ID, ORDER_ID, PAYMENT_METHOD, PAYMENT_AMOUNT, PAYMENT_STATUS, PAYMENT_DATE) VALUES (?, ?, 'Razorpay', ?, 'PENDING', NOW())");
    $stmtPayment->execute([$paymentId, $orderId, $totalAmount]);
    
    // 5. Clear cart
    $clearCart = $pdo->prepare("DELETE FROM MM_CART WHERE CUSTOMER_ID = ?");
    $clearCart->execute([$customerId]);
    
    $pdo->commit();
    
    echo json_encode([
        "success" => true,
        "message" => "Order placed successfully.",
        "order_id" => $orderId,
        "amount" => $totalAmount
    ]);
} catch (\Exception $e) {
    if ($pdo->inTransaction()) {
        $pdo->rollBack();
    }
    http_response_code(500);
    echo json_encode(["success" => false, "message" => "Failed to place order: " . $e->getMessage()]);
}
?>
