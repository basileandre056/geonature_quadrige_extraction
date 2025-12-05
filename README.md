
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

# ✅ Guide d’installation complet — Module GeoNature Quadrige Extraction

Ce document récapitule **toutes les étapes nécessaires** pour installer correctement :

- le **backend Flask**
- le **frontend Angular**
- les **versions précises** de Python, Node, npm et Angular nécessaires
- et les **commandes pour lancer** le projet

Ce guide est adapté à ton environnement et à tous les problèmes que tu as réellement rencontrés.

---

# 📦 1. Prérequis & versions obligatoires

## 🔹 Python (Backend)
Le backend nécessite **Python 3.9 minimum**.

Vérifier :
```bash
python3 --version
```

Si Python 3.9 n’est pas installé, utiliser **pyenv** :
```bash
pyenv install 3.9.19
pyenv local 3.9.19
```

---

## 🔹 Node.js & npm (Frontend)
⚠️ Ton frontend utilise Angular **20**, donc il nécessite absolument :

| Outil | Version minimale |
|-------|------------------|
| **Node.js** | **20.19+** |
| **npm** | 10+ |

Vérifier :
```bash
node -v
npm -v
```

Si Node est trop vieux :
```bash
nvm install 20
nvm use 20
```

---

# 📁 2. Récupération du projet

```bash
git clone <ton_repo>
cd geonature_quadrige_extraction
```

---

# 🐍 3. Installation du backend Flask

Depuis la racine du projet :

```bash
python3 -m venv venv
source venv/bin/activate
```

Mettre pip à jour :

```bash
python -m pip install --upgrade pip
```

Installer les dépendances backend :

```bash
pip install -r requirements_backend.txt
```

Si pip manque dans ton venv :

```bash
python -m ensurepip --upgrade
python -m pip install --upgrade pip
```

✔ Backend prêt

---

# ▶️ 4. Lancer le backend

```bash
source venv/bin/activate
python backend/app_backend.py
```

➡️ Le backend s’exécute sur :  
**http://localhost:5000**

---

# 🅰️ 5. Installation du frontend Angular

Aller dans le dossier frontend :

```bash
cd frontend
```

🧹 Nettoyer une éventuelle installation cassée :

```bash
rm -rf node_modules package-lock.json
npm cache clean --force
```

Installer les dépendances :

```bash
npm install
```

Installer Angular CLI **localement** (version compatible Angular 20) :

```bash
npm install --save-dev @angular/cli@20
```

✔ Le frontend est maintenant correctement configuré.

---

# ▶️ 6. Lancer le frontend

Toujours dans le dossier `frontend/` :

```bash
npx ng serve --poll=2000
```

➡️ Tu peux accéder à l’interface Angular :  
**http://localhost:4200**

---

# 🧪 7. Installation et exécution des tests

## 🔹 Backend : pytest

```bash
pytest -v backend/geonature/tests
```

## 🔹 Backend : benchmarks

```bash
pytest --benchmark-only backend/geonature/tests/benchmarks
```

## 🔹 Frontend : tests Angular

```bash
ng test
```

## 🔹 Cypress (optionnel)

Seulement si Node 20 + Ubuntu 22.04/24.04 :

```bash
npm install --save-dev cypress --legacy-peer-deps
npx cypress open
```

---

# 🛠️ 8. Dépannage courant

## ❗ Problème : `pip` introuvable dans le venv
```bash
python -m ensurepip --upgrade
python -m pip install --upgrade pip
```

## ❗ Problème : Angular refuse de démarrer (crypto.hash)
Tu utilisais Node 18 → Mettre Node 20 via :

```bash
nvm install 20
nvm use 20
```

## ❗ Problème : `ng` introuvable
```bash
npm install --save-dev @angular/cli@20
npx ng serve
```

## ❗ Problème : dépendances cassées
```bash
rm -rf node_modules package-lock.json
npm cache clean --force
npm install
```

---

# 🎯 9. Résumé ultra‑rapide

```bash
# Backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements_backend.txt
python backend/app_backend.py

# Frontend
cd frontend
nvm use 20
npm install
npm install --save-dev @angular/cli@20
npx ng serve --poll=2000
```

---

# ✨ Auteur
Documentation générée pour **Basile André** — 2025  
Optimisée pour ton environnement et les erreurs réellement rencontrées.


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
