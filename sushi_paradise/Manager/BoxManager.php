<?php

class BoxManager
{
    private $pdo;

    public function __construct()
    {
        $this->pdo = new PDO('mysql:host=localhost;dbname=sushi_paradise', 'root', '');
    }

    /**
     * Retourne toutes les boxes avec leurs aliments et saveurs
     * @return array
     */
    public function findAll()
    {
        $boxes = $this->pdo->query("SELECT * FROM boxes")->fetchAll(PDO::FETCH_ASSOC);

        foreach ($boxes as &$box) {
            // Conversion du prix en float "24.50" en 24.50
            $box['price'] = round($box['price'], 2);

            // Récupération des aliments
            $stmt = $this->pdo->prepare("
                SELECT f.name, CAST(bf.quantity AS UNSIGNED) AS quantity
                FROM box_foods bf
                JOIN foods f ON bf.food_id = f.id
                WHERE bf.box_id = :id
            ");
            $stmt->execute(['id' => $box['id']]);
            $box['foods'] = $stmt->fetchAll(PDO::FETCH_ASSOC);

            // Récupération des saveurs
            $stmt = $this->pdo->prepare("
                SELECT fl.name
                FROM box_flavors bf
                JOIN flavors fl ON bf.flavor_id = fl.id
                WHERE bf.box_id = :id
            ");
            $stmt->execute(['id' => $box['id']]);
            $box['flavors'] = array_column($stmt->fetchAll(), 'name');
        }

        return $boxes;
    }

    public function findById($id)
    {
        $result = $this->pdo->prepare("SELECT * FROM boxes WHERE id = ?");
        $result->execute([$id]);
        $boxes = $result->fetchAll(PDO::FETCH_ASSOC);

        if (empty($boxes)) {
            return null;
        }

        foreach ($boxes as &$box) {
            // Conversion du prix en float "24.50" en 24.50
            $box['price'] = round($box['price'], 2);

            // Récupération des aliments
            $stmt = $this->pdo->prepare("
                SELECT f.name, CAST(bf.quantity AS UNSIGNED) AS quantity
                FROM box_foods bf
                JOIN foods f ON bf.food_id = f.id
                WHERE bf.box_id = :id
            ");
            $stmt->execute(['id' => $box['id']]);
            $box['foods'] = $stmt->fetchAll(PDO::FETCH_ASSOC);

            // Récupération des saveurs
            $stmt = $this->pdo->prepare("
                SELECT fl.name
                FROM box_flavors bf
                JOIN flavors fl ON bf.flavor_id = fl.id
                WHERE bf.box_id = :id
            ");
            $stmt->execute(['id' => $box['id']]);
            $box['flavors'] = array_column($stmt->fetchAll(), 'name');
        }

        return $boxes[0];
    }
}
