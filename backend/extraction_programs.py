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
    Exécute une extraction de programmes avec un filtre donné
    et télécharge le CSV généré dans output_dir.
    """
    # Init client
    transport = RequestsHTTPTransport(
        url=graphql_url,
        verify=True,
        headers={"Authorization": f"token {access_token}"}
    )
    client = Client(transport=transport, fetch_schema_from_transport=False)

    # Construire dynamiquement la requête GraphQL en fonction du filtre
    query = f"""
    query {{
      executeProgramExtraction(
        filter: {{
          name: "{filter_data.get("name","Programmes")}"
          criterias: [{{
            monitoringLocation: {{ searchText: "{filter_data.get("monitoringLocation","")}" }}
          }}]
        }}
      ){{
        id
        name
        startDate
        status
      }}
    }}
    """
    execute_query = gql(query)

    # 1) Lancer extraction
    response = client.execute(execute_query)
    task = response["executeProgramExtraction"]
    task_id = task["id"]

    # 2) Poller jusqu’à ce que le fichier soit dispo
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

        if status == "SUCCESS":
            file_url = extraction["fileUrl"]
        elif status in ["PENDING", "RUNNING"]:
            time.sleep(2)
        else:
            raise RuntimeError(f"Tâche en erreur : {extraction.get('error')}")

    # 3) Télécharger le CSV
    os.makedirs(output_dir, exist_ok=True)
    csv_path = os.path.join(output_dir, os.path.basename(file_url))
    r = requests.get(file_url)
    r.raise_for_status()
    with open(csv_path, "wb") as f:
        f.write(r.content)

    return csv_path
