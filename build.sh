#!/bin/bash
# =========================================================
# Script de build GeoNature Docker
# Auteur : Basile André
# Description : construit l'image Docker GeoNature avec ou sans cache
# =========================================================

IMAGE_NAME="geonature-rie"
DOCKERFILE="Dockerfile"

# ---------------------------------------------------------
# Aide
# ---------------------------------------------------------
if [ "$1" = "-h" ] || [ "$1" = "--help" ]; then
    echo "Usage: ./build.sh [option]"
    echo
    echo "Options disponibles :"
    echo "  normal    -> Build standard (avec cache)"
    echo "  nocache   -> Build complet (désactive le cache)"
    echo "  clean     -> Nettoie toutes les images et conteneurs avant build"
    echo
    echo "Exemples :"
    echo "  ./build.sh normal"
    echo "  ./build.sh nocache"
    echo "  ./build.sh clean"
    exit 0
fi

# ---------------------------------------------------------
# Vérification Docker
# ---------------------------------------------------------
if ! command -v docker &> /dev/null; then
    echo "Erreur : Docker n'est pas installé ou n'est pas dans le PATH."
    exit 1
fi

# ---------------------------------------------------------
# Mode sélectionné
# ---------------------------------------------------------
MODE=${1:-normal}

case "$MODE" in
    normal)
        echo "🟢 Build standard avec cache..."
        sudo docker build -t $IMAGE_NAME:latest -f $DOCKERFILE .
        ;;
    
    nocache)
        echo "🔵 Build complet sans cache..."
        sudo docker build --no-cache -t $IMAGE_NAME:latest -f $DOCKERFILE .
        ;;

    clean)
        echo "🧹 Nettoyage complet du cache, des images et conteneurs..."
        sudo docker system prune -a -f
        echo "🔁 Reconstruction complète sans cache..."
        sudo docker build --no-cache -t $IMAGE_NAME:latest -f $DOCKERFILE .
        ;;

    *)
        echo "❌ Option invalide : $MODE"
        echo "Utilise ./build.sh --help pour voir les options disponibles."
        exit 1
        ;;
esac

# ---------------------------------------------------------
# Résumé
# ---------------------------------------------------------
if [ $? -eq 0 ]; then
    echo "✅ Build terminé avec succès !"
    echo "Image disponible : $IMAGE_NAME:latest"
else
    echo "❌ Erreur pendant la construction de l'image."
    exit 1
fi
