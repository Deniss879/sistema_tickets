<?php
// =============================================================
// Servidor Backend API - Sistema de Tickets Tezontepec de Aldama
// Puerto: 3000
// =============================================================

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// 1. Conexión a la base de datos MySQL en XAMPP (puerto 3307 o 3306)
try {
    $pdo = new PDO("mysql:host=127.0.0.1;port=3307;dbname=ayuntamiento;charset=utf8mb4", "root", "", [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC
    ]);
} catch (PDOException $e1) {
    try {
        $pdo = new PDO("mysql:host=127.0.0.1;port=3306;dbname=ayuntamiento;charset=utf8mb4", "root", "", [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC
        ]);
    } catch (PDOException $e2) {
        http_response_code(500);
        echo json_encode([
            "status" => "error",
            "message" => "No se pudo conectar a MySQL en puerto 3307 ni 3306: " . $e2->getMessage()
        ], JSON_UNESCAPED_UNICODE);
        exit();
    }
}

$uri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
$uri = preg_replace('#^/sistema_tickets#', '', $uri);
$method = $_SERVER['REQUEST_METHOD'];
$body = json_decode(file_get_contents("php://input"), true) ?? [];

// Helper para extraer usuario autenticado desde el token
function getAuthUser($pdo) {
    $headers = getallheaders();
    $auth = $headers['Authorization'] ?? $headers['authorization'] ?? '';
    if (preg_match('/Bearer\s+(.*)$/i', $auth, $m)) {
        $decoded = json_decode(base64_decode($m[1]), true);
        if ($decoded && isset($decoded['id'])) {
            $stmt = $pdo->prepare("SELECT id, nombre, usuario, rol, area_id FROM usuarios WHERE id = ?");
            $stmt->execute([$decoded['id']]);
            return $stmt->fetch() ?: null;
        }
    }
    return null;
}

// -------------------------------------------------------------
// AUTENTICACIÓN
// -------------------------------------------------------------

// POST /api/auth/login
if ($method === 'POST' && $uri === '/api/auth/login') {
    $usuario = trim($body['usuario'] ?? '');
    $contraseña = trim($body['contraseña'] ?? '');
    $role = trim($body['role'] ?? '');

    if (empty($usuario) || empty($contraseña)) {
        http_response_code(400);
        echo json_encode(["status" => "error", "message" => "Por favor ingresa usuario y contraseña."], JSON_UNESCAPED_UNICODE);
        exit();
    }

    $stmt = $pdo->prepare("SELECT u.*, a.nombre as area_nombre FROM usuarios u LEFT JOIN areas a ON u.area_id = a.id WHERE u.usuario = ?");
    $stmt->execute([$usuario]);
    $user = $stmt->fetch();

    if (!$user) {
        http_response_code(401);
        echo json_encode(["status" => "error", "message" => "Usuario no encontrado."], JSON_UNESCAPED_UNICODE);
        exit();
    }

    // Verificar contraseña con hash bcrypt o texto plano
    $valid = password_verify($contraseña, $user['password']) || ($contraseña === $user['password']);

    if (!$valid) {
        http_response_code(401);
        echo json_encode(["status" => "error", "message" => "Contraseña incorrecta."], JSON_UNESCAPED_UNICODE);
        exit();
    }

    // Si seleccionó rol de admin, validar permisos
    if (!empty($role)) {
        $userRolNormalized = ($user['rol'] === 'admin' || $user['rol'] === 'administrador') ? 'admin' : 'usuario';
        if ($role === 'admin' && $userRolNormalized !== 'admin') {
            http_response_code(403);
            echo json_encode(["status" => "error", "message" => "Esta cuenta no tiene permisos de Administrador."], JSON_UNESCAPED_UNICODE);
            exit();
        }
    }

    $token = base64_encode(json_encode([
        "id" => $user['id'],
        "usuario" => $user['usuario'],
        "rol" => $user['rol'],
        "time" => time()
    ]));

    echo json_encode([
        "status" => "ok",
        "token" => $token,
        "usuario" => [
            "id" => (int)$user['id'],
            "nombre" => $user['nombre'],
            "usuario" => $user['usuario'],
            "rol" => $user['rol'],
            "area_id" => $user['area_id'] ? (int)$user['area_id'] : null,
            "area_nombre" => $user['area_nombre'] ?? 'Área Municipal'
        ]
    ], JSON_UNESCAPED_UNICODE);
    exit();
}

