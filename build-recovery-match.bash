#!/bin/bash

# Vérifier que l'environnement et le type de base de données sont fournis comme arguments
if [ -z "$1" ] || [ -z "$2" ]; then
  echo "Usage: $0 <environment> <database_type>"
  echo "Environments: dev, prod, test"
  echo "Database types: mysql, dynamodb"
  exit 1
fi

# Récupérer les arguments
ENVIRONMENT=$1
DB_TYPE=$2

# Définir le répertoire de fichiers .env
ENV_DIR="./env/$ENVIRONMENT"

# Vérifier si le répertoire existe
if [ ! -d "$ENV_DIR" ]; then
  echo "Erreur: Le répertoire d'environnement $ENV_DIR n'existe pas."
  exit 1
fi

# Sélectionner le fichier .env en fonction du type de base de données
ENV_FILE="$ENV_DIR/.env.$DB_TYPE.sh"

# Vérifier si le fichier existe
if [ ! -f "$ENV_FILE" ]; then
  echo "Erreur: Le fichier d'environnement $ENV_FILE n'existe pas."
  exit 1
fi

# Charger les variables d'environnement depuis le fichier sélectionné
export $(grep -v '^#' "$ENV_FILE" | xargs)

# Construire l'image Docker en utilisant les variables d'environnement et les arguments de build
docker build \
  --build-arg DB_TYPE=$DB_TYPE \
  --build-arg DB_HOST=$DB_HOST \
  --build-arg DB_PORT=$DB_PORT \
  --build-arg DB_USER=$DB_USER \
  --build-arg DB_PASS=$DB_PASS \
  --build-arg DB_NAME=$DB_NAME \
  --build-arg AWS_REGION=$AWS_REGION \
  --build-arg AWS_ACCESS_KEY_ID=$AWS_ACCESS_KEY_ID \
  --build-arg AWS_SECRET_ACCESS_KEY=$AWS_SECRET_ACCESS_KEY \
  --build-arg DYNAMODB_TABLE=$DYNAMODB_TABLE \
  -t recovery-match-hall-e:$ENVIRONMENT-$DB_TYPE .


# Exécuter le conteneur avec le fichier d'environnement
docker run --name recovery-match-hall-e-$ENVIRONMENT --env-file "$ENV_FILE" -p 8080:80 recovery-match-hall-e:$ENVIRONMENT-$DB_TYPE
