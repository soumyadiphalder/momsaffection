<?php
// backend/api/cart/manage.php

require_once __DIR__ . '/../../config/db.php';
require_once __DIR__ . '/../../config/auth_helper.php';

$user = getAuthenticatedUser();
$userId = $user['user_id'];

$method = $_SERVER['REQUEST_METHOD'];

try {
    // Get CUSTOMER_ID
    $stmtCust = $pdo->prepare("SELECT CUSTOMER_ID FROM MM_CUSTOMER WHERE USER_ID = ?");
    $stmtCust->execute([$userId]);
    $customer = $stmtCust->fetch();
    
    if (!$customer) {
        http_response_code(403);
        echo json_encode(["success" => false, "message" => "Only customer users can manage cart listings."]);
        exit();
    }
    
    $customerId = $customer['CUSTOMER_ID'];
    
    if ($method === 'GET') {
        // Fetch user cart
        $stmt = $pdo->prepare("
            SELECT c.*, p.PRODUCT_NAME, p.PRODUCT_IMAGE, p.PRODUCT_STOCK, p.PRODUCT_PRICE as ORIGINAL_PRICE
            FROM MM_CART c
            JOIN MM_PRODUCT p ON c.PRODUCT_ID = p.PRODUCT_ID
            WHERE c.CUSTOMER_ID = ?
        ");
        $stmt->execute([$customerId]);
        $items = $stmt->fetchAll();
        
        echo json_encode(["success" => true, "cart" => $items]);
        
    } elseif ($method === 'POST') {
        $data = json_decode(file_get_contents("php://input"), true);
        
        // Sync localstorage cart from front-end upon sign in
        if (isset($data['items']) && is_array($data['items'])) {
            $pdo->beginTransaction();
            // Clear existing cart items
            $clearStmt = $pdo->prepare("DELETE FROM MM_CART WHERE CUSTOMER_ID = ?");
            $clearStmt->execute([$customerId]);
            
            $insertStmt = $pdo->prepare("
                INSERT INTO MM_CART (CART_ID, CUSTOMER_ID, PRODUCT_ID, QUANTITY, PRICE, TOTAL_AMOUNT, ADDED_DATE)
                VALUES (?, ?, ?, ?, ?, ?, NOW())
            ");
            
            foreach ($data['items'] as $item) {
                $prodId = $item['product_id'];
                $qty = intval($item['quantity']);
                if ($qty <= 0) continue;
                
                // Read fresh product price to avoid client-side tampering
                $pStmt = $pdo->prepare("SELECT PRODUCT_SELL_PRICE, PRODUCT_STOCK FROM MM_PRODUCT WHERE PRODUCT_ID = ?");
                $pStmt->execute([$prodId]);
                $product = $pStmt->fetch();
                
                if ($product) {
                    $cartId = 'crt_' . bin2hex(random_bytes(8));
                    $price = $product['PRODUCT_SELL_PRICE'];
                    $total = $price * $qty;
                    $insertStmt->execute([$cartId, $customerId, $prodId, $qty, $price, $total]);
                }
            }
            
            $pdo->commit();
            echo json_encode(["success" => true, "message" => "Cart synced successfully."]);
            exit();
        }
        
        // Add or Update single product
        $prodId = $data['product_id'] ?? '';
        $qty = intval($data['quantity'] ?? 1);
        $action = $data['action'] ?? 'add';
        
        if (empty($prodId) || $qty <= 0) {
            http_response_code(400);
            echo json_encode(["success" => false, "message" => "product_id and positive quantity are required."]);
            exit();
        }
        
        $pStmt = $pdo->prepare("SELECT PRODUCT_SELL_PRICE, PRODUCT_STOCK FROM MM_PRODUCT WHERE PRODUCT_ID = ?");
        $pStmt->execute([$prodId]);
        $product = $pStmt->fetch();
        
        if (!$product) {
            http_response_code(404);
            echo json_encode(["success" => false, "message" => "Product not found."]);
            exit();
        }
        
        $price = $product['PRODUCT_SELL_PRICE'];
        
        $checkStmt = $pdo->prepare("SELECT CART_ID, QUANTITY FROM MM_CART WHERE CUSTOMER_ID = ? AND PRODUCT_ID = ?");
        $checkStmt->execute([$customerId, $prodId]);
        $existing = $checkStmt->fetch();
        
        if ($existing) {
            $newQty = $qty;
            if ($action === 'add') {
                $newQty = $existing['QUANTITY'] + $qty;
            }
            
            if ($newQty > $product['PRODUCT_STOCK']) {
                http_response_code(400);
                echo json_encode(["success" => false, "message" => "Quantity exceeds current warehouse stock."]);
                exit();
            }
            
            $total = $price * $newQty;
            $updateStmt = $pdo->prepare("UPDATE MM_CART SET QUANTITY = ?, PRICE = ?, TOTAL_AMOUNT = ? WHERE CART_ID = ?");
            $updateStmt->execute([$newQty, $price, $total, $existing['CART_ID']]);
            
            echo json_encode(["success" => true, "message" => "Cart updated successfully."]);
        } else {
            if ($qty > $product['PRODUCT_STOCK']) {
                http_response_code(400);
                echo json_encode(["success" => false, "message" => "Quantity exceeds current warehouse stock."]);
                exit();
            }
            
            $cartId = 'crt_' . bin2hex(random_bytes(8));
            $total = $price * $qty;
            
            $insertStmt = $pdo->prepare("INSERT INTO MM_CART (CART_ID, CUSTOMER_ID, PRODUCT_ID, QUANTITY, PRICE, TOTAL_AMOUNT, ADDED_DATE) VALUES (?, ?, ?, ?, ?, ?, NOW())");
            $insertStmt->execute([$cartId, $customerId, $prodId, $qty, $price, $total]);
            
            echo json_encode(["success" => true, "message" => "Item added to cart."]);
        }
        
    } elseif ($method === 'DELETE') {
        $prodId = $_GET['product_id'] ?? '';
        
        if (!empty($prodId)) {
            $stmt = $pdo->prepare("DELETE FROM MM_CART WHERE CUSTOMER_ID = ? AND PRODUCT_ID = ?");
            $stmt->execute([$customerId, $prodId]);
            echo json_encode(["success" => true, "message" => "Item removed from cart."]);
        } else {
            $stmt = $pdo->prepare("DELETE FROM MM_CART WHERE CUSTOMER_ID = ?");
            $stmt->execute([$customerId]);
            echo json_encode(["success" => true, "message" => "Cart cleared successfully."]);
        }
    } else {
        http_response_code(405);
        echo json_encode(["success" => false, "message" => "Method Not Allowed"]);
    }
} catch (\Exception $e) {
    if (isset($pdo) && $pdo->inTransaction()) {
        $pdo->rollBack();
    }
    http_response_code(500);
    echo json_encode(["success" => false, "message" => "Server error: " . $e->getMessage()]);
}
?>
