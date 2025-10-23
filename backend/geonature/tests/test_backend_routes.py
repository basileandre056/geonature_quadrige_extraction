import os
import json
import pytest
from unittest.mock import patch, MagicMock


@pytest.fixture()
def client(tmp_path, monkeypatch):
    """Client Flask avec environnement isolé (dossiers tmp)."""
    from backend import app_backend as backend

    # On redirige les dossiers pour ne pas toucher les vrais répertoires
    monkeypatch.setattr(backend, "MEMORY_DIR", str(tmp_path / "memory"))
    monkeypatch.setattr(backend, "OUTPUT_DATA_DIR", str(tmp_path / "output_data"))
    os.makedirs(backend.MEMORY_DIR, exist_ok=True)
    os.makedirs(backend.OUTPUT_DATA_DIR, exist_ok=True)

    backend.app.config["TESTING"] = True
    with backend.app.test_client() as c:
        yield c


# --------------------------------------------------------------------
# 1) /program-extraction — succès
# --------------------------------------------------------------------
@patch("backend.app_backend.extract_programs", return_value="https://exemple.tld/programs.csv")
# ^ Simule l’URL CSV renvoyée par l’API Ifremer (programme)
@patch("backend.app_backend.requests.get")
# ^ On intercepte requests.get pour empêcher un vrai téléchargement HTTP
def test_program_extraction_success(mock_get, mock_extract_programs, client, tmp_path):
    # Prépare ce que renverra requests.get(...).content :
    fake_csv_bytes = (
        "Lieu : Mnémonique;Programme : Code;Programme : Libellé;"
        "Programme : Etat;Programme : Date de création;"
        "Programme : Droit : Personne : Responsable : NOM Prénom : Liste\n"
        "126-AAA;P1;Lib;A;2020-01-01;Doe|John\n"
    ).encode("utf-8")
    mock_resp = MagicMock()
    mock_resp.content = fake_csv_bytes
    mock_resp.raise_for_status.return_value = None
    mock_get.return_value = mock_resp

    payload = {"filter": {"monitoringLocation": "126-", "name": "test"}}
    resp = client.post("/program-extraction", json=payload)

    assert resp.status_code == 200
    data = resp.get_json()
    assert data["status"] == "ok"
    # On vérifie qu’on expose bien des liens CSV :
    assert len(data.get("fichiers_csv", [])) >= 1

    mock_extract_programs.assert_called_once()
    mock_get.assert_called_once()  # le CSV brut a été “téléchargé” via le mock


# --------------------------------------------------------------------
# 2) /filtrage_seul — succès (re-filtrage)
# --------------------------------------------------------------------
@patch("backend.app_backend.charger_filtre", return_value={"monitoringLocation": "126-"})
def test_filtrage_seul_success(mock_charger, client, tmp_path):
    # On fabrique un CSV brut minimal dans MEMORY_DIR pour que la route puisse filtrer
    memory = tmp_path / "memory"
    os.makedirs(memory, exist_ok=True)
    brut = memory / "programmes_126-_brut.csv"
    brut.write_text(
        "Lieu : Mnémonique;Programme : Code;Programme : Libellé;Programme : Etat;Programme : Date de création;Programme : Droit : Personne : Responsable : NOM Prénom : Liste\n"
        "126-AAA;P1;Lib;A;2020-01-01;Doe|John\n",
        encoding="utf-8"
    )

    resp = client.post("/filtrage_seul", json={"filter": {}})
    assert resp.status_code == 200
    data = resp.get_json()
    assert data["status"] == "ok"
    # Le filtrage doit produire au moins un lien filtré
    assert any("filtered" in f["file_name"].lower() for f in data.get("fichiers_csv", []))
    mock_charger.assert_called_once()


# --------------------------------------------------------------------
# 3) /data-extractions — succès
# --------------------------------------------------------------------
@patch("backend.app_backend.charger_filtre", return_value={"monitoringLocation": "126-"})
# ^ Simule la présence d’un filtre sauvegardé valide
@patch("backend.app_backend.extract_ifremer_data", return_value=["https://exemple.tld/P1.zip", "https://exemple.tld/P2.zip"])
# ^ Simule l’API Ifremer qui renverrait 2 liens ZIP
@patch("backend.app_backend.requests.get")
# ^ On intercepte le téléchargement des ZIP pour les “écrire” localement
def test_data_extraction_success(mock_get, mock_extract, mock_charger, client):
    mock_resp = MagicMock()
    mock_resp.content = b"FAKEZIP"
    mock_resp.raise_for_status.return_value = None
    mock_get.return_value = mock_resp

    payload = {
        "programmes": ["P1", "P2"],
        "filter": {"name": "Mon filtre", "fields": ["id", "value"], "startDate": "2024-01-01", "endDate": "2024-12-31"}
    }
    resp = client.post("/data-extractions", json=payload)
    assert resp.status_code == 200
    data = resp.get_json()
    assert data["status"] == "ok"
    # Doit contenir deux fichiers renommés côté backend
    assert len(data.get("fichiers_zip", [])) == 2

    mock_charger.assert_called_once()
    mock_extract.assert_called_once()
    # requests.get a été appelé deux fois (2 ZIP)
    assert mock_get.call_count == 2


# --------------------------------------------------------------------
# 4) /data-extractions — aucun programme fourni
# --------------------------------------------------------------------
def test_data_extraction_no_programmes(client):
    resp = client.post("/data-extractions", json={"programmes": [], "filter": {}})
    assert resp.status_code == 400
    data = resp.get_json()
    assert data["status"] == "warning"
    assert "Aucun programme" in data["message"]


# --------------------------------------------------------------------
# 5) /last-programmes — succès (avec fichiers exposés)
# --------------------------------------------------------------------
def test_last_programmes_success(client, tmp_path, monkeypatch):
    from backend import app_backend as backend

    # On force un filtre “persisté”
    monkeypatch.setattr(backend, "LAST_FILTER_FILE", str(tmp_path / "memory" / "last_filter.json"))
    os.makedirs(tmp_path / "memory", exist_ok=True)
    (tmp_path / "memory" / "last_filter.json").write_text(
        json.dumps({"monitoringLocation": "126-"}), encoding="utf-8"
    )

    # On fabrique un CSV filtré qui sera relu et converti en JSON
    filt = tmp_path / "memory" / "programmes_126-_filtered.csv"
    os.makedirs(tmp_path / "memory", exist_ok=True)
    filt.write_text(
        "Lieu : Mnémonique;Programme : Code;Programme : Libellé;Programme : Etat;Programme : Date de création;Programme : Droit : Personne : Responsable : NOM Prénom : Liste\n"
        "126-AAA;P1;Lib;A;2020-01-01;Doe|John\n",
        encoding="utf-8"
    )

    # On remappe aussi MEMORY_DIR vers notre tmp
    monkeypatch.setattr(backend, "MEMORY_DIR", str(tmp_path / "memory"))

    resp = client.get("/last-programmes")
    assert resp.status_code == 200
    data = resp.get_json()
    assert data["status"] in ("ok", "empty")
    # Si ok → au moins 1 programme
    if data["status"] == "ok":
        assert len(data.get("programmes", [])) >= 1
