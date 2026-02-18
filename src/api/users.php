<?php
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

require_once __DIR__ . "/config.php";
require_once __DIR__ . "/vendor/autoload.php";

use Firebase\JWT\JWT;
use Firebase\JWT\Key;

// ==============================
// VERIFY JWT (Improved detection)
// ==============================
function getBearerToken()
{
    $headers = array_change_key_case(getallheaders(), CASE_LOWER);
    $authHeader = null;

    if (isset($headers['authorization'])) {
        $authHeader = $headers['authorization'];
    } elseif (isset($_SERVER['HTTP_AUTHORIZATION'])) {
        $authHeader = $_SERVER['HTTP_AUTHORIZATION'];
    } elseif (isset($_SERVER['REDIRECT_HTTP_AUTHORIZATION'])) {
        $authHeader = $_SERVER['REDIRECT_HTTP_AUTHORIZATION'];
    }

    if (!$authHeader)
        return null;

    $authHeader = trim($authHeader, " \t\n\r\0\x0B\"'");
    if (preg_match('/Bearer\s(\S+)/i', $authHeader, $matches)) {
        return $matches[1];
    }
    return $authHeader; // Return as-is if not prefixed with Bearer
}

$token = getBearerToken();

if (!$token) {
    http_response_code(401);
    echo json_encode(["success" => false, "error" => "Authorization header missing or invalid format"]);
    exit;
}

try {
    $decoded = JWT::decode($token, new Key($jwt_secret, $jwt_algorithm));
} catch (Exception $e) {
    http_response_code(401);
    echo json_encode(["success" => false, "error" => "Invalid token: " . $e->getMessage()]);
    exit;
}

// Check for Organization-Guid header
$headers = array_change_key_case(getallheaders(), CASE_LOWER);
if (isset($headers['organization-guid']) && !empty($headers['organization-guid'])) {
    $decoded->organization_guid = $headers['organization-guid'];
}

// Only Admin can manage users
if (!isset($decoded->role) || (strcasecmp($decoded->role, "Admin") !== 0 && strcasecmp($decoded->role, "Super Admin") !== 0)) {
    http_response_code(403);
    echo json_encode(["success" => false, "error" => "Only Admin can manage users"]);
    exit;
}

$method = $_SERVER['REQUEST_METHOD'];

switch ($method) {
    case 'GET':
        handleGet($conn, $decoded);
        break;
    case 'POST':
        handleUpdate($conn, $decoded);
        break;
    case 'PUT':
        handleUpdate($conn, $decoded);
        break;
    case 'DELETE':
        handleDelete($conn, $decoded);
        break;
    default:
        http_response_code(405);
        echo json_encode(["success" => false, "error" => "Method not allowed"]);
        break;
}

