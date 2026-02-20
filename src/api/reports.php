<?php

/* =====================================================
   ERROR REPORTING
===================================================== */
ini_set('display_errors', 1);
error_reporting(E_ALL);

/* =====================================================
   CORS
===================================================== */
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type, Authorization, Organization-Guid");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

/* =====================================================
   REQUIRE FILES
===================================================== */
require_once 'middleware.php';
require_once 'config.php';

/* =====================================================
   AUTH VALIDATION
===================================================== */
$token = getBearerToken();
$validation = validateJWTAndGetGuid($token);

if (!$validation['success']) {
    http_response_code(401);
    echo json_encode(["success" => false, "error" => "Invalid token"]);
    exit;
}

$user = $validation['data'];
$user_guid = $user->user_guid ?? null;

if (!$user_guid) {
    http_response_code(401);
    echo json_encode(["success" => false, "error" => "User GUID missing"]);
    exit;
}

/* =====================================================
   ORGANIZATION GUID
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
    echo json_encode(["success" => false, "error" => "Organization-Guid header missing"]);
    exit;
}

/* =====================================================
   GET PARAMETERS
===================================================== */

$type = $_GET['type'] ?? ''; // payroll | attendance
$search = $_GET['search'] ?? '';
$start = $_GET['start'] ?? '';
$end = $_GET['end'] ?? '';

/* =====================================================
   ROUTER
===================================================== */

if ($type === "payroll") {
    getPayrollReport($conn, $organization_guid, $search, $start, $end);
} elseif ($type === "attendance") {
    getAttendanceReport($conn, $organization_guid, $search, $start, $end);
} else {
    echo json_encode([
        "success" => false,
        "error" => "Invalid report type"
    ]);
}

/* =====================================================
   PAYROLL REPORT
===================================================== */
function getPayrollReport($conn, $org, $search, $start, $end)
{
    $sql = "
        SELECT 
            usd.id AS payroll_guid,
            usd.user_guid AS employee_id,
            u.name,
            r.role_name AS role,
            usd.basic_salary,
            usd.allowances,
            usd.deductions,
            usd.net_salary,
            usd.payment_status AS status,
            usd.created_at AS payment_date
        FROM user_salary_details usd
        LEFT JOIN users u ON usd.user_guid = u.user_guid
        LEFT JOIN roles r ON u.role_guid = r.role_guid
        WHERE usd.organization_guid = ?
    ";

    if (!empty($search)) {
        $sql .= " AND (u.name LIKE ? OR u.user_guid LIKE ?)";
    }

    if (!empty($start) && !empty($end)) {
        $sql .= " AND DATE(usd.created_at) BETWEEN ? AND ?";
    }

    $sql .= " ORDER BY usd.created_at DESC";

    $stmt = $conn->prepare($sql);

    if (!empty($search) && !empty($start)) {
        $like = "%$search%";
        $stmt->bind_param("sssss", $org, $like, $like, $start, $end);
    } elseif (!empty($search)) {
        $like = "%$search%";
        $stmt->bind_param("sss", $org, $like, $like);
    } elseif (!empty($start)) {
        $stmt->bind_param("sss", $org, $start, $end);
    } else {
        $stmt->bind_param("s", $org);
    }

    $stmt->execute();
    $result = $stmt->get_result();
    $data = $result->fetch_all(MYSQLI_ASSOC);

    echo json_encode([
        "success" => true,
        "data" => $data
    ]);
}

/* =====================================================
   ATTENDANCE REPORT
===================================================== */
function getAttendanceReport($conn, $org, $search, $start, $end)
{
    $sql = "
        SELECT
            a.attendance_guid,
            u.user_guid AS employee_id,
            u.name,
            a.attendance_date,
            a.check_in_time,
            a.check_out_time,
            a.status,
            a.working_hours
        FROM attendance a
        LEFT JOIN users u ON a.employee_guid = u.user_guid
        WHERE a.organization_guid = ?
        AND a.is_active = 1
    ";

    if (!empty($search)) {
        $sql .= " AND (u.name LIKE ? OR u.user_guid LIKE ?)";
    }

    if (!empty($start) && !empty($end)) {
        $sql .= " AND DATE(a.attendance_date) BETWEEN ? AND ?";
    }

    $sql .= " ORDER BY a.attendance_date DESC";

    $stmt = $conn->prepare($sql);

    if (!empty($search) && !empty($start)) {
        $like = "%$search%";
        $stmt->bind_param("sssss", $org, $like, $like, $start, $end);
    } elseif (!empty($search)) {
        $like = "%$search%";
        $stmt->bind_param("sss", $org, $like, $like);
    } elseif (!empty($start)) {
        $stmt->bind_param("sss", $org, $start, $end);
    } else {
        $stmt->bind_param("s", $org);
    }

    $stmt->execute();
    $result = $stmt->get_result();
    $data = $result->fetch_all(MYSQLI_ASSOC);

    echo json_encode([
        "success" => true,
        "data" => $data
    ]);
}
?>