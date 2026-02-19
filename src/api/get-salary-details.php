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


$employee_guid = $_GET['employee_guid'] ?? null;

if ($employee_guid) {
    // Return single record for specific employee
    $stmt = $conn->prepare("SELECT *, (basic_salary + allowances - deductions) as net_salary FROM employee_salary_details WHERE employee_guid = ? ORDER BY created_at DESC LIMIT 1");
    $stmt->bind_param("s", $employee_guid);
    $stmt->execute();
    $result = $stmt->get_result();

    if ($result->num_rows > 0) {
        echo json_encode(["success" => true, "data" => $result->fetch_assoc()]);
    } else {
        echo json_encode(["success" => false, "message" => "Salary details not found"]);
    }
} else {
    // Return ALL records
    $stmt = $conn->prepare("SELECT *, (basic_salary + allowances - deductions) as net_salary FROM employee_salary_details ORDER BY created_at DESC");
    $stmt->execute();
    $result = $stmt->get_result();

    $data = [];
    while ($row = $result->fetch_assoc()) {
        $data[] = $row;
    }
    
    // Always return success with data array (empty if no records)
    echo json_encode(["success" => true, "data" => $data]);
}

$stmt->close();
$conn->close();
?>