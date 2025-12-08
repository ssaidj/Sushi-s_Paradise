<?php

class UserManager
{
    private $pdo;

    public function __construct()
    {
        $this->pdo = new PDO('mysql:host=localhost;dbname=sushi_paradise', 'root', '');
    }

    public function addUser($firstname, $lastname, $email, $password)
    {
        $query = $this->pdo->prepare("INSERT INTO users (firstname, lastname, email, password)
        VALUES (:firstname, :lastname, :email, :password_hash)");

        $query->execute([
            ':firstname' => $firstname,
            ':lastname' => $lastname,
            ':email' => $email,
            ':password_hash' => password_hash($password, PASSWORD_DEFAULT)
        ]);
    }

    public function findUserByEmail($email)
    {
        $query = $this->pdo->prepare("SELECT * FROM users WHERE email = :email");
        $query->execute([':email' => $email]);
        return $query->fetch(PDO::FETCH_ASSOC);
    }

    public function updateToken($userId, $token)
    {
        $query = $this->pdo->prepare("UPDATE users SET api_token = :token WHERE id = :id");
        $query->execute([
            ':token' => $token,
            ':id' => $userId
        ]);
    }

    public function findByToken($token)
    {
        $query = $this->pdo->prepare("SELECT * FROM users WHERE api_token = :token");
        $query->execute([':token' => $token]);
        return $query->fetch(PDO::FETCH_ASSOC);
    }
}
