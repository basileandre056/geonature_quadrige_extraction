import os
import json
import pytest
from pathlib import Path
from unittest.mock import patch, MagicMock


@pytest.fixture()
def client(tmp_path, monkeypatch):
    """Client Flask + redirection des dossiers pour isoler le FS."""
    from backend import app_backend as backend
    monkeypatch.setattr(backend, "MEMORY_DIR", str(tmp_path / "memory"))
    monkeypatch.setattr(backend, "OUTPUT_DATA_DIR", str(tmp_path / "output_data"))
    os.makedirs(backend.MEMORY_DIR, exist_ok=True)
    os.makedirs(backend.OUTPUT_DATA_DIR, exist_ok=True)
    backend.app.config["TESTING"] = True
    with backend.app.test_client() as c:
        yield c


# --------------------------------------------------------------------
# 1) Test sauvegarder_filtre / charger_filtre (sans patch réseau)
# --------------------------------------------------------------------
def test_sauvegarder_et_charger_filtre(tmp_path, monkeypatch):
    from backend import app_backend as backend

    # On force le fichier last_filter.json dans un tmp
    monkeypatch.setattr(backend, "LAST_FILTER_FILE", str(tmp_path / "memory" / "last_filter.json"))
    os.makedirs(tmp_path / "memory", exist_ok=True)

    filtre = {"monitoringLocation": "126-", "name": "test"}
    backend.sauvegarder_filtre(filtre)

    # On relit ce qu'on a écrit
    lu = backend.charger_filtre()
    assert lu == filtre
    assert os.path.exists(backend.LAST_FILTER_FILE)


# --------------------------------------------------------------------
# 2) Test utilitaires de ménage : nettoyer_dossier_memory
# --------------------------------------------------------------------
def test_nettoyer_dossier_memory(tmp_path, monkeypatch):
    from backend import app_backend as backend
    memory = tmp_path / "memory"
    os.makedirs(memory, exist_ok=True)

    # On crée des fichiers “anciens”
    (memory / "programmes_126-_brut.csv").write_text("x; y\n", encoding="utf-8")
    (memory / "programmes_126-_filtered.csv").write_text("x; y\n", encoding="utf-8")
    # On crée le last_filter.json (à NE PAS supprimer)
    monkeypatch.setattr(backend, "MEMORY_DIR", str(memory))
    backend.LAST_FILTER_FILE = str(memory / "last_filter.json")
    Path(backend.LAST_FILTER_FILE).write_text("{}", encoding="utf-8")

    backend.nettoyer_dossier_memory()

    # Les CSV doivent avoir disparu, pas le filtre
    assert not (memory / "programmes_126-_brut.csv").exists()
    assert not (memory / "programmes_126-_filtered.csv").exists()
    assert (memory / "last_filter.json").exists()


# --------------------------------------------------------------------
# 3) Test utilitaires de ménage : nettoyer_output_data
# --------------------------------------------------------------------
def test_nettoyer_output_data(tmp_path, monkeypatch):
    from backend import app_backend as backend
    out = tmp_path / "output_data"
    os.makedirs(out, exist_ok=True)

    # Faux ZIP
    (out / "P1.zip").write_bytes(b"FAKE")
    (out / "P2.zip").write_bytes(b"FAKE")

    monkeypatch.setattr(backend, "OUTPUT_DATA_DIR", str(out))
    backend.nettoyer_output_data()

    # Tout doit être vide
    assert list(out.iterdir()) == []
