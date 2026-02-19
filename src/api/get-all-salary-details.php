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

// Added Organization-Guid filtering
$sql = "SELECT 
    usd.user_guid AS employee_guid,
    u.name AS employee_name,
    r.role_name AS role,
    usd.basic_salary,
    usd.allowances,
    usd.deductions,
    usd.net_salary,
    usd.payment_status,
    usd.created_at
FROM user_salary_details usd
LEFT JOIN users u ON u.user_guid = usd.user_guid
LEFT JOIN roles r ON r.role_guid = usd.role_guid
WHERE usd.organization_guid = ?
ORDER BY usd.created_at DESC";

$stmt = $conn->prepare($sql);
$stmt->bind_param("s", $organization_guid);
$stmt->execute();
$result = $stmt->get_result();

$data = [];

if ($result) {
    while ($row = $result->fetch_assoc()) {
        $data[] = $row;
    }
} else {
    echo json_encode([
        "success" => false, 
        "error" => $conn->error
    ]);
    exit;
}

echo json_encode([
    "success" => true,
    "data" => $data
]);

$stmt->close();
$conn->close();
?>
