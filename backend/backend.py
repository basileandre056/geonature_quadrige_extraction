from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
from extraction_data import extract_ifremer_data
from extraction_programs import extract_programs, nettoyer_csv
import os

app = Flask(__name__)
CORS(app)

OUTPUT_DIR = os.path.join(os.getcwd(), "output_test")

@app.route('/program-extraction', methods=['POST'])
def recevoir_program_extraction():
    data = request.json
    program_filter = data.get('filter', {})
    print("\n[BACKEND] ➡️ Requête reçue sur /program-extraction")
    print("[BACKEND] Filtre reçu :", program_filter)

    try:
        # Étape 1 : lancer l’extraction Ifremer (URL CSV brut)
        file_url = extract_programs(program_filter)
        print(f"[BACKEND] URL CSV reçue depuis Ifremer : {file_url}")

        # Étape 2 : télécharger le CSV brut
        import requests
        brut_path = os.path.join(OUTPUT_DIR, "Programmes_126_brut.csv")
        r = requests.get(file_url)
        r.raise_for_status()
        os.makedirs(OUTPUT_DIR, exist_ok=True)
        with open(brut_path, "wb") as f:
            f.write(r.content)
        print(f"[BACKEND] ✅ CSV brut sauvegardé : {brut_path}")

        # Étape 3 : filtrer le CSV
        filtre_path = os.path.join(OUTPUT_DIR, "Programmes_126_filtered.csv")
        nettoyer_csv(brut_path, filtre_path)

    except Exception as e:
        print(f"[BACKEND] Erreur extraction/filtrage : {e}")
        return jsonify({
            "status": "warning",
            "type": "not_found",
            "message": str(e)
        }), 500

    # Réponse envoyée au frontend
    response = {
        "status": "ok",
        "fichiers_csv": [
            {"file_name": "Programmes_126_filtered.csv", "url": f"http://localhost:5000/output_test/Programmes_126_filtered.csv"}
        ]
    }
    return jsonify(response), 200


@app.route('/filtrage_seul', methods=['GET'])
def relancer_filtrage():
    """
    Relance uniquement le nettoyage sur le dernier brut CSV
    """
    try:
        brut_path = os.path.join(OUTPUT_DIR, "Programmes_126_brut.csv")
        filtre_path = os.path.join(OUTPUT_DIR, "Programmes_126_filtered.csv")
        nettoyer_csv(brut_path, filtre_path)
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500

    return jsonify({
        "status": "ok",
        "fichiers_csv": [
            {"file_name": "Programmes_126_filtered.csv", "url": f"http://localhost:5000/output_test/Programmes_126_filtered.csv"}
        ],
        "message": "Filtrage relancé avec succès"
    }), 200


@app.route('/output_test/<path:filename>', methods=['GET'])
def download_output_file(filename):
    return send_from_directory(OUTPUT_DIR, filename)

if __name__ == '__main__':
    app.run(debug=True)
