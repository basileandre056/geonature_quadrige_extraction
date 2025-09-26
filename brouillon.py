for p in programmes:
        print(f"Programme : {p}")

        # Lancer l'extraction
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

        # Suivi du statut
        status_query = gql("""
        query getStatus($id: Int!) {
            getExtraction(id: $id) {
                status
                fileUrl
                error
            }
        }
        """)