function handleGet($conn, $decoded)
{
    $user_guid = $_GET['user_guid'] ?? null;

    if ($user_guid) {
        $stmt = $conn->prepare("
            SELECT u.user_guid, u.organization_guid, u.name, u.email, u.role_guid, r.role_name, u.admin_guid, u.status, u.is_active 
            FROM users u
            LEFT JOIN roles r ON u.role_guid = r.role_guid
            WHERE u.user_guid = ?
        ");
        $stmt->bind_param("s", $user_guid);
        $stmt->execute();
        $result = $stmt->get_result();
        $user = $result->fetch_assoc();

        if ($user) {
            echo json_encode(["success" => true, "data" => $user]);
        } else {
            http_response_code(404);
            echo json_encode(["success" => false, "error" => "User not found"]);
        }
        $stmt->close();
    } else {
        $filter = "";
        $params = [];
        $types = "";

        // Admin can only see their own organization's users
        if (strcasecmp($decoded->role, "Super Admin") !== 0) {
            $filter = " WHERE u.organization_guid = ?";
            $params[] = $decoded->organization_guid;
            $types = "s";
        } elseif (isset($_GET['role'])) {
            // Super Admin can filter by role (e.g., ?role=Admin)
            $filter = " WHERE r.role_name = ?";
            $params[] = $_GET['role'];
            $types = "s";
        }

        $sql = "
            SELECT u.user_guid, u.organization_guid, u.name, u.email, u.role_guid, r.role_name, u.admin_guid, u.status, u.is_active 
            FROM users u
            LEFT JOIN roles r ON u.role_guid = r.role_guid
            $filter
            ORDER BY u.name ASC
        ";

        if (!empty($filter)) {
            $stmt = $conn->prepare($sql);
            $stmt->bind_param($types, ...$params);
            $stmt->execute();
            $result = $stmt->get_result();
        } else {
            $result = $conn->query($sql);
        }

        $users = [];
        while ($row = $result->fetch_assoc()) {
            // Fetch organizations created by this user
            $orgs_stmt = $conn->prepare("SELECT organization_guid FROM `organizations` WHERE `admin_guid` = ?");
            $orgs_stmt->bind_param("s", $row['user_guid']);
            $orgs_stmt->execute();
            $orgs_result = $orgs_stmt->get_result();

            $row['organizations'] = [];
            while ($org_row = $orgs_result->fetch_assoc()) {
                $row['organizations'][] = $org_row['organization_guid'];
            }
            $orgs_stmt->close();

            $users[] = $row;
        }
        echo json_encode(["success" => true, "data" => $users]);
        if (isset($stmt))
            $stmt->close();
    }
}

function handleUpdate($conn, $decoded)
{
    $input = json_decode(file_get_contents("php://input"), true);

    // If the user pasted a GET response directly, extract the 'data' part
    if (isset($input['data']) && is_array($input['data'])) {
        $data = $input['data'];
    } else {
        $data = $input;
    }

    // Check for user_guid in body first, then fallback to GET parameter
    $user_guid = $data['user_guid'] ?? $_GET['user_guid'] ?? null;

    if (!$user_guid) {
        http_response_code(400);
        echo json_encode(["success" => false, "error" => "User GUID is required for update"]);
        return;
    }

    // SELF-PROTECTION (Prevent admin from locking themselves out)
    // ==============================
    $current_user_guid = $decoded->user_guid ?? $decoded->admin_guid ?? null;

    if ($user_guid === $current_user_guid) {
        // Prevent changing own role or deactivating themselves
        if (isset($data['role_guid']) || isset($data['is_active']) || isset($data['status'])) {
            http_response_code(403);
            echo json_encode(["success" => false, "error" => "You cannot change your own role or status. Please ask another admin to do this."]);
            return;
        }
    }

    $updatable_fields = [
        'name' => 's',
        'email' => 's',
        'role_guid' => 's',
        'status' => 's',
        'is_active' => 'i',
        'password' => 's',
        'organization_guid' => 's'
    ];

    $fields = [];
    $params = [];
    $types = "";

    foreach ($updatable_fields as $field => $type) {
        if (isset($data[$field])) {
            $value = $data[$field];

            // If it's a password update, skip if value is empty/null
            if ($field === 'password' && empty($value)) {
                continue;
            }

            // Hash password if it's being updated
            if ($field === 'password') {
                $value = password_hash($value, PASSWORD_DEFAULT);
            }

            $fields[] = "$field = ?";
            $params[] = $value;
            $types .= $type;
        }
    }

    if (empty($fields)) {
        http_response_code(400);
        echo json_encode(["success" => false, "error" => "No fields provided to update"]);
        return;
    }

    $sql = "UPDATE users SET " . implode(", ", $fields) . " WHERE user_guid = ?";
    $params[] = $user_guid;
    $types .= "s";

    $stmt = $conn->prepare($sql);
    $stmt->bind_param($types, ...$params);

    if ($stmt->execute()) {
        echo json_encode(["success" => true, "message" => "User updated successfully"]);
    } else {
        http_response_code(500);
        echo json_encode(["success" => false, "error" => "Failed to update user: " . $conn->error]);
    }
    $stmt->close();
}

function handleDelete($conn, $decoded)
{
    // Check GET first, then body
    $user_guid = $_GET['user_guid'] ?? null;

    if (!$user_guid) {
        $input = json_decode(file_get_contents("php://input"), true);
        $user_guid = $input['user_guid'] ?? $input['data']['user_guid'] ?? null;
    }

    if (!$user_guid) {
        http_response_code(400);
        echo json_encode(["success" => false, "error" => "User GUID is required for deletion"]);
        return;
    }

    // SELF-PROTECTION: Prevent admin from deleting themselves
    $current_user_guid = $decoded->user_guid ?? $decoded->admin_guid ?? null;

    if ($user_guid === $current_user_guid) {
        http_response_code(403);
        echo json_encode(["success" => false, "error" => "You cannot delete your own account."]);
        return;
    }

    $stmt = $conn->prepare("DELETE FROM users WHERE user_guid = ?");
    $stmt->bind_param("s", $user_guid);

    if ($stmt->execute()) {
        if ($stmt->affected_rows > 0) {
            echo json_encode(["success" => true, "message" => "User deleted successfully"]);
        } else {
            http_response_code(404);
            echo json_encode(["success" => false, "error" => "User not found or already deleted"]);
        }
    } else {
        http_response_code(500);
        echo json_encode(["success" => false, "error" => "Failed to delete user: " . $conn->error]);
    }
    $stmt->close();
}