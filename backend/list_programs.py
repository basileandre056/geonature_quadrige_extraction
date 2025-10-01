import os
import time
import requests
import pandas as pd
from gql import gql, Client
from gql.transport.requests import RequestsHTTPTransport


def extract_programs_test(
    name="Programmes_126",
    monitoring_location="126-",
    graphql_url="https://quadrige-core.ifremer.fr/graphql/public",
    access_token = "2L7BiaziVfbd9iLhhhaq6MiWRKGwJrexUmR183GgiJx4:CA8375B7CF45E83F3B637FE97F8DA0F6263120AA9D58C6888A32111C766B054C:1|D6YumLYYbW2wWLoiFkGx++l1psS6BxzHCB5zm2mJRivNlAppnQOVWOZOX+y1C66pkFOxzvADjh7JT9yy2PwsAg==",
    output_dir="output_test"
):
    """
    Teste executeProgramExtraction avec un critère monitoringLocation
    et télécharge le CSV brut.
    """
    # Initialisation client GraphQL
    transport = RequestsHTTPTransport(
        url=graphql_url,
        verify=True,
        headers={"Authorization": f"token {access_token}"}
    )
    client = Client(transport=transport, fetch_schema_from_transport=False)

    # -------------------------
    # 1) Lancer l’extraction
    # -------------------------
    query = gql(f"""
    query {{
      executeProgramExtraction(
        filter: {{
          name: "{name}"
          criterias: [{{
            monitoringLocation: {{ searchText: "{monitoring_location}" }}
          }}]
        }}
      ) {{
        id
        name
        startDate
        status
      }}
    }}
    """)

    print(f"[TEST] 🚀 Lancement extraction executeProgramExtraction avec monitoringLocation='{monitoring_location}'")
    response = client.execute(query)
    task = response["executeProgramExtraction"]
    task_id = task["id"]
    print(f"[TEST] ✅ Extraction lancée : id={task_id}, nom={task['name']}")

    # -------------------------
    # 2) Suivi du statut
    # -------------------------
    status_query = gql("""
    query getStatus($id: Int!) {
      getExtraction(id: $id) {
        status
        fileUrl
        error
      }
    }
    """)

    file_url = None
    while file_url is None:
        status_resp = client.execute(status_query, variable_values={"id": task_id})
        extraction = status_resp["getExtraction"]
        status = extraction["status"]
        print(f"[TEST] Statut = {status}")

        if status == "SUCCESS":
            file_url = extraction["fileUrl"]
            print(f"[TEST] ✅ Fichier CSV disponible : {file_url}")

        elif status in ["PENDING", "RUNNING"]:
            time.sleep(2)
        else:
            raise RuntimeError(f"[TEST] ❌ Erreur extraction : {extraction.get('error')}")

    # -------------------------
    # 3) Télécharger le CSV brut
    # -------------------------
    os.makedirs(output_dir, exist_ok=True)
    file_name = f"{name}_brut.csv"
    file_path = os.path.join(output_dir, file_name)

    r = requests.get(file_url)
    r.raise_for_status()
    with open(file_path, "wb") as f:
        f.write(r.content)

    print(f"[TEST] ✅ CSV brut téléchargé : {file_path}")
    return file_path


def nettoyer_csv(input_path, output_path):
    """
    Nettoie le CSV pour ne garder que :
      - les lignes où Lieu : Mnémonique commence par '126'
      - uniquement la colonne Programme : Code
      - suppression des doublons
    """
    df = pd.read_csv(input_path, sep=";", dtype=str)

    # Vérifier que les colonnes attendues existent
    if "Lieu : Mnémonique" not in df.columns or "Programme : Code" not in df.columns:
        raise ValueError("❌ Colonnes attendues manquantes dans le CSV extrait")

    df_filtre = df[df["Lieu : Mnémonique"].str.startswith("126", na=False)]
    df_codes = df_filtre[["Programme : Code"]].drop_duplicates()

    df_codes.to_csv(output_path, sep=";", index=False)
    print(f"[TEST] ✅ CSV filtré enregistré : {output_path}")


if __name__ == "__main__":
    # Étape 1 : extraction et téléchargement du brut
    csv_brut = extract_programs_test()

    # Étape 2 : nettoyage et sauvegarde du filtré
    csv_filtre = "output_test/Programmes_126_filtered.csv"
    nettoyer_csv(csv_brut, csv_filtre)

    print(f"[MAIN] ✅ Extraction terminée, fichier filtré disponible : {csv_filtre}")
