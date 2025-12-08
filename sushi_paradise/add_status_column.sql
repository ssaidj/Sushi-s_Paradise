-- Ajouter la colonne status à la table users si elle n'existe pas déjà
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'regular';

-- Vérifier la structure de la table
DESCRIBE users;
