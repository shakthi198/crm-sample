<?php
// Standalone configuration to avoid 401/CORS issues
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: *");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// Database Connection
require_once __DIR__ . "/config.php";


// Fetch active users with their roles
// Aliasing user_guid as 'guid' to match frontend expectations
$sql = "
    SELECT u.user_guid AS guid, u.user_guid AS employee_guid, u.name AS employee_name, u.email, u.phone, r.role_name AS role
    FROM users u
    LEFT JOIN roles r ON u.role_guid = r.role_guid
    WHERE u.status = 'Active' AND u.is_active = 1
    ORDER BY u.name ASC
";

$result = $conn->query($sql);

$employees = [];

if ($result && $result->num_rows > 0) {
    while($row = $result->fetch_assoc()) {
        $employees[] = $row;
    }
}

echo json_encode(["success" => true, "data" => $employees]);

$conn->close();
?>
