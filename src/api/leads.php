<?php

/* =========================
   ERROR REPORTING (IMPORTANT)
========================= */

error_reporting(E_ALL);
ini_set('display_errors', 1);


/* =========================
   HEADERS
========================= */

header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}


/* =========================
   REQUIRE FILES
========================= */

require_once __DIR__ . "/config.php";
require_once __DIR__ . "/vendor/autoload.php";

use Firebase\JWT\JWT;
use Firebase\JWT\Key;


/* =========================
   DB CONNECTION
========================= */



/* =========================
   GET TOKEN FROM HEADER
========================= */

function getBearerToken()
{
    $headers = getallheaders();

    if (!isset($headers['Authorization'])) {
        return null;
    }

    if (preg_match('/Bearer\s(\S+)/', $headers['Authorization'], $matches)) {
        return $matches[1];
    }

    return null;
}


/* =========================
   VERIFY TOKEN
========================= */

$token = getBearerToken();

if (!$token) {

    echo json_encode([
        "success" => false,
        "error" => "Token missing"
    ]);

    exit;
}

try {

    $decoded = JWT::decode($token, new Key($jwt_secret, $jwt_algorithm));
    $org_guid = $decoded->organization_guid ?? null;

} catch (Exception $e) {

    echo json_encode([
        "success" => false,
        "error" => "Invalid token",
        "message" => $e->getMessage()
    ]);

    exit;
}


/* =========================
   READ JSON INPUT
========================= */

function getInput()
{
    $data = file_get_contents("php://input");

    if (!$data) {
        return [];
    }

    return json_decode($data, true);
}


/* =========================
   GENERATE UUID
========================= */

function generateUUID()
{
    $data = random_bytes(16);

    $data[6] = chr(ord($data[6]) & 0x0f | 0x40);
    $data[8] = chr(ord($data[8]) & 0x3f | 0x80);

    return vsprintf(
        '%s%s-%s-%s-%s-%s%s%s',
        str_split(bin2hex($data), 4)
    );
}


$method = $_SERVER['REQUEST_METHOD'];




/* =========================
   GET LEADS
========================= */

if ($method === "GET") {

    $sql = "
        SELECT
            l.id,
            l.lead_guid,
            l.client_name,
            l.phone,
            l.email,
            l.company,
            l.source,
            l.status,
            l.assigned_to,
            l.remarks,
            u.name AS assigned_name
        FROM leads l
        LEFT JOIN users u ON l.assigned_to = u.user_guid
        WHERE l.is_active = 1 AND l.organization_guid = ?
        ORDER BY l.id DESC
    ";

    $stmt = $conn->prepare($sql);
    $stmt->bind_param("s", $org_guid);
    $stmt->execute();
    $result = $stmt->get_result();

    $data = [];

    while ($row = $result->fetch_assoc()) {
        $data[] = $row;
    }

    echo json_encode([
        "success" => true,
        "data" => $data
    ]);

    exit;
}


/* =========================
   ADD LEAD
========================= */

if ($method === "POST") {

    $input = getInput();

    $guid = generateUUID();

    $stmt = $conn->prepare("
        INSERT INTO leads
        (
            lead_guid,
            client_name,
            phone,
            email,
            company,
            source,
            status,
            assigned_to,
            remarks,
            organization_guid,
            created_at,
            is_active
        )
        VALUES
        (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), 1)
    ");

    $stmt->bind_param(
        "ssssssssss",
        $guid,
        $input['client_name'],
        $input['phone'],
        $input['email'],
        $input['company'],
        $input['source'],
        $input['status'],
        $input['assigned_to'],
        $input['remarks'],
        $org_guid
    );

    if ($stmt->execute()) {

        echo json_encode([
            "success" => true,
            "message" => "Lead added successfully"
        ]);

    } else {

        echo json_encode([
            "success" => false,
            "error" => $stmt->error
        ]);
    }

    exit;
}


/* =========================
   UPDATE LEAD
========================= */

if ($method === "PUT") {

    $input = getInput();

    $stmt = $conn->prepare("
        UPDATE leads SET
            client_name = ?,
            phone = ?,
            email = ?,
            company = ?,
            source = ?,
            status = ?,
            assigned_to = ?,
            remarks = ?
        WHERE id = ? AND organization_guid = ?
    ");

    $stmt->bind_param(
        "ssssssssis",
        $input['client_name'],
        $input['phone'],
        $input['email'],
        $input['company'],
        $input['source'],
        $input['status'],
        $input['assigned_to'],
        $input['remarks'],
        $input['id'],
        $org_guid
    );

    if ($stmt->execute()) {

        echo json_encode([
            "success" => true,
            "message" => "Lead updated"
        ]);

    } else {

        echo json_encode([
            "success" => false,
            "error" => $stmt->error
        ]);
    }

    exit;
}


/* =========================
   DELETE LEAD
========================= */

if ($method === "DELETE") {

    $input = getInput();

    $stmt = $conn->prepare("
        UPDATE leads
        SET is_active = 0
        WHERE id = ? AND organization_guid = ?
    ");

    $stmt->bind_param("is", $input['id'], $org_guid);

    if ($stmt->execute()) {

        echo json_encode([
            "success" => true,
            "message" => "Lead deleted"
        ]);

    } else {

        echo json_encode([
            "success" => false,
            "error" => $stmt->error
        ]);
    }

    exit;
}


$conn->close();

?>