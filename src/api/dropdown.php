<?php

/* =========================
   ✅ FIX 1: ERROR REPORTING
========================= */

error_reporting(E_ALL);
ini_set('display_errors', 1);


/* =========================
   ✅ FIX 2: CORS HEADERS
========================= */

header("Content-Type: application/json; charset=UTF-8");

header("Access-Control-Allow-Origin: *");

/* ✅ FIX: Added Organization-Guid */

header("Access-Control-Allow-Headers: Content-Type, Authorization, Organization-Guid");

header("Access-Control-Allow-Methods: GET, OPTIONS");


/* =========================
   ✅ FIX 3: OPTIONS HANDLER
========================= */

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {

http_response_code(200);

exit;

}


/* =========================
   REQUIRE FILES
========================= */

require_once __DIR__ . "/config.php";

/* ✅ FIX: JWT middleware */

require_once __DIR__ . "/middleware.php";


/* =========================
   ✅ FIX 4: VERIFY JWT
========================= */

if (!isset($validation) || !$validation['success']) {

http_response_code(401);

echo json_encode([

"success"=>false,

"error"=>"Unauthorized"

]);

exit;

}

$auth=(array)$validation['data'];


/* =========================
   ✅ FIX 5: GET ORG GUID HEADER
========================= */

function getOrganizationGuid(){

$headers=getallheaders();

foreach($headers as $key=>$value){

if(strtolower($key)==='organization-guid'){

return $value;

}

}

return null;

}

$organization_guid=getOrganizationGuid();


/* =========================
   ALLOWED TABLES
========================= */

$allowedTables=[

"users"=>[

"id_column"=>"user_guid",

"name_column"=>"name",

"active_column"=>"is_active",

"org_column"=>"organization_guid"

],

"organizations"=>[

"id_column"=>"organization_guid",

"name_column"=>"organization_name",

"active_column"=>"is_active",

"org_column"=>"organization_guid"

],

"leads"=>[

"id_column"=>"lead_guid",

"name_column"=>"client_name",

"active_column"=>"is_active",

"org_column"=>"organization_guid"

]

];


/* =========================
   GET TABLE
========================= */

$table=$_GET['table'] ?? '';

if(!array_key_exists($table,$allowedTables)){

echo json_encode([

"success"=>false,

"error"=>"Invalid table"

]);

exit;

}


$idColumn=$allowedTables[$table]['id_column'];

$nameColumn=$allowedTables[$table]['name_column'];

$activeColumn=$allowedTables[$table]['active_column'];

$orgColumn=$allowedTables[$table]['org_column'];


/* =========================
   ✅ FIX 6: ORG FILTER QUERY
========================= */

$user_role=$auth['role'] ?? '';

/* Super Admin → show all */

if(strcasecmp($user_role,"Super Admin")==0){

$sql="

SELECT

$idColumn AS id,

$nameColumn AS name

FROM $table

WHERE $activeColumn=1

ORDER BY $nameColumn

";

$stmt=$conn->prepare($sql);

}

/* Admin → org filter */

else{

if(!$organization_guid){

echo json_encode([

"success"=>false,

"error"=>"Organization-Guid header missing"

]);

exit;

}


$sql="

SELECT

$idColumn AS id,

$nameColumn AS name

FROM $table

WHERE $activeColumn=1

AND $orgColumn=?

ORDER BY $nameColumn

";


$stmt=$conn->prepare($sql);

$stmt->bind_param("s",$organization_guid);

}


/* =========================
   EXECUTE
========================= */

$stmt->execute();

$result=$stmt->get_result();

$data=$result->fetch_all(MYSQLI_ASSOC);


/* =========================
   RESPONSE
========================= */

echo json_encode([

"success"=>true,

"data"=>$data

]);


$conn->close();

?>
