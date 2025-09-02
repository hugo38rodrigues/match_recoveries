# syntax=docker/dockerfile:1.6

############################
# Étape deps/build
############################
FROM node:24-slim AS builder
WORKDIR /app

# Copie manifeste + lock (npm ci = reproductible)
COPY package.json package-lock.json ./

# Reçoit le token GitHub Packages
ARG GITHUB_TOKEN

RUN set -e; \
  { echo "registry=https://registry.npmjs.org/"; \
    echo "@hugo38rodrigues:registry=https://npm.pkg.github.com/"; \
    echo "//npm.pkg.github.com/:_authToken=${GITHUB_TOKEN}"; } > /root/.npmrc; \
  npm ci --omit=dev; \
  rm -f /root/.npmrc; \
  npm cache clean --force

# Copie le reste du code (après install pour profiter du cache)
COPY . .

############################
# Étape runtime légère
############################
FROM node:24-slim AS runner
ENV NODE_ENV=production
WORKDIR /app

# Copie node_modules + code
COPY --from=builder /app ./

# (Optionnel) user non-root si besoin
# USER node


# Démarrage (adapte selon ton app)
# pour l'API:
CMD ["npm", "run","load-data"]
