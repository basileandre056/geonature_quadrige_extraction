import requests

url = "https://quadrige-core.ifremer.fr/graphql/public"
query = {"query": "{ __typename }"}

try:
    r = requests.post(url, json=query, timeout=10)
    print("Status:", r.status_code)
    print("Body:", r.text)
except Exception as e:
    print("Erreur:", e)
