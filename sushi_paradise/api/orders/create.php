<?php
header('Content-Type: application/json');

require __DIR__ . '/../../Manager/UserManager.php';

// Vérification du token, récupération du client (id)
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
    // Créer la commande (INSERT INTO orders)
    $query = $pdo->prepare("INSERT INTO orders (user_id, status) VALUES (:user_id, 'pending')");
    $query->execute([':user_id' => $userId]);

    // Ensuite récupérer l'id de l'order créé
    $orderId = $pdo->lastInsertId();

    //  On crée les items dans order_items
    // On prépare la requête
    $sqlItem = "INSERT INTO order_items (order_id, box_id, quantity, unit_price) 
                VALUES (:order_id, :box_id, :quantity, :unit_price)";
    $stmtItem = $pdo->prepare($sqlItem);

    // On exécute (enregistre) chaque box dans order_items
    $total = 0;
    $totalQuantity = 0;

    foreach ($input['items'] as $item) {
        // Vérifier que les champs box_id et quantity sont présents (lors de la boucle)
        if (!isset($item['box_id']) || !isset($item['quantity'])) {
            throw new Exception("Les champs box_id et quantity sont requis pour chaque item");
        }

        // Calculer la quantité totale de boxes
        $totalQuantity += $item["quantity"];

        // Récupérer la box pour obtenir le prix
        $sqlPrice = $pdo->prepare("SELECT price FROM boxes WHERE id = :id");
        $sqlPrice->execute(['id' => $item["box_id"]]);
        $box = $sqlPrice->fetch();

        // Vérifier si l'id de la box existe
        if (!$box) {
            throw new Exception("La box avec l'ID " . $item["box_id"] . " n'existe pas");
        }

        // Insertion de l'item dans order_items
        $stmtItem->execute([
            'order_id' => $orderId,
            'box_id' => $item["box_id"],
            'quantity' => $item["quantity"],
            'unit_price' => $box["price"]
        ]);

        // Calcul du total
        $lineTotal = $box["price"] * $item["quantity"];
        $total = $total + $lineTotal;
    }

    // Un client ne peut pas commander plus de 10 boxes à la fois
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

    //Remise de 10% pour les étudiants
    if (isset($user['status']) && $user['status'] === 'student') {
        // Appliquer 10% de remise sur le total
        $total = $total * 0.9;
    }

    //Remise de 1,5% si le montant total dépasse un certain seuil 
    $seuil = 100;
    if ($total > $seuil) {
        // Appliquer 1,5% de remise
        $total = $total * 0.985;
    }

    // Mise à jour du total
    $updateOrder = $pdo->prepare("UPDATE orders SET total_price = :total_price WHERE id = :id");
    $updateOrder->execute([
        ':total_price' => $total,
        ':id' => $orderId
    ]);

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
