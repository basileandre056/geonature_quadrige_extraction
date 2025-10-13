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

Si vous n'avez pas le résultat attendu : voir [Problèmes rencontrés et solutions — Proxy RIE](#problèmes-rencontrés-et-solutions--proxy-rie)

### 4️⃣ Création du dossier du projet

```bash
cd ~
mkdir geonature-docker
cd geonature-docker
nano Dockerfile
```

### 5️⃣ Contenu du Dockerfile
Ce Dockerfile construit une image Debian 12 (bookworm) entièrement autonome pour GeoNature v2.16.0,
adaptée à un environnement réseau RIE avec proxy et restrictions Internet.

Les étapes sont détaillées et commentées ci-dessous.

```bash

# ===================================================
# GeoNature – Dockerfile Debian 12 (Bookworm)
# ===================================================
FROM debian:12

# ---------------------------------------------------
# Desactivation du .bashrc automatique
# ---------------------------------------------------
ENV BASH_ENV=""

# ---------------------------------------------------
# Configuration de base du systeme
# ---------------------------------------------------
ENV DEBIAN_FRONTEND=noninteractive
ENV LANG=fr_FR.UTF-8
ENV LC_ALL=fr_FR.UTF-8

# ---------------------------------------------------
# Variables de proxy pour les environnements RIE
# ---------------------------------------------------
ARG HTTP_PROXY=http://pfrie-std.proxy.e2.rie.gouv.fr:8080
ARG HTTPS_PROXY=http://pfrie-std.proxy.e2.rie.gouv.fr:8080
ARG NO_PROXY=localhost,127.0.0.1,.mnhn.fr,github.com,raw.githubusercontent.com,codeload.github.com

ENV http_proxy=${HTTP_PROXY} \
    https_proxy=${HTTPS_PROXY} \
    no_proxy=${NO_PROXY}

LABEL maintainer="basile.andre"
LABEL description="Image Docker GeoNature basee sur Debian 12 – compatible proxy RIE"

# ===================================================
# Etape 1 – Installation du systeme de base
# ===================================================
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
    apt-get clean && rm -rf /var/lib/apt/lists/*

# ===================================================
# Etape 2 – Creation de l'utilisateur GeoNature
# ===================================================
RUN useradd -ms /bin/bash geonature && \
    echo "geonature ALL=(ALL) NOPASSWD: ALL" >> /etc/sudoers

USER geonature
WORKDIR /home/geonature

# ===================================================
# Etape 3 – Environnement Python
# ===================================================
ENV VIRTUAL_ENV=/home/geonature/venv
ENV PATH="$VIRTUAL_ENV/bin:$PATH"

RUN python3 -m venv $VIRTUAL_ENV && \
    pip install --upgrade pip setuptools wheel

# ===================================================
# Etape 4 – Telechargement et configuration GeoNature
# ===================================================
ARG GEONATURE_VERSION=2.16.0

RUN wget -q https://github.com/PnX-SI/GeoNature/archive/refs/tags/${GEONATURE_VERSION}.zip && \
    unzip ${GEONATURE_VERSION}.zip && \
    mv GeoNature-${GEONATURE_VERSION} geonature && \
    rm ${GEONATURE_VERSION}.zip

WORKDIR /home/geonature/geonature

RUN cp config/settings.ini.sample config/settings.ini && \
    sed -i "s|my_url = .*|my_url = http://localhost/|" config/settings.ini && \
    sed -i "s|user_pg = .*|user_pg = geonaturedb|" config/settings.ini && \
    sed -i "s|user_pg_pass = .*|user_pg_pass = geonaturepass|" config/settings.ini && \
    sed -i "s|mode = .*|mode = dev|" config/settings.ini

# ===================================================
# Etape 5 – Installation backend et frontend
# ===================================================
WORKDIR /home/geonature/geonature/install
ENV NVM_DIR="/home/geonature/.nvm"

RUN ./00_install_nvm.sh && \
    bash -i -c "source ~/.bashrc && nvm install 20 && npm install -g @angular/cli"

RUN ./01_install_backend.sh

# ===================================================
# Etape 6 – Configuration PostgreSQL et patchs RIE
# ===================================================
USER root

RUN /etc/init.d/postgresql start && sleep 5 && \
    sudo -u postgres psql -c "CREATE USER geonaturedb WITH PASSWORD 'geonaturepass';" && \
    sudo -u postgres createdb -O geonaturedb geonaturedb && \
    sudo -u postgres psql -d geonaturedb -c 'CREATE EXTENSION IF NOT EXISTS postgis;' && \
    sudo -u postgres psql -d geonaturedb -c 'CREATE EXTENSION IF NOT EXISTS pg_trgm;' && \
    echo "PostgreSQL pret et extensions activees" && \
    sed -i '/with open_remote_file(base_url, "HABREF_50.zip"/,/op.bulk_insert/d' \
    /home/geonature/geonature/backend/venv/lib/python3.11/site-packages/pypn_habref_api/migrations/versions/46e91e738845_insert_inpn_data_in_ref_habitats_schema.py && \
    echo "Patch INPN applique" && \
    /home/geonature/geonature/backend/venv/bin/python3 - <<'EOF'
import re, pathlib
f = pathlib.Path("/home/geonature/geonature/backend/venv/lib/python3.11/site-packages/apptax/taxonomie/commands/taxref_v15_v16.py")
print(f"Application du patch TAXREF sur : {f}")
if f.exists():
    text = f.read_text()
    new = re.sub(
        r'with open_remote_file\(base_url, taxref_archive_name.*?op\.bulk_insert\(.*?\)\n',
        '    logger.info("Telechargement TAXREF desactive (proxy RIE)")\n    return\n',
        text,
        flags=re.S
    )
    f.write_text(new)
    print("Patch TAXREF applique avec succes")
else:
    print("Fichier taxref_v15_v16.py introuvable")
EOF

RUN echo "Application du patch anti-TAXREF et du correctif contrainte..." && \
    echo "ALTER TABLE IF EXISTS ref_nomenclatures.cor_taxref_nomenclature DROP CONSTRAINT IF EXISTS check_cor_taxref_nomenclature_isgroup2inpn;" \
        >> /home/geonature/geonature/install/03_create_db.sh && \
    sed -i "s/geonature[[:space:]]\+taxref/echo 'Import TAXREF desactive (proxy RIE) # geonature taxref desactive'/g" \
        /home/geonature/geonature/install/03b_populate_db.sh && \
    echo "Patch anti-taxref applique a 03b_populate_db.sh" && \
    /etc/init.d/postgresql restart && sleep 5 && \
    sudo -u geonature bash -c "cd /home/geonature/geonature/install && ./03_create_db.sh" && \
    /etc/init.d/postgresql stop && \
    echo "Creation de la base GeoNature terminee sans import TAXREF"

# ===================================================
# Etape 7 – Installation finale (modules et frontend)
# ===================================================
RUN /etc/init.d/postgresql start && sleep 5 && \
    sudo -u geonature bash -c "cd /home/geonature/geonature/install && ./04_install_gn_modules.sh && ./05_install_frontend.sh" && \
    /etc/init.d/postgresql stop && \
    echo "Installation complete de GeoNature terminee"

# ===================================================
# Etape 8 – Configuration Apache
# ===================================================
RUN ./06_configure_apache.sh && \
    a2enmod ssl rewrite headers && \
    apache2ctl graceful

EXPOSE 80 443

# ===================================================
# Etape 9 – Healthcheck et demarrage
# ===================================================
HEALTHCHECK --interval=60s --timeout=10s --retries=3 CMD \
    pg_isready -U geonaturedb -d geonaturedb -h localhost > /dev/null 2>&1 && \
    curl -fs http://localhost/geonature/api/ > /dev/null 2>&1 || exit 1

CMD ["bash", "-c", "service postgresql start && apache2ctl start && bash"]


```

