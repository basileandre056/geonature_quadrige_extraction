import os
import time
import requests
from gql import gql, Client
from gql.transport.requests import RequestsHTTPTransport


def extract_ifremer_data(programmes):
    # -------------------------
    # 1) Connexion GraphQL
    # -------------------------
    graphql_url="https://quadrige-core.ifremer.fr/graphql/public"
    access_token="2L7BiaziVfbd9iLhhhaq6MiWRKGwJrexUmR183GgiJx4:CA8375B7CF45E83F3B637FE97F8DA0F6263120AA9D58C6888A32111C766B054C:1|D6YumLYYbW2wWLoiFkGx++l1psS6BxzHCB5zm2mJRivNlAppnQOVWOZOX+y1C66pkFOxzvADjh7JT9yy2PwsAg=="


    # Initialisation client GraphQL
    transport = RequestsHTTPTransport(
        url=graphql_url,
        verify=True,
        headers={"Authorization": f"token {access_token}"}
    )
    client = Client(transport=transport, fetch_schema_from_transport=False)
    # -------------------------
    # 2) Boucle sur les programmes
    # -------------------------
    zip_files = []
    os.makedirs("outputs", exist_ok=True)

    for p in programmes:
        print(f"Programme : {p}")

        # -------------------------
        # 1) Lancer l'extraction
        # -------------------------

        # 126-P = Mnémonique des lieux de la Réunion


        execute_query = gql(f"""
        query {{
        executeResultExtraction(
            filter: {{
            name: "{p.lower()}"
            fields: [
            MONITORING_LOCATION_LABEL,
            MONITORING_LOCATION_NAME,
            MONITORING_LOCATION_MIN_LATITUDE,
            MONITORING_LOCATION_MAX_LATITUDE,
            MONITORING_LOCATION_MIN_LONGITUDE,
            MONITORING_LOCATION_MAX_LONGITUDE,
            SURVEY_DATE,
            MEASUREMENT_TAXON_GROUP_NAME,
            MEASUREMENT_INPUT_TAXON_NAME,
            SURVEY_NB_INDIVIDUALS,
            MEASUREMENT_NUMERICAL_VALUE,
            MEASUREMENT_ANALYST_DEPARTMENT_NAME,
            MEASUREMENT_RECORDER_DEPARTMENT_NAME
        ]
        periods: [{{ startDate: "1980-01-01", endDate: "2025-12-01" }}]
        mainFilter: {{
            program: {{ ids: ["{p}"] }},
            monitoringLocation: {{ text: "126-" }}
            }}
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
            response = client.execute(execute_query)
            task_id = response['executeResultExtraction']['id']
            print(f"   Extraction lancée (id: {task_id})")
        except Exception as e:
            print(f"   Erreur lors de l'extraction {p} : {e}")
            continue

        # -------------------------
        # 3) Suivi du statut
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
            status_response = client.execute(status_query, variable_values={"id": task_id})

            extraction = status_response['getExtraction']
            status = extraction['status']
            print(f"    Statut: {status}")

            if status == "SUCCESS":
                file_url = extraction['fileUrl']
                print(f"     Fichier disponible : {file_url}")
            elif status in ["PENDING", "RUNNING"]:
                time.sleep(2)
            else:
                print(f"     Tâche en erreur : {extraction.get('error')}")
                break

        if not file_url:
            continue

        # -------------------------
        # 4) Télécharger le ZIP uniquement
        # -------------------------
        zip_path = os.path.join("outputs", os.path.basename(file_url))
        r = requests.get(file_url)
        with open(zip_path, "wb") as f:
            f.write(r.content)
        print(f"     ZIP téléchargé : {zip_path}")

        zip_files.append(zip_path)

    return zip_files


# -------------------------
# Exemple d’utilisation
# -------------------------
if __name__ == "__main__":
    programmes = ["AAMP_BENTHOS_FAU","EFFET-RESERVE_LAREUNION_BELT_POISSON",
                  "EFFET-RESERVE_LAREUNION_PA_POISSON",
                  "EI_RUN_BASSIN_GRANDE-ANSE_BELT_POISSON",
                  "EI_RUN_BEAUFONDS_PCS_POISSON",
                  "EI_RUN_BOUCAN_PCS_POISSON",
                  "EI_RUN_CILAOS_BELT_POISSON",
                  "EI_RUN_COR-SEARAM_BELT_POISSON",
                  "EI_RUN_COR-SEARAM_PA_POISSONS",
                  "EI_RUN_GRAND-PORT_BELT_INVERT",
                  "EI_RUN_GRAND-PORT_BELT_POISSON",
                  "EI_RUN_KELONIA_BELT_POISSON",
                  "EI_RUN_NRL_PCS_POISSON",
                  "GCRMN_LAREUNION_BELT_INVERT",
                  "UTOPIAN_RUN_COR-SEARAM_PA_POISSONS",
                  "UTOPIAN_RUN_COR-SEARAM_HOLOTHURIES",
                  "RESEAUAMP_SXM_BELT_POISSONS",
                  "RESEAUAMP_SBH_QUADRAT_OURSINS"]

    fichiers_zip = extract_ifremer_data(programmes)
    print("\nTous les fichiers téléchargés :")
    for f in fichiers_zip:
        print(" -", f)
