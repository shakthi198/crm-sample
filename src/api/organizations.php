<?php

require_once 'config.php';
ob_start();
require_once 'middleware.php';
ob_end_clean();

header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

$method = $_SERVER['REQUEST_METHOD'];
$rawInput = file_get_contents("php://input");
$input = json_decode($rawInput, true) ?: [];

/* ===============================
   🔐 JWT VALIDATION
================================ */

$token = getBearerToken();

if (!$token && isset($_GET['token'])) {
    $token = $_GET['token'];
}
if (!$token && isset($input['token'])) {
    $token = $input['token'];
}

$token = is_string($token) ? trim($token) : '';
$token = preg_replace('/^Bearer\s+/i', '', $token);
$token = trim($token, "\"' \t\n\r\0\x0B");

$validation = validateJWTAndGetGuid($token);

if (!$validation['success']) {
    http_response_code(401);
    echo json_encode([
        "success" => false,
        "message" => "Unauthorized",
        "error" => $validation['error'] ?? "JWT validation failed"
    ]);
    exit;
}

/* ===============================
   ✅ EXTRACT DATA FROM TOKEN
================================ */

$userData = $validation['data'];

$user_guid = $userData->user_guid ?? $userData->admin_guid ?? null;
$admin_guid = $userData->admin_guid ?? null;

/* ===============================
   🚦 ROUTER
================================ */

switch ($method) {

    case "GET":
        getOrganizations($conn);
        break;

    case "POST":
        createOrganization($conn, $user_guid, $admin_guid, $input);
        break;

    case "PUT":
        updateOrganization($conn, $admin_guid, $input);
        break;

    case "DELETE":
        deleteOrganization($conn, $input);
        break;

    default:
        http_response_code(405);
        echo json_encode([
            "success" => false,
            "message" => "Method Not Allowed"
        ]);
}


/* =========================================
   📌 GET ORGANIZATIONS
========================================= */

function getOrganizations($conn)
{
    $organization_guid = $_GET['organization_guid'] ?? null;

    if ($organization_guid) {

        $sql = "SELECT 
                    organization_guid,
                    company_name,
                    status,
                    email,
                    phone_number,
                    physical_address,
                    created_at
                FROM organizations 
                WHERE organization_guid = ? 
                AND is_active = 1";

        $stmt = $conn->prepare($sql);
        $stmt->bind_param("s", $organization_guid);

    } else {

        $sql = "SELECT 
                    organization_guid,
                    company_name,
                    status,
                    email,
                    phone_number,
                    physical_address,
                    created_at
                FROM organizations 
                WHERE is_active = 1
                ORDER BY created_at DESC";

        $stmt = $conn->prepare($sql);
    }

    $stmt->execute();
    $result = $stmt->get_result();

    $data = $organization_guid
        ? $result->fetch_assoc()
        : $result->fetch_all(MYSQLI_ASSOC);

    echo json_encode([
        "success" => true,
        "data" => $data
    ]);
}


/* =========================================
   📌 CREATE ORGANIZATION
========================================= */

function createOrganization($conn, $user_guid, $admin_guid, $data)
{
    if (empty($data['company_name'])) {
        http_response_code(400);
        echo json_encode([
            "success" => false,
            "message" => "company_name is required"
        ]);
        return;
    }

    $organization_guid = uuidv4();

    $company_name = $data['company_name'];
    $email = $data['email'] ?? null;
    $phone_number = $data['phone_number'] ?? null;
    $physical_address = $data['physical_address'] ?? null;

    $status = "Active";
    $is_active = 1;

    $sql = "INSERT INTO organizations 
            (organization_guid, company_name, status, is_active, user_guid, admin_guid, email, phone_number, physical_address)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)";

    $stmt = $conn->prepare($sql);

    $stmt->bind_param(
        "sssisssss",
        $organization_guid,
        $company_name,
        $status,
        $is_active,
        $user_guid,
        $admin_guid,
        $email,
        $phone_number,
        $physical_address
    );

    $stmt->execute();

    echo json_encode([
        "success" => true,
        "message" => "Organization created successfully",
        "organization_guid" => $organization_guid
    ]);
}


/* =========================================
   📌 UPDATE ORGANIZATION
========================================= */

function updateOrganization($conn, $admin_guid, $data)
{
    if (empty($data['organization_guid'])) {
        http_response_code(400);
        echo json_encode([
            "success" => false,
            "message" => "organization_guid is required"
        ]);
        return;
    }

    $sql = "UPDATE organizations 
            SET company_name = ?, 
                status = ?, 
                email = ?, 
                phone_number = ?, 
                physical_address = ?, 
                admin_guid = ?
            WHERE organization_guid = ?
            AND is_active = 1";

    $stmt = $conn->prepare($sql);

    $stmt->bind_param(
        "sssssss",
        $data['company_name'],
        $data['status'],
        $data['email'],
        $data['phone_number'],
        $data['physical_address'],
        $admin_guid,
        $data['organization_guid']
    );

    $stmt->execute();

    echo json_encode([
        "success" => true,
        "message" => "Organization updated successfully"
    ]);
}


/* =========================================
   📌 DELETE ORGANIZATION (SOFT DELETE)
========================================= */

function deleteOrganization($conn, $data)
{
    if (empty($data['organization_guid'])) {
        http_response_code(400);
        echo json_encode([
            "success" => false,
            "message" => "organization_guid is required"
        ]);
        return;
    }

    $sql = "UPDATE organizations 
            SET is_active = 0
            WHERE organization_guid = ?";

    $stmt = $conn->prepare($sql);
    $stmt->bind_param("s", $data['organization_guid']);
    $stmt->execute();

    echo json_encode([
        "success" => true,
        "message" => "Organization deleted successfully"
    ]);
}


/* =========================================
   🧬 UUID GENERATOR
========================================= */

function uuidv4()
{
    $data = random_bytes(16);

    $data[6] = chr(ord($data[6]) & 0x0f | 0x40);
    $data[8] = chr(ord($data[8]) & 0x3f | 0x80);

    return vsprintf('%s%s-%s-%s-%s-%s%s%s', str_split(bin2hex($data), 4));
}
