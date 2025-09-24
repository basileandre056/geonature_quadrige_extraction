# backend.py
import os
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

    download_links = extract_ifremer_data(programmes)

    print("\nTous les fichiers téléchargés :")
    for l in download_links:
        print(" -", l)

    return jsonify({
        "status": "ok",
        "programmes_recus": programmes,
        "fichiers_zip": [{"programme": p, "url": url} for p, url in zip(programmes, download_links)]
    }), 200

if __name__ == '__main__':
    app.run(debug=True)
