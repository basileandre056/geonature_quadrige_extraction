import os
import tempfile
import pandas as pd
import pytest
from backend.extraction_programs import nettoyer_csv, csv_to_programmes_json
from backend.app_backend import app

# --------------------------------------------------------------------------------
# 🧩 Exemple de benchmark simple avec pytest-benchmark
# --------------------------------------------------------------------------------

@pytest.mark.benchmark(group="csv")
def test_nettoyer_csv_performance(benchmark):
    """
    Mesure la performance de la fonction nettoyer_csv sur un CSV de 10 000 lignes.
    """

    # 🔹 Création d’un CSV temporaire avec beaucoup de lignes
    tmp_input = tempfile.NamedTemporaryFile(delete=False, suffix=".csv")
    tmp_output = tempfile.NamedTemporaryFile(delete=False, suffix=".csv")

    df = pd.DataFrame({
        "Lieu : Mnémonique": ["126-AAA"] * 10000,
        "Programme : Code": [f"P{i}" for i in range(10000)],
        "Programme : Libellé": ["Test programme"] * 10000,
        "Programme : Etat": ["A"] * 10000,
        "Programme : Date de création": ["2020-01-01"] * 10000,
        "Programme : Droit : Personne : Responsable : NOM Prénom : Liste": ["Doe|John"] * 10000
    })
    df.to_csv(tmp_input.name, sep=";", index=False)

    # 🔸 Benchmark : exécution de la fonction à mesurer
    benchmark(nettoyer_csv, tmp_input.name, tmp_output.name, "126-")

    # 🔹 Vérification du résultat
    assert os.path.exists(tmp_output.name)
    df_out = pd.read_csv(tmp_output.name, sep=";")
    assert len(df_out) == 10000

@pytest.mark.benchmark(group="json")
def test_csv_to_programmes_json_performance(benchmark):
    """
    Mesure la performance de la conversion CSV → JSON (csv_to_programmes_json)
    """
    # 🔹 Création d’un CSV temporaire
    tmp_csv = tempfile.NamedTemporaryFile(delete=False, suffix=".csv")

    df = pd.DataFrame({
        "Lieu : Mnémonique": ["126-AAA"] * 5000,
        "Programme : Code": [f"P{i}" for i in range(5000)],
        "Programme : Libellé": ["Test"] * 5000,
        "Programme : Etat": ["A"] * 5000,
        "Programme : Date de création": ["2020-01-01"] * 5000,
        "Programme : Droit : Personne : Responsable : NOM Prénom : Liste": ["Doe|John"] * 5000
    })
    df.to_csv(tmp_csv.name, sep=";", index=False)

    # 🔸 Benchmark
    result = benchmark(csv_to_programmes_json, tmp_csv.name)

    # 🔹 Vérifications basiques
    assert isinstance(result, list)
    assert len(result) == 5000
    assert "name" in result[0]

