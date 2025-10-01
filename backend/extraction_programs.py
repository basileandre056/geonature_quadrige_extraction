# extraction_programs.py
import os
import time
import requests
from gql import gql, Client
from gql.transport.requests import RequestsHTTPTransport

def extract_programs(filter_data: dict,
                    graphql_url="https://quadrige-core.ifremer.fr/graphql/public",
                    access_token = "2L7BiaziVfbd9iLhhhaq6MiWRKGwJrexUmR183GgiJx4:CA8375B7CF45E83F3B637FE97F8DA0F6263120AA9D58C6888A32111C766B054C:1|D6YumLYYbW2wWLoiFkGx++l1psS6BxzHCB5zm2mJRivNlAppnQOVWOZOX+y1C66pkFOxzvADjh7JT9yy2PwsAg==",
                    output_dir="output_programs"):
    """
    Lance une extraction de programmes et retourne directement l’URL CSV fournie par Ifremer.
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
