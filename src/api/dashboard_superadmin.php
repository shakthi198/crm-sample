<?php
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

require_once __DIR__ . "/config.php";
require_once __DIR__ . "/vendor/autoload.php";

use Firebase\JWT\JWT;
use Firebase\JWT\Key;

// Verify Token
$allHeaders = getallheaders();
$authHeader = $allHeaders['Authorization'] ?? $allHeaders['authorization'] ?? '';
$token = "";

if (preg_match('/Bearer\s(\S+)/', $authHeader, $matches)) {
    $token = $matches[1];
}

if (!$token) {
    http_response_code(401);
    echo json_encode(["success" => false, "error" => "Unauthorized"]);
    exit;
}

try {
    $decoded = JWT::decode($token, new Key($jwt_secret, $jwt_algorithm));
    if (strcasecmp($decoded->role, "Super Admin") !== 0) {
        http_response_code(403);
        echo json_encode(["success" => false, "error" => "Access denied. Super Admin only."]);
        exit;
    }
} catch (Exception $e) {
    http_response_code(401);
    echo json_encode(["success" => false, "error" => "Invalid token"]);
    exit;
}

// 1. Fetch Admins
$admins = [];
$admin_sql = "
    SELECT 
        u.user_guid as id,
        u.name,
        u.email,
        r.role_name as role,
        u.status,
        u.is_active,
        u.last_login as lastLogin,
        u.is_deleted as isDeleted,
        u.deleted_at as deletedDate,
        u.created_at as createdDate
    FROM users u
    JOIN roles r ON u.role_guid = r.role_guid
    WHERE r.role_name = 'Admin' OR r.role_name = 'Super Admin'
";
$res = $conn->query($admin_sql);
while ($row = $res->fetch_assoc()) {
    $row['isDeleted'] = (bool) $row['isDeleted'];
    $admins[] = $row;
}

// 2. Fetch Activities
$activities = [];
$act_sql = "
    SELECT 
        l.id,
        l.user_guid,
        l.action,
        l.module,
        l.created_at as raw_time
    FROM activity_log l
    ORDER BY l.created_at DESC
    LIMIT 5
";
$res_act = $conn->query($act_sql);
while ($row = $res_act->fetch_assoc()) {
    // Resolve Name Manually
    $name = "System";
    $guid = $row['user_guid'];

    // Check Users
    $u_stmt = $conn->prepare("SELECT name FROM users WHERE user_guid = ?");
    $u_stmt->bind_param("s", $guid);
    $u_stmt->execute();
    $u_res = $u_stmt->get_result();
    if ($u_row = $u_res->fetch_assoc()) {
        $name = $u_row['name'];
    } else {
        // Check Super Admin
        $sa_stmt = $conn->prepare("SELECT full_name FROM super_admin WHERE super_admin_guid = ? LIMIT 1");
        $sa_stmt->bind_param("s", $guid);
        $sa_stmt->execute();
        $sa_res = $sa_stmt->get_result();
        if ($sa_row = $sa_res->fetch_assoc()) {
            $name = $sa_row['full_name'];
        }
    }

    $row['adminName'] = $name;
    $row['action'] = $row['action'] . " (" . $row['module'] . ")";

    $time = strtotime($row['raw_time']);
    $diff = time() - $time;
    if ($diff < 60)
        $row['time'] = "Just now";
    elseif ($diff < 3600)
        $row['time'] = floor($diff / 60) . " mins ago";
    elseif ($diff < 86400)
        $row['time'] = floor($diff / 3600) . " hours ago";
    else
        $row['time'] = date("Y-m-d", $time);
    $activities[] = $row;
}

// 3. System Summary (Dynamic)
// Logins today
$today_res = $conn->query("SELECT COUNT(DISTINCT user_guid) FROM activity_log WHERE DATE(created_at) = CURDATE() AND action = 'Logged In'");
$logins_today = $today_res->fetch_row()[0] ?? 0;

// Active sessions (estimated by activity in last 30 mins)
$active_res = $conn->query("SELECT COUNT(DISTINCT user_guid) FROM activity_log WHERE created_at > DATE_SUB(NOW(), INTERVAL 30 MINUTE)");
$active_sessions = $active_res->fetch_row()[0] ?? 0;

$systemSummary = [
    "systemHealth" => "100%",
    "activeSessions" => (int) $active_sessions,
    "totalLoginsToday" => (int) $logins_today
];

echo json_encode([
    "success" => true,
    "admins" => $admins,
    "activities" => $activities,
    "systemSummary" => $systemSummary
]);
?>