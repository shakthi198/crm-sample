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

// 1. Fetch Summary data (from budgets)
$res_paid = $conn->query("SELECT SUM(final_amount) FROM budgets WHERE status = 'Paid'");
$totalRevenue = $res_paid->fetch_row()[0] ?? 0;

$res_pending = $conn->query("SELECT SUM(final_amount) FROM budgets WHERE status = 'Pending'");
$pendingCollections = $res_pending->fetch_row()[0] ?? 0;

$res_admins = $conn->query("SELECT COUNT(*) FROM users u JOIN roles r ON u.role_guid = r.role_guid WHERE r.role_name = 'Admin'");
$totalAdmins = $res_admins->fetch_row()[0] ?? 0;

$res_orgs = $conn->query("SELECT COUNT(DISTINCT organization_guid) FROM budgets");
$activeProjects = $res_orgs->fetch_row()[0] ?? 0;

// 2. Revenue Distribution (By Organization)
$distribution = [];
$res_dist = $conn->query("
    SELECT o.company_name, SUM(b.final_amount) as value 
    FROM budgets b 
    JOIN organizations o ON b.organization_guid = o.organization_guid 
    WHERE b.status = 'Paid'
    GROUP BY o.organization_guid 
    LIMIT 4
");
while ($row = $res_dist->fetch_assoc()) {
    $distribution[] = ["name" => $row['company_name'], "value" => (float) $row['value']];
}

// 3. Revenue Trend (Weekly)
$trend = [];
$res_trend = $conn->query("
    SELECT CONCAT('Week ', WEEK(created_at, 1) - WEEK(DATE_SUB(created_at, INTERVAL DAYOFMONTH(created_at)-1 DAY), 1) + 1) as week_name,
           SUM(final_amount) as total
    FROM budgets
    WHERE status = 'Paid' AND MONTH(created_at) = MONTH(CURRENT_DATE()) AND YEAR(created_at) = YEAR(CURRENT_DATE())
    GROUP BY week_name
    ORDER BY MIN(created_at)
");
while ($row = $res_trend->fetch_assoc()) {
    $trend[] = ["name" => $row['week_name'], "value" => (float) $row['total']];
}

// 4. Admin Performance
$performance = [];
$res_perf = $conn->query("
    SELECT u.name, COUNT(b.budget_guid) as clients, SUM(b.final_amount) as revenue
    FROM budgets b
    JOIN organizations o ON b.organization_guid = o.organization_guid
    JOIN users u ON o.admin_guid = u.user_guid
    WHERE b.status = 'Paid'
    GROUP BY u.user_guid
");
while ($row = $res_perf->fetch_assoc()) {
    $performance[] = [
        "name" => $row['name'],
        "clients" => (int) $row['clients'],
        "revenue" => (float) $row['revenue'],
        "target" => rand(85, 115) . "%" // Mock target for now
    ];
}

// Structured response
$reports = [
    [
        "year" => "2026",
        "month" => "January",
        "summary" => [
            "totalRevenue" => "₹" . number_format($totalRevenue),
            "totalAdmins" => $totalAdmins,
            "pendingCollections" => "₹" . number_format($pendingCollections),
            "activeProjects" => $activeProjects
        ],
        "revenueDistribution" => !empty($distribution) ? $distribution : [["name" => "Initial", "value" => 100]],
        "revenueTrend" => !empty($trend) ? $trend : [["name" => "Jan", "value" => 0]],
        "performance" => $performance
    ]
];

echo json_encode([
    "success" => true,
    "availableYears" => ["2026", "2025"],
    "availableMonths" => ["January", "February", "March", "April", "May", "June"],
    "reports" => $reports
]);
?>