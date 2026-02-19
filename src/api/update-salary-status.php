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

$input = json_decode(file_get_contents("php://input"), true);

if (!isset($input['employee_guids']) || !isset($input['status'])) {
    http_response_code(400);
    echo json_encode([
        "success" => false,
        "message" => "employee_guids and status required"
    ]);
    exit;
}

$employee_guids = $input['employee_guids'];
$status = $input['status'];

if ($status !== "Paid" && $status !== "Unpaid") {
    echo json_encode([
        "success" => false,
        "message" => "Invalid status"
    ]);
    exit;
}

$updated = 0;

// Added organization_guid filtering
$stmt = $conn->prepare("
UPDATE user_salary_details
SET payment_status = ?, updated_at = NOW()
WHERE user_guid = ? AND organization_guid = ?
");

foreach ($employee_guids as $guid) {
    $stmt->bind_param("sss", $status, $guid, $organization_guid);
    
    if ($stmt->execute()) {
        $updated++;
    }
}

$stmt->close();
$conn->close();

echo json_encode([
    "success" => true,
    "message" => "$updated employee salary status updated",
    "updated_count" => $updated
]);
?>