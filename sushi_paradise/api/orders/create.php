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

// 1 - Vérification du token, récupération du client (id)
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

// Récupération de l'ID du client
$userId = $user['id'];

// Récupération de la payload (les box commandées)
$input = json_decode(file_get_contents("php://input"), true);

if (!isset($input['items']) || !is_array($input['items'])) {
    http_response_code(400);
    echo json_encode(['error' => 'Invalid payload: items array is required']);
    exit;
}

// Création de la connexion PDO
$pdo = new PDO('mysql:host=localhost;dbname=sushi_paradise', 'root', '');

// Commencer la transaction
$pdo->beginTransaction();

try {
    // 2 - Créer la commande (INSERT INTO orders)
    $query = $pdo->prepare("INSERT INTO orders (user_id, status) VALUES (:user_id, 'pending')");
    $query->execute([':user_id' => $userId]);

    // Ensuite récupérer l'id de l'order créé
    $orderId = $pdo->lastInsertId();

    // 3 - On crée les items dans order_items
    // On prépare la requête
    $sqlItem = "INSERT INTO order_items (order_id, box_id, quantity, unit_price) 
                VALUES (:order_id, :box_id, :quantity, :unit_price)";
    $stmtItem = $pdo->prepare($sqlItem);

    // On exécute (enregistre) chaque box dans order_items
    $total = 0;
    $totalQuantity = 0;

    foreach ($input['items'] as $item) {
        // Vérifier que les champs box_id, quantity et unit_price sont présents
        if (!isset($item['box_id']) || !isset($item['quantity']) || !isset($item['unit_price'])) {
            throw new Exception("Les champs box_id, quantity et unit_price sont requis pour chaque item");
        }

        // Validation du prix unitaire (doit être positif et raisonnable)
        if ($item['unit_price'] <= 0 || $item['unit_price'] > 1000) {
            throw new Exception("Prix unitaire invalide pour le produit ID " . $item['box_id']);
        }

        // Calculer la quantité totale de boxes
        $totalQuantity += $item["quantity"];

        // Récupérer la box pour vérifier qu'elle existe
        $sqlPrice = $pdo->prepare("SELECT id FROM boxes WHERE id = :id");
        $sqlPrice->execute(['id' => $item["box_id"]]);
        $box = $sqlPrice->fetch();

        // Vérifier si l'id de la box existe
        if (!$box) {
            throw new Exception("La box avec l'ID " . $item["box_id"] . " n'existe pas");
        }

        // Utiliser le prix unitaire envoyé depuis le frontend (permet de gérer les réductions)
        $unitPrice = $item['unit_price'];

        // Insertion de l'item dans order_items
        $stmtItem->execute([
            'order_id' => $orderId,
            'box_id' => $item["box_id"],
            'quantity' => $item["quantity"],
            'unit_price' => $unitPrice
        ]);

        // Calcul du total
        $lineTotal = $unitPrice * $item["quantity"];
        $total = $total + $lineTotal;
    }

    // RÈGLE 1: Un client ne peut pas commander plus de 10 boxes à la fois
    if ($totalQuantity > 10) {
        // Annuler la transaction
        $pdo->rollBack();
        http_response_code(409);
        echo json_encode([
            "error" => "Vous ne pouvez pas commander plus de 10 boxes à la fois",
            "total_quantity" => $totalQuantity
        ]);
        exit;
    }

    // RÈGLE 2: Remise de 1,5% si le montant total dépasse un certain seuil (ex: 100€)
    $seuil = 100;
    if ($total > $seuil) {
        // Appliquer 1,5% de remise
        $total = $total * 0.985;
    }

    // 4 - Mise à jour du total
    $updateOrder = $pdo->prepare("UPDATE orders SET total_price = :total_price WHERE id = :id");
    $updateOrder->execute([
        ':total_price' => $total,
        ':id' => $orderId
    ]);

    // On exécute la transaction (tout s'est bien passé -> on valide la transaction)
    $pdo->commit();

    // Retourner l'ID de la commande créée
    http_response_code(201);
    header('Content-Type: application/json');
    echo json_encode([
        "success" => true,
        "order_id" => $orderId
    ]);

} catch (\Throwable $th) {
    // Une erreur - on annule tout
    $pdo->rollBack();

    http_response_code(500);
    header('Content-Type: application/json');
    echo json_encode([
        "error" => "Impossible de créer la commande",
        "message" => $th->getMessage()
    ]);
}
