# backend.py
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

    # Appel de ta fonction avec la liste de programmes reçue
    download_links = extract_ifremer_data(programmes)

    print("\nTous les fichiers téléchargés :")
    for l in download_links:
        print(" -", l)

    # Renvoie un JSON de confirmation à Angular
    return jsonify({
    "status": "ok",
    "programmes_recus": programmes,
    "fichiers_zip": [{"name": os.path.basename(url), "url": url} for url in download_links]
}), 200

if __name__ == '__main__':
    app.run(debug=True)
