<?php
// backend/api/contact.php

require_once __DIR__ . '/../config/db.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(["success" => false, "message" => "Method Not Allowed"]);
    exit();
}

$data = json_decode(file_get_contents("php://input"), true);

$name = trim($data['name'] ?? '');
$email = trim($data['email'] ?? '');
$mobile = trim($data['mobile'] ?? '');
$subject = trim($data['subject'] ?? '');
$message = trim($data['message'] ?? '');

if (empty($name) || empty($email) || empty($message)) {
    http_response_code(400);
    echo json_encode(["success" => false, "message" => "Name, Email, and Message are required fields."]);
    exit();
}

try {
    $contactId = 'cont_' . bin2hex(random_bytes(8));
    
    $stmt = $pdo->prepare("
        INSERT INTO MM_CONTACT_US (CONTACT_ID, NAME, EMAIL, MOBILE, SUBJECT, MESSAGE, CREATED_AT)
        VALUES (?, ?, ?, ?, ?, ?, NOW())
    ");
    $stmt->execute([$contactId, $name, $email, $mobile, $subject, $message]);
    
    echo json_encode([
        "success" => true,
        "message" => "Thank you! Your message has been received. We will get back to you shortly."
    ]);
} catch (\Exception $e) {
    http_response_code(500);
    echo json_encode(["success" => false, "message" => "Failed to submit message: " . $e->getMessage()]);
}
?>
