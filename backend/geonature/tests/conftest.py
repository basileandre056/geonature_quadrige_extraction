import sys
import os
import pytest

#pytest parcourt récursivement ce dossier et :

# charge tous les conftest.py (avant tout autre fichier)
# cela initialise le contexte global de test (ex. ton PYTHONPATH, fixtures, etc.)
# importe les fichiers de test (commençant par test_)
# pour trouver toutes les fonctions qui commencent par test_.
# associe automatiquement les fixtures (client, tmp_savedir, etc.)
# chaque test qui les mentionne en paramètre les reçoit avant exécution.


# Étape 1 : ajoute le chemin racine du projet pour que "backend" soit importable
sys.path.append(
    os.path.abspath(os.path.join(os.path.dirname(__file__), "../../../"))
)

# Étape 2 : importe ton application Flask
from backend.app_backend import app


# --- 3️⃣ Fixtures globales pour les tests backend ---

@pytest.fixture()
def client():
    """Instancie un client Flask pour simuler des requêtes HTTP."""
    app.config["TESTING"] = True
    with app.test_client() as client:
        yield client  #  pytest fournit ce client aux tests qui l’appellent



@pytest.fixture()
def tmp_savedir(monkeypatch, tmp_path):
    """Crée un dossier temporaire et redirige les variables SAVE_DIR / LAST_FILTER_FILE."""
    temp_dir = tmp_path / "saved_programmes"
    temp_dir.mkdir(parents=True, exist_ok=True)

    monkeypatch.setattr("backend.app_backend.SAVE_DIR", str(temp_dir))
    monkeypatch.setattr("backend.app_backend.LAST_FILTER_FILE", os.path.join(temp_dir, "last_filter.json"))

    yield temp_dir
