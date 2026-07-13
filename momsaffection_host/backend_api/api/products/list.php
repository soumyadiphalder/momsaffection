<?php
// backend/api/products/list.php

require_once __DIR__ . '/../../config/db.php';

try {
    // Retrieve categories for navigation filter sidebar
    $catStmt = $pdo->query("SELECT * FROM MM_MAS_CATEGORY WHERE CATEGORY_STATUS = 'ACTIVE'");
    $categories = $catStmt->fetchAll();
    
    $categoryFilter = $_GET['category_id'] ?? '';
    $search = $_GET['search'] ?? '';
    $sort = $_GET['sort'] ?? '';
    
    $query = "SELECT p.*, c.CATEGORY_NAME, COALESCE(AVG(r.RATING), 0) AS PRODUCT_RATING, COUNT(r.REVIEW_ID) AS REVIEW_COUNT FROM MM_PRODUCT p JOIN MM_MAS_CATEGORY c ON p.CATEGORY_ID = c.CATEGORY_ID LEFT JOIN MM_PRODUCT_REVIEW r ON p.PRODUCT_ID = r.PRODUCT_ID WHERE p.PRODUCT_STATUS != 'INACTIVE'";
    $params = [];
    
    if (!empty($categoryFilter)) {
        $query .= " AND p.CATEGORY_ID = ?";
        $params[] = $categoryFilter;
    }
    
    if (!empty($search)) {
        $query .= " AND (p.PRODUCT_NAME LIKE ? OR p.PRODUCT_DESCRIPTION LIKE ?)";
        $params[] = "%$search%";
        $params[] = "%$search%";
    }
    
    $query .= " GROUP BY p.PRODUCT_ID";
    
    // Sort logic
    if ($sort === 'price_asc') {
        $query .= " ORDER BY p.PRODUCT_SELL_PRICE ASC";
    } elseif ($sort === 'price_desc') {
        $query .= " ORDER BY p.PRODUCT_SELL_PRICE DESC";
    } elseif ($sort === 'name_asc') {
        $query .= " ORDER BY p.PRODUCT_NAME ASC";
    } elseif ($sort === 'name_desc') {
        $query .= " ORDER BY p.PRODUCT_NAME DESC";
    } else {
        $query .= " ORDER BY p.PRODUCT_CREATED_AT DESC";
    }
    
    $prodStmt = $pdo->prepare($query);
    $prodStmt->execute($params);
    $products = $prodStmt->fetchAll();
    
    echo json_encode([
        "success" => true,
        "categories" => $categories,
        "products" => $products
    ]);
} catch (\Exception $e) {
    http_response_code(500);
    echo json_encode(["success" => false, "message" => "Server error: " . $e->getMessage()]);
}
?>
