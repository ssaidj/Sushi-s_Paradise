<?php
header('Content-Type: application/json');

require __DIR__ . '/../../Manager/UserManager.php';

$data = json_decode(file_get_contents('php://input'), true);

if (!isset($data['firstname'], $data['lastname'], $data['email'], $data['password'])) {
    http_response_code(400);
    echo json_encode(['error' => 'Missing required fields']);
    exit;
}

$userManager = new UserManager();

try {
    $userManager->addUser(
        $data['firstname'],
        $data['lastname'],
        $data['email'],
        $data['password']
    );

    http_response_code(201);
    echo json_encode(['response' => 'User created']);
} catch (PDOException $e) {
    if ($e->getCode() == 23000) {
        http_response_code(409);
        echo json_encode(['error' => 'Email already exists']);
    } else {
        http_response_code(500);
        echo json_encode(['error' => 'Database error']);
    }
}
