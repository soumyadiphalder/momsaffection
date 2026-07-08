<?php
// backend/api/admin/orders.php

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
    if ($method === 'GET') {
        // Fetch all client orders
        $stmt = $pdo->query("
            SELECT o.*, c.CUSTOMER_NAME, u.USER_EMAIL, u.USER_MOBILE, p.PAYMENT_STATUS, p.PAYMENT_METHOD
            FROM MM_ORDER o
            JOIN MM_CUSTOMER c ON o.CUSTOMER_ID = c.CUSTOMER_ID
            JOIN MM_USER_LOGIN u ON c.USER_ID = u.USER_ID
            LEFT JOIN MM_PAYMENT p ON o.ORDER_ID = p.ORDER_ID
            ORDER BY o.ORDER_DATE DESC
        ");
        $orders = $stmt->fetchAll();
        
        $result = [];
        foreach ($orders as $order) {
            // Fetch purchased products
            $dStmt = $pdo->prepare("
                SELECT d.*, p.PRODUCT_NAME, p.PRODUCT_IMAGE
                FROM MM_ORDER_DETAILS d
                JOIN MM_PRODUCT p ON d.PRODUCT_ID = p.PRODUCT_ID
                WHERE d.ORDER_ID = ?
            ");
            $dStmt->execute([$order['ORDER_ID']]);
            $order['items'] = $dStmt->fetchAll();
            $result[] = $order;
        }
        
        echo json_encode(["success" => true, "orders" => $result]);
        
    } elseif ($method === 'POST' || $method === 'PUT') {
        $data = json_decode(file_get_contents("php://input"), true);
        
        $orderId = trim($data['order_id'] ?? '');
        $status = trim($data['status'] ?? '');
        $remarks = trim($data['remarks'] ?? '');
        
        if (empty($orderId) || empty($status)) {
            http_response_code(400);
            echo json_encode(["success" => false, "message" => "order_id and status parameters are required."]);
            exit();
        }
        
        $allowed = ['PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'];
        if (!in_array($status, $allowed)) {
            http_response_code(400);
            echo json_encode(["success" => false, "message" => "Invalid order status provided."]);
            exit();
        }
        
        $pdo->beginTransaction();
        
        // Confirm order existence
        $check = $pdo->prepare("SELECT ORDER_STATUS FROM MM_ORDER WHERE ORDER_ID = ?");
        $check->execute([$orderId]);
        if (!$check->fetch()) {
            $pdo->rollBack();
            http_response_code(404);
            echo json_encode(["success" => false, "message" => "Order not found."]);
            exit();
        }
        
        // Update status field
        $stmtUpdate = $pdo->prepare("UPDATE MM_ORDER SET ORDER_STATUS = ? WHERE ORDER_ID = ?");
        $stmtUpdate->execute([$status, $orderId]);
        
        // Restore warehouse inventory count if cancelled
        if ($status === 'CANCELLED') {
            $stmtDetails = $pdo->prepare("SELECT PRODUCT_ID, QUANTITY FROM MM_ORDER_DETAILS WHERE ORDER_ID = ?");
            $stmtDetails->execute([$orderId]);
            $items = $stmtDetails->fetchAll();
            
            $stmtRestore = $pdo->prepare("UPDATE MM_PRODUCT SET PRODUCT_STOCK = PRODUCT_STOCK + ? WHERE PRODUCT_ID = ?");
            foreach ($items as $item) {
                $stmtRestore->execute([$item['QUANTITY'], $item['PRODUCT_ID']]);
            }
        }
        
        // Append history logs
        $statusId = 'stat_' . bin2hex(random_bytes(8));
        $stmtHistory = $pdo->prepare("INSERT INTO MM_ORDER_STATUS (STATUS_ID, ORDER_ID, STATUS_NAME, STATUS_DATE, REMARKS) VALUES (?, ?, ?, NOW(), ?)");
        $stmtHistory->execute([$statusId, $orderId, $status, empty($remarks) ? "Order status updated to $status by admin." : $remarks]);
        
        // Update payments
        if ($status === 'DELIVERED') {
            $stmtPay = $pdo->prepare("UPDATE MM_PAYMENT SET PAYMENT_STATUS = 'SUCCESS', PAYMENT_DATE = NOW() WHERE ORDER_ID = ? AND PAYMENT_STATUS = 'PENDING'");
            $stmtPay->execute([$orderId]);
        } elseif ($status === 'CANCELLED') {
            $stmtPay = $pdo->prepare("UPDATE MM_PAYMENT SET PAYMENT_STATUS = 'FAILED', PAYMENT_DATE = NOW() WHERE ORDER_ID = ? AND PAYMENT_STATUS = 'PENDING'");
            $stmtPay->execute([$orderId]);
        }
        
        $pdo->commit();
        echo json_encode(["success" => true, "message" => "Order status updated successfully."]);
    } else {
        http_response_code(405);
        echo json_encode(["success" => false, "message" => "Method Not Allowed"]);
    }
} catch (\Exception $e) {
    if ($pdo->inTransaction()) {
        $pdo->rollBack();
    }
    http_response_code(500);
    echo json_encode(["success" => false, "message" => "Server error occurred: " . $e->getMessage()]);
}
?>
