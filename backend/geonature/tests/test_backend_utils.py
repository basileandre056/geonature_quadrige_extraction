import os
import pandas as pd
from backend.app_backend import sauvegarder_filtre, charger_filtre
from backend.extraction_programs import (
    nettoyer_csv,
    csv_to_programmes_json,
    sauvegarder_derniere_version,
)
from backend.build_query import build_extraction_query


# =============================
# Tests des fonctions utilitaires
# =============================

def test_sauvegarder_et_charger_filtre(tmp_path):
    """Test de sauvegarde et lecture du filtre JSON."""
    from backend import app_backend
    app_backend.SAVE_DIR = str(tmp_path)
    app_backend.LAST_FILTER_FILE = os.path.join(str(tmp_path), "last_filter.json")

    filtre = {"monitoringLocation": "126-"}
    sauvegarder_filtre(filtre)
    result = charger_filtre()

    assert result == filtre
    assert os.path.exists(app_backend.LAST_FILTER_FILE)


def test_nettoyer_csv(tmp_path):
    """Teste le nettoyage du CSV."""
    input_csv = tmp_path / "input.csv"
    output_csv = tmp_path / "output.csv"

    df = pd.DataFrame([
        {
            "Lieu : Mnémonique": "126-AAA",
            "Programme : Code": "P1",
            "Programme : Libellé": "Test",
            "Programme : Etat": "A",
            "Programme : Date de création": "2020-01-01",
            "Programme : Droit : Personne : Responsable : NOM Prénom : Liste": "Durand|Jean"
        },
        {
            "Lieu : Mnémonique": "999-BBB",
            "Programme : Code": "P2",
            "Programme : Libellé": "Autre",
            "Programme : Etat": "B",
            "Programme : Date de création": "2021-02-02",
            "Programme : Droit : Personne : Responsable : NOM Prénom : Liste": "Dupont|Paul"
        }
    ])
    df.to_csv(input_csv, sep=";", index=False)

    nettoyer_csv(input_csv, output_csv, "126-")

    filtered = pd.read_csv(output_csv, sep=";")

    #Le fichier de sortie existe.
    assert len(filtered) == 1

    #Seule la ligne dont "Lieu : Mnémonique" commence par "126-" est conservée.
    #assert "999-BBB" not in filtered["Lieu : Mnémonique"].values
    assert "P1" in filtered["Programme : Code"].values


def test_csv_to_programmes_json(tmp_path):
    """Conversion CSV → JSON."""
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

    result = csv_to_programmes_json(str(csv_path))

    # Vérifie que la liste JSON résultante a la bonne taille et les bons champs.
    assert len(result) == 1
    assert result[0]["responsable"] == "Durand, Marie"


def test_sauvegarder_derniere_version(tmp_path):
    """Copie du CSV filtré."""
    src = tmp_path / "src.csv"
    src.write_text("a;b\n1;2")
    dest = sauvegarder_derniere_version(str(src), save_dir=tmp_path)

    #Vérifie que le fichier existe bien à la bonne destination.
    assert os.path.exists(dest)
    assert "last_programmes_updates.csv" in dest


def test_build_extraction_query_construction():
    """Validation de la requête GraphQL générée."""
    filtre = {
        "fields": ["id", "name"],
        "startDate": "2024-01-01",
        "endDate": "2024-12-31",
        "monitoringLocation": "126-",
    }

    query = build_extraction_query("P1", filtre)
    query_str = str(query)

    #Vérifie que les éléments clés sont présents dans la requête.
    assert "executeResultExtraction" in query_str
    assert "126-" in query_str
    assert "2024-12-31" in query_str
    assert "P1" in query_str
