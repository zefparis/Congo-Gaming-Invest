# Script pour configurer l'environnement de la base de données

# Chemin vers le fichier .env
$envFile = "apps/api/.env"

# Vérifier si le fichier .env existe, sinon le créer
if (-not (Test-Path $envFile)) {
    New-Item -ItemType File -Path $envFile -Force | Out-Null
}

# Configuration de la base de données
$dbConfig = @"
# Database Configuration
DATABASE_URL=postgres://cg_user:280470@127.0.0.1:5432/congogaming_clean

# JWT Configuration
JWT_SECRET=your-32-character-secret-key-change-this-in-production
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# CORS Configuration (comma-separated)
CORS_ORIGIN=http://localhost:3000,http://localhost:3001

# Server Configuration
PORT=4000
NODE_ENV=development
LOG_LEVEL=debug

# Rate Limiting
THROTTLE_TTL=60
THROTTLE_LIMIT=30
"@

# Écrire la configuration dans le fichier .env
Set-Content -Path $envFile -Value $dbConfig

Write-Host "Le fichier .env a été configuré avec succès." -ForegroundColor Green
Write-Host "N'oubliez de sécuriser vos informations sensibles en production !" -ForegroundColor Yellow
