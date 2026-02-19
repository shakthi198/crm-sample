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

// Added Organization-Guid filtering
$sql = "SELECT 
            sa.id, 
            sa.employee_guid AS guid, 
            sa.advance_amount AS amount, 
            sa.balance_after,
            sa.created_at AS date, 
            u.name AS employeeName,
            r.role_name AS role
        FROM salary_advance sa
        LEFT JOIN users u ON sa.employee_guid = u.user_guid
        LEFT JOIN roles r ON u.role_guid = r.role_guid
        WHERE sa.organization_guid = ?
        ORDER BY sa.created_at DESC";

$stmt = $conn->prepare($sql);
$stmt->bind_param("s", $organization_guid);
$stmt->execute();
$result = $stmt->get_result();

$history = [];
if ($result) {
    $remainingBalance = 0; // Initialize remaining balance
    while($row = $result->fetch_assoc()) {
        $remainingBalance += floatval($row['balance_after']);
        $history[] = [
            "id" => $row['id'],
            "guid" => $row['guid'],
            "employeeName" => $row['employeeName'], 
            "role" => $row['role'],                 
            "amount" => floatval($row['amount']),
            "date" => date("Y-m-d", strtotime($row['date'])),
            "enteredBy" => "Admin", 
            "remainingBalance" => $remainingBalance
        ];
    }
    echo json_encode(["status" => "success", "data" => $history]);
} else {
    echo json_encode(["status" => "error", "message" => $conn->error]);
}

$stmt->close();
$conn->close();
?>
