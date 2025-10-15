# backend/geonature/tests/fixtures.py
import pytest
from backend import app

@pytest.fixture(scope="session")
def client():
    """
    Crée un client Flask pour tester les routes sans lancer le serveur.
    """
    app.config["TESTING"] = True
    with app.test_client() as client:
        yield client
