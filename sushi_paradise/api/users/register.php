<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');

// Gestion de la requête OPTIONS (preflight)
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

$input = json_decode(file_get_contents("php://input"), true);

// Validation
if (!isset($input['email']) || !isset($input['password']) || !isset($input['firstname']) || !isset($input['lastname'])) {
    http_response_code(400);
    echo json_encode(['error' => 'Tous les champs sont requis']);
    exit;
}

try {
    // Connexion BDD
    $pdo = new PDO('mysql:host=localhost;dbname=sushi_paradise', 'root', '');
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    // Vérifier si email existe déjà
    $check = $pdo->prepare("SELECT id FROM users WHERE email = :email");
    $check->execute([':email' => $input['email']]);
    if ($check->fetch()) {
        http_response_code(409);
        echo json_encode(['error' => 'Cet email est déjà utilisé']);
        exit;
    }

    // Vérifier si la colonne status existe
    $statusColumn = null;
    try {
        $pdo->query("SELECT status FROM users LIMIT 1");
        $statusColumn = true;
    } catch (PDOException $e) {
        $statusColumn = false;
    }

    // Insérer utilisateur
    if ($statusColumn) {
        $query = $pdo->prepare(
            "INSERT INTO users (firstname, lastname, email, password, status) 
             VALUES (:firstname, :lastname, :email, :password, :status)"
        );
        $query->execute([
            ':firstname' => $input['firstname'],
            ':lastname' => $input['lastname'],
            ':email' => $input['email'],
            ':password' => password_hash($input['password'], PASSWORD_DEFAULT),
            ':status' => $input['status'] ?? 'regular'
        ]);
    } else {
        // Sans la colonne status
        $query = $pdo->prepare(
            "INSERT INTO users (firstname, lastname, email, password) 
             VALUES (:firstname, :lastname, :email, :password)"
        );
        $query->execute([
            ':firstname' => $input['firstname'],
            ':lastname' => $input['lastname'],
            ':email' => $input['email'],
            ':password' => password_hash($input['password'], PASSWORD_DEFAULT)
        ]);
    }

    http_response_code(201);
    echo json_encode([
        'success' => true,
        'message' => 'Compte créé avec succès'
    ]);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode([
        'error' => 'Erreur serveur',
        'message' => $e->getMessage(),
        'details' => 'Vérifiez que la table users existe et que les colonnes sont correctes'
    ]);
}
