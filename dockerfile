# Étape 1 : Build
FROM node:24 AS builder

# Crée un répertoire de travail
WORKDIR /app

# Copie les fichiers nécessaires
COPY ./package*.json ./

# Injecte les variables d'environnement si nécessaire (ex. via ARG)
ARG NODE_ENV=production
ENV NODE_ENV=${NODE_ENV}

# Installe les dépendances, y compris le repo privé
RUN npm install

# Copie le reste de l'app
COPY . .

# Étape 2 : Image finale (plus légère)
FROM node:24-slim

WORKDIR /app

# Copie uniquement les fichiers nécessaires depuis l'étape de build
COPY --from=builder /app ./

# Commande de démarrage
CMD ["npm", "run","load-data"]
