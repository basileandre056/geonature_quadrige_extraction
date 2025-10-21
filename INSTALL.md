⚙️ Installation du projet GeoNature Quadrige Extraction

Ce guide explique toutes les étapes nécessaires pour installer et exécuter le projet GeoNature Quadrige Extraction — depuis le clonage du dépôt jusqu’au lancement du backend (Flask) et du frontend (Angular).

🚀 1. Prérequis système

Avant toute chose, assurez-vous d’avoir installé les outils suivants :

| Outil                        | Version minimale     | Vérification        |
| ---------------------------- | -------------------- | ------------------- |
| 🐍 Python                    | **3.9+**             | `python3 --version` |
| 🌐 Node.js                   | **18+**              | `node -v`           |
| 📦 npm                       | **9+**               | `npm -v`            |
| 🧱 Angular CLI *(optionnel)* | **15+ (recommandé)** | `ng version`        |

🔧 Mise à jour des dépendances système
🐍 Mettre à jour Python (Linux / macOS)

sudo apt update
sudo apt install -y python3 python3-venv python3-pip

🌐 Mettre à jour Node.js et npm

Utiliser nvm (Node Version Manager) — c’est la méthode la plus propre :

# Installer NVM (si non présent)
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/master/install.sh | bash

# Charger NVM dans le terminal courant
source ~/.bashrc

# Installer la dernière version LTS de Node.js
nvm install --lts

# Vérifier les versions
node -v
npm -v


Si nvm n’est pas possible, on00** peut aussi utiliser :

🧱 Installer / Mettre à jour Angular CLI (optionnel mais utile)

npm install -g @angular/cli
ng version




📥 2. Cloner le dépôt Git

git clone https://github.com/<ton-utilisateur>/<ton-repo>.git
cd <ton-repo>


🧰 3. Lancer l’installation complète
Tout est automatisé grâce au script setup.sh.

Sous Linux / macOS :

chmod +x setup.sh
./setup.sh


Sous Windows (PowerShell) :

bash setup.sh


Ce script effectue automatiquement :

✅ Vérification des versions de Python, Node, npm, et Angular CLI

🐍 Création d’un environnement virtuel venv/ pour le backend Flask

📦 Installation des dépendances Python depuis requirements_backend.txt

🌐 Installation du frontend Angular (dans frontend/)

💄 Installation d’Angular Material, MatTable, MatCheckbox, MatSort

✅ Vérification de compatibilité entre les versions

Aucune dépendance globale n’est modifiée : tout est installé localement au projet.

🧩 4. Lancer le backend Flask

Une fois l’installation terminée :

source venv/bin/activate
python backend/app_backend.py

Le backend démarre par défaut sur :

http://localhost:5000

Vous pouvez vérifier le bon fonctionnement en ouvrant cette URL dans votre navigateur.

💻 5. Lancer le frontend Angular

Dans un autre terminal :

ng serve --poll=2000

Le frontend s’exécute sur :

http://localhost:4200

Assurez-vous que le backend Flask est démarré avant d’interagir avec le frontend.

📂 6. Structure du projet

geonature_quadrige_extraction/
├── backend/                     # API Flask
│   ├── app_backend.py           # Point d'entrée du backend
│   ├── extraction_data.py
│   ├── extraction_programs.py
│   └── ...
│
├── frontend/                    # Application Angular
│   ├── src/
│   ├── package.json
│   └── angular.json
│
├── requirements_backend.txt     # Dépendances Python
├── requirements_frontend.txt    # Dépendances Angular listées
├── setup.sh                     # Script d'installation automatique
└── README.md / INSTALL.md

🧪 7. Vérification rapide


| Élément              | Commande                              | Résultat attendu                           |
| -------------------- | ------------------------------------- | ------------------------------------------ |
| Backend Flask        | `curl http://localhost:5000`          | Retour JSON `{"status":"ok"}` ou similaire |
| Frontend Angular     | Naviguer vers `http://localhost:4200` | Interface affichée                         |
| Liste des programmes | Cliquez sur “Extraire les programmes” | Table visible                              |



🔄 8. Mise à jour du projet

Pour mettre à jour votre version locale :


git pull
./setup.sh

Cela supprimera et recréera les dépendances locales si nécessaire (sans toucher vos données).


🧹 9. Nettoyer le projet (optionnel)

Pour repartir de zéro :


rm -rf venv frontend/node_modules


Puis relancez :

./setup.sh


✅ Résumé rapide

| Étape                 | Commande                                                    |
| --------------------- | ----------------------------------------------------------- |
| Cloner le dépôt       | `git clone ... && cd geonature_quadrige_extraction`         |
| Lancer l’installation | `./setup.sh`                                                |
| Démarrer le backend   | `source venv/bin/activate && python backend/app_backend.py` |
| Démarrer le frontend  | `cd frontend && npm start`                                  |


💬 Support

En cas de problème :

Vérifiez vos versions : node -v, npm -v, python3 --version

Assurez-vous que les ports 5000 et 4200 ne sont pas déjà utilisés

Consultez les logs console du backend et du frontend