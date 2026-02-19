<?php
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

require_once __DIR__ . "/config.php";   // contains $conn, $jwt_secret, $jwt_algorithm
require_once __DIR__ . "/vendor/autoload.php";

use Firebase\JWT\JWT;
use Firebase\JWT\Key;

// Only allow POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode([
        "success" => false,
        "error" => "Method not allowed"
    ]);
    exit;
}

// Parse input
$input = json_decode(file_get_contents("php://input"), true);
$username = $input['username'] ?? null;
$password = $input['password'] ?? null;

if (!$username || !$password) {
    http_response_code(400);
    echo json_encode([
        "success" => false,
        "error" => "Username and password required"
    ]);
    exit;
}

// ==============================
// FETCH USER (Check super_admin table first)
// ==============================
$is_super_admin = false;
$stmt = $conn->prepare("SELECT * FROM super_admin WHERE email = ? OR username = ? LIMIT 1");
$stmt->bind_param("ss", $username, $username);
$stmt->execute();
$user_data = $stmt->get_result()->fetch_assoc();

if ($user_data) {
    // Found in super_admin table
    $is_super_admin = true;
    $user = [
        'user_guid' => $user_data['super_admin_guid'],
        'organization_guid' => null, // Super Admin is global
        'admin_guid' => null,
        'name' => $user_data['full_name'],
        'username' => $user_data['username'],
        'password' => $user_data['password'],
        'role_name' => 'Super Admin',
        'role_guid' => 'SA_ROLE_GUID_001',
        'is_active' => $user_data['is_active']
    ];
} else {
    // Check regular users table
    $stmt = $conn->prepare("
        SELECT 
            u.user_guid,
            u.admin_guid,
            u.organization_guid,
            u.name as full_name,
            u.email,
            u.password,
            u.role_guid,
            r.role_name,
            u.is_active
        FROM users u
        JOIN roles r ON u.role_guid = r.role_guid
        WHERE u.email = ? OR u.name = ?
        LIMIT 1
    ");
    $stmt->bind_param("ss", $username, $username);
    $stmt->execute();
    $user_data = $stmt->get_result()->fetch_assoc();

    if ($user_data) {
        $user = [
            'user_guid' => $user_data['user_guid'],
            'organization_guid' => $user_data['organization_guid'],
            'admin_guid' => $user_data['admin_guid'] ?? null,
            'name' => $user_data['full_name'],
            'username' => $user_data['email'],
            'password' => $user_data['password'],
            'role_name' => $user_data['role_name'],
            'role_guid' => $user_data['role_guid'],
            'is_active' => $user_data['is_active']
        ];
    } else {
        $user = null;
    }
}

// ==============================
// VERIFY PASSWORD
// ==============================
$is_valid = false;
$needs_rehash = false;

if ($user) {
    if (password_verify($password, $user['password'])) {
        $is_valid = true;
    } elseif ($password === $user['password']) {
        // Plain text match! (User requested this)
        $is_valid = true;
        $needs_rehash = true;
    }
}

if (!$is_valid) {
    http_response_code(401);
    echo json_encode(["success" => false, "error" => "Invalid credentials"]);
    exit;
}

// Upgrade to hash if needed
if ($needs_rehash) {
    $new_hash = password_hash($password, PASSWORD_DEFAULT);
    if ($is_super_admin) {
        $upd = $conn->prepare("UPDATE super_admin SET password = ? WHERE super_admin_guid = ?");
    } else {
        $upd = $conn->prepare("UPDATE users SET password = ? WHERE user_guid = ?");
    }
    $upd->bind_param("ss", $new_hash, $user['user_guid']);
    $upd->execute();
    $upd->close();
}

if ($user['is_active'] == 0) {
    http_response_code(403);
    echo json_encode(["success" => false, "error" => "Account inactive"]);
    exit;
}

// ==============================
// FETCH PERMISSIONS
// ==============================
$permissions = [];

if (strcasecmp($user['role_name'], "Admin") === 0 || strcasecmp($user['role_name'], "Super Admin") === 0) {
    // Admin gets ALL permissions automatically with all rights
    $result = $conn->query("SELECT module, full_access, view, edit, `delete` FROM permissions WHERE is_active = 1");
    while ($row = $result->fetch_assoc()) {
        $permissions[] = [
            "module" => $row['module'],
            "full_access" => 1, // Admins always get 1
            "view" => 1,
            "edit" => 1,
            "delete" => 1
        ];
    }
} else {
    $stmt2 = $conn->prepare("
    SELECT p.module, p.full_access, p.view, p.edit, p.`delete`
    FROM role_permissions rp
    JOIN permissions p ON rp.permission_guid = p.permission_guid
    WHERE rp.role_guid = ? AND rp.organization_guid = ? AND rp.is_active = 1
");
    $stmt2->bind_param("ss", $user['role_guid'], $user['organization_guid']);
    $stmt2->execute();
    $res2 = $stmt2->get_result();

    if ($res2) {
        while ($row = $res2->fetch_assoc()) {
            $permissions[] = $row;
        }
    }
    $stmt2->close();

}

// ==============================
// BUILD JWT PAYLOAD
// ==============================
$issuedAt = time();
$expireTime = $issuedAt + (24 * 60 * 60); // Default: 24 hours

// If Super Admin, expire in 30 minutes
if (strcasecmp($user['role_name'], "Super Admin") === 0) {
    $expireTime = $issuedAt + (30 * 60); // 30 minutes
}

$payload = [
    "iat" => $issuedAt,
    "exp" => $expireTime,
    "user_guid" => $user['user_guid'],
    "organization_guid" => $user['organization_guid'],
    "admin_guid" => $user['admin_guid'],
    "username" => $user['name'],
    "role" => $user['role_name'],
    "is_active" => $user['is_active']
];


// Sign JWT
$token = JWT::encode($payload, $jwt_secret, $jwt_algorithm);

// Response
echo json_encode([
    "success" => true,
    "message" => "Login successful",
    "token" => $token,
    "role" => $user['role_name'],
    "username" => $user['name'],
    "organization_guid" => $user['organization_guid'],
    "permissions" => $permissions,  // ✅ shown in response
]);

