# 🌊 GeoNature Quadrige Extraction

Projet combinant un **frontend Angular** et un **backend Flask** pour extraire et télécharger des données (au format `.zip` et `.csv`) depuis **Quadrige (Ifremer)**.

---

## 🚀 Installation

### 1️⃣ Cloner le projet

```bash
git clone https://github.com/<ton-utilisateur>/<ton-repo>.git
cd geonature_quadrige_extraction

2️⃣ Backend (Flask)

Créer un environnement virtuel et installer les dépendances :

python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt

Lancer le backend :

python backend/backend.py

Le backend est accessible sur :
👉 http://127.0.0.1:5000
3️⃣ Frontend (Angular)

Installer Node.js et Angular CLI (si non installés) :

sudo apt install nodejs npm -y
npm install -g @angular/cli

Installer les dépendances Angular :

cd frontend
npm install

Lancer le frontend :

ng serve

Le frontend est accessible sur :
👉 http://localhost:4200
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
│── saved_programmes/    # Sauvegardes des programmes et filtres
│── venv/                # Environnement virtuel Python
│── requirements.txt     # Dépendances Python
│── .gitignore
│── README.md

⚙️ TestGeo (Frontend Angular)

Ce projet a été généré avec Angular CLI v20.3.2.
🧩 Serveur de développement

ng serve

Ouvrez votre navigateur sur http://localhost:4200

.
L’application se recharge automatiquement à chaque modification.
🧱 Génération de composants

ng generate component component-name
ng generate --help

🏗️ Compilation

ng build

Les fichiers compilés seront dans le dossier dist/.
🧪 Tests unitaires

ng test

🌐 Tests end-to-end

ng e2e

    ⚠️ Angular CLI ne fournit pas de framework e2e par défaut.

🐳 Configuration d’un Docker pour installer GeoNature et toutes ses dépendances (Debian 12)

Ce guide décrit les étapes nécessaires pour installer et configurer Docker, paramétrer le proxy réseau RIE, et construire une image Debian 12 prête pour GeoNature.
1️⃣ Installation de Docker Desktop

Téléchargez Docker Desktop pour Windows depuis :
👉 https://www.docker.com/products/docker-desktop

Lors de l’installation, sélectionnez les options suivantes :
Option	Choix
Start Docker Desktop when you sign in	✅
Open Docker Dashboard when Docker Desktop starts	❌
Choose container terminal → Integrated	✅
Enable Docker terminal	✅
Enable Docker Debug by default	❌
Expose daemon on tcp://localhost:2375 without TLS	❌
Use the WSL 2 based engine	✅
Add the *.docker.internal names to hosts file	✅
2️⃣ Configuration du proxy réseau

    Ouvrir Docker Desktop

    Aller dans Settings → Resources → Proxies

    Remplir les trois champs suivants :

Exemple pour le réseau RIE :

HTTP Proxy:  http://pfrie-std.proxy.e2.rie.gouv.fr:8080
HTTPS Proxy: http://pfrie-std.proxy.e2.rie.gouv.fr:8080
No Proxy: localhost,127.0.0.1

    Cliquer sur Apply & Restart
    (Docker redémarre automatiquement avec cette configuration)

3️⃣ Vérification du proxy dans WSL

Dans votre terminal WSL (Ubuntu ou Debian) :

docker info | grep -i proxy

Vous devez voir :

HTTP Proxy: http://pfrie-std.proxy.e2.rie.gouv.fr:8080
HTTPS Proxy: http://pfrie-std.proxy.e2.rie.gouv.fr:8080

Si ce n’est pas le cas, voir la section Problèmes rencontrés ci-dessous.
4️⃣ Création du dossier du projet

cd ~
mkdir geonature-docker
cd geonature-docker
nano Dockerfile

5️⃣ Contenu du Dockerfile

# ===============================================
# 🐧 GeoNature – Dockerfile Debian 12 (Bookworm)
# ===============================================
# Basé sur Debian 12, compatible GeoNature 2.13+
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

# Installation des paquets de base + Python + PostgreSQL + PostGIS
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

# Création d’un environnement virtuel Python
RUN python3 -m venv venv && ./venv/bin/pip install --upgrade pip

ENV PATH="/home/geonature/venv/bin:$PATH"
CMD ["/bin/bash"]

6️⃣ Construction de l’image Docker

Depuis le dossier geonature-docker, exécuter :

sudo docker build \
  --build-arg HTTP_PROXY=http://pfrie-std.proxy.e2.rie.gouv.fr:8080 \
  --build-arg HTTPS_PROXY=http://pfrie-std.proxy.e2.rie.gouv.fr:8080 \
  --build-arg NO_PROXY=localhost,127.0.0.1 \
  -t geonature-debian12 .

7️⃣ Test du conteneur

docker run -it geonature-debian12 bash

Dans le conteneur :

python3 --version
psql --version
curl -I https://www.google.com

Vous devez voir :

    Une version de Python 3.x

    Une version de PostgreSQL

    Un code 200 OK (connexion Internet via proxy)

✅ Résultat final

Vous disposez maintenant d’un conteneur Debian 12 :

    Configuré avec le proxy RIE

    Intégrant Python, pip, PostgreSQL et PostGIS

    Prêt pour l’installation de GeoNature

🧰 Problèmes rencontrés et solutions — Configuration Docker avec Proxy RIE

Ce document décrit les problèmes rencontrés lors de la configuration de Docker sous WSL avec un proxy réseau RIE, ainsi que leurs solutions détaillées.

---

## 🔸 Problème 1 — Le proxy n’était pas pris en compte par Docker

Description :
Après configuration du proxy dans Docker Desktop, la commande suivante affichait encore des proxys internes incorrects :

docker info | grep -i proxy
HTTP Proxy: http.docker.internal:3128
HTTPS Proxy: http.docker.internal:3128

Cela signifiait que les proxys configurés dans Docker Desktop n’étaient pas appliqués au démon Docker sous WSL.

Solution :
La solution a consisté à configurer manuellement le proxy dans le fichier de configuration du démon Docker.

1. Créer le répertoire de configuration (s’il n’existe pas) :
   sudo mkdir -p /etc/docker

2. Créer ou modifier le fichier daemon.json :
   sudo nano /etc/docker/daemon.json

3. Ajouter la configuration suivante :
   {
     "proxies": {
       "http-proxy": "http://pfrie-std.proxy.e2.rie.gouv.fr:8080",
       "https-proxy": "http://pfrie-std.proxy.e2.rie.gouv.fr:8080",
       "no-proxy": "localhost,127.0.0.1,.rie.gouv.fr"
     }
   }

4. Redémarrer le service Docker :
   sudo systemctl restart docker

5. Vérifier que le proxy est pris en compte :
   docker info | grep -i proxy

Les bonnes adresses du proxy devaient maintenant s’afficher.

---

## 🔸 Problème 2 — Le service Docker était introuvable

Description :
Lors du redémarrage du service Docker, la commande suivante renvoyait une erreur :

sudo systemctl restart docker
Failed to restart docker.service: Unit docker.service not found.

Cela indiquait que Docker n’était pas installé correctement ou que l’installation utilisait le mode rootless (sans privilèges administrateur).

Solution :
1. Vérifier la présence de Docker :
   docker --version

2. Si Docker n’est pas trouvé, le réinstaller :
   sudo apt update
   sudo apt install docker.io

3. Démarrer et activer le service :
   sudo systemctl start docker
   sudo systemctl enable docker

4. Vérifier la présence du service :
   systemctl list-units --type=service | grep docker

Après ces étapes, la commande sudo systemctl restart docker fonctionnait correctement.

---

## 🔸 Problème 3 — Le répertoire /etc/docker n’existait pas

Description :
Lors de la tentative de configuration du proxy, le message suivant apparaissait :

directory /etc/docker does not exist

Cela signifiait que Docker n’avait pas encore de configuration personnalisée sur le système.

Solution :
Créer manuellement le répertoire et le fichier de configuration :

sudo mkdir -p /etc/docker
sudo nano /etc/docker/daemon.json

Puis y ajouter la configuration du proxy (voir le problème 1).

---

## 🔸 Problème 4 — Le client Docker n’utilisait pas le proxy

Description :
Même après avoir configuré le démon Docker, certaines commandes comme docker build échouaient encore, car le client Docker (CLI) n’utilisait pas les proxys du démon.

Solution :
Configurer également le proxy côté client dans le fichier ~/.docker/config.json :

nano ~/.docker/config.json

Ajouter ou modifier la section suivante :
{
  "proxies": {
    "default": {
      "httpProxy": "http://pfrie-std.proxy.e2.rie.gouv.fr:8080",
      "httpsProxy": "http://pfrie-std.proxy.e2.rie.gouv.fr:8080",
      "noProxy": "localhost,127.0.0.1,.rie.gouv.fr"
    }
  }
}

---

## 🔸 Problème 5 — Vérification finale du bon fonctionnement

Description :
Une fois la configuration terminée, il fallait confirmer que Docker accédait bien à Internet via le proxy.

Solution :
Lancer un test simple :

docker pull hello-world

Le téléchargement de l’image s’est effectué correctement, confirmant que :
- Docker communiquait bien à travers le proxy,
- la configuration du démon et du client fonctionnait,
- et l’environnement était prêt pour la création de conteneurs.

---

## 🧭 Résumé global

Problème | Cause principale | Solution appliquée
---------|------------------|------------------
Proxy incorrect | Proxy Docker Desktop non appliqué à WSL | Configuration manuelle via /etc/docker/daemon.json
Service introuvable | Docker non installé ou rootless | Réinstallation et activation du service
Dossier manquant | Pas de configuration Docker initiale | Création du répertoire /etc/docker
Proxy non appliqué au client | Absence de config CLI | Ajout du proxy dans ~/.docker/config.json
Test de connexion | Validation du proxy | Téléchargement réussi de hello-world

---

Remarques complémentaires :
- Si votre proxy nécessite une authentification, vous pouvez inclure les identifiants dans l’URL :
  http://utilisateur:motdepasse@pfrie-std.proxy.e2.rie.gouv.fr:8080

- Si votre mot de passe contient des caractères spéciaux (#, %, @, etc.), pensez à les encoder avec %.  
  Exemple : %40 pour @

- Vous pouvez exécuter toutes les commandes depuis n’importe quel répertoire, les chemins /etc/docker et ~/.docker sont absolus.

---

Résultat final :
Docker est désormais configuré pour fonctionner correctement avec le proxy RIE, aussi bien côté démon que côté client.  
Les connexions externes (docker pull) fonctionnent, et l’environnement est prêt pour la construction de l’image GeoNature Debian 12.
