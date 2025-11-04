# ⚙️ Installation — GeoNature Quadrige Extraction

Ce guide décrit les étapes pour cloner, installer et lancer le projet GeoNature Quadrige Extraction (backend Flask + frontend Angular). Les commandes fournies sont destinées à un environnement UNIX-like (Linux / macOS). Pour Windows, on peut utiliser WSL, Git Bash ou adapter les commandes PowerShell équivalentes.

---

## 🚀 1. Prérequis système

Avant de commencer, installez ces outils :

| Outil                        | Version minimale     | Vérification        |
| ---------------------------: | -------------------: | ------------------- |
| 🐍 Python                    | **3.9+**             | `python3 --version` |
| 🌐 Node.js                   | **18+**              | `node -v`           |
| 📦 npm                       | **9+**               | `npm -v`            |
| 🧱 Angular CLI *(optionnel)* | **15+ (recommandé)** | `ng version`        |

---

## 🔧 2. Installer / mettre à jour les dépendances système

Mettre à jour les paquets (Debian/Ubuntu) :

```bash
sudo apt update
sudo apt install -y python3 python3-venv python3-pip curl git
```

Installer nvm, Node.js LTS et npm :

```bash
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/master/install.sh | bash
```
 puis dans le même terminal
```bash

source ~/.bashrc
nvm install --lts
node -v
npm -v
```

Installer Angular CLI (optionnel) :

```bash
npm install -g @angular/cli
ng version || true
```

---

## 📥 3. Cloner le dépôt

Remplacez `<votre-utilisateur>` si vous avez forké le projet ; sinon clonez directement :

```bash
git clone https://github.com/basileandre056/geonature_quadrige_extraction.git
cd geonature_quadrige_extraction
```

---

## 🧰 4. Installation automatique (recommandée)

Le projet fournit un script `setup.sh` pour automatiser l'installation. Rendre le script exécutable et l'exécuter :

```bash
chmod +x setup.sh
./setup.sh
```

Que fait `setup.sh` (résumé) :
- Vérifie les versions de Python / Node / npm
- Crée un environnement virtuel `venv/`
- Installe les dépendances Python depuis `requirements_backend.txt`
- Installe les dépendances frontend dans `frontend/` (`npm install`)
- Prépare les assets Angular si nécessaire
- Installe les librairies de tests backend
- Propose d'installer les librairies de tests frontend.

Il vous sera proposé d'installer cypress ou non.
Si vous ne comptez pas executer les tests frontend, il est fortement conseillé de renseigner "non" car l'installation peut planter en fonction des versions de Ubuntu, Debian, et WSL.

Si l'exécution du script échoue, on peut suivre les étapes manuelles décrites ci‑dessous.

---

## 🐍 5. Installation manuelle (backend)

Créer et activer l'environnement virtuel, puis installer les dépendances :

```bash
python3 -m venv venv
source venv/bin/activate
python -m pip install --upgrade pip
pip install -r requirements_backend.txt
```

Sous Windows (PowerShell) avec Git Bash / WSL, l'activation peut être :

```bash
# Git Bash / WSL
source venv/bin/activate

# PowerShell (si on utilise PowerShell natif)
# .\venv\Scripts\Activate.ps1
```

Lancer le backend :

```bash
source venv/bin/activate
python backend/app_backend.py
```

Par défaut, le backend écoute sur : http://localhost:5000

---

## 🌐 6. Installation manuelle (frontend)

Depuis la racine du projet :

```bash
cd frontend
npm install
# si on utilise Angular CLI et qu'on veut le live-reload
ng serve --poll=2000
# ou via le script npm défini dans package.json
npm start
```

Le frontend par défaut : http://localhost:4200

Veillez à démarrer le backend avant d’utiliser le frontend.

---

## 🧭 7. Vérifications rapides

Vérifier que le backend répond :

```bash
curl -sS http://localhost:5000 | jq . || echo "no JSON response"
```

Ouvrir le frontend dans un navigateur : http://localhost:4200

---

## 🗂️ 8. Structure du projet

Arborescence principale :

```bash
geonature_quadrige_extraction/
├── backend/                     # API Flask
│   ├── app_backend.py           # Point d'entrée du backend
│   ├── extraction_data.py
│   ├── extraction_programs.py
│   └── ...
├── frontend/                    # Application Angular
│   ├── src/
│   ├── package.json
│   └── angular.json
├── requirements_backend.txt
├── requirements_frontend.txt
├── setup.sh
└── README.md / INSTALL.md
```

---

## 🔄 9. Mettre à jour le projet

Pour récupérer les dernières modifications et réexécuter l'installation :

```bash
git pull --rebase
./setup.sh
```

---

## 🧹 10. Nettoyer l'environnement

Supprimer les dépendances locales et recommencer proprement :

```bash
rm -rf venv frontend/node_modules
./setup.sh
```

---

## 🛠️ 11. Dépannage courant

- Ports occupés : vérifier avec `lsof -i :5000 -P -n` ou `lsof -i :4200 -P -n`
- Erreur pip : mettre pip à jour `python -m pip install --upgrade pip`
- Erreur node-gyp / build : installer dépendances système (build-essential, python3-dev, etc.)
- Logs : consulter la sortie du terminal backend / frontend pour obtenir des détails

---

## ✅ Résumé rapide

```bash
# Cloner
git clone https://github.com/basileandre056/geonature_quadrige_extraction.git
cd geonature_quadrige_extraction

# Installation automatique
chmod +x setup.sh
./setup.sh

# Démarrer backend
source venv/bin/activate
python backend/app_backend.py

# Démarrer frontend (dans un autre terminal)
cd frontend
ng serve --poll=2000
# ou
npm start
```

---

