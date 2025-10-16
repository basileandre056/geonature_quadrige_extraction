import os
import pytest
from backend.app_backend import app


# ============================
# Tests de routes
# ============================

def test_route_last_programmes_vide(client, tmp_savedir):
    """Route /last-programmes sans fichiers sauvegardés."""
    response = client.get("/last-programmes")
    assert response.status_code == 200
    data = response.get_json()
    assert "status" in data
    assert data["status"] in ("empty", "ok")


def test_route_filtrage_seul_sans_filtre(client, tmp_savedir):
    """Route /filtrage_seul sans filtre enregistré."""
    response = client.get("/filtrage_seul")
    assert response.status_code in (200, 400)
    assert response.is_json
    data = response.get_json()
    assert "status" in data
