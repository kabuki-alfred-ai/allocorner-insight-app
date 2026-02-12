# Backend Dockerfile
FROM node:22-alpine

# Installer les dépendances système nécessaires
RUN apk add --no-cache openssl

WORKDIR /app

# Copier tous les fichiers de configuration d'abord
COPY package*.json ./
COPY tsconfig*.json ./
COPY nest-cli.json ./
COPY prisma ./prisma/

# Installer les dépendances
RUN npm ci

# Générer le client Prisma
RUN npx prisma generate

# Copier le code source
COPY src ./src/

# Modifier tsconfig pour le build (remplacer nodenext par commonjs temporairement)
RUN sed -i 's/"module": "nodenext"/"module": "commonjs"/' tsconfig.json && \
    sed -i 's/"moduleResolution": "nodenext"/"moduleResolution": "node"/' tsconfig.json && \
    sed -i '/"resolvePackageJsonExports"/d' tsconfig.json

# Build de l'application
RUN npm run build

# Vérifier que le build a créé les fichiers
RUN ls -la dist/

# Exposer le port
EXPOSE 3000

# Commande de démarrage
CMD ["node", "dist/main.js"]
