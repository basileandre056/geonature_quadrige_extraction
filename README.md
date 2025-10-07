# 🌊 GeoNature Quadrige Extraction

Projet combinant un **frontend Angular** et un **backend Flask** pour extraire et télécharger des données (au format `.zip` et `.csv`) depuis **Quadrige (Ifremer)**.

---

## 🚀 Installation

### 1. Cloner le projet
```bash
git clone https://github.com/<ton-utilisateur>/<ton-repo>.git
cd geonature_quadrige_extraction

2. Backend (Flask)

Créer un environnement virtuel et installer les dépendances :

python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt

Lancer le backend :

python backend/backend.py

Le backend est accessible sur http://127.0.0.1:5000
3. Frontend (Angular)

Installer Node.js et Angular CLI (si pas déjà installés) :

sudo apt install nodejs npm -y
npm install -g @angular/cli

Installer les dépendances Angular :

cd frontend   # aller dans le dossier Angular
npm install

Lancer le frontend :

ng serve

👉 Le frontend est disponible sur : http://localhost:4200
📂 Structure du projet

geonature_quadrige_extraction/
│── backend/             # Backend Flask
│   ├── backend.py
│   ├── extraction_programs.py
│   ├── extraction_data.py
│   ├── build_query.py
│── frontend/            # Frontend Angular
│   ├── src/
│   ├── angular.json
│   ├── package.json
│── output_test/         # Fichiers CSV et ZIP générés
│── saved_programmes/    # Sauvegardes des derniers programmes et filtres
│── venv/                # Environnement virtuel Python (ignoré par git)
│── requirements.txt     # Dépendances Python
│── .gitignore
│── README.md

⚙️ TestGeo (Frontend Angular)

Ce projet a été généré avec Angular CLI

version 20.3.2.
🧩 Development server

Pour lancer un serveur de développement local :

ng serve

Ouvre ton navigateur sur http://localhost:4200/.
L’application se rechargera automatiquement à chaque modification des fichiers sources.
🧱 Code scaffolding

Angular CLI permet de générer rapidement du code.
Par exemple, pour créer un nouveau composant :

ng generate component component-name

Pour afficher la liste complète des schémas disponibles :

ng generate --help

🏗️ Building

Pour compiler le projet :

ng build

Les fichiers générés seront placés dans le dossier dist/.
La build de production optimise automatiquement les performances.
🧪 Running unit tests

Exécuter les tests unitaires avec Karma

:

ng test

🌐 Running end-to-end tests

Pour exécuter des tests de bout en bout (e2e) :

ng e2e

⚠️ Angular CLI ne fournit pas de framework e2e par défaut — choisis celui qui correspond à ton usage.
📚 Ressources supplémentaires

🔗 Pour plus d’informations sur Angular CLI, consulte :
👉 Angular CLI Overview and Command Reference
