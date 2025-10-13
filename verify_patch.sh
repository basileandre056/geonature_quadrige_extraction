#!/bin/bash
# ===================================================
# Script de vérification des patchs RIE pour GeoNature
# ===================================================

set -e

echo "🔍 Vérification des patchs anti-TAXREF et INPN dans GeoNature..."

echo
echo "1️⃣ Vérification du patch INPN (HABREF)..."
if grep -q "open_remote_file" /home/geonature/geonature/backend/venv/lib/python3.11/site-packages/pypn_habref_api/migrations/versions/46e91e738845_insert_inpn_data_in_ref_habitats_schema.py 2>/dev/null; then
    echo "❌ Le patch INPN (HABREF_50.zip) n'a PAS été appliqué."
else
    echo "✅ Patch INPN appliqué (aucun téléchargement HABREF détecté)."
fi

echo
echo "2️⃣ Vérification du patch TAXREF v15–v16..."
if grep -q "TAXREF download disabled" /home/geonature/geonature/backend/venv/lib/python3.11/site-packages/apptax/taxonomie/commands/taxref_v15_v16.py 2>/dev/null; then
    echo "✅ Patch TAXREF v15–v16 appliqué."
else
    echo "❌ Patch TAXREF v15–v16 manquant."
fi

echo
echo "3️⃣ Vérification du patch TAXREF v18..."
TAXREF_V18_PATH="/home/geonature/geonature/backend/geonature/migrations/versions/taxref/da3172cecdb1_taxref_v18.py"
if grep -q "TAXREF download skipped due to RIE proxy" "$TAXREF_V18_PATH" 2>/dev/null; then
    echo "✅ Patch TAXREF v18 appliqué correctement."
else
    echo "❌ Patch TAXREF v18 manquant ou incorrect."
    echo "   Vérifie que le fichier existe : $TAXREF_V18_PATH"
fi

echo
echo "4️⃣ Vérification du script 03b_populate_db.sh..."
if grep -q "TAXREF import disabled" /home/geonature/geonature/install/03b_populate_db.sh 2>/dev/null; then
    echo "✅ Script 03b_populate_db.sh modifié pour ignorer TAXREF."
else
    echo "❌ Le script 03b_populate_db.sh n’a pas été modifié."
fi

echo
echo "🎯 Résumé rapide :"
grep -q "❌" <(bash "$0" --summary 2>/dev/null) 2>/dev/null || echo "✅ Tous les patchs RIE sont correctement appliqués."
echo
echo "Vérification terminée ✅"
