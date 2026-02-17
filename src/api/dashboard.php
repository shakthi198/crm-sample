<?php

ob_start();

header("Access-Control-Allow-Origin: http://localhost:5173");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Credentials: true");
header("Content-Type: application/json; charset=UTF-8");

function sendJsonResponse(int $statusCode, array $body): void {
    if (ob_get_length()) {
        ob_clean();
    }
    http_response_code($statusCode);
    echo json_encode($body);
    exit;
}

// Handle preflight request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once 'config.php';
require_once 'vendor/autoload.php';

if ($_SERVER['REQUEST_METHOD'] !== "GET") {
    sendJsonResponse(405, ['success' => false, 'error' => 'Method Not Allowed']);
}

/* ===============================
   AUTHENTICATION / ORG RESOLUTION
=================================*/

function getBearerTokenFromHeaders(): ?string {
    $headers = function_exists('getallheaders') ? getallheaders() : [];
    $headers = array_change_key_case($headers, CASE_LOWER);

    $authHeader = $headers['authorization']
        ?? $_SERVER['HTTP_AUTHORIZATION']
        ?? $_SERVER['REDIRECT_HTTP_AUTHORIZATION']
        ?? null;

    if (!$authHeader) {
        return null;
    }

    $authHeader = trim((string)$authHeader);
    if (preg_match('/Bearer\s+(\S+)/i', $authHeader, $matches)) {
        return trim($matches[1]);
    }

    return null;
}

function resolveFallbackOrganizationGuid(mysqli $conn): ?string {
    $queries = [
        "SELECT organization_guid FROM organizations WHERE is_active = 1 LIMIT 1",
        "SELECT organization_guid FROM leads WHERE is_active = 1 LIMIT 1",
        "SELECT organization_guid FROM followups WHERE is_active = 1 LIMIT 1",
        "SELECT organization_guid FROM budgets WHERE is_active = 1 LIMIT 1",
        "SELECT organization_guid FROM users WHERE is_active = 1 LIMIT 1"
    ];

    foreach ($queries as $sql) {
        $result = $conn->query($sql);
        if ($result && $row = $result->fetch_assoc()) {
            $guid = trim((string)($row['organization_guid'] ?? ''));
            if ($guid !== '') {
                return $guid;
            }
        }
    }

    return null;
}

$organization_guid = null;
$token = getBearerTokenFromHeaders();

if ($token) {
    try {
        $decoded = \Firebase\JWT\JWT::decode($token, new \Firebase\JWT\Key($jwt_secret, $jwt_algorithm));
        $organization_guid = $decoded->organization_guid ?? null;
    } catch (\Throwable $e) {
        $organization_guid = null;
    }
}

if (!$organization_guid) {
    $organization_guid = resolveFallbackOrganizationGuid($conn);
}

if (!$organization_guid) {
    sendJsonResponse(403, ['success' => false, 'error' => 'Invalid organization']);
}

/* ===============================
   DASHBOARD DATA
=================================*/

$response = [];

/* ===============================
   1️⃣ KPI COUNTS
=================================*/

// Total Leads
$stmt = $conn->prepare("
    SELECT COUNT(*) as total 
    FROM leads 
    WHERE organization_guid = ? 
    AND is_active = 1
");
$stmt->bind_param("s", $organization_guid);
$stmt->execute();
$totalLeads = $stmt->get_result()->fetch_assoc()['total'] ?? 0;


// Total Revenue (Approved Budgets)
$stmt = $conn->prepare("
    SELECT SUM(estimated_amount - discount) as revenue 
    FROM budgets
    WHERE organization_guid = ?
    AND status = 'Approved'
    AND is_active = 1
");
$stmt->bind_param("s", $organization_guid);
$stmt->execute();
$totalRevenue = $stmt->get_result()->fetch_assoc()['revenue'] ?? 0;


// Today Followups Count
$stmt = $conn->prepare("
    SELECT COUNT(*) as total 
    FROM followups
    WHERE organization_guid = ?
    AND DATE(next_followup_date) = CURDATE()
    AND is_active = 1
");
$stmt->bind_param("s", $organization_guid);
$stmt->execute();
$totalFollowups = $stmt->get_result()->fetch_assoc()['total'] ?? 0;


// Total Organizations
$res = $conn->query("
    SELECT COUNT(*) as total 
    FROM organizations 
    WHERE is_active = 1
");
$totalOrganizations = $res->fetch_assoc()['total'] ?? 0;


$response['kpis'] = [
    [
        "id" => "total_leads",
        "title" => "Total Leads",
        "value" => (int)$totalLeads
    ],
    [
        "id" => "revenue",
        "title" => "Revenue",
        "value" => "₹" . number_format($totalRevenue ?? 0)
    ],
    [
        "id" => "followups",
        "title" => "Today Follow-ups",
        "value" => (int)$totalFollowups
    ],
    [
        "id" => "organizations",
        "title" => "Organizations",
        "value" => (int)$totalOrganizations
    ]
];


/* ===============================
   2️⃣ LEADS BY STATUS
=================================*/

$stmt = $conn->prepare("
    SELECT status, COUNT(*) as count
    FROM leads
    WHERE organization_guid = ?
    AND is_active = 1
    GROUP BY status
");
$stmt->bind_param("s", $organization_guid);
$stmt->execute();
$result = $stmt->get_result();

$leadsByStatus = [];

while ($row = $result->fetch_assoc()) {
    $leadsByStatus[] = [
        "status" => $row['status'],
        "count" => (int)$row['count']
    ];
}

$response['leads_by_status'] = $leadsByStatus;


/* ===============================
   3️⃣ MONTHLY REVENUE
=================================*/

$stmt = $conn->prepare("
    SELECT 
        DATE_FORMAT(created_at, '%b') as month,
        SUM(estimated_amount - discount) as revenue
    FROM budgets
    WHERE organization_guid = ?
    AND status = 'Approved'
    AND is_active = 1
    GROUP BY MONTH(created_at)
    ORDER BY MONTH(created_at)
");
$stmt->bind_param("s", $organization_guid);
$stmt->execute();
$result = $stmt->get_result();

$revenueChart = [];

while ($row = $result->fetch_assoc()) {
    $revenueChart[] = [
        "month" => $row['month'],
        "revenue" => (float)($row['revenue'] ?? 0)
    ];
}

$response['revenue_chart'] = $revenueChart;


/* ===============================
   4️⃣ TODAY FOLLOWUPS TABLE
=================================*/

$stmt = $conn->prepare("
    SELECT 
        l.client_name as lead_name,
        l.phone,
        f.call_status,
        f.next_followup_date,
        u.name as assigned_to
    FROM followups f
    LEFT JOIN leads l ON l.lead_guid = f.lead_guid
    LEFT JOIN users u ON u.user_guid = f.user_guid
    WHERE f.organization_guid = ?
    AND DATE(f.next_followup_date) = CURDATE()
    AND f.is_active = 1
    ORDER BY f.next_followup_date ASC
");
$stmt->bind_param("s", $organization_guid);
$stmt->execute();
$result = $stmt->get_result();

$followups = [];

while ($row = $result->fetch_assoc()) {
    $followups[] = $row;
}

$response['today_followups_table'] = $followups;


/* ===============================
   FINAL RESPONSE
=================================*/

sendJsonResponse(200, [
    "success" => true,
    "data" => $response
]);