| Modification                                 | Pourquoi                                                                                         | Effet                                                                                      |
|-----------------------------------------------|--------------------------------------------------------------------------------------------------|--------------------------------------------------------------------------------------------|
| Ajout de ENV BASH_ENV=""                      | Pour neutraliser le .bashrc de l’hôte (qui pouvait lancer Apache/PostgreSQL ou forcer le proxy). | Empêche tout conflit entre l’environnement Ubuntu et le conteneur pendant le build.         |
| Séparation du bloc après EOF dans un nouveau RUN | Docker ne permet pas de continuer un RUN juste après un heredoc (EOF).                          | Évite l’erreur unknown instruction: &&.                                                    |
| Commentaires et emoji limités aux lignes #    | Docker ne supporte pas les caractères UTF-8 dans les instructions.                              | Les emoji décoratifs restent dans les commentaires sans casser le parser.                  |
| Test if f.exists() dans le patch TAXREF       | Certains chemins peuvent varier selon la version de GeoNature.                                  | Rend le patch plus robuste (ne plante pas si le fichier n’existe pas).                     |
| Logs explicites dans les patchs               | Pour garder une trace claire pendant le build.                                                  | Facilite le diagnostic si une migration est ignorée.                                       |


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

### 🩹 Patchs Proxy (rappel synthétique)

