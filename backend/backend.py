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
    fichiers_zip = extract_ifremer_data(programmes)

    print("\nTous les fichiers téléchargés :")
    for f in fichiers_zip:
        print(" -", f)

    # Renvoie un JSON de confirmation à Angular
    return jsonify({
        "status": "ok",
        "programmes_recus": programmes,
        "fichiers_zip": fichiers_zip
    }), 200

if __name__ == '__main__':
    app.run(debug=True)
