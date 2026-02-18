<?php

ob_start();

header("Access-Control-Allow-Origin: *");

/* ✅ CHANGED: Added Organization-Guid */
header("Access-Control-Allow-Headers: Content-Type, Authorization, Organization-Guid");

header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Credentials: true");
header("Content-Type: application/json; charset=UTF-8");


function sendJsonResponse(int $statusCode, array $body): void
{
    if (ob_get_length()) {
        ob_clean();
    }

    http_response_code($statusCode);
    echo json_encode($body);
    exit;
}


if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}


require_once 'config.php';
require_once 'vendor/autoload.php';


if ($_SERVER['REQUEST_METHOD'] !== "GET") {

    sendJsonResponse(405, [
        'success' => false,
        'error' => 'Method Not Allowed'
    ]);
}


/* ======================================
   ✅ CHANGED: GET ORGANIZATION FROM HEADER
====================================== */

function getOrganizationGuid(): ?string
{
    $headers = getallheaders();

    foreach ($headers as $key => $value)
    {
        if (strtolower($key) === 'organization-guid')
        {
            return trim($value);
        }
    }

    return null;
}


$organization_guid = getOrganizationGuid();


/* ✅ CHANGED: STOP if missing */
if (!$organization_guid)
{
    sendJsonResponse(403, [
        "success" => false,
        "error" => "Organization-Guid header missing"
    ]);
}



/* ======================================
   DASHBOARD DATA
====================================== */

$response = [];



/* ======================================
   1️⃣ KPI COUNTS
====================================== */


/* ✅ CHANGED */
$stmt = $conn->prepare("
    SELECT COUNT(*) as total 
    FROM leads 
    WHERE is_active = 1
    AND organization_guid = ?
");

$stmt->bind_param("s", $organization_guid);

$stmt->execute();

$totalLeads = $stmt->get_result()->fetch_assoc()['total'] ?? 0;




/* ✅ CHANGED */
$stmt = $conn->prepare("
    SELECT SUM(estimated_amount - discount) as revenue 
    FROM budgets
    WHERE is_active = 1
    AND organization_guid = ?
");

$stmt->bind_param("s", $organization_guid);

$stmt->execute();

$totalRevenue = $stmt->get_result()->fetch_assoc()['revenue'] ?? 0;




/* ✅ CHANGED */
$stmt = $conn->prepare("
    SELECT COUNT(*) as total 
    FROM followups
    WHERE DATE(`date`) = CURDATE()
    AND is_active = 1
    AND organization_guid = ?
");

$stmt->bind_param("s", $organization_guid);

$stmt->execute();

$totalFollowups = $stmt->get_result()->fetch_assoc()['total'] ?? 0;




/* ✅ CHANGED */
$stmt = $conn->prepare("
    SELECT COUNT(*) as total 
    FROM organizations
    WHERE is_active = 1
    AND organization_guid = ?
");

$stmt->bind_param("s", $organization_guid);

$stmt->execute();

$totalOrganizations = $stmt->get_result()->fetch_assoc()['total'] ?? 0;



$response['kpis'] =
[
    [
        "id" => "total_leads",
        "title" => "Total Leads",
        "value" => (int)$totalLeads
    ],

    [
        "id" => "revenue",
        "title" => "Revenue",
        "value" => (float)$totalRevenue
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



/* ======================================
   2️⃣ LEADS BY STATUS
====================================== */


/* ✅ CHANGED */
$stmt = $conn->prepare("
SELECT
status,
COUNT(*) as count
FROM leads
WHERE is_active = 1
AND organization_guid = ?
GROUP BY status
");

$stmt->bind_param("s", $organization_guid);

$stmt->execute();

$result = $stmt->get_result();

$leadsByStatus = [];

while ($row = $result->fetch_assoc())
{
    $leadsByStatus[] =
    [
        "status" => $row['status'],
        "count" => (int)$row['count']
    ];
}

$response['leads_by_status'] = $leadsByStatus;




/* ======================================
   3️⃣ MONTHLY REVENUE
====================================== */


/* ✅ CHANGED */
$stmt = $conn->prepare("
SELECT 
DATE_FORMAT(created_at, '%b') as month,
SUM(estimated_amount - discount) as revenue
FROM budgets
WHERE is_active = 1
AND organization_guid = ?
GROUP BY MONTH(created_at)
ORDER BY MONTH(created_at)
");

$stmt->bind_param("s", $organization_guid);

$stmt->execute();

$result = $stmt->get_result();

$chart = [];

while ($row = $result->fetch_assoc())
{
    $chart[] =
    [
        "month" => $row['month'],
        "revenue" => (float)$row['revenue']
    ];
}

$response['revenue_chart'] = $chart;




/* ======================================
   4️⃣ TODAY FOLLOWUPS TABLE
====================================== */


/* ✅ CHANGED */
$stmt = $conn->prepare("
SELECT 
l.client_name,
l.phone,
f.status,
f.date,
u.name as assigned_to

FROM followups f

LEFT JOIN leads l ON l.lead_guid = f.lead_guid

LEFT JOIN users u ON u.user_guid = f.assigned_to_guid

WHERE DATE(f.date) = CURDATE()

AND f.organization_guid = ?

AND f.is_active = 1
");


$stmt->bind_param("s", $organization_guid);

$stmt->execute();

$result = $stmt->get_result();

$table = [];

while ($row = $result->fetch_assoc())
{
    $table[] = $row;
}

$response['today_followups_table'] = $table;



/* ======================================
   FINAL RESPONSE
====================================== */


sendJsonResponse(200,
[
"success"=>true,
"data"=>$response
]);

?>