Patch HABREF (INPN) : supprime le bloc de téléchargement du fichier HABREF_50.zip.

Patch TAXREF : remplace la fonction de téléchargement par un log via un mini-script Python.

Ces deux ajustements permettent une installation complète et non bloquante en réseau RIE, sans casser la base.

---

#### **1. Patch HABREF (INPN)**
- **Situation :**  
  La migration `46e91e738845_insert_inpn_data_in_ref_habitats_schema.py` tente de télécharger et d’insérer automatiquement le fichier d’habitats `HABREF_50.zip` depuis l’INPN.
- **Problème :**  
  Le proxy RIE bloque ce téléchargement, ce qui provoque l’échec de la migration et donc de l’installation globale.
- **Solution appliquée :**  
  On utilise la commande `sed '/with open_remote_file(base_url, "HABREF_50.zip"/,/op.bulk_insert/d' ...` pour **supprimer tout le bloc de code** qui :
  - tente de télécharger le fichier externe,
  - puis insère les données dans la base.
- **Effet :**  
  La migration passe sans erreur : seules les données externes INPN ne sont pas importées, mais la structure de la base et les autres données locales sont créées normalement.

---

#### **2. Patch TAXREF**
- **Situation :**  
  Le script Python `taxref_v15_v16.py` effectue un téléchargement automatique du fichier TAXREF (taxonomie nationale) via Internet, puis l’insère en base.
- **Problème :**  
  Le proxy institutionnel bloque ce téléchargement, provoquant là aussi l’échec de la migration.
- **Solution appliquée :**  
  Plutôt que d’utiliser `sed` (peu fiable sur du code Python complexe), on exploite un script Python lancé en une ligne :
  - Il recherche dans le fichier le bloc de code contenant `with open_remote_file(...) ... op.bulk_insert(...)`
  - Il remplace tout ce bloc par une ligne : `logger.info("Telechargement TAXREF ignore (proxy RIE)")`
- **Effet :**  
  - Le script saute donc le téléchargement et l’insertion, mais la migration ne plante pas (aucune erreur d’indentation ou d’appel de fonction).
  - Un log clair signale que l’étape a été ignorée à cause du proxy.
  - La structure de la base et le reste de l’installation restent intacts.

---

#### **3. Robustesse et sécurité des patchs**
- **Portée limitée :**  
  Ces patchs ne touchent que les parties responsables des téléchargements distants dans des scripts de migration de données : *le code de l’application, la logique métier, les dépendances Python et la structure de la base ne sont pas modifiés*.
- **Réversibilité :**  
  Si, plus tard, un accès Internet direct devient disponible, il suffira de relancer les migrations concernées pour importer les données manquantes.
- **Intégrité :**  
  La base GeoNature obtenue reste parfaitement fonctionnelle : seules les données externes (INPN, TAXREF) seront absentes, mais pourront être ajoutées ultérieurement.
- **Méthode utilisée :**  
  - Le patch HABREF avec `sed` : supprime un bloc de lignes délimité par deux patterns (très efficace pour effacer proprement une séquence de code dans un fichier).
  - Le patch TAXREF avec Python : permet un remplacement plus robuste qu’un simple sed, notamment pour respecter l’indentation et la syntaxe Python.

