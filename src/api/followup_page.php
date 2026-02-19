<?php

/* =====================================================
   ERROR REPORTING
===================================================== */
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);


/* =====================================================
   CORS HEADERS  ✅ FIXED (Added Organization-Guid)
===================================================== */

header("Access-Control-Allow-Origin: *");

/* ✅ FIX: Added Organization-Guid */
header("Access-Control-Allow-Headers: Content-Type, Authorization, Organization-Guid");

/* ✅ FIX: Added PUT also */
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");

header("Content-Type: application/json");


/* ✅ FIX: Handle OPTIONS preflight */
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {

    http_response_code(200);

    exit;

}


/* =====================================================
   REQUIRE FILES
===================================================== */

require_once 'config.php';

require_once 'middleware.php';


/* =====================================================
   VALIDATE TOKEN
===================================================== */

if (!isset($validation) || !$validation['success']) {

    exit;

}

$decoded = $validation['data'];

$user_guid = $decoded->user_guid ?? null;


/* =====================================================
   ✅ FIX: GET ORGANIZATION GUID FROM HEADER
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


/* ✅ IMPORTANT FIX */
$organization_guid = getOrganizationGuid();


/* ✅ FIX: Proper error */
if (!$organization_guid) {

    http_response_code(400);

    echo json_encode([

        "success" => false,

        "error" => "Organization-Guid header missing"

    ]);

    exit();

}


/* =====================================================
   METHOD
===================================================== */

$method = $_SERVER['REQUEST_METHOD'];


/* =====================================================
   GET FOLLOWUPS
===================================================== */

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



    if ($lead_guid) {

        $sql .= " AND f.lead_guid = ?";

        $params[] = $lead_guid;

        $types .= "s";

    }



    if ($from_date && $to_date) {

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



    echo json_encode([

        "success" => true,

        "data" => $data

    ]);



    exit();

}



/* =====================================================
   POST CREATE / UPDATE / DELETE
===================================================== */

if ($method === 'POST') {



    $input = json_decode(file_get_contents("php://input"), true);



    $action = $input['action'] ?? null;



    /* =====================================================
       DELETE
    ===================================================== */

    if ($action === 'delete') {



        $followup_guid = $input['followup_guid'] ?? null;



        if (!$followup_guid) {

            echo json_encode([

                "success" => false,

                "error" => "Followup GUID required"

            ]);

            exit();

        }



        $stmt = $conn->prepare("

            UPDATE followups

            SET is_active = 0

            WHERE followup_guid = ?

            AND organization_guid = ?

        ");



        $stmt->bind_param(

            "ss",

            $followup_guid,

            $organization_guid

        );



        $stmt->execute();



        echo json_encode([

            "success" => true,

            "message" => "Deleted"

        ]);



        exit();

    }



    /* =====================================================
       CREATE / UPDATE
    ===================================================== */

    $followup_guid = $input['followup_guid'] ?? null;



    $lead_guid = $input['lead_id'] ?? null;



    $type = $input['type'] ?? 'Call';



    $date = $input['date'] ?? date('Y-m-d');



    $time = $input['time'] ?? '09:00:00';



    $status = $input['status'] ?? 'Pending';



    $assigned_to_guid = $input['assigned_to'] ?? $user_guid;



    $outcome = $input['outcome'] ?? '';



    if (!$lead_guid) {

        echo json_encode([

            "success" => false,

            "error" => "Lead required"

        ]);

        exit();

    }



    /* UPDATE */

    if ($followup_guid) {



        $stmt = $conn->prepare("

            UPDATE followups

            SET

            lead_guid=?,

            type=?,

            date=?,

            time=?,

            status=?,

            assigned_to_guid=?,

            outcome=?

            WHERE followup_guid=?

            AND organization_guid=?

        ");



        $stmt->bind_param(

            "sssssssss",

            $lead_guid,

            $type,

            $date,

            $time,

            $status,

            $assigned_to_guid,

            $outcome,

            $followup_guid,

            $organization_guid

        );



        $stmt->execute();



        echo json_encode([

            "success" => true,

            "message" => "Updated"

        ]);



        exit();

    }



    /* CREATE */

    else {



        $followup_guid = bin2hex(random_bytes(16));



        $created_at = date('Y-m-d H:i:s');



        $stmt = $conn->prepare("

            INSERT INTO followups

            (

                followup_guid,

                organization_guid,

                lead_guid,

                type,

                status,

                assigned_to_guid,

                date,

                time,

                created_at,

                is_active,

                outcome

            )

            VALUES

            (?, ?, ?, ?, ?, ?, ?, ?, ?, 1, ?)

        ");



        $stmt->bind_param(

            "ssssssssss",

            $followup_guid,

            $organization_guid,

            $lead_guid,

            $type,

            $status,

            $assigned_to_guid,

            $date,

            $time,

            $created_at,

            $outcome

        );



        $stmt->execute();



        echo json_encode([

            "success" => true,

            "message" => "Created"

        ]);



        exit();

    }

}


/* =====================================================
   INVALID METHOD
===================================================== */

http_response_code(405);

echo json_encode([

    "success" => false,

    "error" => "Invalid Method"

]);

?>
