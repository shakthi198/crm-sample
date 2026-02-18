<?php
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Access-Control-Allow-Methods: GET, POST, DELETE, OPTIONS");
header("Content-Type: application/json");

require_once 'config.php';
require_once 'middleware.php';

/* ----VALIDATE TOKEN (Handled by middleware)------*/
if (!isset($validation) || !$validation['success']) {
    exit; // Middleware already returns error response
}

$decoded = $validation['data'];
$organization_guid = $decoded->organization_guid ?? null;
$user_guid = $decoded->user_guid ?? null; // Current user performing the action

if (!$organization_guid) {
    http_response_code(401);
    echo json_encode(["success" => false, "message" => "Invalid token payload"]);
    exit();
}

$method = $_SERVER['REQUEST_METHOD'];

// Handle GET Request
if ($method === 'GET') {
    $lead_guid = $_GET['lead_guid'] ?? null;
    $from_date = $_GET['from_date'] ?? null;
    $to_date = $_GET['to_date'] ?? null;

    $sql = "
        SELECT 
            f.followup_guid,
            l.client_name AS lead_name,
            f.lead_guid,
            f.type,
            f.date,
            f.time,
            f.status,
            u.name AS assigned_to,
            f.assigned_to_guid, 
            f.outcome
        FROM followups f
        LEFT JOIN leads l ON f.lead_guid = l.lead_guid
        LEFT JOIN users u ON f.assigned_to_guid = u.user_guid
        WHERE f.organization_guid = ?
        AND f.is_active = 1
    ";

    $params = [$organization_guid];
    $types = "s";

    if (!empty($lead_guid)) {
        $sql .= " AND f.lead_guid = ?";
        $params[] = $lead_guid;
        $types .= "s";
    }

    if (!empty($from_date) && !empty($to_date)) {
        $sql .= " AND f.date BETWEEN ? AND ?";
        $params[] = $from_date;
        $params[] = $to_date;
        $types .= "ss";
    }

    $sql .= " ORDER BY f.date ASC";

    $stmt = $conn->prepare($sql);
    $stmt->bind_param($types, ...$params);
    $stmt->execute();
    $result = $stmt->get_result();

    $data = [];
    while ($row = $result->fetch_assoc()) {
        $data[] = $row;
    }

    echo json_encode(["success" => true, "data" => $data]);
    exit();
}

// Handle POST Request (Create, Update, Delete)
if ($method === 'POST') {
    $input = json_decode(file_get_contents("php://input"), true);

    // Check for action param either in query string or body
    $action = $_GET['action'] ?? $input['action'] ?? null;

    // DELETE Action (Soft Delete)
    if ($action === 'delete') {
        $followup_guid = $input['followup_guid'] ?? null;
        if (!$followup_guid) {
            echo json_encode(["success" => false, "message" => "Followup GUID required for deletion"]);
            exit();
        }

        $stmt = $conn->prepare("UPDATE followups SET is_active = 0 WHERE followup_guid = ? AND organization_guid = ?");
        $stmt->bind_param("ss", $followup_guid, $organization_guid);

        if ($stmt->execute()) {
            echo json_encode(["success" => true, "message" => "Followup deleted"]);
        } else {
            echo json_encode(["success" => false, "message" => "Failed to delete"]);
        }
        exit();
    }

    // UPDATE Status Only (Quick Action)
    if (isset($input['followup_guid']) && count($input) === 2 && isset($input['status'])) {
        $followup_guid = $input['followup_guid'];
        $status = $input['status'];

        $stmt = $conn->prepare("UPDATE followups SET status = ? WHERE followup_guid = ? AND organization_guid = ?");
        $stmt->bind_param("sss", $status, $followup_guid, $organization_guid);

        if ($stmt->execute()) {
            echo json_encode(["success" => true, "message" => "Status updated"]);
        } else {
            echo json_encode(["success" => false, "message" => "Failed to update status"]);
        }
        exit();
    }

    // Standard Create / Update
    $followup_guid = $input['followup_guid'] ?? null;
    $lead_guid = $input['lead_id'] ?? null; // Frontend sends lead_id
    $type = $input['type'] ?? 'Call';
    $date = $input['date'] ?? date('Y-m-d');
    $time = $input['time'] ?? '09:00:00';
    $status = $input['status'] ?? 'Pending';
    $assigned_to_guid = $input['assigned_to'] ?? $user_guid; // Default to current user if empty
    $outcome = $input['outcome'] ?? '';

    // Validation
    if (!$lead_guid) {
        echo json_encode(["success" => false, "message" => "Lead is required"]);
        exit();
    }

    if ($followup_guid) {
        // UPDATE
        $stmt = $conn->prepare("
            UPDATE followups 
            SET lead_guid = ?, type = ?, date = ?, time = ?, status = ?, assigned_to_guid = ?, outcome = ?
            WHERE followup_guid = ? AND organization_guid = ?
        ");
        $stmt->bind_param("sssssssss", $lead_guid, $type, $date, $time, $status, $assigned_to_guid, $outcome, $followup_guid, $organization_guid);

        if ($stmt->execute()) {
            echo json_encode(["success" => true, "message" => "Followup updated"]);
        } else {
            echo json_encode(["success" => false, "message" => "Failed to update", "error" => $conn->error]);
        }

    } else {
        // CREATE
        $followup_guid = bin2hex(random_bytes(16));
        $created_at = date('Y-m-d H:i:s');
        $is_active = 1;

        $stmt = $conn->prepare("
            INSERT INTO followups 
            (followup_guid, organization_guid, lead_guid, type, status, assigned_to_guid, date, time, created_at, is_active, outcome)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ");

        $stmt->bind_param("sssssssssis", $followup_guid, $organization_guid, $lead_guid, $type, $status, $assigned_to_guid, $date, $time, $created_at, $is_active, $outcome);

        if ($stmt->execute()) {
            echo json_encode(["success" => true, "message" => "Followup created"]);
        } else {
            echo json_encode(["success" => false, "message" => "Failed to create", "error" => $conn->error]);
        }
    }
    exit();
}

http_response_code(405);
echo json_encode(["success" => false, "message" => "Method not allowed"]);
?>