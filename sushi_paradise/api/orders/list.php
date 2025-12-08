<?php
header('Content-Type: application/json');

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

// Accès autorisé
http_response_code(200);
echo json_encode(['message' => 'Accès autorisé']);