---

#### **4. Pourquoi ce choix technique est pertinent**
- **Non-intrusif :** on désactive seulement les importations impossibles à cause du proxy, sans casser le reste des migrations.
- **Lisibilité :** les logs générés permettent de savoir précisément quelles étapes ont été ignorées, facilitant un éventuel rattrapage manuel.
- **Installation automatisée et fiable** : on évite tout blocage lors du build Docker, même sans accès Internet complet.

---

#### **En résumé**
Ces patchs sont une désactivation ciblée et temporaire de l’import automatique de données externes, indispensable pour une installation GeoNature en environnement réseau restreint.  
Le fonctionnement de la plateforme n’est pas altéré et les imports manquants peuvent être réalisés dès que l’accès Internet est possible.





### 6️⃣ Construction de l’image Docker

On dispose de trois modes principaux pour construire l’image :

#### 1️⃣ Construction standard (avec cache)

```bash
sudo docker build \
  --build-arg HTTP_PROXY=http://pfrie-std.proxy.e2.rie.gouv.fr:8080 \
  --build-arg HTTPS_PROXY=http://pfrie-std.proxy.e2.rie.gouv.fr:8080 \
  --build-arg NO_PROXY=localhost,127.0.0.1 \
  -t geonature-full:2.16.0 .
```
- **Rapide** : Docker réutilise les couches déjà construites (cache).
- **À privilégier** : lorsque le Dockerfile est stable et qu’aucun script ou patch n’a été modifié.
- **Limite :** une étape déjà exécutée (ex : patch Python) ne sera pas rejouée, même si le script a changé → risque d’erreurs masquées.

#### 2️⃣ Construction complète (sans cache)

```bash
sudo docker build --no-cache \
  --build-arg HTTP_PROXY=http://pfrie-std.proxy.e2.rie.gouv.fr:8080 \
  --build-arg HTTPS_PROXY=http://pfrie-std.proxy.e2.rie.gouv.fr:8080 \
  --build-arg NO_PROXY=localhost,127.0.0.1 \
  -t geonature-full:2.16.0 .
```
- **Lent (20–40 min)** : Docker rejoue toutes les étapes (installation, patchs, etc.).
- **À utiliser :** lorsque l’on modifie des scripts, des variables, des patchs ou si l’on souhaite garantir que toutes les modifications sont bien prises en compte.
- **Garantie** : build 100 % propre et reproductible.

#### 3️⃣ Forcer le rebuild partiel (casser le cache sur une étape précise)

Pour forcer la réexécution d’une étape (ex : patch Python), on ajoute une variable bidon avant le RUN concerné :

```bash
sudo docker build --build-arg CACHE_BREAKER=$(date +%s) \
  -t geonature-full:2.16.0 .
```
Dans le Dockerfile, placer :

```dockerfile
ARG CACHE_BREAKER=1
RUN /home/geonature/geonature/backend/venv/bin/python3 - <<'EOF'
# ... le patch à rejouer ...
EOF
```

---

| Mode        | Commande                                  | Vitesse | Fiabilité  | Cas d’usage                              |
|-------------|-------------------------------------------|---------|------------|------------------------------------------|
| ⚡ Avec cache         | docker build                                  | Rapide  | Risque d’erreurs masquées | Builds répétitifs sans changement         |
| 🧱 Sans cache         | docker build --no-cache                        | Lent    | 100 % sûr              | Après modification de patchs, scripts, ENV|
| 🔁 Semi-propre        | --build-arg CACHE_BREAKER=$(date +%s)          | Moyen   | Partiel                | Forcer rebuild à partir d’une étape       |

---

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
    

### Vérification manuelle dans le conteneur

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

---

### 🔸 Problème 1 — Proxy non pris en compte par Docker

**Cause :** Proxys Docker Desktop non appliqués à WSL.  
**Solution :** Configurer manuellement le proxy dans `/etc/docker/daemon.json`.

