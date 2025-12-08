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

require __DIR__ . '/../../Manager/UserManager.php';

$data = json_decode(file_get_contents('php://input'), true);

if (!isset($data['email'], $data['password'])) {
    http_response_code(400);
    echo json_encode(['error' => 'Missing required fields']);
    exit;
}

$userManager = new UserManager();

$user = $userManager->findUserByEmail($data['email']);

if (!$user || !password_verify($data['password'], $user['password'])) {
    http_response_code(401);
    echo json_encode(['error' => 'Invalid credentials']);
    exit;
}

$token = bin2hex(random_bytes(32));

$userManager->updateToken($user['id'], $token);

// Retirer le mot de passe de l'objet user
unset($user['password']);

http_response_code(200);
echo json_encode([
    'success' => true,
    'token' => $token,
    'user' => $user  // Ajout de l'objet user
]);
