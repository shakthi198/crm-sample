<?php

error_reporting(E_ALL);
ini_set('display_errors', 1);

header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");
header("Access-Control-Allow-Methods: GET, OPTIONS");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

$conn = new mysqli("localhost", "root", "", "crm_sample");

if ($conn->connect_error) {

    echo json_encode([
        "success" => false
    ]);

    exit;
}

$sql = "SELECT user_guid, name FROM users WHERE is_active=1 ORDER BY name";

$result = $conn->query($sql);

$data = [];

while ($row = $result->fetch_assoc()) {

    $data[] = $row;

}

echo json_encode([
    "success" => true,
    "data" => $data
]);

?>