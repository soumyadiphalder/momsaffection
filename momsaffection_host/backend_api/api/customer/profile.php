<?php
// backend/api/customer/profile.php

require_once __DIR__ . '/../../config/db.php';
require_once __DIR__ . '/../../config/auth_helper.php';

function uploadProfileImage() {
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
    
    $newName = 'cust_' . bin2hex(random_bytes(8)) . '.' . $ext;
    if (move_uploaded_file($tmpPath, $dir . $newName)) {
        return 'uploads/' . $newName;
    }
    return null;
}

// Secure endpoint
$user = getAuthenticatedUser();
$userId = $user['user_id'];

$method = $_SERVER['REQUEST_METHOD'];

try {
    if ($method === 'GET') {
        // Fetch detailed profile metrics
        $stmt = $pdo->prepare("
            SELECT u.USER_EMAIL, u.USER_MOBILE, u.USER_STATUS, u.USER_LAST_LOGIN, c.*
            FROM MM_USER_LOGIN u
            JOIN MM_CUSTOMER c ON u.USER_ID = c.USER_ID
            WHERE u.USER_ID = ?
        ");
        $stmt->execute([$userId]);
        $profile = $stmt->fetch();
        
        if (!$profile) {
            http_response_code(404);
            echo json_encode(["success" => false, "message" => "Profile records not found."]);
            exit();
        }
        
        echo json_encode(["success" => true, "profile" => $profile]);
        
    } elseif ($method === 'POST' || $method === 'PUT') {
        // Support both JSON and multipart/form-data
        if (strpos($_SERVER['CONTENT_TYPE'] ?? '', 'application/json') !== false) {
            $data = json_decode(file_get_contents("php://input"), true);
        } else {
            $data = $_POST;
        }
        
        $name = trim($data['name'] ?? '');
        $gender = trim($data['gender'] ?? '');
        $dob = trim($data['dob'] ?? null);
        $address = trim($data['address'] ?? '');
        $city = trim($data['city'] ?? '');
        $state = trim($data['state'] ?? '');
        $pincode = trim($data['pincode'] ?? '');
        $email = trim($data['email'] ?? '');
        $mobile = trim($data['mobile'] ?? '');
        
        if (empty($name) || empty($email) || empty($mobile)) {
            http_response_code(400);
            echo json_encode(["success" => false, "message" => "Name, Email and Mobile are required fields."]);
            exit();
        }
        
        if (!empty($dob)) {
            try {
                $dobDate = new DateTime($dob);
                $today = new DateTime('today');
                if ($dobDate > $today) {
                    http_response_code(400);
                    echo json_encode(["success" => false, "message" => "Date of birth cannot be in the future."]);
                    exit();
                }
                $age = $today->diff($dobDate)->y;
                if ($age < 10) {
                    http_response_code(400);
                    echo json_encode(["success" => false, "message" => "Customers under 10 years of age are not allowed."]);
                    exit();
                }
            } catch (\Exception $e) {
                http_response_code(400);
                echo json_encode(["success" => false, "message" => "Invalid date of birth format."]);
                exit();
            }
        }
        $pdo->beginTransaction();
        
        // Ensure email/mobile is not in use elsewhere
        $stmtCheck = $pdo->prepare("SELECT USER_ID FROM MM_USER_LOGIN WHERE (USER_EMAIL = ? OR USER_MOBILE = ?) AND USER_ID != ?");
        $stmtCheck->execute([$email, $mobile, $userId]);
        if ($stmtCheck->fetch()) {
            $pdo->rollBack();
            http_response_code(400);
            echo json_encode(["success" => false, "message" => "Email address or Mobile number already in use by another user."]);
            exit();
        }
        
        // Update user logins
        $stmtUser = $pdo->prepare("UPDATE MM_USER_LOGIN SET USER_EMAIL = ?, USER_MOBILE = ? WHERE USER_ID = ?");
        $stmtUser->execute([$email, $mobile, $userId]);
        
        $imagePath = uploadProfileImage();
        
        // Update customer properties
        if (!empty($imagePath)) {
            $stmtCust = $pdo->prepare("
                UPDATE MM_CUSTOMER SET 
                    CUSTOMER_NAME = ?, 
                    CUSTOMER_GENDER = ?, 
                    CUSTOMER_DOB = ?, 
                    CUSTOMER_ADDRESS = ?, 
                    CUSTOMER_CITY = ?, 
                    CUSTOMER_STATE = ?, 
                    CUSTOMER_PINCODE = ?,
                    CUSTOMER_IMAGE = ?
                WHERE USER_ID = ?
            ");
            $stmtCust->execute([$name, $gender, empty($dob) ? null : $dob, $address, $city, $state, $pincode, $imagePath, $userId]);
        } else {
            $stmtCust = $pdo->prepare("
                UPDATE MM_CUSTOMER SET 
                    CUSTOMER_NAME = ?, 
                    CUSTOMER_GENDER = ?, 
                    CUSTOMER_DOB = ?, 
                    CUSTOMER_ADDRESS = ?, 
                    CUSTOMER_CITY = ?, 
                    CUSTOMER_STATE = ?, 
                    CUSTOMER_PINCODE = ? 
                WHERE USER_ID = ?
            ");
            $stmtCust->execute([$name, $gender, empty($dob) ? null : $dob, $address, $city, $state, $pincode, $userId]);
        }
        
        $pdo->commit();
        
        echo json_encode(["success" => true, "message" => "Profile successfully updated."]);
        
    } elseif ($method === 'DELETE') {
        $data = json_decode(file_get_contents("php://input"), true);
        $password = trim($data['password'] ?? '');
        
        if (empty($password)) {
            http_response_code(400);
            echo json_encode(["success" => false, "message" => "Password verification is required to delete your account."]);
            exit();
        }
        
        // Retrieve the user record containing password hash
        $stmtUser = $pdo->prepare("SELECT USER_PASSWORD FROM MM_USER_LOGIN WHERE USER_ID = ?");
        $stmtUser->execute([$userId]);
        $userRecord = $stmtUser->fetch();
        
        if (!$userRecord || !password_verify($password, $userRecord['USER_PASSWORD'])) {
            http_response_code(401);
            echo json_encode(["success" => false, "message" => "Incorrect password. Verification failed."]);
            exit();
        }

        $pdo->beginTransaction();
        
        // Retrieve CUSTOMER_ID
        $stmtCust = $pdo->prepare("SELECT CUSTOMER_ID FROM MM_CUSTOMER WHERE USER_ID = ?");
        $stmtCust->execute([$userId]);
        $customer = $stmtCust->fetch();
        
        if ($customer) {
            $customerId = $customer['CUSTOMER_ID'];
            
            // Delete product reviews
            $stmt = $pdo->prepare("DELETE FROM MM_PRODUCT_REVIEW WHERE CUSTOMER_ID = ?");
            $stmt->execute([$customerId]);
            
            // Delete cart list
            $stmt = $pdo->prepare("DELETE FROM MM_CART WHERE CUSTOMER_ID = ?");
            $stmt->execute([$customerId]);
            
            // Collect order IDs
            $stmtOrders = $pdo->prepare("SELECT ORDER_ID FROM MM_ORDER WHERE CUSTOMER_ID = ?");
            $stmtOrders->execute([$customerId]);
            $orders = $stmtOrders->fetchAll(PDO::FETCH_COLUMN);
            
            if (!empty($orders)) {
                $inQuery = implode(',', array_fill(0, count($orders), '?'));
                
                // Clear order updates status
                $stmt = $pdo->prepare("DELETE FROM MM_ORDER_STATUS WHERE ORDER_ID IN ($inQuery)");
                $stmt->execute($orders);
                
                // Clear order payments
                $stmt = $pdo->prepare("DELETE FROM MM_PAYMENT WHERE ORDER_ID IN ($inQuery)");
                $stmt->execute($orders);
                
                // Clear order items
                $stmt = $pdo->prepare("DELETE FROM MM_ORDER_DETAILS WHERE ORDER_ID IN ($inQuery)");
                $stmt->execute($orders);
                
                // Clear order master entries
                $stmt = $pdo->prepare("DELETE FROM MM_ORDER WHERE CUSTOMER_ID = ?");
                $stmt->execute([$customerId]);
            }
            
            // Clear customer address directories
            $stmt = $pdo->prepare("DELETE FROM MM_CUSTOMER_ADDRESS WHERE CUSTOMER_ID = ?");
            $stmt->execute([$customerId]);
            
            // Clear customer record
            $stmt = $pdo->prepare("DELETE FROM MM_CUSTOMER WHERE CUSTOMER_ID = ?");
            $stmt->execute([$customerId]);
        }
        
        // Clear login credentials
        $stmt = $pdo->prepare("DELETE FROM MM_USER_LOGIN WHERE USER_ID = ?");
        $stmt->execute([$userId]);
        
        $pdo->commit();
        
        echo json_encode(["success" => true, "message" => "Account deleted successfully."]);
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