```json
{
  "proxies": {
    "http-proxy": "http://pfrie-std.proxy.e2.rie.gouv.fr:8080",
    "https-proxy": "http://pfrie-std.proxy.e2.rie.gouv.fr:8080",
    "no-proxy": "localhost,127.0.0.1,.rie.gouv.fr"
  }
}
```

---

### 🔸 Problème 2 — Service Docker introuvable

**Cause :** Docker non installé ou en mode rootless.  
**Solution :** Installer et activer Docker :

```bash
sudo apt update
sudo apt install docker.io
sudo systemctl start docker
sudo systemctl enable docker
```

---

### 🔸 Problème 3 — Répertoire `/etc/docker` manquant

**Cause :** Pas de configuration Docker initiale.  
**Solution :** Créer le répertoire et le fichier de configuration :

```bash
sudo mkdir -p /etc/docker
sudo nano /etc/docker/daemon.json
```
Ajouter la configuration du proxy comme indiqué dans le Problème 1.

---

### 🔸 Problème 4 — Proxy non appliqué au client Docker

**Cause :** Proxy non configuré côté client Docker.  
**Solution :** Modifier `~/.docker/config.json` :

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

---

### 🔸 Problème 5 — Vérification finale

**Cause :** Vérifier que Docker fonctionne bien avec le proxy.  
**Solution :** Tester avec l’image de test :

```bash
docker pull hello-world
```
✅ Téléchargement réussi → Docker fonctionne correctement via le proxy.

---

### 🔸 Problème 6 — Téléchargement lent ou échoué lors du build Docker (proxy RIE)

**Cause :**  
Lors du build de l’image Docker GeoNature, l’étape suivante télécharge le code source depuis GitHub, ce qui peut être long (débit limité) ou échouer (erreur exit code 4) à cause du proxy :

```bash
RUN wget -q https://github.com/PnX-SI/GeoNature/archive/refs/tags/${GEONATURE_VERSION}.zip && \
    unzip ${GEONATURE_VERSION}.zip && \
    mv GeoNature-${GEONATURE_VERSION} geonature && \
    rm ${GEONATURE_VERSION}.zip
```

**Solution :**  
Télécharger l’archive GitHub *en dehors* du Docker et la fournir localement au build.  
Cette méthode :
- fonctionne sans accès Internet dans le conteneur ;
- évite les problèmes liés au proxy ou au débit ;
- accélère fortement la compilation.

**Étapes à suivre :**

1. Télécharger manuellement l’archive GeoNature (ne passe qu’une seule fois par le proxy RIE) :
   ```bash
   wget https://github.com/PnX-SI/GeoNature/archive/refs/tags/2.16.0.zip -O 2.16.0.zip
   ```

2. Déplacer le fichier dans le répertoire du Dockerfile :
   ```bash
   mv 2.16.0.zip ~/geonature-docker/
   ```

3. Modifier le Dockerfile :  
   Remplacer la ligne de téléchargement par une copie locale :
   ```dockerfile
   # Étape 4 – Copie locale du code GeoNature (pour éviter les téléchargements bloqués par le proxy)
   COPY 2.16.0.zip /tmp/
   RUN unzip /tmp/2.16.0.zip && \
       mv GeoNature-2.16.0 geonature && \
       rm /tmp/2.16.0.zip
   ```

4. Recompiler normalement :
   ```bash
   sudo docker build --no-cache \
     --build-arg HTTP_PROXY=http://pfrie-std.proxy.e2.rie.gouv.fr:8080 \
     --build-arg HTTPS_PROXY=http://pfrie-std.proxy.e2.rie.gouv.fr:8080 \
     --build-arg NO_PROXY=localhost,127.0.0.1 \
     -t geonature-full:2.16.0 .
   ```

**Résultat :**
- Le build n’a plus besoin d’accéder à GitHub.
- Plus aucune dépendance au proxy ou au débit réseau.
- L’étape de téléchargement passe de plusieurs minutes à moins de 5 secondes.

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

## Résultat final

Docker est configuré avec succès pour fonctionner avec le proxy RIE,
et l’environnement est prêt pour la construction de l’image GeoNature Debian 12.

---

## 📘 Auteur et version

Auteur : Basile André  
Version : 1.0  
Dernière mise à jour : Octobre 2025

---
