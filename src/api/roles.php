<?php

/* =====================================================
   ✅ FIX 1: ERROR REPORTING
===================================================== */

ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);


/* =====================================================
   ✅ FIX 2: CORS HEADERS (Added Organization-Guid)
===================================================== */

header("Access-Control-Allow-Origin: *");

header("Access-Control-Allow-Headers: Content-Type, Authorization, Organization-Guid");

header("Access-Control-Allow-Methods: GET, POST, DELETE, OPTIONS");

header("Content-Type: application/json");


/* =====================================================
   ✅ FIX 3: HANDLE OPTIONS PREFLIGHT
===================================================== */

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {

    http_response_code(200);

    exit;

}


/* =====================================================
   REQUIRE FILES
===================================================== */

require_once __DIR__ . '/config.php';

require_once __DIR__ . '/middleware.php';


/* =====================================================
   ✅ FIX 4: USE MIDDLEWARE RESULT (DON'T DECODE AGAIN)
===================================================== */

if (!isset($validation) || !$validation['success']) {

    http_response_code(401);

    echo json_encode([

        "success"=>false,

        "error"=>"Unauthorized"

    ]);

    exit;

}

$auth = (array)$validation['data'];


/* =====================================================
   METHOD
===================================================== */

$method = $_SERVER['REQUEST_METHOD'];


/* =====================================================
   ✅ FIX 5: GET ORGANIZATION GUID FROM HEADER
===================================================== */

function getOrganizationGuid()
{

    $headers = getallheaders();

    foreach ($headers as $key=>$value){

        if(strtolower($key)==='organization-guid'){

            return $value;

        }

    }

    return null;

}

$org_guid=getOrganizationGuid();


if(!$org_guid){

http_response_code(400);

echo json_encode([

"success"=>false,

"error"=>"Organization-Guid header missing"

]);

exit;

}


/* =====================================================
   ROUTER
===================================================== */

switch($method){

case "GET":

handleGet($conn,$org_guid);

break;


case "POST":

handlePost($conn,$auth,$org_guid);

break;


case "DELETE":

handleDelete($conn,$auth,$org_guid);

break;


default:

http_response_code(405);

echo json_encode([

"success"=>false,

"error"=>"Invalid method"

]);

}


/* =====================================================
   GET ROLES
===================================================== */

function handleGet($conn,$org_guid)
{

$stmt=$conn->prepare("

SELECT role_guid,role_name,is_active,description,is_system

FROM roles

WHERE organization_guid=? OR is_system=1

");


$stmt->bind_param("s",$org_guid);

$stmt->execute();


$result=$stmt->get_result();


$roles=$result->fetch_all(MYSQLI_ASSOC);


echo json_encode([

"success"=>true,

"data"=>$roles

]);

}


/* =====================================================
   CREATE / UPDATE ROLE
===================================================== */

function handlePost($conn,$auth,$org_guid)
{


/* ✅ FIX 6: CHECK ROLE */

$user_role=$auth['role'] ?? '';

if(

strcasecmp($user_role,'Admin')!==0

&&

strcasecmp($user_role,'Super Admin')!==0

){

echo json_encode([

"success"=>false,

"error"=>"Admin only"

]);

exit;

}


$data=json_decode(file_get_contents("php://input"),true);


$role_name=$data['role_name'] ?? '';


if(!$role_name){

echo json_encode([

"success"=>false,

"error"=>"Role name required"

]);

exit;

}


$role_guid=$data['role_guid'] ?? null;


/* CREATE */

if(!$role_guid){

$role_guid=bin2hex(random_bytes(16));


$stmt=$conn->prepare("

INSERT INTO roles

(role_guid,organization_guid,role_name,is_active,is_system)

VALUES(?,?,?,1,0)

");


$stmt->bind_param(

"sss",

$role_guid,

$org_guid,

$role_name

);


}


/* UPDATE */

else{

$stmt=$conn->prepare("

UPDATE roles

SET role_name=?

WHERE role_guid=?

AND organization_guid=?

");


$stmt->bind_param(

"sss",

$role_name,

$role_guid,

$org_guid

);

}


$stmt->execute();


echo json_encode([

"success"=>true,

"message"=>"Saved"

]);

}


/* =====================================================
   DELETE ROLE
===================================================== */

function handleDelete($conn,$auth,$org_guid)
{


$user_role=$auth['role'] ?? '';


if(

strcasecmp($user_role,'Admin')!==0

&&

strcasecmp($user_role,'Super Admin')!==0

){

echo json_encode([

"success"=>false,

"error"=>"Unauthorized"

]);

exit;

}


$role_guid=$_GET['role_guid'] ?? '';


$stmt=$conn->prepare("

DELETE FROM roles

WHERE role_guid=?

AND organization_guid=?

");


$stmt->bind_param(

"ss",

$role_guid,

$org_guid

);


$stmt->execute();


echo json_encode([

"success"=>true,

"message"=>"Deleted"

]);

}

?>
