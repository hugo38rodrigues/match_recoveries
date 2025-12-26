############################
# Étape deps/build
############################
FROM node:24-slim AS builder
WORKDIR /app

# Copie manifeste + lock (npm ci = reproductible)
COPY ./src/package*.json ./

# Reçoit le token GitHub Packages
ARG GITHUB_TOKEN

# Install dependencies avec authentification GitHub Packages
RUN --mount=type=secret,id=github_token \
    set -e && \
    if [ -n "${GITHUB_TOKEN}" ]; then \
    echo "registry=https://registry.npmjs.org/" > /root/.npmrc && \
    echo "@hugo38rodrigues:registry=https://npm.pkg.github.com/" >> /root/.npmrc && \
    echo "//npm.pkg.github.com/:_authToken=${GITHUB_TOKEN}" >> /root/.npmrc; \
    fi && \
    npm ci --omit=dev --quiet && \
    rm -f /root/.npmrc && \
    npm cache clean --force

# Copie le reste du code (après install pour profiter du cache)
COPY ./src .

############################
# Étape runtime légère
############################
FROM node:24-slim AS runner

# Variables d'environnement
ENV NODE_ENV=production \
    NODE_OPTIONS="--enable-source-maps" \
    TZ=UTC

WORKDIR /app

# Installer uniquement les outils nécessaires
RUN apt-get update && \
    apt-get install -y --no-install-recommends dumb-init && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

# Copie node_modules + code depuis builder
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app .

# User non-root pour sécurité
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nodejs && \
    chown -R nodejs:nodejs /app

USER nodejs

# Démarrage avec dumb-init pour gérer les signaux proprement
ENTRYPOINT ["dumb-init", "--"]
CMD ["npm", "run", "load-data"]