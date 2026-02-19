<?php
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type, Authorization, Organization-Guid");
header("Access-Control-Allow-Methods: GET, POST, DELETE, OPTIONS");
header("Content-Type: application/json");

// ===============================
// HANDLE OPTIONS (CORS PREFLIGHT)
// ===============================
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}


require_once 'config.php';
require_once 'middleware.php'; // uses $validation

// ===============================
// JWT VALIDATION
// ===============================
if (!isset($validation) || !$validation['success']) {
    exit; // middleware already returns error
}

$decoded = $validation['data'];

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
    echo json_encode([
        "success" => false,
        "message" => "Organization-Guid header missing"
    ]);
    exit();
}

$admin_guid = $decoded->admin_guid ?? null;

if (!$organization_guid) {
    echo json_encode([
        "success" => false,
        "message" => "Invalid token payload"
    ]);
    exit();
}

$method = $_SERVER['REQUEST_METHOD'];


// ===============================
// GUID GENERATOR
// ===============================
function generateGuid()
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


// ========================================================
// GET (ALL or SINGLE)
// ========================================================
if ($method === 'GET') {

    // ========================================================
    // DOWNLOAD FILE
    // ========================================================
    if (isset($_GET['action']) && $_GET['action'] === 'download') {
        $filename = $_GET['file'] ?? null;

        if (!$filename) {
            http_response_code(400); // Bad Request
            exit("File specified.");
        }

        // Security: Prevent directory traversal
        $filename = basename($filename);
        $filepath = __DIR__ . "/uploads/contracts/" . $filename;

        if (file_exists($filepath)) {
            header('Content-Description: File Transfer');
            header('Content-Type: application/octet-stream');
            header('Content-Disposition: attachment; filename="' . $filename . '"');
            header('Expires: 0');
            header('Cache-Control: must-revalidate');
            header('Pragma: public');
            header('Content-Length: ' . filesize($filepath));
            readfile($filepath);
            exit;
        } else {
            http_response_code(404);
            exit("File not found.");
        }
    }

    $stmt = $conn->prepare("
        SELECT 
            c.client_guid,
            c.lead_guid,
            c.contract_file,
            c.start_date,
            c.created_at,
            c.is_active,

            l.client_name,
            l.company,
            l.phone,
            l.email,  
            l.status AS lead_status,
            l.organization_guid,
            c.status

        FROM clients c
        JOIN leads l ON c.lead_guid = l.lead_guid
        WHERE c.organization_guid = ?
        AND c.is_active = 1
    ");

    $stmt->bind_param("s", $organization_guid);
    $stmt->execute();
    $result = $stmt->get_result();

    $clients = [];

    while ($row = $result->fetch_assoc()) {
        $clients[] = $row;
    }

    echo json_encode([
        "success" => true,
        "data" => $clients
    ]);

    exit();
}

// ========================================================
// POST (CREATE or UPDATE)
// ========================================================
if ($method === 'POST') {

    $client_guid = $_POST['client_guid'] ?? null;
    $lead_guid = $_POST['lead_guid'] ?? null;
    $start_date = $_POST['start_date'] ?? null;
    $status = $_POST['status'] ?? 'pending';

    // ---------------------------------------------------
    // UPDATE EXISTING CLIENT
    // ---------------------------------------------------
    if ($client_guid) {

        // 1. Prepare base query
        $query = "UPDATE clients SET start_date = ?, status = ? WHERE client_guid = ? AND organization_guid = ?";
        $params = [$start_date, $status, $client_guid, $organization_guid];
        $types = "ssss";

        // 2. Handle File Upload if new file provided
        if (isset($_FILES['contract_file']) && $_FILES['contract_file']['error'] === 0) {
            $uploadDir = __DIR__ . "/uploads/contracts/";
            if (!is_dir($uploadDir))
                mkdir($uploadDir, 0777, true);

            $fileName = time() . "_" . preg_replace("/[^a-zA-Z0-9\._-]/", "", $_FILES["contract_file"]["name"]);
            $targetFile = $uploadDir . $fileName;

            if (move_uploaded_file($_FILES["contract_file"]["tmp_name"], $targetFile)) {
                $contract_path = "uploads/contracts/" . $fileName;

                // Update query to include file
                $query = "UPDATE clients SET start_date = ?, status = ?, contract_file = ? WHERE client_guid = ? AND organization_guid = ?";
                $params = [$start_date, $status, $contract_path, $client_guid, $organization_guid];
                $types = "sssss";
            }
        }

        $stmt = $conn->prepare($query);
        $stmt->bind_param($types, ...$params);

        if ($stmt->execute()) {
            echo json_encode(["success" => true, "message" => "Client updated successfully"]);
        } else {
            echo json_encode(["success" => false, "message" => "Update failed"]);
        }
        exit();
    }

    // ---------------------------------------------------
    // CREATE NEW CLIENT
    // ---------------------------------------------------
    if (!$lead_guid || !$start_date) {
        echo json_encode(["success" => false, "message" => "lead_guid and start_date required"]);
        exit();
    }

    // Check duplicate
    $check = $conn->prepare("SELECT client_guid FROM clients WHERE lead_guid = ? AND organization_guid = ? AND is_active = 1");
    $check->bind_param("ss", $lead_guid, $organization_guid);
    $check->execute();
    if ($check->get_result()->num_rows > 0) {
        echo json_encode(["success" => false, "message" => "Client already exists for this lead"]);
        exit();
    }

    $client_guid = generateGuid();
    $contract_path = null;

    if (isset($_FILES['contract_file']) && $_FILES['contract_file']['error'] === 0) {
        $uploadDir = __DIR__ . "/uploads/contracts/";
        if (!is_dir($uploadDir))
            mkdir($uploadDir, 0777, true);

        $fileName = time() . "_" . preg_replace("/[^a-zA-Z0-9\._-]/", "", $_FILES["contract_file"]["name"]);
        $targetFile = $uploadDir . $fileName;

        if (move_uploaded_file($_FILES["contract_file"]["tmp_name"], $targetFile)) {
            $contract_path = "uploads/contracts/" . $fileName;
        }
    }

    $stmt = $conn->prepare("INSERT INTO clients (client_guid, organization_guid, lead_guid, contract_file, start_date, status) VALUES (?, ?, ?, ?, ?, ?)");
    $stmt->bind_param("ssssss", $client_guid, $organization_guid, $lead_guid, $contract_path, $start_date, $status);

    if ($stmt->execute()) {
        echo json_encode(["success" => true, "message" => "Client created successfully", "client_guid" => $client_guid]);
    } else {
        echo json_encode(["success" => false, "message" => "Creation failed"]);
    }
    exit();
}


// ========================================================
// DELETE (SOFT DELETE)
// ========================================================
if ($method === 'DELETE') {

    $data = json_decode(file_get_contents("php://input"), true);
    $client_guid = $data['client_guid'] ?? null;

    if (!$client_guid) {
        echo json_encode([
            "success" => false,
            "message" => "client_guid required"
        ]);
        exit();
    }

    $stmt = $conn->prepare("
        UPDATE clients
        SET is_active = 0
        WHERE client_guid = ?
        AND organization_guid = ?
    ");

    $stmt->bind_param("ss", $client_guid, $organization_guid);
    $stmt->execute();

    echo json_encode([
        "success" => true,
        "message" => "Client deleted successfully"
    ]);

    exit();
}


// ========================================================
// INVALID METHOD
// ========================================================
http_response_code(405);
echo json_encode([
    "success" => false,
    "message" => "Method not allowed"
]);