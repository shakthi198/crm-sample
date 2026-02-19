<?php

ini_set('display_errors', 1);
error_reporting(E_ALL);

/* ===============================
   CORS
=============================== */
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type, Authorization, Organization-Guid");
header("Access-Control-Allow-Methods: GET, POST, DELETE, OPTIONS");
header("Content-Type: application/json");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

require_once __DIR__ . '/config.php';
require_once __DIR__ . '/middleware.php';

/* ===============================
   AUTH VALIDATION
=============================== */
if (!isset($validation) || !$validation['success']) {
    http_response_code(401);
    echo json_encode(["success"=>false,"error"=>"Unauthorized"]);
    exit;
}

$auth = (array)$validation['data'];
$user_role = $auth['role'] ?? '';

/* ===============================
   GET ORG FROM HEADER
=============================== */
function getOrganizationGuid() {
    $headers = getallheaders();
    foreach ($headers as $key=>$value){
        if(strtolower($key)==='organization-guid'){
            return $value;
        }
    }
    return null;
}

$org_guid = getOrganizationGuid();

if(!$org_guid){
    http_response_code(400);
    echo json_encode(["success"=>false,"error"=>"Organization-Guid header missing"]);
    exit;
}

$method = $_SERVER['REQUEST_METHOD'];

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
        echo json_encode(["success"=>false,"error"=>"Invalid method"]);
}

/* =========================================================
   GET ROLES WITH PERMISSIONS
========================================================= */
function handleGet($conn,$org_guid)
{
    $stmt = $conn->prepare("
        SELECT role_guid, role_name, is_active, description, is_system
        FROM roles
        WHERE organization_guid = ? OR is_system = 1
    ");
    $stmt->bind_param("s",$org_guid);
    $stmt->execute();
    $result = $stmt->get_result();

    $roles = [];

    while($row = $result->fetch_assoc()){

        $role_guid = $row['role_guid'];

        $permStmt = $conn->prepare("
            SELECT p.module, p.view, p.edit, p.`delete`, p.full_access
            FROM role_permissions rp
            JOIN permissions p ON rp.permission_guid = p.permission_guid
            WHERE rp.role_guid = ?
            AND rp.organization_guid = ?
            AND rp.is_active = 1
        ");

        $permStmt->bind_param("ss",$role_guid,$org_guid);
        $permStmt->execute();
        $permResult = $permStmt->get_result();

        $permissions = $permResult->fetch_all(MYSQLI_ASSOC);

        $row['permissions'] = $permissions;
        $roles[] = $row;
    }

    echo json_encode(["success"=>true,"data"=>$roles]);
}

/* =========================================================
   CREATE / UPDATE ROLE WITH PERMISSIONS
========================================================= */
function handlePost($conn,$auth,$org_guid)
{
    $user_role = $auth['role'] ?? '';

    if(strcasecmp($user_role,'Admin')!==0 &&
       strcasecmp($user_role,'Super Admin')!==0){
        echo json_encode(["success"=>false,"error"=>"Admin only"]);
        exit;
    }

    $data = json_decode(file_get_contents("php://input"),true);

    $role_guid = $data['role_guid'] ?? null;
    $role_name = $data['role_name'] ?? '';
    $description = $data['description'] ?? '';
    $is_active = $data['is_active'] ?? 1;
    $permissions_data = $data['permissions'] ?? [];

    if(!$role_name){
        echo json_encode(["success"=>false,"error"=>"Role name required"]);
        exit;
    }

    $conn->begin_transaction();

    try {

        if($role_guid){
            $stmt = $conn->prepare("
                UPDATE roles
                SET role_name=?, is_active=?, description=?
                WHERE role_guid=? AND organization_guid=?
            ");
            $stmt->bind_param("sisss",
                $role_name,$is_active,$description,$role_guid,$org_guid
            );
        } else {
            $role_guid = bin2hex(random_bytes(16));
            $stmt = $conn->prepare("
                INSERT INTO roles
                (role_guid,organization_guid,role_name,is_active,description,is_system)
                VALUES(?,?,?,?,?,0)
            ");
            $stmt->bind_param("sssis",
                $role_guid,$org_guid,$role_name,$is_active,$description
            );
        }

        $stmt->execute();
        $stmt->close();

        /* CLEAR OLD PERMISSIONS */
        $stmt = $conn->prepare("
            DELETE FROM role_permissions
            WHERE role_guid=? AND organization_guid=?
        ");
        $stmt->bind_param("ss",$role_guid,$org_guid);
        $stmt->execute();
        $stmt->close();

        /* INSERT NEW PERMISSIONS */
        foreach($permissions_data as $perm){

            $module = $perm['module'] ?? '';
            if(!$module) continue;

            $v = $perm['view'] ?? 0;
            $e = $perm['edit'] ?? 0;
            $d = $perm['delete'] ?? 0;
            $f = $perm['full_access'] ?? 0;

            $perm_guid = bin2hex(random_bytes(16));

$stmt = $conn->prepare("
INSERT INTO permissions 
(permission_guid, organization_guid, module, view, edit, `delete`, full_access, is_active) 
VALUES (?, ?, ?, ?, ?, ?, ?, 1)
");

            $stmt->bind_param("sssiiii",
                $perm_guid,$org_guid,$module,$v,$e,$d,$f
            );
            $stmt->execute();
            $stmt->close();

            $rp_guid = bin2hex(random_bytes(16));
            $stmt = $conn->prepare("
                INSERT INTO role_permissions
                (role_permission_guid,role_guid,permission_guid,organization_guid,is_active)
                VALUES(?,?,?,?,1)
            ");
            $stmt->bind_param("ssss",
                $rp_guid,$role_guid,$perm_guid,$org_guid
            );
            $stmt->execute();
            $stmt->close();
        }

        $conn->commit();
        echo json_encode(["success"=>true]);

    } catch(Exception $e){
        $conn->rollback();
        echo json_encode(["success"=>false,"error"=>$e->getMessage()]);
    }
}

/* =========================================================
   DELETE ROLE
========================================================= */
function handleDelete($conn,$auth,$org_guid)
{
    $user_role = $auth['role'] ?? '';

    if(strcasecmp($user_role,'Admin')!==0 &&
       strcasecmp($user_role,'Super Admin')!==0){
        echo json_encode(["success"=>false,"error"=>"Unauthorized"]);
        exit;
    }

    $role_guid = $_GET['role_guid'] ?? '';

    if(!$role_guid){
        echo json_encode(["success"=>false,"error"=>"Role ID required"]);
        exit;
    }

    $stmt = $conn->prepare("
        DELETE FROM roles
        WHERE role_guid=? AND organization_guid=?
    ");
    $stmt->bind_param("ss",$role_guid,$org_guid);
    $stmt->execute();

    echo json_encode(["success"=>true]);
}
