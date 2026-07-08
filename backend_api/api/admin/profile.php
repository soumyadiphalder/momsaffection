<?php
// backend/api/admin/profile.php

require_once __DIR__ . '/../../config/db.php';
require_once __DIR__ . '/../../config/auth_helper.php';

$user = getAuthenticatedUser();
if ($user['role_id'] !== 'ADMIN') {
    http_response_code(403);
    echo json_encode(["success" => false, "message" => "Access Denied: Admin authorization required."]);
    exit();
}

function uploadAdminImage() {
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
    $newName = 'admin_' . bin2hex(random_bytes(8)) . '.' . $ext;
    if (move_uploaded_file($tmpPath, $dir . $newName)) {
        return 'uploads/' . $newName;
    }
    return null;
}

$method = $_SERVER['REQUEST_METHOD'];

try {
    if ($method === 'GET') {
        $stmt = $pdo->prepare("SELECT u.USER_EMAIL, u.USER_MOBILE, u.USER_STATUS, u.USER_LAST_LOGIN, u.USER_LAST_LOGOUT, a.ADMIN_ID, a.ADMIN_NAME, a.ADMIN_IMAGE, a.ADMIN_ADDRESS FROM MM_USER_LOGIN u JOIN MM_ADMIN a ON u.USER_ID = a.USER_ID WHERE u.USER_ID = ? LIMIT 1");
        $stmt->execute([$user['user_id']]);
        $profile = $stmt->fetch();
        if (!$profile) {
            http_response_code(404);
            echo json_encode(["success" => false, "message" => "Admin profile not found."]);
            exit();
        }
        echo json_encode(["success" => true, "profile" => $profile]);
        exit();
    }

    if ($method === 'POST' || $method === 'PUT') {
        if (strpos($_SERVER['CONTENT_TYPE'] ?? '', 'application/json') !== false) {
            $data = json_decode(file_get_contents('php://input'), true);
        } else {
            $data = $_POST;
        }
        $name = trim($data['name'] ?? '');
        $address = trim($data['address'] ?? '');
        $email = trim($data['email'] ?? '');
        $mobile = trim($data['mobile'] ?? '');

        if (empty($name) || empty($email) || empty($mobile)) {
            http_response_code(400);
            echo json_encode(["success" => false, "message" => "Name, Email and Mobile are required fields."]);
            exit();
        }

        $pdo->beginTransaction();
        $stmtCheck = $pdo->prepare("SELECT USER_ID FROM MM_USER_LOGIN WHERE (USER_EMAIL = ? OR USER_MOBILE = ?) AND USER_ID != ?");
        $stmtCheck->execute([$email, $mobile, $user['user_id']]);
        if ($stmtCheck->fetch()) {
            $pdo->rollBack();
            http_response_code(400);
            echo json_encode(["success" => false, "message" => "Email address or Mobile number already in use by another user."]);
            exit();
        }

        $stmtUser = $pdo->prepare("UPDATE MM_USER_LOGIN SET USER_EMAIL = ?, USER_MOBILE = ? WHERE USER_ID = ?");
        $stmtUser->execute([$email, $mobile, $user['user_id']]);

        $imagePath = uploadAdminImage();
        if (!empty($imagePath)) {
            $stmtAdmin = $pdo->prepare("UPDATE MM_ADMIN SET ADMIN_NAME = ?, ADMIN_ADDRESS = ?, ADMIN_IMAGE = ? WHERE USER_ID = ?");
            $stmtAdmin->execute([$name, $address, $imagePath, $user['user_id']]);
        } else {
            $stmtAdmin = $pdo->prepare("UPDATE MM_ADMIN SET ADMIN_NAME = ?, ADMIN_ADDRESS = ? WHERE USER_ID = ?");
            $stmtAdmin->execute([$name, $address, $user['user_id']]);
        }

        $pdo->commit();
        echo json_encode(["success" => true, "message" => "Admin profile updated successfully."]);
        exit();
    }

    http_response_code(405);
    echo json_encode(["success" => false, "message" => "Method Not Allowed"]);
} catch (\Exception $e) {
    if ($pdo->inTransaction()) {
        $pdo->rollBack();
    }
    http_response_code(500);
    echo json_encode(["success" => false, "message" => "Server error: " . $e->getMessage()]);
}
?>