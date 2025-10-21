#!/bin/bash
set -e  # stoppe le script dès qu'une erreur survient

echo "🚀 Initialisation complète du projet GeoNature Quadrige Extraction"

# -------------------------------------------------------------------
# 🐍 BACKEND
# -------------------------------------------------------------------
echo "🐍 Création de l'environnement virtuel Python..."

if [ -d "venv" ]; then
  echo "⚠️ Ancien environnement détecté — suppression..."
  rm -rf venv
fi

python3 -m venv venv
source venv/bin/activate

echo "📦 Installation des dépendances backend..."
pip install --upgrade pip setuptools wheel
pip install -r requirements_backend.txt

deactivate
echo "✅ Backend Python installé avec succès"

# -------------------------------------------------------------------
# 🌐 FRONTEND
# -------------------------------------------------------------------
echo "🌐 Installation du frontend Angular..."

# Vérifie la présence du dossier frontend
if [ ! -d "frontend" ]; then
  echo "❌ Erreur : dossier 'frontend' introuvable à la racine du projet."
  echo "💡 Assurez-vous que le code Angular est dans ./frontend/"
  exit 1
fi

cd frontend

if [ -d "node_modules" ]; then
  echo "⚠️ Nettoyage des dépendances existantes..."
  rm -rf node_modules package-lock.json
fi

npm cache clean --force

echo "📦 Installation des dépendances principales..."
npm install

echo "📦 Installation des modules Angular Material nécessaires..."
npm install @angular/material@~20.2.9 \
            @angular/cdk@~20.2.9 \
            @angular/animations@^20.3.0 \
            @angular/forms@^20.3.0 \
            @angular/core@^20.3.0 \
            @angular/common@^20.3.0 \
            @angular/router@^20.3.0 \
            @angular/material/table@~20.2.9 \
            @angular/material/checkbox@~20.2.9 \
            @angular/material/sort@~20.2.9

cd ..

echo "✅ Frontend Angular prêt !"

# -------------------------------------------------------------------
# 🧩 RAPPEL D'UTILISATION
# -------------------------------------------------------------------
echo ""
echo "📂 Structure installée :"
echo "  - venv/ ..................... Environnement Python (Flask)"
echo "  - frontend/node_modules/ .... Dépendances Angular"
echo ""
echo "🔥 Pour lancer le backend :"
echo "     source venv/bin/activate"
echo "     python backend/app_backend.py"
echo ""
echo "💻 Pour lancer le frontend :"
echo "     cd frontend"
echo "     npm start   # ou ng serve --poll=2000"
echo ""
echo "✅ Installation terminée avec succès 🎉"
