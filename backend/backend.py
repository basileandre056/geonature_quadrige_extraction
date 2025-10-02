import os
import requests
from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
from extraction_data import extract_ifremer_data
from extraction_programs import extract_programs, nettoyer_csv, sauvegarder_derniere_version, csv_to_programmes_json

app = Flask(__name__)
CORS(app)

# -------------------------
# Dossiers robustes (toujours relatifs au fichier backend.py)
# -------------------------
BASE_DIR = os.path.dirname(os.path.abspath(__file__))  # chemin du dossier "backend/"
OUTPUT_DIR = os.path.join(BASE_DIR, "output_test")
SAVE_DIR = os.path.join(BASE_DIR, "saved_programmes")


# -------------------------
# 1) Extraction + filtrage programmes
# -------------------------
@app.route('/program-extraction', methods=['POST'])
def recevoir_program_extraction():
    data = request.json
    program_filter = data.get('filter', {})
    print("\n[BACKEND] ➡️ Requête reçue sur /program-extraction")
    print("[BACKEND] Filtre reçu :", program_filter)

    try:
        # Étape 1 : lancer l’extraction Ifremer
        file_url = extract_programs(program_filter)
        print(f"[BACKEND] URL CSV reçue depuis Ifremer : {file_url}")

        # Étape 2 : télécharger le CSV brut
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

        # Étape 4 : sauvegarde last_programmes_updates.csv
        sauvegarder_derniere_version(filtre_path, SAVE_DIR)

        # Étape 5 : conversion JSON
        programmes_json = csv_to_programmes_json(filtre_path)

    except Exception as e:
        print(f"[BACKEND] Erreur extraction/filtrage : {e}")
        return jsonify({"status": "error", "message": str(e)}), 500

    return jsonify({
        "status": "ok",
        "fichiers_csv": [
            {"file_name": "Programmes_126_filtered.csv", "url": f"http://localhost:5000/output_test/Programmes_126_filtered.csv"}
        ],
        "programmes": programmes_json
    }), 200


# -------------------------
# 2) Relancer uniquement le filtrage
# -------------------------
@app.route('/filtrage_seul', methods=['GET'])
def relancer_filtrage():
    try:
        brut_path = os.path.join(OUTPUT_DIR, "Programmes_126_brut.csv")
        filtre_path = os.path.join(OUTPUT_DIR, "Programmes_126_filtered.csv")

        if not os.path.exists(brut_path):
            return jsonify({
                "status": "ok",
                "fichiers_csv": [],
                "programmes": [],
                "message": "⚠️ Aucun CSV brut trouvé. Veuillez d’abord extraire les programmes."
            }), 200

        nettoyer_csv(brut_path, filtre_path)
        sauvegarder_derniere_version(filtre_path, SAVE_DIR)

        programmes_json = csv_to_programmes_json(filtre_path)

    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500

    return jsonify({
        "status": "ok",
        "fichiers_csv": [
            {"file_name": "Programmes_126_filtered.csv", "url": f"http://localhost:5000/output_test/Programmes_126_filtered.csv"}
        ],
        "programmes": programmes_json,
        "message": "Filtrage relancé avec succès"
    }), 200


# -------------------------
# 3) Extraction des données (ZIP)
# -------------------------
@app.route('/data-extractions', methods=['POST'])
def recevoir_data_extractions():
    data = request.json
    programmes: list[str] = data.get('programmes', [])
    filter_data: dict = data.get('filter', {})

    print("[BACKEND] ➡️ Requête reçue sur /data-extractions")
    print("[BACKEND] Programmes reçus :", programmes)
    print("[BACKEND] Filtre reçu :", filter_data)

    if not programmes:
        return jsonify({
            "status": "warning",
            "type": "validation",
            "message": "Aucun programme reçu par le backend"
        }), 400

    download_links = extract_ifremer_data(programmes, filter_data)

    if not download_links:
        return jsonify({
            "status": "warning",
            "type": "not_found",
            "message": "Les programmes sélectionnés ne correspondent pas aux critères du filtre"
        }), 404

    return jsonify({
        "status": "ok",
        "programmes_recus": programmes,
        "filtre_recu": filter_data,
        "fichiers_zip": [
            {"file_name": p, "url": url} for p, url in zip(programmes, download_links)
        ]
    }), 200


# -------------------------
# 4) Servir les fichiers générés
# -------------------------
@app.route('/output_test/<path:filename>', methods=['GET'])
def download_output_file(filename):
    return send_from_directory(OUTPUT_DIR, filename)


# -------------------------
# 5) Servir les fichiers sauvegardés
# -------------------------
@app.route('/saved_programmes/<path:filename>', methods=['GET'])
def download_saved_file(filename):
    return send_from_directory(SAVE_DIR, filename)


# -------------------------
# 6) Récupérer la dernière liste de programmes en JSON
# -------------------------
@app.route('/last-programmes', methods=['GET'])
def get_last_programmes():
    csv_path = os.path.join(SAVE_DIR, "last_programmes_updates.csv")
    programmes = csv_to_programmes_json(csv_path)

    if not programmes:
        return jsonify({
            "status": "empty",
            "message": "Aucun programme sauvegardé",
            "programmes": []
        }), 200

    return jsonify({
        "status": "ok",
        "programmes": programmes
    }), 200


if __name__ == '__main__':
    print("➡️ BASE_DIR =", BASE_DIR)
    print("➡️ OUTPUT_DIR =", OUTPUT_DIR)
    print("➡️ SAVE_DIR =", SAVE_DIR)
    app.run(debug=True)
