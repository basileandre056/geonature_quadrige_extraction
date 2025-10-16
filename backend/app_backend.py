import os
import requests
from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
from extraction_data import extract_ifremer_data
from extraction_programs import extract_programs, nettoyer_csv, csv_to_programmes_json, sauvegarder_derniere_version
import json

app = Flask(__name__)
CORS(app)

# -------------------------
# Dossiers robustes (toujours relatifs au fichier backend.py)
# -------------------------
BASE_DIR = os.path.dirname(os.path.abspath(__file__))  # chemin du dossier "backend/"
OUTPUT_DIR = os.path.join(BASE_DIR, "output_test")
SAVE_DIR = os.path.join(BASE_DIR, "saved_programmes")
LAST_FILTER_FILE = os.path.join(SAVE_DIR, "last_filter.json")


def sauvegarder_filtre(program_filter: dict):
    os.makedirs(SAVE_DIR, exist_ok=True)
    with open(LAST_FILTER_FILE, "w", encoding="utf-8") as f:
        json.dump(program_filter, f)
    print(f"[BACKEND] 💾 Filtre sauvegardé dans {LAST_FILTER_FILE}")

def charger_filtre() -> dict:
    if os.path.exists(LAST_FILTER_FILE):
        with open(LAST_FILTER_FILE, "r", encoding="utf-8") as f:
            return json.load(f)
    return {}





# -------------------------
# 1) Extraction + filtrage programmes
# -------------------------

@app.route('/program-extraction', methods=['POST'])
def recevoir_program_extraction():
    data = request.json
    program_filter = data.get('filter', {})
    monitoring_location = program_filter.get("monitoringLocation", "")

    print("\n[BACKEND] ➡️ Requête reçue sur /program-extraction")
    print("[BACKEND] Filtre reçu :", program_filter)

    try:
        # Étape 1 : lancer l’extraction Ifremer
        file_url = extract_programs(program_filter)
        print(f"[BACKEND] URL CSV reçue depuis Ifremer : {file_url}")

        # Sauvegarder le filtre utilisé
        sauvegarder_filtre(program_filter)

        # Étape 2 : télécharger le CSV brut
        brut_path = os.path.join(OUTPUT_DIR, f"Programmes_{monitoring_location}_brut.csv")
        r = requests.get(file_url)
        r.raise_for_status()
        os.makedirs(OUTPUT_DIR, exist_ok=True)
        with open(brut_path, "wb") as f:
            f.write(r.content)
        print(f"[BACKEND] ✅ CSV brut sauvegardé : {brut_path}")

        # Étape 3 : filtrer le CSV
        filtre_path = os.path.join(OUTPUT_DIR, f"Programmes_{monitoring_location}_filtered.csv")
        nettoyer_csv(brut_path, filtre_path, monitoring_location)

        # Étape 4 : sauvegarde last_programmes.csv
        sauvegarder_derniere_version(filtre_path, SAVE_DIR)

        # Étape 5 : conversion JSON
        programmes_json = csv_to_programmes_json(filtre_path)

    except Exception as e:
        print(f"[BACKEND] Erreur extraction/filtrage : {e}")
        return jsonify({"status": "error", "message": str(e)}), 500

    base_url = "http://localhost:5000/output_test"

    return jsonify({
        "status": "ok",
        "fichiers_csv": [
            {"file_name": f"Programmes_{monitoring_location}_brut.csv", "url": f"{base_url}/Programmes_{monitoring_location}_brut.csv"},
            {"file_name": f"Programmes_{monitoring_location}_filtered.csv", "url": f"{base_url}/Programmes_{monitoring_location}_filtered.csv"}
        ],
        "programmes": programmes_json
    }), 200



