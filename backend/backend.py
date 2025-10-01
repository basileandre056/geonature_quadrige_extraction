from flask import Flask, request, jsonify
from flask_cors import CORS
from extraction_data import extract_ifremer_data
from extraction_programs import extract_programs


app = Flask(__name__)
CORS(app)


@app.route('/program-extraction', methods=['POST'])
def recevoir_program_extraction():
    data = request.json
    program_filter = data.get('filter', {})
    print("\n[BACKEND] ➡️ Requête reçue sur /program-extraction")
    print("[BACKEND] Filtre reçu :", program_filter)

    try:
        # Lancer l’extraction (retourne l’URL Ifremer du CSV)
        file_url = extract_programs(program_filter)
        print(f"[BACKEND]  URL CSV reçue depuis Ifremer : {file_url}")
    except Exception as e:
        print(f"[BACKEND]  Erreur lors de l’extraction : {e}")
        return jsonify({
            "status": "warning",
            "type": "not_found",
            "message": str(e)
        }), 500

    # Générer un nom de fichier explicite basé sur le filtre
    filter_name = program_filter.get("name", "extraction").replace(" ", "_")
    file_name = f"programmes_{filter_name}.csv"
    print(f"[BACKEND]  Nom du fichier généré : {file_name}")

    # Construire la réponse envoyée au frontend
    response = {
        "status": "ok",
        "filtre_recu": program_filter,  # pour debug côté frontend
        "fichiers_csv": [
            {"file_name": file_name, "url": file_url}
        ]
    }

    print("[BACKEND]  Réponse envoyée au frontend :", response)
    return jsonify(response), 200






@app.route('/extractions', methods=['POST'])
def recevoir_extractions():
    data = request.json
    programmes: list[str] = data.get('programmes', [])
    filter_data: dict = data.get('filter', {})

    print("Programmes reçus :", programmes)
    print("Filtre reçu :", filter_data)

    # Cas 1 : aucune donnée envoyée 400 (Bad Request)
    if not programmes:
        return jsonify({
            "status": "warning",
            "type": "validation",
            "message": "Aucun programme reçu par le backend"
        }), 400

    # Lancer l’extraction avec les filtres
    download_links = extract_ifremer_data(programmes, filter_data)

    # Cas 2 : aucun fichier trouvé 404 (Not Found)
    if not download_links:
        return jsonify({
            "status": "warning",
            "type": "not_found",
            "message": "Les programmes sélectionnés ne correspondent pas aux critères du filtre"
        }), 404

    # Cas 3 : tout est OK 200
    print("\nTous les fichiers téléchargés :")
    for l in download_links:
        print(" -", l)

    return jsonify({
        "status": "ok",
        "programmes_recus": programmes,
        "filtre_recu": filter_data,  #  pour debug côté frontend
        "fichiers_zip": [
            {"file_name": p, "url": url} for p, url in zip(programmes, download_links)
        ]
    }), 200


if __name__ == '__main__':
    app.run(debug=True)
