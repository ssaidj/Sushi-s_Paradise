<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header('Content-Type: application/json');

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

require __DIR__ . '/../../Manager/UserManager.php';

// Récupération du token depuis les headers
$headers = getallheaders();

if (!isset($headers['Authorization'])) {
    http_response_code(401);
    echo json_encode(['error' => 'No token provided']);
    exit;
}

$token = str_replace('Bearer ', '', $headers['Authorization']);

// Vérification du token en base de données
$userManager = new UserManager();
$user = $userManager->findByToken($token);

if (!$user) {
    http_response_code(401);
    echo json_encode(['error' => 'Invalid token']);
    exit;
}

// Récupérer l'ID de l'utilisateur
$userId = $user['id'];

// Connexion à la base de données
$pdo = new PDO('mysql:host=localhost;dbname=sushi_paradise', 'root', '');

try {
    // Récupérer toutes les commandes de l'utilisateur
    $query = $pdo->prepare("
        SELECT id, user_id, total_price, status, created_at 
        FROM orders 
        WHERE user_id = :user_id 
        ORDER BY created_at DESC
    ");
    $query->execute([':user_id' => $userId]);
    $orders = $query->fetchAll(PDO::FETCH_ASSOC);

    // Pour chaque commande, récupérer les items
    foreach ($orders as &$order) {
        $itemsQuery = $pdo->prepare("
            SELECT oi.box_id, oi.quantity, oi.unit_price, b.name
            FROM order_items oi
            JOIN boxes b ON oi.box_id = b.id
            WHERE oi.order_id = :order_id
        ");
        $itemsQuery->execute([':order_id' => $order['id']]);
        $order['items'] = $itemsQuery->fetchAll(PDO::FETCH_ASSOC);
    }

    http_response_code(200);
    echo json_encode($orders);

} catch (\Throwable $th) {
    http_response_code(500);
    echo json_encode([
        'error' => 'Unable to fetch orders',
        'message' => $th->getMessage()
    ]);
}
