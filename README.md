
# 🌊 GeoNature Quadrige Extraction  
Backend **Flask** + Frontend **Angular** pour extraire et télécharger des données Quadrige (Ifremer) au format `.zip` et `.csv`.

---

## 🗂️ Sommaire

1. [Présentation](#présentation)
2. [Installation](#installation)
   - [Prérequis](#prérequis)
   - [Cloner le projet](#cloner-le-projet)
   - [Installation automatique (setup.sh)](#installation-automatique-setupsh)
   - [Installation manuelle](#installation-manuelle)
     - [Backend Flask](#backend-flask)
     - [Frontend Angular](#frontend-angular)
3. [Lancement du projet](#lancement-du-projet)
4. [Tests](#tests)
   - [Tests backend (pytest)](#tests-backend)
   - [Benchmarks backend](#benchmarks-backend)
   - [Tests frontend](#tests-frontend)
5. [Structure du projet](#structure-du-projet)
6. [Dépannage courant](#dépannage-courant)
7. [Résumé rapide](#résumé-rapide)
8. [Auteur](#auteur)

---

## 🧭 Présentation

Ce projet permet :

- l’extraction de **programmes** et **données ZIP** Quadrige via requêtes GraphQL,  
- leur **filtrage**,  
- leur **export** au format CSV,  
- leur consultation via un **frontend Angular** moderne.

---

# 🚀 Installation

## 📋 Prérequis

| Outil | Version min. | Vérification |
|-------|-------------:|-------------|
| Python | **3.9+** | `python3 --version` |
| Node.js | **18+** | `node -v` |
| npm | **9+** | `npm -v` |
| Angular CLI *(optionnel)* | **15+** | `ng version` |

---

## 📥 Cloner le projet

```bash
git clone https://github.com/basileandre056/geonature_quadrige_extraction.git
cd geonature_quadrige_extraction
```

---

## ⚙️ Installation automatique (setup.sh)

```bash
chmod +x setup.sh
./setup.sh
```

Ce script :

- Vérifie Python / Node / npm  
- Crée le venv  
- Installe les dépendances backend  
- Installe le frontend  
- (Optionnel) installe Cypress  

⚠️ Cypress fonctionne uniquement sur Ubuntu **22.04** et **24.04**.

---

## 🐍 Installation manuelle

### 1️⃣ Backend Flask

```bash
python3 -m venv venv
source venv/bin/activate
pip install -r requirements_backend.txt
python backend/app_backend.py
```

➡️ http://localhost:5000

---

### 2️⃣ Frontend Angular

```bash
cd frontend
npm install
npm start
```

### 3. Installation des tests (facultatif)

```bash
cd frontend

```


#### 🔧 A. Supprimer les éventuels restes (recommandé)


```bash

rm -rf node_modules package-lock.json
npm cache clean --force
```

puis réinstaller les dépendances

```bash

npm install
```

#### 🧱 2. Installer Cypress avec la bonne option

C’est l’étape clé pour éviter les conflits Angular :
```bash

npm install --save-dev cypress --legacy-peer-deps
```


🧪 3. Vérifier l’installation
```bash

npx cypress verify
```


🚀 4. Ouvrir Cypress
```bash

npx cypress open
```

---

# ▶️ Lancement du projet

### Backend :

```bash
source venv/bin/activate
python backend/app_backend.py
```

### Frontend :

```bash
cd frontend
npm start


```
➡️ http://localhost:4200

---

# 🧪 Tests

## Tests backend

```bash
pytest -v backend/geonature/tests
```

## Benchmarks backend

```bash
pytest --benchmark-only backend/geonature/tests/benchmarks
```

## Tests frontend

```bash
ng test
```

E2E (si Cypress installé) :

```bash
npm run cypress:open
```

---

# 📂 Structure du projet

```
geonature_quadrige_extraction/
│
├── backend/
│   ├── app_backend.py
│   ├── extraction_programs.py
│   ├── extraction_data.py
│   ├── build_query.py
│   ├── geonature/tests/
│   │   ├── benchmarks/
│   │   └── ...
│   ├── memory/
│   ├── output_data/
│
├── frontend/
│   ├── src/
│   ├── package.json
│   └── angular.json
│
├── requirements_backend.txt
├── setup.sh
└── README.md
```

---

# 🛠️ Dépannage courant

### Port occupé

```bash
lsof -i :5000
lsof -i :4200
```

### pip casse

```bash
python -m pip install --upgrade pip
```

### npm / node-gyp échoue

```bash
sudo apt install build-essential python3-dev
```

---

# ⚡ Résumé rapide

```bash
git clone https://github.com/basileandre056/geonature_quadrige_extraction.git
cd geonature_quadrige_extraction
./setup.sh

# Backend
source venv/bin/activate
python backend/app_backend.py

# Frontend
cd frontend
npm start
```

---

# ✍️ Auteur

**Basile André — 2025**