// POST /api/auth/registro
if ($method === 'POST' && $uri === '/api/auth/registro') {
    $nombre = trim($body['nombre'] ?? '');
    $apPaterno = trim($body['apellidoPaterno'] ?? '');
    $apMaterno = trim($body['apellidoMaterno'] ?? '');
    $correo = trim($body['correo'] ?? '');
    $contraseña = trim($body['contraseña'] ?? '');
    $area_id = !empty($body['area_id']) ? (int)$body['area_id'] : null;
    $rol = $body['rol'] ?? 'solicitante';

    $nombreCompleto = trim("$nombre $apPaterno $apMaterno");
    $userLogin = strtolower(explode('@', $correo)[0] ?? $nombre);
    $hash = password_hash($contraseña, PASSWORD_BCRYPT);

    try {
        $stmt = $pdo->prepare("INSERT INTO usuarios (nombre, usuario, password, rol, area_id) VALUES (?, ?, ?, ?, ?)");
        $stmt->execute([$nombreCompleto, $userLogin, $hash, $rol, $area_id]);
        echo json_encode(["status" => "ok", "message" => "Usuario registrado exitosamente."], JSON_UNESCAPED_UNICODE);
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(["status" => "error", "message" => "Error al registrar: " . $e->getMessage()], JSON_UNESCAPED_UNICODE);
    }
    exit();
}

// -------------------------------------------------------------
// CATÁLOGOS (ÁREAS, CATEGORÍAS, EQUIPOS)
// -------------------------------------------------------------

// GET /api/areas
if ($method === 'GET' && $uri === '/api/areas') {
    $stmt = $pdo->query("SELECT id, nombre, encargado, ubicacion, es_prioritaria FROM areas ORDER BY es_prioritaria DESC, nombre ASC");
    $areas = $stmt->fetchAll();
    echo json_encode(["status" => "ok", "data" => $areas], JSON_UNESCAPED_UNICODE);
    exit();
}

// GET /api/categorias
if ($method === 'GET' && $uri === '/api/categorias') {
    $stmt = $pdo->query("SELECT id, nombre, descripcion FROM categorias ORDER BY id ASC");
    echo json_encode(["status" => "ok", "data" => $stmt->fetchAll()], JSON_UNESCAPED_UNICODE);
    exit();
}

// GET /api/notificaciones
if ($method === 'GET' && $uri === '/api/notificaciones') {
    $authUser = getAuthUser($pdo);
    $uid = $authUser ? $authUser['id'] : 2;
    $stmt = $pdo->prepare("SELECT * FROM notificaciones WHERE usuario_id = ? ORDER BY id DESC LIMIT 20");
    $stmt->execute([$uid]);
    echo json_encode(["status" => "ok", "data" => $stmt->fetchAll()], JSON_UNESCAPED_UNICODE);
    exit();
}

// GET /api/equipos
if ($method === 'GET' && $uri === '/api/equipos') {
    $stmt = $pdo->query("SELECT e.*, a.nombre as area_nombre FROM equipos e LEFT JOIN areas a ON e.area_id = a.id ORDER BY e.id DESC");
    echo json_encode(["status" => "ok", "data" => $stmt->fetchAll()], JSON_UNESCAPED_UNICODE);
    exit();
}

// -------------------------------------------------------------
// TICKETS Y DASHBOARD
// -------------------------------------------------------------

// GET /api/tickets/dashboard
if ($method === 'GET' && $uri === '/api/tickets/dashboard') {
    $total = (int)$pdo->query("SELECT COUNT(*) FROM tickets")->fetchColumn();
    $abiertos = (int)$pdo->query("SELECT COUNT(*) FROM tickets WHERE estado = 'abierto'")->fetchColumn();
    $en_proceso = (int)$pdo->query("SELECT COUNT(*) FROM tickets WHERE estado = 'en_proceso'")->fetchColumn();
    $finalizados = (int)$pdo->query("SELECT COUNT(*) FROM tickets WHERE estado = 'finalizado'")->fetchColumn();
    $alta = (int)$pdo->query("SELECT COUNT(*) FROM tickets WHERE prioridad = 'alta' AND estado != 'finalizado'")->fetchColumn();

    echo json_encode([
        "status" => "ok",
        "data" => [
            "resumen" => [
                "total" => $total,
                "abiertos" => $abiertos,
                "en_proceso" => $en_proceso,
                "finalizados" => $finalizados,
                "alta_prioridad_pendientes" => $alta,
                "sla_excedidos" => 0
            ]
        ]
    ], JSON_UNESCAPED_UNICODE);
    exit();
}

