<?php

/* =====================================================
   ERROR REPORTING
===================================================== */

ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);


/* =====================================================
   ✅ FIX 1: PROPER CORS HEADERS (Added Organization-Guid)
===================================================== */

header("Access-Control-Allow-Origin: *");

header("Access-Control-Allow-Headers: Content-Type, Authorization, Organization-Guid");

header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");

header("Content-Type: application/json; charset=UTF-8");


/* =====================================================
   ✅ FIX 2: HANDLE OPTIONS PREFLIGHT
===================================================== */

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {

    http_response_code(200);

    exit;

}


/* =====================================================
   REQUIRE FILES
===================================================== */

require_once 'middleware.php';

require_once 'config.php';


/* =====================================================
   INPUT
===================================================== */

$method = $_SERVER['REQUEST_METHOD'];

$input = json_decode(file_get_contents("php://input"), true) ?? [];


/* =====================================================
   ✅ FIX 3: VALIDATE TOKEN PROPERLY
===================================================== */

$token = getBearerToken();

$validation = validateJWTAndGetGuid($token);

if (!$validation['success']) {

    http_response_code(401);

    echo json_encode([

        "success" => false,

        "error" => "Invalid token"

    ]);

    exit;

}

$user = $validation['data'];


/* =====================================================
   ✅ FIX 4: USE user_guid (NOT admin_guid)
===================================================== */

$user_guid = $user->user_guid ?? null;


/* =====================================================
   ✅ FIX 5: GET ORGANIZATION GUID FROM HEADER
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


$organization_guid = getOrganizationGuid();


/* =====================================================
   VALIDATION
===================================================== */

if (!$organization_guid) {

    http_response_code(400);

    echo json_encode([

        "success" => false,

        "error" => "Organization-Guid header missing"

    ]);

    exit;

}


if (!$user_guid) {

    http_response_code(401);

    echo json_encode([

        "success" => false,

        "error" => "User GUID missing in token"

    ]);

    exit;

}


/* =====================================================
   ROUTER
===================================================== */

switch ($method) {

    case "GET":

        getBudgets($conn, $organization_guid);

        break;


    case "POST":

        createBudget($conn, $organization_guid, $user_guid, $input);

        break;


    case "PUT":

        updateBudget($conn, $organization_guid, $user_guid, $input);

        break;


    case "DELETE":

        deleteBudget($conn, $organization_guid, $input);

        break;


    default:

        http_response_code(405);

        echo json_encode([

            "success" => false,

            "error" => "Method Not Allowed"

        ]);

}


/* =====================================================
   GET BUDGETS
===================================================== */

function getBudgets($conn, $organization_guid)
{

    $sql = "

        SELECT

        budget_guid,

        lead_guid,

        estimated_amount,

        discount,

        final_amount,

        status,

        created_at

        FROM budgets

        WHERE organization_guid=?

        AND is_active=1

        ORDER BY created_at DESC

    ";


    $stmt = $conn->prepare($sql);

    $stmt->bind_param("s", $organization_guid);

    $stmt->execute();


    $result = $stmt->get_result();


    echo json_encode([

        "success"=>true,

        "data"=>$result->fetch_all(MYSQLI_ASSOC)

    ]);

}


/* =====================================================
   CREATE
===================================================== */

function createBudget($conn,$organization_guid,$user_guid,$data)
{

    if(empty($data['lead_guid']))
    {

        echo json_encode([

        "success"=>false,

        "error"=>"lead_guid required"

        ]);

        return;

    }


    $budget_guid=uuidv4();


    $estimated_amount=floatval($data['estimated_amount']);


    $discount=floatval($data['discount'] ?? 0);


    $final_amount=$estimated_amount-$discount;


    $status=$data['status'] ?? "Pending";


    $stmt=$conn->prepare("

    INSERT INTO budgets

    (budget_guid,organization_guid,lead_guid,

    estimated_amount,discount,final_amount,status,is_active)

    VALUES(?,?,?,?,?,?,?,1)

    ");


    $stmt->bind_param(

    "sssddds",

    $budget_guid,

    $organization_guid,

    $data['lead_guid'],

    $estimated_amount,

    $discount,

    $final_amount,

    $status

    );


    $stmt->execute();


    echo json_encode([

    "success"=>true,

    "message"=>"Budget created"

    ]);

}


/* =====================================================
   UPDATE
===================================================== */

function updateBudget($conn,$organization_guid,$user_guid,$data)
{

$stmt=$conn->prepare("

UPDATE budgets

SET

estimated_amount=?,

discount=?,

final_amount=?,

status=?

WHERE budget_guid=?

AND organization_guid=?

");


$estimated=$data['estimated_amount'];

$discount=$data['discount'];

$final=$estimated-$discount;


$stmt->bind_param(

"dddsss",

$estimated,

$discount,

$final,

$data['status'],

$data['budget_guid'],

$organization_guid

);


$stmt->execute();


echo json_encode([

"success"=>true,

"message"=>"Updated"

]);

}


/* =====================================================
   DELETE
===================================================== */

function deleteBudget($conn,$organization_guid,$data)
{

$stmt=$conn->prepare("

UPDATE budgets

SET is_active=0

WHERE budget_guid=?

AND organization_guid=?

");


$stmt->bind_param(

"ss",

$data['budget_guid'],

$organization_guid

);


$stmt->execute();


echo json_encode([

"success"=>true,

"message"=>"Deleted"

]);

}


/* =====================================================
   UUID
===================================================== */

function uuidv4()
{

$data=random_bytes(16);

$data[6]=chr(ord($data[6]) & 0x0f | 0x40);

$data[8]=chr(ord($data[8]) & 0x3f | 0x80);

return vsprintf(

'%s%s-%s-%s-%s-%s%s%s',

str_split(bin2hex($data),4)

);

}

?>
