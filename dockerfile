########################################
# Étape deps : installe les deps prod
########################################
FROM node:24-alpine AS deps
WORKDIR /app

# Copie uniquement les manifests pour maximiser le cache
COPY package*.json ./

RUN npm ci --omit=dev  &&  npm cache clean --force

########################################
# Étape runtime : image finale légère
########################################
FROM node:24-alpine AS runner
ENV NODE_ENV=production
WORKDIR /app


# Copie node_modules prod et le code
COPY --from=deps /app/node_modules ./node_modules
COPY . .


# Par défaut, lance le script de chargement
# (Tu peux basculer sur ["npm","run","load-data"] si tu préfères)
CMD ["npm","run","load-data"]
