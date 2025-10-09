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


```bash

# ===============================================
# 🐧 GeoNature – Dockerfile Debian 12 (Bookworm)
# ===============================================
FROM debian:12

# -----------------------------------------------
# 🔹 Configuration du proxy réseau (RIE)
# -----------------------------------------------
ARG HTTP_PROXY=http://pfrie-std.proxy.e2.rie.gouv.fr:8080
ARG HTTPS_PROXY=http://pfrie-std.proxy.e2.rie.gouv.fr:8080
ARG NO_PROXY=localhost,127.0.0.1

ENV http_proxy=${HTTP_PROXY}
ENV https_proxy=${HTTPS_PROXY}
ENV no_proxy=${NO_PROXY}

LABEL maintainer="basile.andre"
LABEL description="Environnement GeoNature basé sur Debian 12 (Bookworm)"

ENV DEBIAN_FRONTEND=noninteractive
ENV LANG=fr_FR.UTF-8
ENV LC_ALL=fr_FR.UTF-8

# -----------------------------------------------
# 🔹 Étape 1 : Système de base
# -----------------------------------------------
ARG DEBIAN_FRONTEND=noninteractive

RUN apt-get update -qq && \
    apt-get install -yq --no-install-recommends \
        apt-transport-https ca-certificates curl wget gnupg \
        software-properties-common locales tzdata sudo unzip git \
        python3 python3-pip python3-venv python3-dev build-essential \
        libpq-dev libgdal-dev libffi-dev libpangocairo-1.0-0 \
        postgresql postgresql-contrib postgresql-15-postgis-3 apache2 redis && \
    echo "Europe/Paris" > /etc/timezone && \
    dpkg-reconfigure -f noninteractive tzdata && \
    sed -i 's/# fr_FR.UTF-8 UTF-8/fr_FR.UTF-8 UTF-8/' /etc/locale.gen && \
    locale-gen fr_FR.UTF-8 && update-locale LANG=fr_FR.UTF-8 && \
    rm -rf /var/lib/apt/lists/*


# -----------------------------------------------
# 🔹 Étape 2 : Utilisateur GeoNature
# -----------------------------------------------
RUN useradd -ms /bin/bash geonature && \
    adduser geonature sudo && \
    echo "geonature ALL=(ALL) NOPASSWD: ALL" >> /etc/sudoers

USER geonature
WORKDIR /home/geonature

# -----------------------------------------------
# 🔹 Étape 3 : Installation Python (venv)
# -----------------------------------------------
RUN python3 -m venv /home/geonature/venv && \
    /home/geonature/venv/bin/pip install --upgrade pip setuptools wheel

ENV PATH="/home/geonature/venv/bin:$PATH"

# -----------------------------------------------
# 🔹 Étape 4 : Téléchargement et configuration GeoNature
# -----------------------------------------------
ARG GEONATURE_VERSION=2.16.0
RUN wget https://github.com/PnX-SI/GeoNature/archive/refs/tags/${GEONATURE_VERSION}.zip && \
    unzip ${GEONATURE_VERSION}.zip && \
    mv GeoNature-${GEONATURE_VERSION} geonature && \
    rm ${GEONATURE_VERSION}.zip

WORKDIR /home/geonature/geonature

RUN cp config/settings.ini.sample config/settings.ini && \
    sed -i "s|my_url = .*|my_url = http://localhost/|" config/settings.ini && \
    sed -i "s|user_pg = .*|user_pg = geonaturedb|" config/settings.ini && \
    sed -i "s|user_pg_pass = .*|user_pg_pass = geonaturepass|" config/settings.ini && \
    sed -i "s|mode = .*|mode = dev|" config/settings.ini

# -----------------------------------------------
# 🔹 Étape 5 : Installation backend et frontend
# -----------------------------------------------
WORKDIR /home/geonature/geonature/install

RUN ./00_install_nvm.sh && \
    bash -i -c "source ~/.bashrc && nvm install 20 && npm install -g @angular/cli"

RUN ./01_install_backend.sh

USER root
RUN service postgresql start && \
    sudo -u postgres psql -c "CREATE USER geonaturedb WITH PASSWORD 'geonaturepass';" && \
    sudo -u postgres createdb -O geonaturedb geonaturedb && \
    sudo -u postgres psql -d geonaturedb -c 'CREATE EXTENSION IF NOT EXISTS postgis;' && \
    sudo -u postgres psql -d geonaturedb -c 'CREATE EXTENSION IF NOT EXISTS pg_trgm;' && \
    sudo -u geonature bash -c "cd /home/geonature/geonature/install && ./03_create_db.sh && ./04_install_gn_modules.sh && ./05_install_frontend.sh" && \
    service postgresql stop
USER geonature

# -----------------------------------------------
# 🔹 Étape 6 : Configuration Apache
# -----------------------------------------------
USER root
RUN ./06_configure_apache.sh && \
    a2enmod ssl rewrite headers && \
    apache2ctl restart

EXPOSE 80 443


# ------------------------------------------------------------------------------
# 🔹 Étape 7 : Démarrage automatique et Healthcheck – Vérification des services
# ------------------------------------------------------------------------------
HEALTHCHECK --interval=60s --timeout=10s --retries=3 CMD \
    pg_isready -U geonaturedb -d geonaturedb -h localhost > /dev/null 2>&1 && \
    curl -fs http://localhost/geonature/api/ > /dev/null 2>&1 || exit 1


CMD service postgresql start && apache2ctl start && bash


```

