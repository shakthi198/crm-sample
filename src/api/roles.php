<?php
require_once __DIR__ . '/config.php';
require_once __DIR__ . '/middleware.php'; // This handles the check and exits if unauthorized

use Firebase\JWT\JWT;
use Firebase\JWT\Key;

header("Content-Type: application/json");

// Middleware already validated the token exists and is valid format.
// We need to decode it again locally to get user roles/permissions as middleware doesn't expose them.
$token = getBearerToken();
$decoded = JWT::decode($token, new Key($jwt_secret, $jwt_algorithm));
// Convert to array
$auth = json_decode(json_encode($decoded), true);

$method = $_SERVER['REQUEST_METHOD'];
$org_guid = $auth['organization_guid'] ?? '';

if ($method === 'GET') {
    handleGet($conn, $org_guid);
} elseif ($method === 'POST') {
    handlePost($conn, $auth, $org_guid);
} elseif ($method === 'DELETE') {
    handleDelete($conn, $auth, $org_guid);
}

function handleGet($conn, $org_guid)
{
    $stmt = $conn->prepare("SELECT role_guid, role_name, is_active, description, is_system FROM roles WHERE organization_guid = ? OR is_system = 1");
    $stmt->bind_param("s", $org_guid);
    $stmt->execute();
    $result = $stmt->get_result();
    $roles = [];

    if ($result) {
        while ($row = $result->fetch_assoc()) {
            $role_guid = $row['role_guid'];

            // Try to fetch permissions - handle case where tables might not exist
            $permissions = [];
            try {
                $permStmt = $conn->prepare("
                    SELECT p.module, p.full_access, p.view, p.edit, p.delete 
                    FROM role_permissions rp
                    JOIN permissions p ON rp.permission_guid = p.permission_guid
                    WHERE rp.role_guid = ? AND rp.is_active = 1 AND (rp.organization_guid = ? OR rp.organization_guid IS NULL)
                ");
                if ($permStmt) {
                    $permStmt->bind_param("ss", $role_guid, $org_guid);
                    $permStmt->execute();
                    $permResult = $permStmt->get_result();
                    while ($pRow = $permResult->fetch_assoc()) {
                        $permissions[] = $pRow;
                    }
                    $permStmt->close();
                }
            } catch (Exception $e) {
                // Silently fail if permissions table doesn't exist yet
            }

            $row['permissions'] = $permissions;
            $roles[] = $row;
        }
    }

    echo json_encode(["success" => true, "data" => $roles]);
}

function handlePost($conn, $auth, $org_guid)
{
    if (empty($org_guid)) {
        echo json_encode(["success" => false, "error" => "Organization ID missing in token"]);
        exit;
    }

    // Case-insensitive check for Admin role
    $user_role = $auth['role'] ?? '';
    if (strcasecmp($user_role, 'Admin') !== 0 && strcasecmp($user_role, 'Super Admin') !== 0) {
        echo json_encode(["success" => false, "error" => "Unauthorized: Admin only"]);
        exit;
    }

    $data = json_decode(file_get_contents("php://input"), true);
    $role_name = $data['name'] ?? $data['role_name'] ?? '';
    $description = $data['description'] ?? '';
    $is_active = $data['is_active'] ?? 1;
    $role_guid = $data['role_guid'] ?? null;
    $permissions_data = $data['permissions'] ?? [];

    if (empty($role_name)) {
        echo json_encode(["success" => false, "error" => "Role name is required"]);
        exit;
    }

    $conn->begin_transaction();
    try {
        if ($role_guid) {
            // Update
            $stmt = $conn->prepare("UPDATE roles SET role_name = ?, is_active = ?, description = ? WHERE role_guid = ? AND organization_guid = ?");
            $stmt->bind_param("sisss", $role_name, $is_active, $description, $role_guid, $org_guid);
        } else {
            // Create
            $role_guid = bin2hex(random_bytes(16));
            $stmt = $conn->prepare("INSERT INTO roles (role_guid, organization_guid, role_name, is_active, description, is_system) VALUES (?, ?, ?, ?, ?, 0)");
            $stmt->bind_param("sssis", $role_guid, $org_guid, $role_name, $is_active, $description);
        }

        if (!$stmt->execute()) {
            throw new Exception($stmt->error);
        }
        $stmt->close();

        // Handle Permissions
        // 1. Clear old permissions
        $stmt = $conn->prepare("DELETE FROM role_permissions WHERE role_guid = ? AND organization_guid = ?");
        $stmt->bind_param("ss", $role_guid, $org_guid);
        $stmt->execute();
        $stmt->close();

        // 2. Link/Create new permissions
        foreach ($permissions_data as $perm) {
            $module = $perm['module'] ?? '';
            if (empty($module))
                continue;

            $v = $perm['view'] ?? 0;
            $e = $perm['edit'] ?? 0;
            $d = $perm['delete'] ?? 0;
            $f = $perm['full_access'] ?? 0;

            // Find existing permission combo within the same organization
            $stmt = $conn->prepare("SELECT permission_guid FROM permissions WHERE module = ? AND view = ? AND edit = ? AND `delete` = ? AND full_access = ? AND organization_guid = ? LIMIT 1");
            $stmt->bind_param("siiiis", $module, $v, $e, $d, $f, $org_guid);
            $stmt->execute();
            $res = $stmt->get_result();
            $p_guid = null;
            if ($row = $res->fetch_assoc()) {
                $p_guid = $row['permission_guid'];
            }
            $stmt->close();

            // If not found, create new permission definition
            if (!$p_guid) {
                $p_guid = bin2hex(random_bytes(16));
                $stmt = $conn->prepare("INSERT INTO permissions (permission_guid, organization_guid, module, view, edit, `delete`, full_access, is_active) VALUES (?, ?, ?, ?, ?, ?, ?, 1)");
                $stmt->bind_param("sssiiii", $p_guid, $org_guid, $module, $v, $e, $d, $f);
                if (!$stmt->execute()) {
                    throw new Exception("Error creating permission: " . $stmt->error);
                }
                $stmt->close();
            }

            // Link to role
            $rp_guid = bin2hex(random_bytes(16));
            $stmt = $conn->prepare("INSERT INTO role_permissions (role_permission_guid, role_guid, permission_guid, organization_guid, is_active) VALUES (?, ?, ?, ?, 1)");
            $stmt->bind_param("ssss", $rp_guid, $role_guid, $p_guid, $org_guid);
            if (!$stmt->execute()) {
                throw new Exception("Error linking permission: " . $stmt->error);
            }
            $stmt->close();
        }

        $conn->commit();
        echo json_encode(["success" => true]);
    } catch (Exception $e) {
        $conn->rollback();
        echo json_encode(["success" => false, "error" => $e->getMessage()]);
    }
}

function handleDelete($conn, $auth, $org_guid)
{
    $user_role = $auth['role'] ?? '';
    if (strcasecmp($user_role, 'Admin') !== 0 && strcasecmp($user_role, 'Super Admin') !== 0) {
        echo json_encode(["success" => false, "error" => "Unauthorized"]);
        exit;
    }

    $role_guid = $_GET['role_guid'] ?? '';

    if (empty($role_guid)) {
        echo json_encode(["success" => false, "error" => "Role ID is required"]);
        exit;
    }

    // Check if system role
    $stmt = $conn->prepare("SELECT is_system FROM roles WHERE role_guid = ? AND organization_guid = ?");
    $stmt->bind_param("ss", $role_guid, $org_guid);
    $stmt->execute();
    $res = $stmt->get_result();
    if ($row = $res->fetch_assoc()) {
        if ($row['is_system'] == 1) {
            echo json_encode(["success" => false, "error" => "Cannot delete system role"]);
            exit;
        }
    } else {
        // If not found, it might be a system role without org guid, or just doesn't belong to this org
        $stmt->close();
        $stmt = $conn->prepare("SELECT is_system FROM roles WHERE role_guid = ? AND is_system = 1");
        $stmt->bind_param("s", $role_guid);
        $stmt->execute();
        $res = $stmt->get_result();
        if ($row = $res->fetch_assoc()) {
            echo json_encode(["success" => false, "error" => "Cannot delete system role"]);
            exit;
        }
    }
    $stmt->close();

    // Check if any users have this role in this org
    $checkStmt = $conn->prepare("SELECT COUNT(*) as count FROM users WHERE role_guid = ? AND organization_guid = ?");
    $checkStmt->bind_param("ss", $role_guid, $org_guid);
    $checkStmt->execute();
    $count = $checkStmt->get_result()->fetch_assoc()['count'];
    $checkStmt->close();

    if ($count > 0) {
        echo json_encode(["success" => false, "error" => "Cannot delete role as it is assigned to $count users"]);
        exit;
    }

    $stmt = $conn->prepare("DELETE FROM roles WHERE role_guid = ? AND organization_guid = ?");
    $stmt->bind_param("ss", $role_guid, $org_guid);

    if ($stmt->execute()) {
        echo json_encode(["success" => true]);
    } else {
        echo json_encode(["success" => false, "error" => $stmt->error]);
    }
    $stmt->close();
}

