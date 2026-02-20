<?php

/* ============================================
   FIX 1: CORS HEADERS (CRITICAL)
============================================ */

header("Content-Type: application/json; charset=UTF-8");

header("Access-Control-Allow-Origin: *");

header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");

/* FIX: add Organization-Guid */
header("Access-Control-Allow-Headers: Content-Type, Authorization, Organization-Guid");


/* ============================================
   FIX 2: PREFLIGHT EXIT
============================================ */

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS')
{
    http_response_code(200);
    exit;
}



/* ============================================
   REQUIRE
============================================ */

require_once __DIR__ . "/config.php";
require_once __DIR__ . "/vendor/autoload.php";

use Firebase\JWT\JWT;
use Firebase\JWT\Key;



/* ============================================
   FIX 3: SAFE TOKEN EXTRACTION
============================================ */

function getBearerToken()
{

    $headers = getallheaders();

    foreach ($headers as $key => $value)
    {

        if (strtolower($key) === 'authorization')
        {

            if (preg_match('/Bearer\s(\S+)/', $value, $matches))
            {

                return $matches[1];

            }

        }

    }

    return null;

}



/* ============================================
   VERIFY TOKEN
============================================ */

$token = getBearerToken();


if (!$token)
{

    http_response_code(401);

    echo json_encode([

        "success"=>false,

        "error"=>"Token missing"

    ]);

    exit;

}



try
{

    $decoded = JWT::decode(

        $token,

        new Key($jwt_secret,$jwt_algorithm)

    );

}
catch(Exception $e)
{

    http_response_code(401);

    echo json_encode([

        "success"=>false,

        "error"=>"Invalid Token"

    ]);

    exit;

}



/* ============================================
   FIX 4: ORGANIZATION HEADER SAFE
============================================ */

function getOrganizationGuid()
{

    $headers = getallheaders();

    foreach($headers as $key=>$value)
    {

        if(strtolower($key)=="organization-guid")
        {

            return $value;

        }

    }

    return null;

}


$organization_guid=getOrganizationGuid();



/* ============================================
   ROLE CHECK
============================================ */

if
(

strcasecmp($decoded->role,"Admin")!==0

&&

strcasecmp($decoded->role,"Super Admin")!==0

)

{

http_response_code(403);

echo json_encode([

"success"=>false,

"error"=>"Only Admin allowed"

]);

exit;

}



/* ============================================
   METHOD SWITCH
============================================ */

$method=$_SERVER['REQUEST_METHOD'];



switch($method)
{

case "GET":

handleGet($conn,$decoded,$organization_guid);

break;


case "POST":

handleUpdate($conn,$decoded);

break;


case "PUT":

handleUpdate($conn,$decoded);

break;


case "DELETE":

handleDelete($conn,$decoded);

break;


default:

http_response_code(405);

echo json_encode([

"success"=>false,

"error"=>"Method not allowed"

]);

break;

}





/* ============================================
   GET USERS
============================================ */

function handleGet($conn, $decoded, $organization_guid)
{
    $is_super_admin = strcasecmp($decoded->role, "Super Admin") === 0;

    /* ==========================================
       SUPER ADMIN → Show ONLY Admin Users
    ========================================== */
    if ($is_super_admin)
    {
        $stmt = $conn->prepare("
            SELECT
                u.user_guid,
                u.organization_guid,
                u.name,
                u.email,
                u.role_guid,
                r.role_name,
                u.status,
                u.is_active
            FROM users u
            LEFT JOIN roles r ON u.role_guid = r.role_guid
            WHERE LOWER(r.role_name) = 'admin'
        ");

        $stmt->execute();
        $result = $stmt->get_result();
    }
    else
    {
        /* ==========================================
           NORMAL ADMIN → Only Their Organization
        ========================================== */

        // SAFER: use org from JWT instead of header
        $org_from_token = $decoded->organization_guid ?? null;

        if (!$org_from_token)
        {
            http_response_code(400);
            echo json_encode([
                "success" => false,
                "error" => "Organization missing in token"
            ]);
            return;
        }

        $stmt = $conn->prepare("
            SELECT
                u.user_guid,
                u.organization_guid,
                u.name,
                u.email,
                u.role_guid,
                r.role_name,
                u.status,
                u.is_active
            FROM users u
            LEFT JOIN roles r ON u.role_guid = r.role_guid
            WHERE u.organization_guid = ?
        ");

        $stmt->bind_param("s", $organization_guid);
        $stmt->execute();
        $result = $stmt->get_result();
    }

    $data = [];

    while ($row = $result->fetch_assoc())
    {
        $data[] = $row;
    }

    echo json_encode([
        "success" => true,
        "data" => $data
    ]);
}



/* ============================================
   UPDATE USER
============================================ */

function handleUpdate($conn,$decoded)
{


$input=json_decode(file_get_contents("php://input"),true);


$user_guid=$input['user_guid']??null;


if(!$user_guid)
{

http_response_code(400);

echo json_encode([

"success"=>false,

"error"=>"User GUID missing"

]);

return;

}



$stmt=$conn->prepare("

UPDATE users

SET name=?,

email=?

WHERE user_guid=?

");


$stmt->bind_param(

"sss",

$input['name'],

$input['email'],

$user_guid

);



$stmt->execute();


echo json_encode([

"success"=>true,

"message"=>"Updated"

]);


}




/* ============================================
   DELETE USER
============================================ */

function handleDelete($conn,$decoded)
{


$input=json_decode(file_get_contents("php://input"),true);


$user_guid=$input['user_guid']??null;


if(!$user_guid)
{

http_response_code(400);

echo json_encode([

"success"=>false,

"error"=>"User GUID missing"

]);

return;

}



$stmt=$conn->prepare("

DELETE FROM users

WHERE user_guid=?

");


$stmt->bind_param("s",$user_guid);


$stmt->execute();


echo json_encode([

"success"=>true,

"message"=>"Deleted"

]);


}

?>
