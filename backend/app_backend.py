import os
import requests
from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
from extraction_data import extract_ifremer_data
from extraction_programs import extract_programs, nettoyer_csv, csv_to_programmes_json
import json

app = Flask(__name__)
CORS(app)

# -------------------------
# Dossiers robustes (toujours relatifs au fichier backend.py)
# -------------------------

# chemin du dossier "backend/"
BASE_DIR = os.path.dirname(os.path.abspath(__file__))

MEMORY_DIR = os.path.join(BASE_DIR, "memory")
os.makedirs(MEMORY_DIR, exist_ok=True)
LAST_FILTER_FILE = os.path.join(MEMORY_DIR, "last_filter.json")


def nettoyer_dossier_memory():
    """
    Supprime tous les anciens fichiers programmes dans MEMORY_DIR,
    sauf le fichier de filtre JSON (last_filter.json).
    """
    try:
        for fichier in os.listdir(MEMORY_DIR):
            chemin = os.path.join(MEMORY_DIR, fichier)
            if fichier != "last_filter.json" and os.path.isfile(chemin):
                os.remove(chemin)
                print(f"[BACKEND] 🧹 Fichier supprimé : {fichier}")
    except Exception as e:
        print(f"[BACKEND] ⚠️ Erreur nettoyage MEMORY_DIR : {e}")


def sauvegarder_filtre(program_filter: dict):
    os.makedirs(MEMORY_DIR, exist_ok=True)
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

        # 🧹 Étape 2 : nettoyage de la mémoire (on garde uniquement last_filter.json)
        nettoyer_dossier_memory()

        # Étape 3 : télécharger le CSV brut
        brut_path = os.path.join(MEMORY_DIR, f"programmes_{monitoring_location}_brut.csv")
        r = requests.get(file_url)
        r.raise_for_status()
        os.makedirs(MEMORY_DIR, exist_ok=True)
        with open(brut_path, "wb") as f:
            f.write(r.content)
        print(f"[BACKEND] ✅ CSV brut sauvegardé : {brut_path}")

        # Étape 3 : filtrer et sauvegarder le CSV
        filtre_path = os.path.join(MEMORY_DIR, f"programmes_{monitoring_location}_filtered.csv")
        nettoyer_csv(brut_path, filtre_path, monitoring_location)


        # Étape 4 : conversion JSON
        programmes_json = csv_to_programmes_json(filtre_path)

    except Exception as e:
        print(f"[BACKEND] Erreur extraction/filtrage : {e}")
        return jsonify({"status": "error", "message": str(e)}), 500

    base_url = "http://localhost:5000/memory"

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
        brut_path = os.path.join(MEMORY_DIR, f"programmes_{monitoring_location}_brut.csv")
        filtre_path = os.path.join(MEMORY_DIR, f"programmes_{monitoring_location}_filtered.csv")

        if not os.path.exists(brut_path):
            return jsonify({
                "status": "ok",
                "fichiers_csv": [],
                "programmes": [],
                "message": "⚠️ Aucun CSV brut trouvé pour ce filtre. Veuillez d’abord extraire les programmes."
            }), 200

        # Relancer le filtrage et sauvegarder
        nettoyer_csv(brut_path, filtre_path, monitoring_location)

        programmes_json = csv_to_programmes_json(filtre_path)

    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500

    return jsonify({
        "status": "ok",
        "fichiers_csv": [
            {"file_name": f"Programmes_{monitoring_location}_filtered.csv", "url": f"http://localhost:5000/memory/programmes_{monitoring_location}_filtered.csv"}
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
# 4) Servir les fichiers sauvegardés
# -------------------------
@app.route('/memory/<path:filename>', methods=['GET'])
def download_memory_file(filename):
    return send_from_directory(MEMORY_DIR, filename)

# -------------------------
# 5) Récupérer la dernière liste de programmes en JSON
# -------------------------
@app.route('/last-programmes', methods=['GET'])
def get_last_programmes():
    last_filter = charger_filtre()
    monitoring_location = last_filter.get("monitoringLocation", "")
    base_url = "http://localhost:5000/memory"

    # chemins vers les fichiers
    filtre_path = os.path.join(MEMORY_DIR, f"programmes_{monitoring_location}_filtered.csv")
    brut_path = os.path.join(MEMORY_DIR, f"programmes_{monitoring_location}_brut.csv")

    programmes = csv_to_programmes_json(filtre_path) if os.path.exists(filtre_path) else []

    fichiers_csv = []
    if os.path.exists(brut_path):
        fichiers_csv.append({
            "file_name": os.path.basename(brut_path),
            "url": f"{base_url}/{os.path.basename(brut_path)}"
        })
    if os.path.exists(filtre_path):
        fichiers_csv.append({
            "file_name": os.path.basename(filtre_path),
            "url": f"{base_url}/{os.path.basename(filtre_path)}"
        })

    status = "ok" if programmes else "empty"
    message = "Aucun programme sauvegardé" if not programmes else f"{len(programmes)} programmes trouvés"

    return jsonify({
        "status": status,
        "message": message,
        "programmes": programmes,
        "monitoringLocation": monitoring_location,
        "fichiers_csv": fichiers_csv
    }), 200

# -------------------------
# Lancer le serveur Flask
if __name__ == '__main__':
    print("➡️ BASE_DIR =", BASE_DIR)
    print("➡️ MEMORY_DIR =", MEMORY_DIR)
    app.run(debug=True)

