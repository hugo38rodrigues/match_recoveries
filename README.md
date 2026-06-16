<div align="center">

# 🔄 Hall-E — Service de récupération des matchs 🎮

### *L'usine à données de Hall-E.*

Le service qui collecte en continu les matchs de jeux vidéo
et alimente la base que consomment l'API et l'app mobile.

![Node](https://img.shields.io/badge/Node.js-%3E%3D18-339933?logo=node.js&logoColor=white)
![Type](https://img.shields.io/badge/type-worker%20%2F%20cron-orange)
![Docker](https://img.shields.io/badge/Docker-ready-2496ED?logo=docker&logoColor=white)

</div>

---

## 🎉 Présentation

Le **Service de récupération des matchs** est un service back-end autonome qui tourne
en arrière-plan. À intervalle régulier, il **interroge des sources externes**
(programmes e-sport / streams), **normalise les matchs** récupérés, puis les
**enregistre en base** via le package partagé **`@hall-e/bdd`**.

Sans lui, pas de matchs à afficher : c'est lui qui garde Hall-E à jour. 🎮

### ✨ Ce qu'il fait

- ⏱️ **Récupération planifiée** — synchronisation automatique à intervalle régulier.
- 🧹 **Normalisation** — mise en forme cohérente des matchs et diffusions.
- 💾 **Persistance** — insertion / mise à jour en base via `@hall-e/bdd`.
- 

### 🔗 Place dans l'architecture

```
Sources externes ──▶ Service de récupération ──▶ @hall-e/bdd ──▶ Base ──▶ API ──▶ App mobile
```

---

## 🛠️ Partie Dev


### 🧱 Stack

- **Node.js** 
- Tâches planifiées : **cron**
- Package partagé **`@hall-e/bdd`** pour l'écriture en base
- **Docker** pour le déploiement

### ✅ Prérequis

- Node.js `>= 18` et `npm`
- Un **token GitHub** (`GITHUB_TOKEN`, scope `read:packages`) pour le package privé
- Accès aux sources externes de matchs

### ⚙️ Installation

Comme l'API, le package `@hall-e/bdd` provient de **GitHub Packages**. Crée un `.npmrc` :

```ini
@hall-e:registry=https://npm.pkg.github.com
//npm.pkg.github.com/:_authToken=${GITHUB_TOKEN}
```

Puis :

```bash
export GITHUB_TOKEN=<GH_TOKEN>
npm install
```

### ▶️ Lancement

```bash
npm run dev          # développement
npm start            # production
npm run fetch:once   # récupération manuelle (one-shot)
```

### 🐳 Docker

**Build** — le `GITHUB_TOKEN` est passé en build-arg pour installer `@hall-e/bdd` :

```bash
docker build \
  --build-arg GITHUB_TOKEN=<GH_TOKEN> \
  -t recuperation-hall-e .
```

**Run** :

```bash
docker run \
  --env-file ./env/prod/.env \
  --name recuperation-hall-e-v1 \
  recuperation-hall-e
```

**Commandes utiles** :

```bash
docker logs -f recuperation-hall-e-v1                          # logs
docker stop recuperation-hall-e-v1 && docker rm recuperation-hall-e-v1   # arrêt + suppression
```

---

<div align="center">

🔗 **Projets liés** — [App mobile](https://github.com/hugo38rodrigues/mobile-hall-e) · [API](https://github.com/hugo38rodrigues/hall-e-back) · [Package BDD](https://github.com/hugo38rodrigues/bdd-hall-e)

</div>
