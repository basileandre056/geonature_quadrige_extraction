import pytest
from unittest.mock import patch, MagicMock
from backend.app_backend import app


@pytest.fixture(scope="module")
def client():
    """Crée un client Flask utilisable dans les benchmarks."""
    with app.test_client() as client:
        yield client


# -------------------------------------------------------------------
# 🧪 /program-extraction — mock complet (aucun réseau réel)
# -------------------------------------------------------------------
@patch("backend.app_backend.requests.get")  # ⬅️ mock du téléchargement CSV
@patch("backend.app_backend.extract_programs", return_value="https://fakeurl.test/programmes.csv")
@patch("backend.app_backend.nettoyer_csv", return_value="/tmp/programmes_clean.csv")
@patch("backend.app_backend.csv_to_programmes_json", return_value=[{"name": "P1", "libelle": "Test"}])
@pytest.mark.benchmark(group="routes")
def test_program_extraction_route_mocked(mock_json, mock_clean, mock_extract, mock_requests, benchmark, client):
    """
    Benchmark complet du endpoint /program-extraction.
    Tous les appels réseau et traitements sont simulés.
    """

    # 👉 On simule requests.get() pour renvoyer un "faux" CSV
    mock_response = MagicMock()
    mock_response.status_code = 200
    mock_response.content = "Lieu : Mnémonique;Programme : Code;Programme : Libellé\n126-AAA;P1;Lib\n".encode("utf-8")
    mock_requests.return_value = mock_response

    payload = {
        "filter": {"monitoringLocation": "126-", "name": "test_perf"}
    }

    result = benchmark(lambda: client.post("/program-extraction", json=payload))

    assert result.status_code == 200, result.get_data(as_text=True)
    data = result.get_json()
    assert "programmes" in data
    assert isinstance(data["programmes"], list)


# -------------------------------------------------------------------
# 🧪 /data-extractions — mock complet (aucun appel Ifremer)
# -------------------------------------------------------------------
@patch("backend.app_backend.extract_ifremer_data", return_value=["https://fakeurl.test/data.zip"])
@patch("backend.app_backend.requests.get")
@pytest.mark.benchmark(group="routes")
def test_data_extraction_route_mocked(mock_requests, mock_extract_data, benchmark, client):
    """
    Benchmark de la route /data-extractions avec mock de l’extraction Ifremer et du téléchargement ZIP.
    """

    # simulateur pour requests.get()
    mock_response = MagicMock()
    mock_response.status_code = 200
    mock_response.content = b"Fake ZIP content"
    mock_requests.return_value = mock_response

    # ⚠️ programmes doit être à la racine du JSON
    payload = {
        "programmes": ["P1", "P2"],
        "filter": {"monitoringLocation": "126-"}
    }

    result = benchmark(lambda: client.post("/data-extractions", json=payload))

    assert result.status_code == 200, result.get_data(as_text=True)
    data = result.get_json()
    assert "fichiers_zip" in data
    assert len(data["fichiers_zip"]) > 0


# -------------------------------------------------------------------
# 🧪 /last-programmes — test réel (pas de mock)
# -------------------------------------------------------------------
@pytest.mark.benchmark(group="routes")
def test_last_programmes_route_real(benchmark, client):
    """
    Benchmark réel : lit les derniers programmes stockés localement (pas de mock).
    """
    result = benchmark(lambda: client.get("/last-programmes"))
    assert result.status_code == 200
    data = result.get_json()
    assert "programmes" in data
