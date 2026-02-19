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

if (!$data) {
    echo json_encode(["status" => "error", "message" => "Invalid input"]);
    exit;
}

$employee_guid = $conn->real_escape_string($data['employee_guid']);
$advance_amount = (float)$data['advance_amount'];
$balance_after = (float)$data['balance_after'];

if (empty($employee_guid) || $advance_amount <= 0) {
    echo json_encode(["status" => "error", "message" => "Invalid employee or amount"]);
    exit;
}

// Added organization_guid and created_by to insert
$sql = "INSERT INTO salary_advance (employee_guid, advance_amount, balance_after, organization_guid) VALUES (?, ?, ?, ?)";
$stmt = $conn->prepare($sql);
$stmt->bind_param("sdds", $employee_guid, $advance_amount, $balance_after, $organization_guid);

if ($stmt->execute()) {
    echo json_encode(["status" => "success", "message" => "Advance entry added successfully"]);
} else {
    echo json_encode(["status" => "error", "message" => "Database error: " . $stmt->error]);
}

$stmt->close();
$conn->close();
?>
