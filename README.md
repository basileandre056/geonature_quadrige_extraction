# 🌊 GeoNature Quadrige Extraction

Projet combinant un **frontend Angular** et un **backend Flask** pour extraire et télécharger des données (au format `.zip` et `.csv`) depuis **Quadrige (Ifremer)**.

---

## 🗂️ Sommaire

- [Installation](#installation)
  - [Cloner le projet](#cloner-le-projet)
  - [Backend (Flask)](#backend-flask)
  - [Frontend (Angular)](#frontend-angular)
- [Structure du projet](#structure-du-projet)
- [TestGeo (Frontend Angular)](#testgeo-frontend-angular)
- [Configuration Docker – GeoNature sur Debian 12](#configuration-docker--geonature-sur-debian-12)
- [Problèmes rencontrés et solutions — Proxy RIE](#problèmes-rencontrés-et-solutions--proxy-rie)
- [Résumé global](#résumé-global)
- [Remarques complémentaires](#remarques-complémentaires)
- [Auteur et version](#auteur-et-version)

---

## 🚀 Installation

### 1️⃣ Cloner le projet

```bash
git clone https://github.com/<ton-utilisateur>/<ton-repo>.git
cd geonature_quadrige_extraction
```

---

### 2️⃣ Backend (Flask)

Créer un environnement virtuel et installer les dépendances :

```bash
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

Lancer le backend :

```bash
python backend/backend.py
```

Le backend est accessible sur :
👉 http://127.0.0.1:5000

---

### 3️⃣ Frontend (Angular)

Installer Node.js et Angular CLI (si non installés) :

```bash
sudo apt install nodejs npm -y
npm install -g @angular/cli
```

Installer les dépendances Angular :

```bash
cd frontend
npm install
```

Lancer le frontend :

```bash
ng serve
```

ou,

Lancer le frontend avec un polling toutes les 2 secondes :

```bash
ng serve --poll=2000
```


Le frontend est accessible sur :
👉 http://localhost:4200

---

## 📂 Structure du projet

```
geonature_quadrige_extraction/
│── backend/             # Backend Flask
│   ├── backend.py
│   ├── extraction_programs.py
│   ├── extraction_data.py
│   ├── build_query.py
│
│── frontend/            # Frontend Angular
│   ├── src/
│   ├── angular.json
│   ├── package.json
│
│── output_test/         # Fichiers CSV et ZIP générés
│── saved_programmes/    # Sauvegardes des programmes et filtres
│── venv/                # Environnement virtuel Python
│── requirements.txt     # Dépendances Python
│── .gitignore
│── README.md
```

---

## ⚙️ TestGeo (Frontend Angular)

Ce projet a été généré avec Angular CLI v20.3.2.

### 🧩 Serveur de développement

```bash
ng serve
```

Ouvrez votre navigateur sur :
👉 http://localhost:4200

L’application se recharge automatiquement à chaque modification.

### 🧱 Génération de composants

```bash
ng generate component component-name
ng generate --help
```

### 🏗️ Compilation

```bash
ng build
```

Les fichiers compilés seront générés dans le dossier dist/.

### 🧪 Tests unitaires

```bash
ng test
```

### 🌐 Tests end-to-end

```bash
ng e2e
```

⚠️ Angular CLI ne fournit pas de framework e2e par défaut.

---

## 🐳 Configuration Docker – GeoNature sur Debian 12

Ce guide décrit les étapes nécessaires pour installer et configurer Docker, paramétrer le proxy réseau RIE, et construire une image Debian 12 prête pour GeoNature.

### 1️⃣ Installation de Docker Desktop

Téléchargez Docker Desktop pour Windows :
👉 https://www.docker.com/products/docker-desktop

Options recommandées :

| Option | Choix |
|---|---|
| Start Docker Desktop when you sign in | ✅ |
| Open Docker Dashboard when Docker Desktop starts | ❌ |
| Choose container terminal → Integrated | ✅ |
| Enable Docker terminal | ✅ |
| Enable Docker Debug by default | ❌ |
| Expose daemon on tcp://localhost:2375 without TLS | ❌ |
| Use the WSL 2 based engine | ✅ |
| Add the *.docker.internal names to hosts file | ✅ |

### 2️⃣ Configuration du proxy réseau

    Ouvrir Docker Desktop

    Aller dans Settings → Resources → Proxies

    Remplir les champs suivants :

HTTP Proxy:  http://pfrie-std.proxy.e2.rie.gouv.fr:8080  
HTTPS Proxy: http://pfrie-std.proxy.e2.rie.gouv.fr:8080  
No Proxy:    localhost,127.0.0.1

    Cliquer sur Apply & Restart

### 3️⃣ Vérification du proxy dans WSL

```bash
docker info | grep -i proxy
```

Résultat attendu :

HTTP Proxy: http://pfrie-std.proxy.e2.rie.gouv.fr:8080  
HTTPS Proxy: http://pfrie-std.proxy.e2.rie.gouv.fr:8080

### 4️⃣ Création du dossier du projet

```bash
cd ~
mkdir geonature-docker
cd geonature-docker
nano Dockerfile
```

### 5️⃣ Contenu du Dockerfile

```dockerfile
# ===============================================
# 🐧 GeoNature – Dockerfile Debian 12 (Bookworm)
# ===============================================
FROM debian:12

# Configuration du proxy (réseau d’entreprise)
ARG HTTP_PROXY=http://pfrie-std.proxy.e2.rie.gouv.fr:8080
ARG HTTPS_PROXY=http://pfrie-std.proxy.e2.rie.gouv.fr:8080
ARG NO_PROXY=localhost,127.0.0.1

ENV http_proxy=${HTTP_PROXY}
ENV https_proxy=${HTTPS_PROXY}
ENV no_proxy=${NO_PROXY}

LABEL maintainer="basile.andre"
LABEL description="Environnement GeoNature basé sur Debian 12 (Bookworm)"

ENV DEBIAN_FRONTEND=noninteractive

RUN apt-get update && \
    apt-get install -y --no-install-recommends \
        apt-transport-https ca-certificates curl wget gnupg \
        software-properties-common locales tzdata \
        python3 python3-pip python3-venv python3-dev \
        build-essential git postgresql postgresql-contrib postgis libpq-dev && \
    echo "Europe/Paris" > /etc/timezone && \
    dpkg-reconfigure -f noninteractive tzdata && \
    sed -i 's/# fr_FR.UTF-8 UTF-8/fr_FR.UTF-8 UTF-8/' /etc/locale.gen && \
    locale-gen fr_FR.UTF-8 && update-locale LANG=fr_FR.UTF-8 && \
    useradd -ms /bin/bash geonature && \
    rm -rf /var/lib/apt/lists/*

USER geonature
WORKDIR /home/geonature

RUN python3 -m venv venv && ./venv/bin/pip install --upgrade pip

ENV PATH="/home/geonature/venv/bin:$PATH"
CMD ["/bin/bash"]
```

### 6️⃣ Construction de l’image Docker

```bash
sudo docker build \
  --build-arg HTTP_PROXY=http://pfrie-std.proxy.e2.rie.gouv.fr:8080 \
  --build-arg HTTPS_PROXY=http://pfrie-std.proxy.e2.rie.gouv.fr:8080 \
  --build-arg NO_PROXY=localhost,127.0.0.1 \
  -t geonature-debian12 .
```

### 7️⃣ Test du conteneur

```bash
docker run -it geonature-debian12 bash
```

Dans le conteneur :

```bash
python3 --version
psql --version
curl -I https://www.google.com
```

Résultat attendu :

    ✅ Python 3.x installé

    ✅ PostgreSQL disponible

    ✅ Code HTTP 200 OK (connexion Internet via proxy)

---

## 🧰 Problèmes rencontrés et solutions — Proxy RIE

🔸 Problème 1 — Proxy non pris en compte par Docker

Cause : Proxys Docker Desktop non appliqués à WSL.  
Solution : Configuration manuelle dans /etc/docker/daemon.json.

```json
{
  "proxies": {
    "http-proxy": "http://pfrie-std.proxy.e2.rie.gouv.fr:8080",
    "https-proxy": "http://pfrie-std.proxy.e2.rie.gouv.fr:8080",
    "no-proxy": "localhost,127.0.0.1,.rie.gouv.fr"
  }
}
```

🔸 Problème 2 — Service Docker introuvable

Cause : Docker non installé ou en mode rootless.  
Solution :

```bash
sudo apt update
sudo apt install docker.io
sudo systemctl start docker
sudo systemctl enable docker
```

🔸 Problème 3 — Répertoire /etc/docker manquant

Solution :

```bash
sudo mkdir -p /etc/docker
sudo nano /etc/docker/daemon.json
```

Ajouter la configuration du proxy.

🔸 Problème 4 — Proxy non appliqué au client Docker

Solution : Modifier ~/.docker/config.json :

```json
{
  "proxies": {
    "default": {
      "httpProxy": "http://pfrie-std.proxy.e2.rie.gouv.fr:8080",
      "httpsProxy": "http://pfrie-std.proxy.e2.rie.gouv.fr:8080",
      "noProxy": "localhost,127.0.0.1,.rie.gouv.fr"
    }
  }
}
```

🔸 Problème 5 — Vérification finale

Tester avec :

```bash
docker pull hello-world
```

✅ Téléchargement réussi → Docker fonctionne correctement via le proxy.

---

## 🧭 Résumé global

| Problème         | Cause principale                      | Solution                                |
|------------------|--------------------------------------|-----------------------------------------|
| Proxy incorrect  | Proxy Docker Desktop non appliqué à WSL | Config via /etc/docker/daemon.json      |
| Service introuvable | Docker non installé / rootless     | Réinstallation + activation             |
| Dossier manquant | Pas de config Docker initiale         | Création manuelle                       |
| Proxy client manquant | Pas de config CLI                | Ajout dans ~/.docker/config.json        |
| Test final       | Validation du proxy                   | docker pull hello-world                 |

---

## 📝 Remarques complémentaires

    Si votre proxy nécessite une authentification :

    http://utilisateur:motdepasse@pfrie-std.proxy.e2.rie.gouv.fr:8080

    Encodez les caractères spéciaux (@, #, %, etc.) :
    Exemple → @ devient %40

    Les chemins /etc/docker et ~/.docker sont absolus, exécutables depuis n’importe quel répertoire.

---

## ✅ Résultat final

Docker est configuré avec succès pour fonctionner avec le proxy RIE,
et l’environnement est prêt pour la construction de l’image GeoNature Debian 12.

---

## 📘 Auteur et version

Auteur : Basile André  
Version : 1.0  
Dernière mise à jour : Octobre 2025

---

Souhaites-tu que je te fasse une **version abrégée** (moins technique, pour la page d’accueil du dépôt)
