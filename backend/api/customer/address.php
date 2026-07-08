<?php
// backend/api/customer/address.php

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
        http_response_code(404);
        echo json_encode(["success" => false, "message" => "Customer details not found."]);
        exit();
    }
    
    $customerId = $customer['CUSTOMER_ID'];
    
    if ($method === 'GET') {
        $stmt = $pdo->prepare("SELECT * FROM MM_CUSTOMER_ADDRESS WHERE CUSTOMER_ID = ?");
        $stmt->execute([$customerId]);
        $addresses = $stmt->fetchAll();
        
        echo json_encode(["success" => true, "addresses" => $addresses]);
        
    } elseif ($method === 'POST') {
        $data = json_decode(file_get_contents("php://input"), true);
        
        $fullAddress = trim($data['full_address'] ?? '');
        $city = trim($data['city'] ?? '');
        $state = trim($data['state'] ?? '');
        $pincode = trim($data['pincode'] ?? '');
        $country = trim($data['country'] ?? 'India');
        
        if (empty($fullAddress) || empty($city) || empty($state) || empty($pincode)) {
            http_response_code(400);
            echo json_encode(["success" => false, "message" => "Address parameters (full_address, city, state, pincode) are required."]);
            exit();
        }
        
        $addressId = 'addr_' . bin2hex(random_bytes(8));
        
        $stmt = $pdo->prepare("INSERT INTO MM_CUSTOMER_ADDRESS (ADDRESS_ID, CUSTOMER_ID, FULL_ADDRESS, CITY, STATE, PINCODE, COUNTRY) VALUES (?, ?, ?, ?, ?, ?, ?)");
        $stmt->execute([$addressId, $customerId, $fullAddress, $city, $state, $pincode, $country]);
        
        echo json_encode(["success" => true, "message" => "Address added successfully.", "address_id" => $addressId]);
        
    } elseif ($method === 'DELETE') {
        $addressId = $_GET['address_id'] ?? '';
        
        if (empty($addressId)) {
            http_response_code(400);
            echo json_encode(["success" => false, "message" => "address_id parameter is required."]);
            exit();
        }
        
        $stmt = $pdo->prepare("DELETE FROM MM_CUSTOMER_ADDRESS WHERE ADDRESS_ID = ? AND CUSTOMER_ID = ?");
        $stmt->execute([$addressId, $customerId]);
        
        echo json_encode(["success" => true, "message" => "Address deleted successfully."]);
    } else {
        http_response_code(405);
        echo json_encode(["success" => false, "message" => "Method Not Allowed"]);
    }
} catch (\Exception $e) {
    http_response_code(500);
    echo json_encode(["success" => false, "message" => "Server error: " . $e->getMessage()]);
}
?>
