#!/bin/bash
set -e  # stoppe le script dès qu'une erreur survient

echo "🚀 Initialisation complète du projet GeoNature Quadrige Extraction"

# -------------------------------------------------------------------
# ✅ VÉRIFICATION DES PRÉREQUIS
# -------------------------------------------------------------------
echo "🔍 Vérification des dépendances système..."

# --- Node.js ---
if ! command -v node &> /dev/null; then
  echo "❌ Node.js n'est pas installé. Veuillez installer Node.js (>= 18)."
  exit 1
fi

NODE_VERSION=$(node -v | sed 's/v//')
NODE_MAJOR=$(echo "$NODE_VERSION" | cut -d. -f1)
if [ "$NODE_MAJOR" -lt 18 ]; then
  echo "❌ Version de Node.js trop ancienne : $NODE_VERSION (minimum requis : 18.x)"
  exit 1
fi
echo "✅ Node.js version $NODE_VERSION détectée"

# --- npm ---
if ! command -v npm &> /dev/null; then
  echo "❌ npm n'est pas installé. Veuillez l’installer avec Node.js."
  exit 1
fi

NPM_VERSION=$(npm -v)
NPM_MAJOR=$(echo "$NPM_VERSION" | cut -d. -f1)
if [ "$NPM_MAJOR" -lt 9 ]; then
  echo "❌ Version de npm trop ancienne : $NPM_VERSION (minimum requis : 9.x)"
  exit 1
fi
echo "✅ npm version $NPM_VERSION détectée"

# --- Angular CLI ---
if ! command -v ng &> /dev/null; then
  echo "⚠️ Angular CLI non détecté globalement."
  echo "   → Il sera installé localement dans le projet si nécessaire."
else
  NG_VERSION=$(ng version | grep 'Angular CLI:' | awk '{print $3}')
  echo "✅ Angular CLI détecté : version $NG_VERSION"
fi

# --- Python ---
if ! command -v python3 &> /dev/null; then
  echo "❌ Python3 n'est pas installé. Veuillez installer Python 3.9 ou plus."
  exit 1
fi

PY_VERSION=$(python3 -V | awk '{print $2}')
PY_MAJOR=$(echo "$PY_VERSION" | cut -d. -f1)
PY_MINOR=$(echo "$PY_VERSION" | cut -d. -f2)

if [ "$PY_MAJOR" -lt 3 ] || ([ "$PY_MAJOR" -eq 3 ] && [ "$PY_MINOR" -lt 9 ]); then
  echo "❌ Version de Python trop ancienne : $PY_VERSION (minimum requis : 3.9)"
  exit 1
fi
echo "✅ Python version $PY_VERSION détectée"

echo ""
echo "✅ Toutes les dépendances système sont compatibles"
echo "------------------------------------------"
sleep 1

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

echo "📦 Installation d'Angular Material et des modules nécessaires..."
npm install @angular/material@~20.2.9 \
            @angular/cdk@~20.2.9 \
            @angular/animations@^20.3.0 \
            @angular/forms@^20.3.0 \
            @angular/core@^20.3.0 \
            @angular/common@^20.3.0 \
            @angular/router@^20.3.0 --save

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
