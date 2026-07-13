<?php
// backend/api/admin/products.php

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

function uploadProductImage() {
    if (!isset($_FILES['image']) || $_FILES['image']['error'] !== UPLOAD_ERR_OK) {
        return null;
    }
    $tmpPath = $_FILES['image']['tmp_name'];
    $name = $_FILES['image']['name'];
    $ext = strtolower(pathinfo($name, PATHINFO_EXTENSION));
    $allowed = ['jpg', 'jpeg', 'png', 'gif', 'webp'];
    
    if (!in_array($ext, $allowed)) {
        return null;
    }
    
    $dir = dirname(dirname(__DIR__)) . '/uploads/';
    if (!is_dir($dir)) {
        mkdir($dir, 0755, true);
    }
    
    $newName = 'prod_' . bin2hex(random_bytes(8)) . '.' . $ext;
    if (move_uploaded_file($tmpPath, $dir . $newName)) {
        return 'uploads/' . $newName;
    }
    return null;
}

try {
    if ($method === 'GET') {
        // Fetch products catalog
        $stmt = $pdo->query("
            SELECT p.*, c.CATEGORY_NAME 
            FROM MM_PRODUCT p 
            JOIN MM_MAS_CATEGORY c ON p.CATEGORY_ID = c.CATEGORY_ID 
            ORDER BY p.PRODUCT_CREATED_AT DESC
        ");
        $products = $stmt->fetchAll();
        
        // Fetch master tables for inputs
        $cats = $pdo->query("SELECT * FROM MM_MAS_CATEGORY")->fetchAll();
        $brands = $pdo->query("SELECT * FROM MM_MAS_BRAND")->fetchAll();
        
        echo json_encode([
            "success" => true,
            "products" => $products,
            "categories" => $cats,
            "brands" => $brands
        ]);
        
    } elseif ($method === 'POST') {
        $productId = $_POST['product_id'] ?? '';
        $name = trim($_POST['name'] ?? '');
        $categoryId = trim($_POST['category_id'] ?? '');
        $brandId = trim($_POST['brand_id'] ?? 'MOMSAFFECTION');
        $description = trim($_POST['description'] ?? '');
        $price = floatval($_POST['price'] ?? 0);
        $discount = floatval($_POST['discount'] ?? 0);
        $sellPrice = floatval($_POST['sell_price'] ?? $price);
        $stock = intval($_POST['stock'] ?? 0);
        $status = trim($_POST['status'] ?? 'ACTIVE');
        
        if (empty($name) || empty($categoryId) || $price <= 0) {
            http_response_code(400);
            echo json_encode(["success" => false, "message" => "Product Name, Category ID, and positive Price are required fields."]);
            exit();
        }
        
        $imagePath = uploadProductImage();
        
        if (!empty($productId)) {
            // Update existing product
            $stmtCheck = $pdo->prepare("SELECT PRODUCT_IMAGE FROM MM_PRODUCT WHERE PRODUCT_ID = ?");
            $stmtCheck->execute([$productId]);
            $existing = $stmtCheck->fetch();
            
            if (!$existing) {
                http_response_code(404);
                echo json_encode(["success" => false, "message" => "Product details not found."]);
                exit();
            }
            
            if (empty($imagePath)) {
                $imagePath = $existing['PRODUCT_IMAGE'];
            }
            
            $stmt = $pdo->prepare("
                UPDATE MM_PRODUCT 
                SET CATEGORY_ID = ?, BRAND_ID = ?, PRODUCT_NAME = ?, PRODUCT_DESCRIPTION = ?, 
                    PRODUCT_PRICE = ?, PRODUCT_DISCOUNT = ?, PRODUCT_SELL_PRICE = ?, PRODUCT_STOCK = ?, PRODUCT_IMAGE = ?, PRODUCT_STATUS = ? 
                WHERE PRODUCT_ID = ?
            ");
            $stmt->execute([$categoryId, $brandId, $name, $description, $price, $discount, $sellPrice, $stock, $imagePath, $status, $productId]);
            
            echo json_encode(["success" => true, "message" => "Product updated successfully."]);
        } else {
            // Add new product
            $newId = 'prod_' . bin2hex(random_bytes(8));
            
            $stmt = $pdo->prepare("
                INSERT INTO MM_PRODUCT (PRODUCT_ID, CATEGORY_ID, BRAND_ID, PRODUCT_NAME, PRODUCT_DESCRIPTION, PRODUCT_PRICE, PRODUCT_DISCOUNT, PRODUCT_SELL_PRICE, PRODUCT_STOCK, PRODUCT_IMAGE, PRODUCT_STATUS) 
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ");
            $stmt->execute([$newId, $categoryId, $brandId, $name, $description, $price, $discount, $sellPrice, $stock, $imagePath, $status]);
            
            echo json_encode(["success" => true, "message" => "Product registered successfully.", "product_id" => $newId]);
        }
        
    } elseif ($method === 'DELETE') {
        $productId = $_GET['product_id'] ?? '';
        
        if (empty($productId)) {
            http_response_code(400);
            echo json_encode(["success" => false, "message" => "product_id query parameter is required."]);
            exit();
        }
        
        // Prevent integrity issues if references in order history exist
        $stmtCheck = $pdo->prepare("SELECT COUNT(*) FROM MM_ORDER_DETAILS WHERE PRODUCT_ID = ?");
        $stmtCheck->execute([$productId]);
        $count = $stmtCheck->fetchColumn();
        
        if ($count > 0) {
            $stmt = $pdo->prepare("UPDATE MM_PRODUCT SET PRODUCT_STATUS = 'OUT OF STOCK' WHERE PRODUCT_ID = ?");
            $stmt->execute([$productId]);
            echo json_encode(["success" => true, "message" => "Product references exist in orders. Status set to 'OUT OF STOCK'."]);
        } else {
            // Delete dependent cart entries
            $stmtCart = $pdo->prepare("DELETE FROM MM_CART WHERE PRODUCT_ID = ?");
            $stmtCart->execute([$productId]);
            
            // Delete product feedback/reviews
            $stmtRev = $pdo->prepare("DELETE FROM MM_PRODUCT_REVIEW WHERE PRODUCT_ID = ?");
            $stmtRev->execute([$productId]);
            
            $stmt = $pdo->prepare("DELETE FROM MM_PRODUCT WHERE PRODUCT_ID = ?");
            $stmt->execute([$productId]);
            echo json_encode(["success" => true, "message" => "Product deleted successfully."]);
        }
    } else {
        http_response_code(405);
        echo json_encode(["success" => false, "message" => "Method Not Allowed"]);
    }
} catch (\Exception $e) {
    http_response_code(500);
    echo json_encode(["success" => false, "message" => "Server error: " . $e->getMessage()]);
}
?>
