<?php
header("Content-Type: application/json; charset=UTF-8");

// Handle CORS preflight request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    header("Access-Control-Allow-Origin: *");
    header("Access-Control-Allow-Methods: POST, GET, OPTIONS");
    header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");
    header("Access-Control-Allow-Credentials: true");
    header("Access-Control-Max-Age: 86400");
    http_response_code(204);
    exit;
}

// General CORS headers for all requests
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Credentials: true");
header("Access-Control-Expose-Headers: Content-Type, Authorization");

require_once 'config.php';
require_once 'vendor/autoload.php';

// Retrieve Bearer token (case-insensitive headers)
function getBearerToken()
{
    $headers = array_change_key_case(getallheaders(), CASE_LOWER);

    if (isset($headers['authorization'])) {
        $authHeader = $headers['authorization'];
    } elseif (isset($_SERVER['HTTP_AUTHORIZATION'])) {
        $authHeader = $_SERVER['HTTP_AUTHORIZATION'];
    } elseif (isset($_SERVER['REDIRECT_HTTP_AUTHORIZATION'])) {
        $authHeader = $_SERVER['REDIRECT_HTTP_AUTHORIZATION'];
    } else {
        return null;
    }

    // Remove any surrounding whitespace or quotes
    $authHeader = trim($authHeader, " \t\n\r\0\x0B\"'");

    if (preg_match('/Bearer\s(\S+)/i', $authHeader, $matches)) {
        return trim($matches[1]);
    }

    return null;
}

// Validate JWT and extract payload
function validateJWTAndGetGuid($token)
{
    $parts = explode('.', $token);
    if (count($parts) !== 3) {
        return ['success' => false, 'error' => 'Invalid token structure', 'code' => 401];
    }


    global $jwt_secret, $jwt_algorithm;
    try {
        $decoded = \Firebase\JWT\JWT::decode($token, new \Firebase\JWT\Key($jwt_secret, $jwt_algorithm));
        return ['success' => true, 'message' => 'Valid Token', 'data' => $decoded];
    } catch (Exception $e) {
        return ['success' => false, 'error' => $e->getMessage(), 'code' => 401];
    }
}

// Main logic
try {
    $token = getBearerToken();

    if (!$token) {
        http_response_code(401);
        echo json_encode(['success' => false, 'error' => 'Unauthorized: No token found']);
        exit;
    }

    $validation = validateJWTAndGetGuid($token);

    if ($validation['success']) {
        $user_payload = $validation['data'];
    } else {
        http_response_code($validation['code']);
        echo json_encode([
            'success' => false,
            'error' => $validation['error'],
        ]);
        exit;
    }

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => 'Server error: ' . $e->getMessage()]);
    exit;
}
?>