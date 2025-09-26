from gql import gql

def build_extraction_query(programme: str, filter_data: dict):
    """
    Construit une requête GraphQL executeResultExtraction en fonction
    du programme et des paramètres envoyés par le frontend.

    Args:
        programme (str): l'identifiant du programme
        filter_data (dict): dictionnaire contenant
            - name (str)
            - fields (list[str])
            - startDate (str, format AAAA-MM-JJ)
            - endDate (str, format AAAA-MM-JJ)
            - monitoringLocation (str)

    Returns:
        gql: requête GraphQL prête à exécuter
    """

    name = filter_data.get("name", "").lower()
    fields = filter_data.get("fields", [])
    start_date = filter_data.get("startDate", "")
    end_date = filter_data.get("endDate", "")
    monitoring_location = filter_data.get("monitoringLocation", "")

    # Formater les champs (pas de guillemets car GraphQL attend des identifiants)
    formatted_fields = ",\n                        ".join(fields)

    query = f"""
    query {{
        executeResultExtraction(
            filter: {{
                name: "{name}"
                fields: [
                    {formatted_fields}
                ]
                periods: [{{ startDate: "{start_date}", endDate: "{end_date}" }}]
                mainFilter: {{
                    program: {{ ids: ["{programme}"] }},
                    monitoringLocation: {{ text: "{monitoring_location}" }}
                }}
            }}
        ) {{
            id
            name
            startDate
            status
        }}
    }}
    """

    return gql(query)
