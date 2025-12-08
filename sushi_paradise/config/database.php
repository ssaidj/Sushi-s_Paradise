<?php

$pdo = new PDO('mysql:host=localhost;dbname=sushi_paradise','root','');

$boxes = $pdo->query("SELECT * FROM boxes")->fetchAll(PDO::FETCH_ASSOC);