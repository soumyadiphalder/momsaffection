<?php
// backend/api/admin/categories.php

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
        // Fetch categories
        $stmt = $pdo->query("SELECT * FROM MM_MAS_CATEGORY ORDER BY CATEGORY_NAME ASC");
        $categories = $stmt->fetchAll();
        
        echo json_encode([
            "success" => true,
            "categories" => $categories
        ]);
        
    } elseif ($method === 'POST') {
        $data = json_decode(file_get_contents("php://input"), true);
        
        $categoryId = trim($data['category_id'] ?? '');
        $name = trim($data['name'] ?? '');
        $description = trim($data['description'] ?? '');
        $status = trim($data['status'] ?? 'ACTIVE');
        
        if (empty($name)) {
            http_response_code(400);
            echo json_encode(["success" => false, "message" => "Category Name is required."]);
            exit();
        }
        
        if (!empty($categoryId)) {
            // Update existing category
            $stmtCheck = $pdo->prepare("SELECT * FROM MM_MAS_CATEGORY WHERE CATEGORY_ID = ?");
            $stmtCheck->execute([$categoryId]);
            $existing = $stmtCheck->fetch();
            
            if (!$existing) {
                http_response_code(404);
                echo json_encode(["success" => false, "message" => "Category not found."]);
                exit();
            }
            
            $stmt = $pdo->prepare("
                UPDATE MM_MAS_CATEGORY 
                SET CATEGORY_NAME = ?, CATEGORY_DESCRIPTION = ?, CATEGORY_STATUS = ? 
                WHERE CATEGORY_ID = ?
            ");
            $stmt->execute([$name, $description, $status, $categoryId]);
            
            echo json_encode(["success" => true, "message" => "Category updated successfully."]);
        } else {
            // Add new category
            // Auto-generate uppercase slug-like ID from name
            $baseId = strtoupper(preg_replace('/[^a-zA-Z0-9]/', '_', $name));
            $newId = $baseId;
            
            // Check uniqueness of ID, append random suffix if it exists
            $stmtCheck = $pdo->prepare("SELECT COUNT(*) FROM MM_MAS_CATEGORY WHERE CATEGORY_ID = ?");
            $stmtCheck->execute([$newId]);
            if ($stmtCheck->fetchColumn() > 0) {
                $newId = $baseId . '_' . strtoupper(bin2hex(random_bytes(3)));
            }
            
            $stmt = $pdo->prepare("
                INSERT INTO MM_MAS_CATEGORY (CATEGORY_ID, CATEGORY_NAME, CATEGORY_DESCRIPTION, CATEGORY_STATUS) 
                VALUES (?, ?, ?, ?)
            ");
            $stmt->execute([$newId, $name, $description, $status]);
            
            echo json_encode(["success" => true, "message" => "Category created successfully.", "category_id" => $newId]);
        }
        
    } elseif ($method === 'DELETE') {
        $categoryId = $_GET['category_id'] ?? '';
        
        if (empty($categoryId)) {
            http_response_code(400);
            echo json_encode(["success" => false, "message" => "category_id query parameter is required."]);
            exit();
        }
        
        // Prevent integrity issues if products exist in this category
        $stmtCheck = $pdo->prepare("SELECT COUNT(*) FROM MM_PRODUCT WHERE CATEGORY_ID = ?");
        $stmtCheck->execute([$categoryId]);
        $count = $stmtCheck->fetchColumn();
        
        if ($count > 0) {
            http_response_code(400);
            echo json_encode([
                "success" => false, 
                "message" => "Cannot delete category: It is currently assigned to $count product(s). You can mark it as 'INACTIVE' instead."
            ]);
        } else {
            $stmt = $pdo->prepare("DELETE FROM MM_MAS_CATEGORY WHERE CATEGORY_ID = ?");
            $stmt->execute([$categoryId]);
            echo json_encode(["success" => true, "message" => "Category deleted successfully."]);
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
