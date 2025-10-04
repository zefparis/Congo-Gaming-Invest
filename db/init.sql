-- Script d'initialisation de la base de données

-- 1. Créer l'utilisateur s'il n'existe pas
DO $$
BEGIN
  IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'cg_user') THEN
    CREATE USER cg_user WITH PASSWORD '280470';
  END IF;
END
$$;

-- 2. Créer la base de données si elle n'existe pas
SELECT 'CREATE DATABASE congogaming_clean'
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'congogaming_clean')\gexec

-- 3. Se connecter à la base de données et configurer
\c congogaming_clean

-- 4. Activer l'extension uuid-ossp
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 5. Accorder les privilèges à l'utilisateur
GRANT ALL PRIVILEGES ON DATABASE congogaming_clean TO cg_user;

-- 6. Exécuter le schéma principal
\i db/schema.sql

-- 7. Accorder les privilèges sur les tables
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO cg_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO cg_user;
GRANT ALL PRIVILEGES ON ALL FUNCTIONS IN SCHEMA public TO cg_user;

-- 8. Afficher un message de confirmation
\echo 'Base de données congogaming_clean configurée avec succès !'
