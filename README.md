# TestGeo

This project was generated using [Angular CLI](https://github.com/angular/angular-cli) version 20.3.2.

## Development server

To start a local development server, run:

```bash
ng serve
```

Once the server is running, open your browser and navigate to `http://localhost:4200/`. The application will automatically reload whenever you modify any of the source files.

## Code scaffolding

Angular CLI includes powerful code scaffolding tools. To generate a new component, run:

```bash
ng generate component component-name
```

For a complete list of available schematics (such as `components`, `directives`, or `pipes`), run:

```bash
ng generate --help
```

## Building

To build the project run:

```bash
ng build
```

This will compile your project and store the build artifacts in the `dist/` directory. By default, the production build optimizes your application for performance and speed.

## Running unit tests

To execute unit tests with the [Karma](https://karma-runner.github.io) test runner, use the following command:

```bash
ng test
```

## Running end-to-end tests

For end-to-end (e2e) testing, run:

```bash
ng e2e
```

Angular CLI does not come with an end-to-end testing framework by default. You can choose one that suits your needs.

## Additional Resources

For more information on using the Angular CLI, including detailed command references, visit the [Angular CLI Overview and Command Reference](https://angular.dev/tools/cli) page.




# 🌊 GeoNature Quadrige Extraction

Projet combinant un **frontend Angular** et un **backend Flask** pour extraire et télécharger des données (au format `.zip`) depuis Quadrige (Ifremer).

---

## 🚀 Installation

### 1. Cloner le projet
```bash
git clone https://github.com/<ton-utilisateur>/<ton-repo>.git
cd geonature_quadrige_extraction



Créer un environnement virtuel et installer les dépendances :

python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt


Lancer le backend :

python backend/backend.py



3. Frontend (Angular)

Installer Node.js et Angular CLI (si pas déjà installés) :


sudo apt install nodejs npm -y
npm install -g @angular/cli


Installer les dépendances Angular du projet :


cd frontend   # aller dans le dossier Angular
npm install


Lancer le frontend :
ng serve

👉 Le frontend est disponible sur : http://localhost:4200

📂 Structure du projet

geonature_quadrige_extraction/
│── backend/             # Backend Flask
│   ├── backend.py
│   ├── extractProgm_p.py
│── frontend/            # Frontend Angular
│   ├── src/
│   ├── angular.json
│   ├── package.json
│── outputs/             # Fichiers .zip téléchargés (ignorés par git)
│── venv/                # Virtualenv Python (ignoré par git)
│── requirements.txt     # Dépendances Python
│── .gitignore
│── README.md

