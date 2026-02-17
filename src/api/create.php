<?php
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

require_once __DIR__ . "/config.php";
require_once __DIR__ . "/vendor/autoload.php";

use Firebase\JWT\JWT;
use Firebase\JWT\Key;

// Only allow POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(["success" => false, "error" => "Method not allowed"]);
    exit;
}

// ==============================
// VERIFY JWT
// ==============================
$headers = getallheaders();
$authHeader = $headers['Authorization'] ?? '';
if (!$authHeader) {
    http_response_code(401);
    echo json_encode(["success" => false, "error" => "Authorization header missing"]);
    exit;
}

list($type, $token) = explode(" ", $authHeader, 2);

try {
    $decoded = JWT::decode($token, new Key($jwt_secret, $jwt_algorithm));
} catch (Exception $e) {
    http_response_code(401);
    echo json_encode(["success" => false, "error" => "Invalid token"]);
    exit;
}

// Only Admin can create users
if (strcasecmp($decoded->role, "Admin") !== 0 && strcasecmp($decoded->role, "Super Admin") !== 0) {
    http_response_code(403);
    echo json_encode(["success" => false, "error" => "Only Admin can create users"]);
    exit;
}

// ==============================
// PARSE INPUT
// ==============================
$input = json_decode(file_get_contents("php://input"), true);

$name = $input['name'] ?? null;
$email = $input['email'] ?? null;
$password = $input['password'] ?? null;
$role_guid = $input['role_guid'] ?? null;
$organization_guid = $input['organization_guid'] ?? null;

if (!$name || !$email || !$password || !$role_guid) {
    http_response_code(400);
    echo json_encode(["success" => false, "error" => "Missing required fields"]);
    exit;
}

// ==============================
// CHECK IF EMAIL EXISTS
// ==============================
$checkStmt = $conn->prepare("SELECT user_guid FROM users WHERE email = ? LIMIT 1");
$checkStmt->bind_param("s", $email);
$checkStmt->execute();
if ($checkStmt->get_result()->num_rows > 0) {
    http_response_code(400);
    echo json_encode(["success" => false, "error" => "Email already exists"]);
    exit;
}
$checkStmt->close();

// ==============================
// INSERT USER
// ==============================
$organization_guid = $input['organization_guid'] ?? $decoded->organization_guid ?? null;
$hashed_password = password_hash($password, PASSWORD_DEFAULT);

$stmt = $conn->prepare("
    INSERT INTO users (user_guid, organization_guid, name, email, password, role_guid, status, admin_guid)
    VALUES (UUID(), ?, ?, ?, ?, ?, 'Active', ?)
");
$stmt->bind_param(
    "ssssss",
    $organization_guid,
    $name,
    $email,
    $hashed_password,
    $role_guid,
    $decoded->admin_guid   // ✅ use -> not ['']
);


if ($stmt->execute()) {
    echo json_encode(["success" => true, "message" => "User created successfully"]);
} else {
    http_response_code(500);
    echo json_encode(["success" => false, "error" => "Failed to create user"]);
}
