<?php

header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Authorization");

require_once "config.php";
require_once "vendor/autoload.php";

use Firebase\JWT\JWT;
use Firebase\JWT\Key;

$headers = getallheaders();

if (!isset($headers['Authorization'])) {
    echo json_encode(["success"=>false]);
    exit;
}

$token = str_replace("Bearer ","",$headers['Authorization']);

try {

    JWT::decode($token,new Key($jwt_secret,"HS256"));

} catch(Exception $e){

    echo json_encode(["success"=>false]);
    exit;
}

$result=$conn->query("
SELECT role_guid,role_name
FROM roles
WHERE is_active=1
");

$data=[];

while($row=$result->fetch_assoc()){
$data[]=$row;
}

echo json_encode([
"success"=>true,
"data"=>$data
]);
