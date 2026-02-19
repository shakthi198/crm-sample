<?php

// CORS HEADERS (MUST BE FIRST)
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type, Authorization, Organization-Guid");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Credentials: false");
header("Content-Type: application/json; charset=UTF-8");

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once 'config.php';
require_once 'middleware.php';

/* =====================================================
   VALIDATE JWT TOKEN
===================================================== */

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

if (!$user_guid) {
    http_response_code(401);
    echo json_encode([
        "success" => false,
        "error" => "User GUID missing in token"
    ]);
    exit;
}


/* =====================================================
   GET ORGANIZATION GUID FROM HEADER (LIKE BUDGET)
===================================================== */

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


// ===============================
// YOUR GUID FUNCTION (mt_rand)
// ===============================
function generateGUID()
{
    return sprintf(
        '%04x%04x-%04x-%04x-%04x-%04x%04x%04x',
        mt_rand(0, 0xffff),
        mt_rand(0, 0xffff),
        mt_rand(0, 0xffff),
        mt_rand(0, 0x0fff) | 0x4000,
        mt_rand(0, 0x3fff) | 0x8000,
        mt_rand(0, 0xffff),
        mt_rand(0, 0xffff),
        mt_rand(0, 0xffff)
    );
}

$method = $_SERVER['REQUEST_METHOD'];


// ======================================================
// GET : All Attendance OR Employee History
// ======================================================
if ($method === "GET") {

    $employeeFilter = "";

    if (isset($_GET['employee_guid'])) {
        $employee_guid = $conn->real_escape_string($_GET['employee_guid']);
        $employeeFilter = " AND a.employee_guid = '$employee_guid' ";
    }

    // 1. Fetch Attendance
    $sql = "SELECT 
                a.attendance_guid,
                a.employee_guid,
                u.name AS employee_name, 
                u.user_guid AS empId,
                a.attendance_date AS date,
                a.check_in_time AS check_in, 
                a.check_out_time AS check_out, 
                a.status,
                a.working_hours
            FROM attendance a
            LEFT JOIN users u ON u.user_guid = a.employee_guid
            WHERE a.organization_guid = '$organization_guid'
            AND a.is_active = 1
            $employeeFilter
            ORDER BY a.attendance_date DESC";

    $result = $conn->query($sql);
    $attendanceData = [];

    while ($row = $result->fetch_assoc()) {
        $attendanceData[] = $row;
    }

    // 2. Fetch Employees (Users) - Excluding Admins
    $empSql = "SELECT 
                u.user_guid AS employee_guid, 
                u.name, 
                u.email, 
                u.role_guid 
               FROM users u
               LEFT JOIN roles r ON u.role_guid = r.role_guid
               WHERE u.organization_guid = '$organization_guid'
               AND (r.role_name IS NULL OR r.role_name != 'Admin')";

    $empResult = $conn->query($empSql);
    $employeeData = [];

    while ($row = $empResult->fetch_assoc()) {
        $employeeData[] = $row;
    }

    echo json_encode([
        "success" => true,
        "attendance" => $attendanceData,
        "employees" => $employeeData
    ]);
    exit;
}


