#!/bin/bash
set -e  # stoppe le script dès qu'une erreur survient

echo "🚀 Initialisation complète du projet GeoNature Quadrige Extraction"

# -------------------------------------------------------------------
# ⚙️ QUESTION : INSTALLER CYPRESS ?
# -------------------------------------------------------------------
read -p "🧪 Souhaitez-vous installer Cypress (tests frontend) ? (y/n) " install_cypress

case "$install_cypress" in
  y|Y ) INSTALL_CYPRESS=true ;;
  n|N ) INSTALL_CYPRESS=false ;;
  * ) echo "Réponse invalide. Installation de Cypress ignorée."; INSTALL_CYPRESS=false ;;
esac

# -------------------------------------------------------------------
# ✅ VÉRIFICATION DES PRÉREQUIS
# -------------------------------------------------------------------
echo ""
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
# 🧩 DÉPENDANCES SYSTÈME POUR CYPRESS (Ubuntu 22.04 vs 24.04)
# -------------------------------------------------------------------
if [ "$INSTALL_CYPRESS" = true ]; then
  echo "🧱 Installation des dépendances système nécessaires à Cypress..."

  # Détection Ubuntu
  . /etc/os-release
  UBUNTU_VER="${VERSION_ID}"

  sudo apt update

  if [ "$UBUNTU_VER" = "24.04" ]; then
    # Noble (24.04) → paquets t64
    sudo apt install -y \
      libasound2t64 \
      libatk1.0-0t64 \
      libatk-bridge2.0-0t64 \
      libcups2t64 \
      libdrm2 \
      libgtk-3-0t64 \
      libnss3 \
      libgbm1 \
      libxss1 \
      libx11-xcb1 \
      libxcomposite1 \
      libxdamage1 \
      libxrandr2 \
      libxtst6 \
      libxkbcommon0 \
      libpango-1.0-0 \
      libpangocairo-1.0-0 \
      libatspi2.0-0t64 \
      libwayland-client0 \
      libwayland-cursor0 \
      libwayland-egl1 \
      libxshmfence1 \
      libglu1-mesa
  else
    # Jammy (22.04) → mêmes libs SANS suffixe t64
    sudo apt install -y \
      libasound2 \
      libatk1.0-0 \
      libatk-bridge2.0-0 \
      libcups2 \
      libdrm2 \
      libgtk-3-0 \
      libnss3 \
      libgbm1 \
      libxss1 \
      libx11-xcb1 \
      libxcomposite1 \
      libxdamage1 \
      libxrandr2 \
      libxtst6 \
      libxkbcommon0 \
      libpango-1.0-0 \
      libpangocairo-1.0-0 \
      libatspi2.0-0 \
      libwayland-client0 \
      libwayland-cursor0 \
      libwayland-egl1 \
      libxshmfence1 \
      libglu1-mesa
  fi

  echo "✅ Librairies système installées pour Cypress"
  sleep 1
fi

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
            @angular/animations@~20.3.6 \
            @angular/forms@~20.3.6 \
            @angular/core@~20.3.6 \
            @angular/common@~20.3.6 \
            @angular/router@~20.3.6 --save --legacy-peer-deps

if [ "$INSTALL_CYPRESS" = true ]; then
  echo "🧪 Installation de Cypress pour les tests E2E..."
  npm install --save-dev cypress --legacy-peer-deps

  if [ $? -ne 0 ]; then
    echo "❌ Échec de l'installation Cypress (conflits Angular)"
    echo "👉 Vous pourrez réessayer manuellement : npm install --save-dev cypress --legacy-peer-deps"
    INSTALL_CYPRESS=false
  else
    echo "✅ Cypress installé avec succès"

    echo "🛠️ Mise à jour du fichier package.json avec les scripts Cypress..."
    npx json -I -f package.json -e '
      if (!this.scripts) this.scripts = {};
      this.scripts["cypress:open"] = "cypress open";
      this.scripts["e2e:ci"] = "cypress run";
      this.scripts["e2e:coverage"] = "echo '\''Coverage not implemented'\''";
    '
    echo "✅ Scripts Cypress ajoutés à package.json"
  fi

else
  echo "🚫 Installation de Cypress ignorée (choix utilisateur)"
fi


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
if [ "$INSTALL_CYPRESS" = true ]; then
  echo "🧪 Pour lancer Cypress :"
  echo "     cd frontend"
  echo "     npm run cypress:open"
else
  echo "⚙️ Cypress non installé (choix utilisateur)"
fi
echo ""
echo "✅ Installation terminée avec succès 🎉"
