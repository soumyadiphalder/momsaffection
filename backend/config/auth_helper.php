<?php
// backend/config/auth_helper.php

require_once __DIR__ . '/db.php';

/**
 * Generate stateless JWT token
 */
function generateToken($userId, $roleId) {
    $secret = getenv('JWT_SECRET') ?: 'default_momsaffection_secret_key_777';
    $header = json_encode(['alg' => 'HS256', 'typ' => 'JWT']);
    $payload = json_encode([
        'user_id' => $userId,
        'role_id' => $roleId,
        'exp' => time() + (24 * 60 * 60) // valid for 1 day
    ]);
    
    $base64UrlHeader = str_replace(['+', '/', '='], ['-', '_', ''], base64_encode($header));
    $base64UrlPayload = str_replace(['+', '/', '='], ['-', '_', ''], base64_encode($payload));
    
    $signature = hash_hmac('sha256', $base64UrlHeader . "." . $base64UrlPayload, $secret, true);
    $base64UrlSignature = str_replace(['+', '/', '='], ['-', '_', ''], base64_encode($signature));
    
    return $base64UrlHeader . "." . $base64UrlPayload . "." . $base64UrlSignature;
}

/**
 * Validate JWT token signature and expiration
 */
function validateToken($token) {
    $secret = getenv('JWT_SECRET') ?: 'default_momsaffection_secret_key_777';
    $parts = explode('.', $token);
    if (count($parts) !== 3) return null;
    
    list($header, $payload, $signature) = $parts;
    
    $expectedSig = hash_hmac('sha256', $header . "." . $payload, $secret, true);
    $expectedSigBase64 = str_replace(['+', '/', '='], ['-', '_', ''], base64_encode($expectedSig));
    
    if (!hash_equals($expectedSigBase64, $signature)) return null;
    
    $data = json_decode(base64_decode(str_replace(['-', '_'], ['+', '/'], $payload)), true);
    if (!$data || !isset($data['exp']) || $data['exp'] < time()) return null;
    
    return $data;
}

/**
 * Extract Bearer token from request headers
 */
function getBearerToken() {
    $headers = null;
    if (isset($_SERVER['Authorization'])) {
        $headers = trim($_SERVER["Authorization"]);
    } else if (isset($_SERVER['HTTP_AUTHORIZATION'])) {
        $headers = trim($_SERVER["HTTP_AUTHORIZATION"]);
    } else if (function_exists('apache_request_headers')) {
        $requestHeaders = apache_request_headers();
        $requestHeaders = array_combine(array_map('ucwords', array_keys($requestHeaders)), array_values($requestHeaders));
        if (isset($requestHeaders['Authorization'])) {
            $headers = trim($requestHeaders['Authorization']);
        }
    }
    
    if (!empty($headers)) {
        if (preg_match('/Bearer\s(\S+)/', $headers, $matches)) {
            return $matches[1];
        }
    }
    return null;
}

/**
 * Authenticates request or exits with HTTP 401
 */
function getAuthenticatedUser() {
    $token = getBearerToken();
    if (!$token) {
        http_response_code(401);
        echo json_encode(["success" => false, "message" => "Access Denied: Missing Authorization Header"]);
        exit();
    }
    
    $decoded = validateToken($token);
    if (!$decoded) {
        http_response_code(401);
        echo json_encode(["success" => false, "message" => "Access Denied: Invalid or Expired Token"]);
        exit();
    }
    
    return $decoded;
}
?>
