<?php

require __DIR__ . '/../../Manager/BoxManager.php';

$boxManager = new BoxManager();

if (isset($_GET['id'])) {
    $boxes = $boxManager->findById($_GET['id']);
} else {
    $boxes = $boxManager->findAll();
}

header('Content-Type: application/json; charset=utf-8');

echo json_encode($boxes);

