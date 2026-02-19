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

$employee_guid = $_GET['employee_guid'] ?? null;

// Query using user_salary_details as the base for salary info
// Join with users for name
// Join with roles for role name
// Left Join with salary_advance for advance calc
// Added Organization-Guid filtering
$sql = "
SELECT 
    usd.user_guid AS employee_guid,
    u.name AS employee_name,
    r.role_name AS role,
    usd.net_salary AS totalSalary,
    COALESCE(SUM(sa.advance_amount), 0) AS advanceTaken,
    usd.payment_status AS status,
    usd.allowances,
    usd.deductions,
    usd.basic_salary,
    usd.net_salary
FROM user_salary_details usd
JOIN users u ON usd.user_guid = u.user_guid
LEFT JOIN roles r ON u.role_guid = r.role_guid
LEFT JOIN salary_advance sa ON usd.user_guid = sa.employee_guid AND sa.organization_guid = ?
WHERE u.is_active = 1 
AND usd.organization_guid = ?
";

$types = "ss";
$params = [$organization_guid, $organization_guid];

if ($employee_guid) {
    $sql .= " AND usd.user_guid = ?";
    $types .= "s";
    $params[] = $employee_guid;
}

$sql .= " GROUP BY usd.user_guid";

$stmt = $conn->prepare($sql);
$stmt->bind_param($types, ...$params);
$stmt->execute();
$result = $stmt->get_result();

$data = [];

while ($row = $result->fetch_assoc()) {
    $totalSalary = (float)$row['totalSalary'];
    $advanceTaken = (float)$row['advanceTaken'];
    $allowances = (float)$row['allowances'];
    $balance = $totalSalary + $allowances - $advanceTaken;
    // $total= $totalSalary + $allowances - (float)$row['deductions']- $advanceTaken;
    // Status fallback
    $status = $row['status'] ? $row['status'] : 'Unpaid';

    $data[] = [
        "employee_guid" => $row['employee_guid'],
        "employee_name" => $row['employee_name'],
        "role" => $row['role'],
        "totalSalary" => $totalSalary,
        "advanceTaken" => $advanceTaken,
        "allowances" => (float)$row['allowances'],
        "deductions" => (float)$row['deductions'],
        "basic_salary" => (float)$row['basic_salary'],
        "balance" => $balance,
        "status" => $status
    ];
}

// Return single object or list based on request
if ($employee_guid) {
    $singleData = count($data) > 0 ? $data[0] : null;
    echo json_encode([
        "status" => "success",
        "data" => $singleData
    ]);
} else {
    echo json_encode([
        "status" => "success",
        "data" => $data
    ]);
}

$stmt->close();
$conn->close();
?>
