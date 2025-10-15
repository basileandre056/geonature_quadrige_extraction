# backend/geonature/tests/test_backend_utils.py
import os
import json
import pandas as pd
from backend import sauvegarder_filtre, charger_filtre
from extraction_programs import (
    csv_to_programmes_json,
    sauvegarder_derniere_version,
)
from build_query import build_extraction_query


def test_sauvegarder_et_charger_filtre(tmp_path):
    # Arrange
    filtre = {"monitoringLocation": "126-"}
    os.chdir(tmp_path)

    # Act
    sauvegarder_filtre(filtre)
    loaded = charger_filtre()

    # Assert
    assert loaded == filtre


def test_csv_to_programmes_json(tmp_path):
    # Arrange
    csv_path = tmp_path / "test.csv"
    df = pd.DataFrame([
        {
            "Programme : Code": "P1",
            "Programme : Libellé": "Libellé test",
            "Programme : Etat": "A",
            "Programme : Date de création": "2020-01-01",
            "Programme : Droit : Personne : Responsable : NOM Prénom : Liste": "Durand|Marie"
        }
    ])
    df.to_csv(csv_path, sep=";", index=False)

    # Act
    result = csv_to_programmes_json(str(csv_path))

    # Assert
    assert len(result) == 1
    assert result[0]["libelle"] == "Libellé test"
    assert result[0]["responsable"] == "Durand, Marie"


def test_sauvegarder_derniere_version(tmp_path):
    # Arrange
    src = tmp_path / "input.csv"
    src.write_text("a;b\n1;2")

    # Act
    dest = sauvegarder_derniere_version(str(src), save_dir=tmp_path)

    # Assert
    assert os.path.exists(dest)
    assert "last_programmes_updates.csv" in dest


def test_build_extraction_query():
    # Arrange
    filtre = {
        "fields": ["id", "name"],
        "startDate": "2024-01-01",
        "endDate": "2024-12-31",
        "monitoringLocation": "126-"
    }

    # Act
    query = build_extraction_query("P1", filtre)
    query_str = str(query)

    # Assert
    assert "executeResultExtraction" in query_str
    assert "126-" in query_str
    assert "2024-12-31" in query_str
