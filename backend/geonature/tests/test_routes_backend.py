# backend/geonature/tests/test_routes_backend.py
import pytest
from backend import OUTPUT_DIR, SAVE_DIR

@pytest.mark.usefixtures("client")
class TestBackendRoutes:
    def test_program_extraction_ok(self, monkeypatch, client, tmp_path):
        # Arrange
        monkeypatch.setattr("backend.OUTPUT_DIR", tmp_path)
        monkeypatch.setattr("backend.SAVE_DIR", tmp_path)
        monkeypatch.setattr("backend.extract_programs", lambda f: "http://fake-url.com/test.csv")
        monkeypatch.setattr("backend.requests.get", lambda url: type("Resp", (), {
            "content": b"a;b\n1;2",
            "raise_for_status": lambda self=None: None
        })())
        monkeypatch.setattr("backend.nettoyer_csv", lambda i, o, m: open(o, "w").write("mocked"))
        monkeypatch.setattr("backend.sauvegarder_derniere_version", lambda i, s: None)
        monkeypatch.setattr("backend.csv_to_programmes_json", lambda p: [{"code": "mock"}])

        # Act
        response = client.post("/program-extraction", json={"filter": {"monitoringLocation": "126-"}})

        # Assert
        assert response.status_code == 200
        assert response.json["status"] == "ok"
        assert "Programmes_126-_filtered.csv" in response.json["fichiers_csv"][0]["file_name"]

    def test_filtrage_seul_sans_filtre(self, client):
        # Act
        resp = client.get("/filtrage_seul")
        # Assert
        assert resp.status_code == 400
        assert "Aucun filtre" in resp.json["message"]

    def test_data_extractions_no_programs(self, client):
        # Act
        resp = client.post("/data-extractions", json={"programmes": []})
        # Assert
        assert resp.status_code == 400
        assert resp.json["status"] == "warning"

    def test_data_extractions_no_filter_saved(self, monkeypatch, client):
        monkeypatch.setattr("backend.charger_filtre", lambda: {})
        # Act
        resp = client.post("/data-extractions", json={"programmes": ["P1"], "filter": {}})
        # Assert
        assert resp.status_code == 400
        assert "Aucune monitoringLocation" in resp.json["message"]

    def test_last_programmes_empty(self, monkeypatch, client):
        monkeypatch.setattr("backend.csv_to_programmes_json", lambda p: [])
        resp = client.get("/last-programmes")
        assert resp.status_code == 200
        assert resp.json["status"] == "empty"
