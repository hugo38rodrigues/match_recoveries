#!/bin/bash

if [ $# -eq 0 ]; then
  echo "No parameters provided. Please specify an environment using --bdd=<environment>."
  exit 1
fi

bdd_name=""

for param in "$@"; do
  case $param in
    --bdd=*)
      bdd_name="${param#*=}"
      ;;
    --dev=true)
      dev_mode=true
      ;;
    *)
      echo "Unknown parameter: $param"
      exit 1
      ;;
  esac
done
echo -e "##################################\n"

echo "Data retrieval from API for Hall-e database"

echo -e "\n##################################"
# Execute database creation based on bdd_name
case $bdd_name in
  dynamo)
    echo "Loading environment for DynamoDB"
    if [ -f "./env/.env.dynamodb.sh" ]; then
      source "./env/.env.dynamodb.sh"
      npm run load-data
    else
      echo "Environment file for DynamoDB not found!"
      exit 1
    fi
    ;;
  mysql)
    echo "Loading environment for MySQL"
    if [ -f "./env/dev/.env.mysql.sh" ]; then
      source "./env/dev/.env.mysql.sh"
      npm run load-data
    else
      echo "Environment file for MySQL not found!"
      exit 1
    fi
    ;;
  mongo)
    echo "Loading environment for MongoDB"
    if [ -f "./env/dev/.env.mongo.sh" ]; then
      source "./env/dev/.env.mongo.sh"
      npm run load-data
    else
      echo "Environment file for MongoDB not found!"
      exit 1
    fi
    ;;
  *)
    echo "Unknown configuration value: $bdd_name"
    exit 1
    ;;
esac