// ======================================================
// POST : Insert / Update / Bulk Save
// ======================================================
if ($method === "POST") {

    $input = json_decode(file_get_contents("php://input"), true);

    if (!$input) {
        echo json_encode(["success" => false, "message" => "Invalid JSON"]);
        exit;
    }

    // =========================================
    // BULK WORKSHEET SAVE
    // =========================================
    if (isset($input['bulk']) && $input['bulk'] === true) {

        foreach ($input['records'] as $row) {

            $employee_guid = $conn->real_escape_string($row['employee_guid']);
            $date = $conn->real_escape_string($row['date']);
            $checkIn = $conn->real_escape_string($row['checkIn']);
            $checkOut = $conn->real_escape_string($row['checkOut']);
            $status = $conn->real_escape_string($row['status']);
     

            // Prevent duplicate entry for same date
            $checkSql = "SELECT id FROM attendance
                         WHERE organization_guid='$organization_guid'
                         AND employee_guid='$employee_guid'
                         AND attendance_date='$date'";

            $checkResult = $conn->query($checkSql);

            if ($checkResult->num_rows > 0) {
                continue;
            }

            $attendance_guid = generateGUID();

            $working_hours = 0;
            if ($checkIn !== "-" && $checkOut !== "-") {
                $working_hours = (strtotime($checkOut) - strtotime($checkIn)) / 3600;
            }

            $sql = "INSERT INTO attendance (
                        attendance_guid,
                        organization_guid,
                        employee_guid,
                        attendance_date,
                        check_in_time,
                        check_out_time,
                        working_hours,
                        status,                     
                        created_at,
                        is_active
                    ) VALUES (
                        '$attendance_guid',
                        '$organization_guid',
                        '$employee_guid',
                        '$date',
                        '$checkIn',
                        '$checkOut',
                        '$working_hours',
                        '$status',    
                        NOW(),
                        1
                    )";

            $conn->query($sql);
        }

        echo json_encode([
            "success" => true,
            "message" => "Bulk attendance saved"
        ]);
        exit;
    }


    // =========================================
    // UPDATE ATTENDANCE
    // =========================================
    if (!empty($input['attendance_guid'])) {

        $attendance_guid = $conn->real_escape_string($input['attendance_guid']);
        $checkIn = $conn->real_escape_string($input['checkIn']);
        $checkOut = $conn->real_escape_string($input['checkOut']);
        $status = $conn->real_escape_string($input['status']);
        

        $working_hours = 0;
        if ($checkIn !== "-" && $checkOut !== "-") {
            $working_hours = (strtotime($checkOut) - strtotime($checkIn)) / 3600;
        }

        $sql = "UPDATE attendance SET
                    check_in_time='$checkIn',
                    check_out_time='$checkOut',
                    working_hours='$working_hours',
                    status='$status'                 
                WHERE attendance_guid='$attendance_guid'
                AND organization_guid='$organization_guid'";

        $conn->query($sql);

        echo json_encode([
            "success" => true,
            "message" => "Attendance updated"
        ]);
        exit;
    }


    // =========================================
    // INSERT SINGLE RECORD
    // =========================================
    $attendance_guid = generateGUID();

    $employee_guid = $conn->real_escape_string($input['employee_guid']);
    $date = $conn->real_escape_string($input['date']);
    $checkIn = $conn->real_escape_string($input['checkIn']);
    $checkOut = $conn->real_escape_string($input['checkOut']);
    $status = $conn->real_escape_string($input['status']);
  

    $working_hours = 0;
    if ($checkIn !== "-" && $checkOut !== "-") {
        $working_hours = (strtotime($checkOut) - strtotime($checkIn)) / 3600;
    }

    $sql = "INSERT INTO attendance (
                attendance_guid,
                organization_guid,
                employee_guid,
                attendance_date,
                check_in_time,
                check_out_time,
                working_hours,
                status,              
                created_at,
                is_active
            ) VALUES (
                '$attendance_guid',
                '$organization_guid',
                '$employee_guid',
                '$date',
                '$checkIn',
                '$checkOut',
                '$working_hours',
                '$status',
                NOW(),
                1
            )";

    $conn->query($sql);

    echo json_encode([
        "success" => true,
        "message" => "Attendance added"
    ]);
    exit;
}


// ======================================================
// DELETE (SOFT DELETE)
// ======================================================
if ($method === "DELETE") {

    // Read JSON input instead of parse_str
    $input = json_decode(file_get_contents("php://input"), true);

    if (empty($input['attendance_guid'])) {
        echo json_encode([
            "success" => false,
            "message" => "Attendance GUID required"
        ]);
        exit;
    }

    $attendance_guid = $conn->real_escape_string($input['attendance_guid']);

    $sql = "UPDATE attendance
            SET is_active = 0
            WHERE attendance_guid='$attendance_guid'
            AND organization_guid='$organization_guid'
            AND is_active = 1";

    $conn->query($sql);

    if ($conn->affected_rows > 0) {
        echo json_encode([
            "success" => true,
            "message" => "Attendance archived successfully"
        ]);
    } else {
        echo json_encode([
            "success" => false,
            "message" => "Record not found or already deleted"
        ]);
    }

    exit;
}

echo json_encode([
    "success" => false,
    "message" => "Invalid request"
]);
?>