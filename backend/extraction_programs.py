# extraction_programs.py
import os
import time
import requests
import pandas as pd
from gql import gql, Client
from gql.transport.requests import RequestsHTTPTransport

def extract_programs(filter_data: dict,
                    graphql_url="https://quadrige-core.ifremer.fr/graphql/public",
                    access_token="2L7BiaziVfbd9iLhhhaq6MiWRKGwJrexUmR183GgiJx4:96A2A2AEDE6115BE9C462247461D26B317CD1602D73AE47408EDA70A04DCF21A:1|mhQMC3j5nad54G615G7NotJILcTeQv9KKbr8Fj+pn6Sk2T+pY3xIdNikUzIuJ3T43FeNKBYAlKnQNWpvhdKWBg==",
                    output_dir="output_programs"):
    """
    Lance une extraction de programmes et retourne l’URL CSV fournie par Ifremer.
    """

    # Initialisation du client GraphQL
    transport = RequestsHTTPTransport(
        url=graphql_url,
        verify=True,
        headers={"Authorization": f"token {access_token}"}
    )
    client = Client(transport=transport, fetch_schema_from_transport=False)

    # -------------------------
    # 1) Construire la requête executeProgramExtraction
    # -------------------------
    name = filter_data.get("name", "Extraction Programmes")
    monitoring_location = filter_data.get("monitoringLocation", "")
    if not monitoring_location:
      raise ValueError("Le champ 'monitoringLocation' est vide — requête annulée.")


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

    try:
        response = client.execute(query)
        task = response["executeProgramExtraction"]
        task_id = task["id"]
        print(f"[extract_programs] ✅ Extraction lancée (id={task_id}, nom={task['name']})")
    except Exception as e:
        raise RuntimeError(f"Erreur lors du lancement de l’extraction : {e}")

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
        print(f"[extract_programs] Statut : {status}")

        if status == "SUCCESS":
            file_url = extraction["fileUrl"]
            print(f"[extract_programs] ✅ Fichier disponible : {file_url}")
        elif status in ["PENDING", "RUNNING"]:
            time.sleep(2)
        else:
            raise RuntimeError(f"Tâche en erreur : {extraction.get('error')}")

    return file_url


#def download_csv(file_url: str, name="Programmes", output_dir="output_test") -> str:
#    """
#    Télécharge le CSV brut depuis l’URL Ifremer.
#    """
#    os.makedirs(output_dir, exist_ok=True)
#    file_path = os.path.join(output_dir, f"{name}_brut.csv")
#
#    r = requests.get(file_url)
#    r.raise_for_status()
#    with open(file_path, "wb") as f:
#        f.write(r.content)
#
#    print(f"[extract_programs] ✅ CSV brut téléchargé : {file_path}")
#    return file_path


def nettoyer_csv(input_path, output_path, monitoring_location_prefix: str):
    """
    Nettoie le CSV extrait depuis Ifremer pour ne garder que :
      - les lignes où 'Lieu : Mnémonique' commence par le préfixe monitoring_location_prefix
      - les colonnes importantes pour le frontend
      - une seule occurrence de chaque 'Programme : Code' (suppression des doublons)

    Le CSV final conserve 'Lieu : Mnémonique' pour traçabilité,
    mais cette colonne n’est pas renvoyée dans le JSON côté frontend.
    """
    # Lecture du CSV brut en chaine de caractères
    df = pd.read_csv(input_path, sep=";", dtype=str)

    # Vérification de la présence des colonnes requises
    colonnes_requises = [
        "Lieu : Mnémonique",
        "Programme : Code",
        "Programme : Libellé",
        "Programme : Etat",
        "Programme : Date de création",
        "Programme : Droit : Personne : Responsable : NOM Prénom : Liste"
    ]
    for col in colonnes_requises:
        if col not in df.columns:
            raise ValueError(f"❌ Colonne manquante dans le CSV extrait : {col}")

    # Filtrage dynamique sur la base du monitoring location
    df_filtre = df[df["Lieu : Mnémonique"].str.startswith(monitoring_location_prefix, na=False)]

    # Selection des colonnes d’intérêt
    df_reduit = df_filtre[[
        "Lieu : Mnémonique",
        "Programme : Code",
        "Programme : Libellé",
        "Programme : Etat",
        "Programme : Date de création",
        "Programme : Droit : Personne : Responsable : NOM Prénom : Liste"
    ]]
    # Suppression des doublons sur "Programme : Code"
    df_unique = df_reduit.drop_duplicates(subset=["Programme : Code"])

    # Sauvegarde du CSV nettoyé
    df_unique.to_csv(output_path, sep=";", index=False)

    print(f"[extract_programs] ✅ CSV filtré enregistré : {output_path}")



def csv_to_programmes_json(csv_path: str):
    """
    Charge un CSV filtré et le transforme en liste JSON de programmes.
    """
    if not os.path.exists(csv_path):
        return []

    df = pd.read_csv(csv_path, sep=";", dtype=str).fillna("")

    programmes = []
    for _, row in df.iterrows():
        programmes.append({
            "name": row.get("Programme : Code", ""),
            "checked": False,
            "libelle": row.get("Programme : Libellé", ""),
            "etat": row.get("Programme : Etat", ""),
            "startDate": row.get("Programme : Date de création", ""),
            "responsable": row.get("Programme : Droit : Personne : Responsable : NOM Prénom : Liste", "").replace("|", ", ")
        })
    return programmes


# -------------------------
# Mode test (remplace list_programs.py)
# -------------------------
if __name__ == "__main__":
    # Exemple de filtre
    filtre = {
        "name": "Programmes_126",
        "monitoringLocation": "126-"
    }

    # Étape 1 : extraction → récupère l’URL CSV
    file_url = extract_programs(filtre)

    # Étape 2 : téléchargement du brut
    csv_brut = download_csv(file_url, name=filtre["name"], output_dir="output_test")

    # Étape 3 : nettoyage
    csv_filtre = "output_test/Programmes_126_filtered.csv"
    nettoyer_csv(csv_brut, csv_filtre,filtre["monitoringLocation"])

    print(f"[MAIN] ✅ Extraction terminée, fichier filtré disponible : {csv_filtre}")
