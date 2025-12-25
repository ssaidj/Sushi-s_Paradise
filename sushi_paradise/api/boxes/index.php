<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

require __DIR__ . '/../../Manager/BoxManager.php';

$boxManager = new BoxManager();

if (isset($_GET['id'])) {
    $boxes = $boxManager->findById($_GET['id']);
} else {
    $boxes = $boxManager->findAll();
}

header('Content-Type: application/json; charset=utf-8');

echo json_encode($boxes);

