"""
📊 Benchmark des routes réelles (non mockées)
=================================================
Ce fichier exécute les vraies routes Flask pour mesurer :
- le temps d'extraction de programmes depuis Ifremer
- le temps de filtrage
- le temps de récupération des derniers programmes
- le temps d'extraction des données ZIP
"""

import pytest
import json
from backend.app_backend import app


@pytest.fixture(scope="module")
def client():
    """Crée un client Flask pour exécuter les routes réelles."""
    app.testing = True
    with app.test_client() as client:
        yield client


# 🔹 Configuration d’un filtre de test réel
TEST_FILTER = {
    "name": "Benchmark_Ifremer",
    "monitoringLocation": "048-",  # 💡 tu peux changer pour une autre localisation
}


@pytest.mark.benchmark(group="real_routes")
def test_real_program_extraction(benchmark, client):
    """
    Mesure le temps complet de la route /program-extraction.
    Lance une vraie requête Ifremer.
    """
    payload = {"filter": TEST_FILTER}

    def run_extraction():
        response = client.post("/program-extraction", json=payload)
        assert response.status_code == 200
        data = json.loads(response.data)
        assert data["status"] == "ok"
        return data

    result = benchmark(run_extraction)

    print(f"\n✅ Extraction réelle terminée : {len(result['programmes'])} programmes reçus")


@pytest.mark.benchmark(group="real_routes")
def test_real_filtrage_seul(benchmark, client):
    """
    Teste uniquement la route /filtrage_seul, après extraction.
    """
    def run_filtrage():
        response = client.get("/filtrage_seul")
        assert response.status_code == 200
        return json.loads(response.data)

    result = benchmark(run_filtrage)
    print(f"\n✅ Filtrage seul : {len(result['programmes'])} programmes")


@pytest.mark.benchmark(group="real_routes")
def test_real_last_programmes(benchmark, client):
    """
    Teste la récupération de la dernière liste de programmes.
    """
    def run_last():
        response = client.get("/last-programmes")
        assert response.status_code == 200
        return json.loads(response.data)

    result = benchmark(run_last)
    print(f"\n✅ Derniers programmes trouvés : {len(result['programmes'])}")


@pytest.mark.benchmark(group="real_routes")
def test_real_data_extraction(benchmark, client):
    """
    Teste l’extraction des données ZIP depuis Ifremer.
    ⚠️ Ce test peut être long selon la taille des programmes.
    """
    payload = {
        "programmes": ["REPHY"],  # test pour REPHY ici
        "filter": {"startDate": "2020-01-01", "endDate": "2025-01-01"}
    }

    def run_data():
        response = client.post("/data-extractions", json=payload)
        assert response.status_code in (200, 404)
        return json.loads(response.data)

    result = benchmark(run_data)
    print(f"\n✅ Extraction données terminée avec statut : {result['status']}")
