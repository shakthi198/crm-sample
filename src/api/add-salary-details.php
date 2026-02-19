<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type, Authorization, Organization-Guid");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

require_once __DIR__ . "/config.php";
require_once __DIR__ . "/middleware.php";

function getOrganizationGuid()
{
    $headers = getallheaders();
    foreach ($headers as $key => $value) {
        if (strtolower($key) === 'organization-guid') {
            return $value;
        }
    }
    return null;
}

$organization_guid = getOrganizationGuid();

if (!$organization_guid) {
    http_response_code(400);
    echo json_encode([
        "success" => false,
        "error" => "Organization-Guid header missing"
    ]);
    exit;
}

$token = getBearerToken();
$validation = validateJWTAndGetGuid($token);

if (!$validation['success']) {
    http_response_code(401);
    echo json_encode([
        "success" => false,
        "error" => "Invalid token"
    ]);
    exit;
}

$user = $validation['data'];
$user_guid = $user->user_guid ?? null;

$data = json_decode(file_get_contents("php://input"), true);

if (!isset($data['employee_guid']) || !isset($data['basic_salary'])) {
    echo json_encode([
        "status" => "error",
        "message" => "Missing required fields"
    ]);
    exit;
}

$target_user_guid = $data['employee_guid'];
$basic_salary = $data['basic_salary'];
$allowances = $data['allowances'] ?? 0;
$deductions = $data['deductions'] ?? 0;

// Verify user belongs to organization
$getUser = $conn->prepare("
SELECT role_guid, organization_guid
FROM users
WHERE user_guid=? AND organization_guid=?
");

$getUser->bind_param("ss", $target_user_guid, $organization_guid);
$getUser->execute();
$userResult = $getUser->get_result();

if ($userResult->num_rows == 0) {
    echo json_encode([
        "status" => "error",
        "message" => "User not found in this organization"
    ]);
    exit;
}

$targetUser = $userResult->fetch_assoc();
$role_guid = $targetUser['role_guid'];

// Use organization_guid from header (enforced tenant)
$stmt = $conn->prepare("
INSERT INTO user_salary_details
(user_guid, role_guid, organization_guid, basic_salary, allowances, deductions)
VALUES (?, ?, ?, ?, ?, ?)
");

$stmt->bind_param(
    "sssddd",
    $target_user_guid,
    $role_guid,
    $organization_guid,
    $basic_salary,
    $allowances,
    $deductions
);

if ($stmt->execute()) {
    echo json_encode([
        "status" => "success",
        "message" => "Salary added successfully"
    ]);
} else {
    echo json_encode([
        "status" => "error",
        "message" => $stmt->error
    ]);
}

$stmt->close();
$conn->close();
?>