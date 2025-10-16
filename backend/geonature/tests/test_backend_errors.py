import os
import pytest
import pandas as pd
from backend.app_backend import app
from backend.extraction_programs import nettoyer_csv


# ============================
# Fixtures Flask et environnement
# ============================

@pytest.fixture()
def client():
    """Fournit un client Flask de test."""
    app.config["TESTING"] = True
    with app.test_client() as client:
        yield client


@pytest.fixture()
def tmp_savedir(tmp_path, monkeypatch):
    """Crée un répertoire temporaire isolé pour les sauvegardes."""
    from backend import app_backend
    save_dir = tmp_path / "saved_programmes"
    save_dir.mkdir()
    monkeypatch.setattr(app_backend, "SAVE_DIR", str(save_dir))
    monkeypatch.setattr(app_backend, "LAST_FILTER_FILE", str(save_dir / "last_filter.json"))
    return save_dir


# ============================
# 1️⃣ Tests d’erreurs sur fonctions
# ============================

def test_nettoyer_csv_colonne_manquante(tmp_path):
    """Vérifie qu’une erreur est levée si une colonne requise est absente."""
    input_csv = tmp_path / "input.csv"
    output_csv = tmp_path / "output.csv"

    # On omet volontairement une colonne obligatoire
    df = pd.DataFrame([
        {"Programme : Code": "P1", "Programme : Libellé": "Test"}
    ])
    df.to_csv(input_csv, sep=";", index=False)

    with pytest.raises(ValueError) as e:
        nettoyer_csv(input_csv, output_csv, "126-")

    assert "Colonne manquante" in str(e.value)


def test_charger_filtre_inexistant(tmp_path, monkeypatch):
    """Teste charger_filtre() quand le fichier JSON n’existe pas."""
    from backend import app_backend
    monkeypatch.setattr(app_backend, "LAST_FILTER_FILE", str(tmp_path / "does_not_exist.json"))
    result = app_backend.charger_filtre()
    assert result == {}  # retourne un dict vide


# ============================
# 2️⃣ Tests d’erreurs sur routes Flask
# ============================

def test_filtrage_seul_sans_monitoring_location(client, tmp_savedir):
    """Simule une requête /filtrage_seul avec un filtre sans 'monitoringLocation'."""
    bad_filter = {"filter": {"wrongKey": "oops"}}
    response = client.post("/filtrage_seul", json=bad_filter)
    data = response.get_json()
    assert response.status_code == 400
    assert data["status"] == "error"
    assert "Aucun filtre trouvé" in data["message"]


def test_data_extractions_sans_programmes(client, tmp_savedir):
    """Teste la route /data-extractions sans liste de programmes."""
    payload = {"programmes": [], "filter": {}}
    response = client.post("/data-extractions", json=payload)
    data = response.get_json()
    assert response.status_code == 400
    assert data["status"] == "warning"
    assert "Aucun programme" in data["message"]


def test_data_extractions_sans_last_filter(client, tmp_savedir):
    """Teste la route /data-extractions sans filtre sauvegardé valide."""
    # On crée un filtre vide pour forcer l’erreur
    from backend import app_backend
    with open(os.path.join(tmp_savedir, "last_filter.json"), "w") as f:
        f.write("{}")

    payload = {"programmes": ["P1"], "filter": {}}
    response = client.post("/data-extractions", json=payload)
    data = response.get_json()

    assert response.status_code == 400
    assert data["status"] == "error"
    assert "monitoringLocation" in data["message"]