### 🔍 Ce que fait ce HEALTHCHECK

pg_isready → vérifie que PostgreSQL répond bien sur le socket local
curl -fs http://localhost/geonature/api/ → vérifie que l’API GeoNature est accessible via Apache
Si l’un des deux échoue → Docker marque le conteneur comme “unhealthy”
On peut voir l’état en direct avec :

```bash
docker ps
```
→ colonne STATUS affichera healthy ou unhealthy


### 🧠 Quelques précisions techniques

--interval=60s → Docker teste toutes les 60 secondes

--timeout=10s → si la commande met plus de 10s, elle est considérée échouée

--retries=3 → il faut 3 échecs consécutifs pour passer en “unhealthy”

### 🧠 Ce que ça fait le patch :

```bash
# Patch pour éviter le téléchargement bloqué par le proxy
sed -i 's|with open_remote_file(base_url, "HABREF_50.zip"|# with open_remote_file(base_url, "HABREF_50.zip"|' \
/home/geonature/geonature/backend/venv/lib/python3.11/site-packages/pypn_habref_api/migrations/versions/46e91e738845_insert_inpn_data_in_ref_habitats_schema.py && \
 \
```

🔹 Le sed commente la ligne responsable du téléchargement du fichier HABREF_50.zip

🔹 Le reste des migrations (création de schémas, extensions, données locales) s’exécute normalement

🔹 Aucune dépendance réseau n’est requise

🔹 Tu auras une base GeoNature opérationnelle (il manquera seulement les données d’habitats INPN, mais tu pourras les importer plus tard si besoin)


### 6️⃣ Construction de l’image Docker

```bash
sudo docker build \
  --build-arg HTTP_PROXY=http://pfrie-std.proxy.e2.rie.gouv.fr:8080 \
  --build-arg HTTPS_PROXY=http://pfrie-std.proxy.e2.rie.gouv.fr:8080 \
  --build-arg NO_PROXY=localhost,127.0.0.1 \
  -t geonature-debian12 .
```

Attention, cette opération prend plus ou moins 20minutes..

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
    

### ✅ Vérification manuelle dans le conteneur

Une fois que le build terminé et le docker lancé :
```bash
docker run -it -p 8080:80 geonature-full:2.16.0
```

On peut vérifier


```bash
pg_isready -U geonaturedb -d geonaturedb -h localhost
curl -I http://localhost/geonature/api/
```

→ On devrait Obtenir accepting connections et un HTTP/1.1 200 OK

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