// GET /api/tickets
if ($method === 'GET' && $uri === '/api/tickets') {
    $estado = $_GET['estado'] ?? null;
    $prioridad = $_GET['prioridad'] ?? null;

    $sql = "SELECT t.*, a.nombre as area_nombre, a.encargado as area_encargado, u.nombre as usuario_nombre, c.nombre as categoria_nombre 
            FROM tickets t 
            LEFT JOIN areas a ON t.area_id = a.id 
            LEFT JOIN usuarios u ON t.usuario_id = u.id 
            LEFT JOIN categorias c ON t.categoria_id = c.id 
            WHERE 1=1";
    $params = [];

    if ($estado && $estado !== 'todos') {
        $sql .= " AND t.estado = ?";
        $params[] = $estado;
    }
    if ($prioridad) {
        $sql .= " AND t.prioridad = ?";
        $params[] = $prioridad;
    }

    $sql .= " ORDER BY t.id DESC";

    $stmt = $pdo->prepare($sql);
    $stmt->execute($params);
    echo json_encode(["status" => "ok", "data" => $stmt->fetchAll()], JSON_UNESCAPED_UNICODE);
    exit();
}

// GET /api/tickets/:id
if ($method === 'GET' && preg_match('#^/api/tickets/(\d+)$#', $uri, $matches)) {
    $id = (int)$matches[1];

    $stmt = $pdo->prepare("SELECT t.*, a.nombre as area_nombre, a.encargado as area_encargado, u.nombre as usuario_nombre, c.nombre as categoria_nombre 
                           FROM tickets t 
                           LEFT JOIN areas a ON t.area_id = a.id 
                           LEFT JOIN usuarios u ON t.usuario_id = u.id 
                           LEFT JOIN categorias c ON t.categoria_id = c.id 
                           WHERE t.id = ?");
    $stmt->execute([$id]);
    $ticket = $stmt->fetch();

    if (!$ticket) {
        http_response_code(404);
        echo json_encode(["status" => "error", "message" => "Ticket no encontrado."], JSON_UNESCAPED_UNICODE);
        exit();
    }

    // Historial
    $stmtHist = $pdo->prepare("SELECT th.*, u.nombre as usuario_nombre FROM ticket_historial th LEFT JOIN usuarios u ON th.usuario_id = u.id WHERE th.ticket_id = ? ORDER BY th.id ASC");
    $stmtHist->execute([$id]);
    $ticket['historial'] = $stmtHist->fetchAll();

    // Fotos
    $stmtFotos = $pdo->prepare("SELECT * FROM ticket_fotos WHERE ticket_id = ?");
    $stmtFotos->execute([$id]);
    $ticket['fotos'] = $stmtFotos->fetchAll();

    echo json_encode(["status" => "ok", "data" => $ticket], JSON_UNESCAPED_UNICODE);
    exit();
}

// POST /api/tickets (Crear ticket)
if ($method === 'POST' && $uri === '/api/tickets') {
    $area_id = (int)($body['area_id'] ?? 0);
    $categoria_id = !empty($body['categoria_id']) ? (int)$body['categoria_id'] : null;
    $equipo_id = !empty($body['equipo_id']) ? (int)$body['equipo_id'] : null;
    $descripcion = trim($body['descripcion'] ?? '');
    $tipo_intervencion = $body['tipo_intervencion'] ?? 'in_situ';

    if (!$area_id || empty($descripcion)) {
        http_response_code(400);
        echo json_encode(["status" => "error", "message" => "Área y descripción son obligatorias."], JSON_UNESCAPED_UNICODE);
        exit();
    }

    // Prioridad según área
    $stmtArea = $pdo->prepare("SELECT es_prioritaria FROM areas WHERE id = ?");
    $stmtArea->execute([$area_id]);
    $areaRow = $stmtArea->fetch();
    $prioridad = ($areaRow && !empty($areaRow['es_prioritaria'])) ? 'alta' : 'normal';

    $authUser = getAuthUser($pdo);
    $usuario_id = $authUser ? $authUser['id'] : 2; // Default samantha

    try {
        $stmt = $pdo->prepare("INSERT INTO tickets (area_id, usuario_id, categoria_id, equipo_id, descripcion, tipo_intervencion, prioridad, estado) 
                               VALUES (?, ?, ?, ?, ?, ?, ?, 'abierto')");
        $stmt->execute([$area_id, $usuario_id, $categoria_id, $equipo_id, $descripcion, $tipo_intervencion, $prioridad]);
        $ticketId = $pdo->lastInsertId();

        $stmtH = $pdo->prepare("INSERT INTO ticket_historial (ticket_id, usuario_id, estado_anterior, estado_nuevo, nota) VALUES (?, ?, NULL, 'abierto', 'Ticket registrado en el sistema')");
        $stmtH->execute([$ticketId, $usuario_id]);

        echo json_encode([
            "status" => "ok",
            "message" => "Ticket levantado exitosamente",
            "ticket" => [
                "id" => (int)$ticketId,
                "folio" => "TCK-" . str_pad($ticketId, 3, "0", STR_PAD_LEFT),
                "prioridad" => $prioridad,
                "estado" => "abierto",
                "descripcion" => $descripcion,
                "area_id" => $area_id,
                "categoria_id" => $categoria_id,
                "tipo_intervencion" => $tipo_intervencion,
                "created_at" => date('Y-m-d H:i:s'),
            ]
        ], JSON_UNESCAPED_UNICODE);
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(["status" => "error", "message" => "Error al guardar ticket: " . $e->getMessage()], JSON_UNESCAPED_UNICODE);
    }
    exit();
}

// PUT /api/tickets/:id/estado
if ($method === 'PUT' && preg_match('#^/api/tickets/(\d+)/estado$#', $uri, $matches)) {
    $id = (int)$matches[1];
    $nuevoEstado = $body['estado'] ?? 'en_proceso';
    $subestado = !empty($body['subestado']) ? trim($body['subestado']) : null;
    $nota = !empty($body['nota']) ? trim($body['nota']) : null;

    $stmtOld = $pdo->prepare("SELECT estado FROM tickets WHERE id = ?");
    $stmtOld->execute([$id]);
    $oldEstado = $stmtOld->fetchColumn();

    $stmt = $pdo->prepare("UPDATE tickets SET estado = ?, subestado = ?, updated_at = NOW() WHERE id = ?");
    $stmt->execute([$nuevoEstado, $subestado, $id]);

    $authUser = getAuthUser($pdo);
    $usuario_id = $authUser ? $authUser['id'] : 1;

    $stmtH = $pdo->prepare("INSERT INTO ticket_historial (ticket_id, usuario_id, estado_anterior, estado_nuevo, nota) VALUES (?, ?, ?, ?, ?)");
    $stmtH->execute([$id, $usuario_id, $oldEstado, $nuevoEstado, $nota]);

    echo json_encode(["status" => "ok", "message" => "Estado actualizado exitosamente."], JSON_UNESCAPED_UNICODE);
    exit();
}

// PUT /api/tickets/:id/reabrir
if ($method === 'PUT' && preg_match('#^/api/tickets/(\d+)/reabrir$#', $uri, $matches)) {
    $id = (int)$matches[1];
    $nota = $body['nota'] ?? 'Ticket reabierto';

    $stmt = $pdo->prepare("UPDATE tickets SET estado = 'en_proceso', updated_at = NOW() WHERE id = ?");
    $stmt->execute([$id]);

    $authUser = getAuthUser($pdo);
    $usuario_id = $authUser ? $authUser['id'] : 1;

    $stmtH = $pdo->prepare("INSERT INTO ticket_historial (ticket_id, usuario_id, estado_anterior, estado_nuevo, nota) VALUES (?, ?, 'finalizado', 'en_proceso', ?)");
    $stmtH->execute([$id, $usuario_id, $nota]);

    echo json_encode(["status" => "ok", "message" => "Ticket reabierto exitosamente."], JSON_UNESCAPED_UNICODE);
    exit();
}

// DELETE /api/tickets/:id
if ($method === 'DELETE' && preg_match('#^/api/tickets/(\d+)$#', $uri, $matches)) {
    $user = getAuthUser($pdo);
    if (!$user) {
        http_response_code(401);
        echo json_encode(["status" => "error", "message" => "No autenticado."], JSON_UNESCAPED_UNICODE);
        exit();
    }

    $ticketId = (int)$matches[1];

    $stmt = $pdo->prepare("SELECT id, usuario_id FROM tickets WHERE id = ?");
    $stmt->execute([$ticketId]);
    $ticket = $stmt->fetch();

    if (!$ticket) {
        http_response_code(404);
        echo json_encode(["status" => "error", "message" => "Ticket no encontrado."], JSON_UNESCAPED_UNICODE);
        exit();
    }

    if ($user['rol'] !== 'admin' && (int)$ticket['usuario_id'] !== (int)$user['id']) {
        http_response_code(403);
        echo json_encode(["status" => "error", "message" => "No tienes permiso para eliminar este ticket."], JSON_UNESCAPED_UNICODE);
        exit();
    }

    $stmt = $pdo->prepare("DELETE FROM tickets WHERE id = ?");
    $stmt->execute([$ticketId]);

    echo json_encode(["status" => "ok", "message" => "Ticket eliminado correctamente."], JSON_UNESCAPED_UNICODE);
    exit();
}

// GET /api/reportes/general
if ($method === 'GET' && $uri === '/api/reportes/general') {
    $total      = (int)$pdo->query("SELECT COUNT(*) FROM tickets")->fetchColumn();
    $abiertos   = (int)$pdo->query("SELECT COUNT(*) FROM tickets WHERE estado = 'abierto'")->fetchColumn();
    $en_proceso = (int)$pdo->query("SELECT COUNT(*) FROM tickets WHERE estado = 'en_proceso'")->fetchColumn();
    $finalizados= (int)$pdo->query("SELECT COUNT(*) FROM tickets WHERE estado = 'finalizado'")->fetchColumn();

    $stmtArea = $pdo->query("
        SELECT a.nombre AS area, COUNT(t.id) AS total,
               SUM(CASE WHEN t.estado='finalizado' THEN 1 ELSE 0 END) AS resueltos
        FROM tickets t
        LEFT JOIN areas a ON t.area_id = a.id
        GROUP BY a.nombre
        ORDER BY total DESC
        LIMIT 10
    ");
    $por_area = $stmtArea->fetchAll();

    $stmtCat = $pdo->query("
        SELECT COALESCE(c.nombre, 'Sin categoría') AS categoria, COUNT(t.id) AS total
        FROM tickets t
        LEFT JOIN categorias c ON t.categoria_id = c.id
        GROUP BY c.nombre
        ORDER BY total DESC
        LIMIT 10
    ");
    $por_categoria = $stmtCat->fetchAll();

    // Tickets recientes con detalle completo
    $stmtTickets = $pdo->query("
        SELECT t.id, t.descripcion, t.estado, t.prioridad, t.tipo_intervencion,
               t.created_at, t.updated_at,
               a.nombre AS area_nombre,
               c.nombre AS categoria_nombre,
               u.nombre AS usuario_nombre
        FROM tickets t
        LEFT JOIN areas a ON t.area_id = a.id
        LEFT JOIN categorias c ON t.categoria_id = c.id
        LEFT JOIN usuarios u ON t.usuario_id = u.id
        ORDER BY t.created_at DESC
        LIMIT 50
    ");
    $tickets_recientes = $stmtTickets->fetchAll();

    echo json_encode([
        "status" => "ok",
        "data" => [
            "resumen" => [
                "total_tickets" => $total,
                "abiertos"      => $abiertos,
                "en_proceso"    => $en_proceso,
                "finalizados"   => $finalizados,
            ],
            "por_area"          => $por_area,
            "por_categoria"     => $por_categoria,
            "tickets_recientes" => $tickets_recientes,
        ]
    ], JSON_UNESCAPED_UNICODE);
    exit();
}

// Fallback: ruta no encontrada
http_response_code(404);
echo json_encode(["status" => "error", "message" => "Ruta no encontrada: $method $uri"], JSON_UNESCAPED_UNICODE);