# -------------------------
# 2) Relancer uniquement le filtrage
# -------------------------
@app.route('/filtrage_seul', methods=['POST', 'GET'])
def relancer_filtrage():
    if request.method == "POST":
        data = request.json or {}
        program_filter = data.get('filter', {})
    else:
        program_filter = {}

    # si aucun filtre envoyé → on recharge le dernier sauvegardé
    if not program_filter:
        program_filter = charger_filtre()

    monitoring_location = program_filter.get("monitoringLocation", "")

    if not monitoring_location:
        return jsonify({
            "status": "error",
            "message": "Aucun filtre trouvé (ni reçu, ni sauvegardé)."
        }), 400

    try:
        brut_path = os.path.join(OUTPUT_DIR, f"Programmes_{monitoring_location}_brut.csv")
        filtre_path = os.path.join(OUTPUT_DIR, f"Programmes_{monitoring_location}_filtered.csv")

        if not os.path.exists(brut_path):
            return jsonify({
                "status": "ok",
                "fichiers_csv": [],
                "programmes": [],
                "message": "⚠️ Aucun CSV brut trouvé pour ce filtre. Veuillez d’abord extraire les programmes."
            }), 200

        nettoyer_csv(brut_path, filtre_path, monitoring_location)
        sauvegarder_derniere_version(filtre_path, SAVE_DIR)

        programmes_json = csv_to_programmes_json(filtre_path)

    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500

    return jsonify({
        "status": "ok",
        "fichiers_csv": [
            {"file_name": f"Programmes_{monitoring_location}_filtered.csv", "url": f"http://localhost:5000/output_test/Programmes_{monitoring_location}_filtered.csv"}
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
    filter_data_front: dict = data.get('filter', {})

    print("[BACKEND] ➡️ Requête reçue sur /data-extractions")
    print("[BACKEND] Programmes reçus :", programmes)
    print("[BACKEND] Filtre reçu depuis le frontend :", filter_data_front)

    # 1️⃣ Vérifier qu'on a bien des programmes
    if not programmes:
        return jsonify({
            "status": "warning",
            "type": "validation",
            "message": "Aucun programme reçu par le backend"
        }), 400

    # 2️⃣ Charger le dernier filtre sauvegardé (pour récupérer la vraie monitoringLocation)
    last_filter = charger_filtre()
    monitoring_location = last_filter.get("monitoringLocation", "")

    if not monitoring_location:
        return jsonify({
            "status": "error",
            "message": "Aucune monitoringLocation trouvée dans le dernier filtre sauvegardé."
        }), 400

    # 3️⃣ Fusionner les infos : on garde le reste du filtre du frontend (périodes, champs, etc.)
    # mais on remplace la localisation par celle du dernier filtre
    filter_data = dict(filter_data_front)  # copie du filtre frontend
    filter_data["monitoringLocation"] = monitoring_location

    print(f"[BACKEND] ✅ Localisation remplacée par celle du filtre des derniers programmes importés : {monitoring_location}")

    # 4️⃣ Lancer l’extraction
    try:
        download_links = extract_ifremer_data(programmes, filter_data)
    except Exception as e:
        print(f"[BACKEND] ❌ Erreur lors de l’extraction des données : {e}")
        return jsonify({"status": "error", "message": str(e)}), 500

    # 5️⃣ Vérifier la réponse
    if not download_links:
        return jsonify({
            "status": "warning",
            "type": "not_found",
            "message": "Les programmes sélectionnés ne correspondent pas aux critères du filtre"
        }), 404

    return jsonify({
        "status": "ok",
        "programmes_recus": programmes,
        "filtre_utilise": filter_data,
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

    # On récupère le dernier filtre enregistré pour afficher la localisation
    last_filter = charger_filtre()
    monitoring_location = last_filter.get("monitoringLocation", "")

    if not programmes:
        return jsonify({
            "status": "empty",
            "message": "Aucun programme sauvegardé",
            "programmes": [],
            "monitoringLocation": monitoring_location
        }), 200

    return jsonify({
        "status": "ok",
        "programmes": programmes,
        "monitoringLocation": monitoring_location
    }), 200



if __name__ == '__main__':
    print("➡️ BASE_DIR =", BASE_DIR)
    print("➡️ OUTPUT_DIR =", OUTPUT_DIR)
    print("➡️ SAVE_DIR =", SAVE_DIR)
    app.run(debug=True)
