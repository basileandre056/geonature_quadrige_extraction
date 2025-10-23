import os
import json
import pytest

# On va patcher des symboles utilisés DANS backend.app_backend
# → Important : on patche l’endroit où c’est importé/utilisé.
from flask import Flask

# --------------------------------------------------------------------
# Ce fichier couvre les cas d’erreur côté backend :
# - échec d’extraction des programmes
# - /data-extractions sans filtre sauvegardé
# - erreur interne lors de l’extraction de données
# - /filtrage_seul sans monitoringLocation
# --------------------------------------------------------------------

from unittest.mock import patch, MagicMock


@pytest.fixture()
def client():
    """Client Flask de test : on importe l'app ici pour bénéficier des patches."""
    # Import tardif : garantit que les patches s’appliquent avant l’instanciation
    from backend import app_backend as backend
    backend.app.config["TESTING"] = True
    with backend.app.test_client() as c:
        yield c


# --------------------------------------------------------------------
# 1) /program-extraction — cas d’erreur
# --------------------------------------------------------------------
@patch("backend.app_backend.extract_programs", side_effect=RuntimeError("Boom!"))
# ^ On remplace la fonction extract_programs utilisée par app_backend par un mock
#   qui LÈVE une RuntimeError. On simule ainsi un échec du service Ifremer.
def test_program_extraction_failure(mock_extract_programs, client):
    # mock_extract_programs est le Mock injecté par @patch (param ajouté à la fin)
    payload = {"filter": {"monitoringLocation": "126-", "name": "test"}}

    resp = client.post("/program-extraction", json=payload)
    assert resp.status_code == 500  # l’API renvoie une 500 sur erreur interne
    data = resp.get_json()
    assert data["status"] == "error"
    # Vérifie que notre mock a bien été appelé une fois
    mock_extract_programs.assert_called_once()


# --------------------------------------------------------------------
# 2) /data-extractions — pas de filtre sauvegardé
# --------------------------------------------------------------------
@patch("backend.app_backend.charger_filtre", return_value={})
# ^ On force charger_filtre() à renvoyer {}, donc pas de monitoringLocation.
def test_data_extraction_no_filter(mock_charger, client):
    payload = {"programmes": ["P1"], "filter": {"fields": ["id"]}}
    resp = client.post("/data-extractions", json=payload)
    assert resp.status_code == 400
    data = resp.get_json()
    assert data["status"] == "error"
    assert "monitoringLocation" in data["message"]
    mock_charger.assert_called_once()


# --------------------------------------------------------------------
# 3) /data-extractions — erreur interne
# --------------------------------------------------------------------
@patch("backend.app_backend.charger_filtre", return_value={"monitoringLocation": "126-"})
# ^ Cette fois, on simule un filtre sauvegardé valide
@patch("backend.app_backend.extract_ifremer_data", side_effect=RuntimeError("Service KO"))
# ^ L’appel réseau/GraphQL est simulé en erreur
def test_data_extraction_internal_error(mock_extract, mock_charger, client):
    # ⚠️ Ordre des paramètres : le patch le plus haut → param le plus à droite
    payload = {"programmes": ["P1"], "filter": {"fields": ["id"]}}
    resp = client.post("/data-extractions", json=payload)
    assert resp.status_code == 500
    data = resp.get_json()
    assert data["status"] == "error"
    mock_charger.assert_called_once()
    mock_extract.assert_called_once()


# --------------------------------------------------------------------
# 4) /filtrage_seul — aucun filtre connu
# --------------------------------------------------------------------
@patch("backend.app_backend.charger_filtre", return_value={})
def test_filtrage_seul_no_filter(mock_charger, client):
    resp = client.post("/filtrage_seul", json={"filter": {}})
    assert resp.status_code == 400
    data = resp.get_json()
    assert data["status"] == "error"
    mock_charger.assert_called_once()
