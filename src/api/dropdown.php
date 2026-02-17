<?php

/* =========================
   ERROR REPORTING
========================= */
error_reporting(E_ALL);
ini_set('display_errors', 1);

/* =========================
   HEADERS
========================= */
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Access-Control-Allow-Methods: GET, OPTIONS");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

/* =========================
   REQUIRE CONFIG
========================= */
require_once __DIR__ . "/config.php";

/* =========================
   ALLOWED TABLES (SECURE)
========================= */

$allowedTables = [
    "users" => [
        "id_column" => "user_guid",
        "name_column" => "name",
        "active_column" => "is_active"
    ],
    "organizations" => [
        "id_column" => "organization_guid",
        "name_column" => "organization_name",
        "active_column" => "is_active"
    ],
    "leads" => [
        "id_column" => "lead_guid",
        "name_column" => "client_name",
        "active_column" => "is_active"
    ]
];

/* =========================
   GET TABLE PARAM
========================= */

$table = $_GET['table'] ?? '';

if (!array_key_exists($table, $allowedTables)) {
    echo json_encode([
        "success" => false,
        "error" => "Invalid table name"
    ]);
    exit;
}

$idColumn = $allowedTables[$table]['id_column'];
$nameColumn = $allowedTables[$table]['name_column'];
$activeColumn = $allowedTables[$table]['active_column'];

/* =========================
   QUERY
========================= */

$sql = "
    SELECT 
        $idColumn AS id, 
        $nameColumn AS name
    FROM $table
    WHERE $activeColumn = 1
    ORDER BY $nameColumn ASC
";

$result = $conn->query($sql);

if (!$result) {
    echo json_encode([
        "success" => false,
        "error" => $conn->error
    ]);
    exit;
}

$data = [];

while ($row = $result->fetch_assoc()) {
    $data[] = $row;
}

echo json_encode([
    "success" => true,
    "data" => $data
]);

$conn->close();
