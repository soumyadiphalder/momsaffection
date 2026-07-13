<?php
// backend/config/auth_helper.php

require_once __DIR__ . '/db.php';

/**
 * Generate stateless JWT token
 */
function generateToken($userId, $roleId) {
    $secret = getenv('JWT_SECRET') ?: 'default_momsaffection_secret_key_777';
    $header = json_encode(['alg' => 'HS256', 'typ' => 'JWT']);
    
    // Admin session expires in 1 hour (3600s), customer in 24 hours
    $duration = ($roleId === 'ADMIN') ? 3600 : (24 * 60 * 60);
    
    $payload = json_encode([
        'user_id' => $userId,
        'role_id' => $roleId,
        'exp' => time() + $duration
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
    
    // Check $_SERVER variables for standard and redirected authorization headers
    if (isset($_SERVER['Authorization'])) {
        $headers = trim($_SERVER["Authorization"]);
    } else if (isset($_SERVER['HTTP_AUTHORIZATION'])) {
        $headers = trim($_SERVER["HTTP_AUTHORIZATION"]);
    } else if (isset($_SERVER['REDIRECT_HTTP_AUTHORIZATION'])) {
        $headers = trim($_SERVER["REDIRECT_HTTP_AUTHORIZATION"]);
    } else if (isset($_SERVER['HTTP_X_AUTHORIZATION'])) {
        $headers = trim($_SERVER["HTTP_X_AUTHORIZATION"]);
    } else if (isset($_SERVER['REDIRECT_HTTP_X_AUTHORIZATION'])) {
        $headers = trim($_SERVER["REDIRECT_HTTP_X_AUTHORIZATION"]);
    } else if (function_exists('getallheaders')) {
        $requestHeaders = getallheaders();
        if (is_array($requestHeaders)) {
            foreach ($requestHeaders as $key => $val) {
                $lowerKey = strtolower($key);
                if ($lowerKey === 'authorization' || $lowerKey === 'x-authorization') {
                    $headers = trim($val);
                    break;
                }
            }
        }
    } else if (function_exists('apache_request_headers')) {
        $requestHeaders = apache_request_headers();
        if (is_array($requestHeaders)) {
            foreach ($requestHeaders as $key => $val) {
                $lowerKey = strtolower($key);
                if ($lowerKey === 'authorization' || $lowerKey === 'x-authorization') {
                    $headers = trim($val);
                    break;
                }
            }
        }
    }
    
    // Bulletproof fallback to GET or POST/JSON request parameters if headers are completely stripped
    if (empty($headers)) {
        if (isset($_GET['token'])) {
            $headers = 'Bearer ' . trim($_GET['token']);
        } else if (isset($_GET['auth_token'])) {
            $headers = 'Bearer ' . trim($_GET['auth_token']);
        } else if (isset($_POST['token'])) {
            $headers = 'Bearer ' . trim($_POST['token']);
        } else {
            $jsonInput = json_decode(file_get_contents('php://input'), true);
            if (is_array($jsonInput) && isset($jsonInput['token'])) {
                $headers = 'Bearer ' . trim($jsonInput['token']);
            }
        }
    }
    
    if (!empty($headers)) {
        if (preg_match('/Bearer\s(\S+)/i', $headers, $matches)) {
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
        $serverVars = [];
        foreach ($_SERVER as $key => $val) {
            if (stripos($key, 'auth') !== false || stripos($key, 'http_') === 0 || stripos($key, 'redirect_') === 0) {
                $serverVars[$key] = $val;
            }
        }
        $allHeaders = function_exists('getallheaders') ? getallheaders() : (function_exists('apache_request_headers') ? apache_request_headers() : []);
        echo json_encode([
            "success" => false,
            "message" => "Access Denied: Missing Authorization Header",
            "debug_server_variables" => $serverVars,
            "debug_all_headers" => $allHeaders
        ]);
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
