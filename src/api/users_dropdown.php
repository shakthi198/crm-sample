<?php

header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json");

$conn = new mysqli("localhost", "root", "", "crm");

if ($conn->connect_error) {

    echo json_encode([
        "success"=>false
    ]);

    exit;
}

$sql = "SELECT user_guid, name FROM users WHERE is_active=1 ORDER BY name";

$result = $conn->query($sql);

$data=[];

while($row=$result->fetch_assoc()){

    $data[]=$row;

}

echo json_encode([
    "success"=>true,
    "data"=>$data
]);

?>
