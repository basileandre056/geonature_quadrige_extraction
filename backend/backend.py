from flask import Flask, request, jsonify
from flask_cors import CORS
from extractProgm_p import extract_ifremer_data

app = Flask(__name__)
CORS(app)

@app.route('/extractions', methods=['POST'])
def recevoir_extractions():
    data = request.json
    programmes: list[str] = data.get('programmes', [])
    print("Programmes reçus :", programmes)

    # Cas 1 : aucune donnée envoyée 400 (Bad Request)
    if not programmes:
        return jsonify({
            "status": "warning",
            "type": "validation",  #  ajout d'un type
            "message": "Aucun programme reçu par le backend"
        }), 400

    download_links = extract_ifremer_data(programmes)

    # Cas 2 : aucun fichier trouvé  404 (Not Found)
    if not download_links:
        return jsonify({
            "status": "warning",
            "type": "not_found",  #  ajout d'un type
            "message": "Les programmes sélectionnés ne correspondent pas aux critères du filtre"
        }), 404

    # Cas 3 : tout est OK 200
    print("\nTous les fichiers téléchargés :")
    for l in download_links:
        print(" -", l)

    return jsonify({
        "status": "ok",
        "programmes_recus": programmes,
        "fichiers_zip": [
            {"programme": p, "url": url} for p, url in zip(programmes, download_links)
        ]
    }), 200

if __name__ == '__main__':
    app.run(debug=True)
