########################################
# Étape deps : installe les deps prod
########################################
FROM node:20-alpine AS deps
WORKDIR /app

# Copie uniquement les manifests pour maximiser le cache
COPY package*.json ./

RUN npm ci --omit=dev  &&  npm cache clean --force

########################################
# Étape runtime : image finale légère
########################################
FROM node:20-alpine AS runner
ENV NODE_ENV=production
WORKDIR /app

# Crée un user non-root (UID/GID 1001) et ré répertoires
RUN addgroup -S nodejs -g 1001 && adduser -S node -G nodejs -u 1001

# Copie node_modules prod et le code
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Droits au user non-root
USER 1001

# Par défaut, lance le script de chargement
# (Tu peux basculer sur ["npm","run","load-data"] si tu préfères)
CMD ["npm","run","load-data"]
