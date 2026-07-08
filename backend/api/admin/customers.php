<?php
// backend/api/admin/customers.php

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
        // Fetch all customers details
        $stmt = $pdo->query("
            SELECT c.*, u.USER_EMAIL, u.USER_MOBILE, u.USER_STATUS, u.USER_LAST_LOGIN
            FROM MM_CUSTOMER c
            JOIN MM_USER_LOGIN u ON c.USER_ID = u.USER_ID
            ORDER BY c.CUSTOMER_CREATED_AT DESC
        ");
        $customers = $stmt->fetchAll();
        
        echo json_encode(["success" => true, "customers" => $customers]);
        
    } elseif ($method === 'DELETE') {
        $targetUserId = $_GET['user_id'] ?? '';
        
        if (empty($targetUserId)) {
            http_response_code(400);
            echo json_encode(["success" => false, "message" => "user_id query parameter is required."]);
            exit();
        }
        
        if ($targetUserId === $user['user_id']) {
            http_response_code(400);
            echo json_encode(["success" => false, "message" => "You cannot delete your own admin account."]);
            exit();
        }
        
        $pdo->beginTransaction();
        
        // Find CUSTOMER_ID
        $stmtCust = $pdo->prepare("SELECT CUSTOMER_ID FROM MM_CUSTOMER WHERE USER_ID = ?");
        $stmtCust->execute([$targetUserId]);
        $customer = $stmtCust->fetch();
        
        if ($customer) {
            $customerId = $customer['CUSTOMER_ID'];
            
            // Delete reviews
            $stmt = $pdo->prepare("DELETE FROM MM_PRODUCT_REVIEW WHERE CUSTOMER_ID = ?");
            $stmt->execute([$customerId]);
            
            // Delete cart
            $stmt = $pdo->prepare("DELETE FROM MM_CART WHERE CUSTOMER_ID = ?");
            $stmt->execute([$customerId]);
            
            // Collect order IDs
            $stmtOrders = $pdo->prepare("SELECT ORDER_ID FROM MM_ORDER WHERE CUSTOMER_ID = ?");
            $stmtOrders->execute([$customerId]);
            $orders = $stmtOrders->fetchAll(PDO::FETCH_COLUMN);
            
            if (!empty($orders)) {
                $inQuery = implode(',', array_fill(0, count($orders), '?'));
                
                // Delete order status history
                $stmt = $pdo->prepare("DELETE FROM MM_ORDER_STATUS WHERE ORDER_ID IN ($inQuery)");
                $stmt->execute($orders);
                
                // Delete payments
                $stmt = $pdo->prepare("DELETE FROM MM_PAYMENT WHERE ORDER_ID IN ($inQuery)");
                $stmt->execute($orders);
                
                // Delete details
                $stmt = $pdo->prepare("DELETE FROM MM_ORDER_DETAILS WHERE ORDER_ID IN ($inQuery)");
                $stmt->execute($orders);
                
                // Delete order masters
                $stmt = $pdo->prepare("DELETE FROM MM_ORDER WHERE CUSTOMER_ID = ?");
                $stmt->execute([$customerId]);
            }
            
            // Delete addresses
            $stmt = $pdo->prepare("DELETE FROM MM_CUSTOMER_ADDRESS WHERE CUSTOMER_ID = ?");
            $stmt->execute([$customerId]);
            
            // Delete customer details
            $stmt = $pdo->prepare("DELETE FROM MM_CUSTOMER WHERE CUSTOMER_ID = ?");
            $stmt->execute([$customerId]);
        }
        
        // Delete login credentials
        $stmt = $pdo->prepare("DELETE FROM MM_USER_LOGIN WHERE USER_ID = ?");
        $stmt->execute([$targetUserId]);
        
        $pdo->commit();
        
        echo json_encode(["success" => true, "message" => "Customer account and all dependencies deleted."]);
    } else {
        http_response_code(405);
        echo json_encode(["success" => false, "message" => "Method Not Allowed"]);
    }
} catch (\Exception $e) {
    if ($pdo->inTransaction()) {
        $pdo->rollBack();
    }
    http_response_code(500);
    echo json_encode(["success" => false, "message" => "Server error: " . $e->getMessage()]);
}
?>
