# Backend Dockerfile
FROM node:22-alpine

# Installer les dépendances système nécessaires
RUN apk add --no-cache openssl

WORKDIR /app

# Copier les fichiers de configuration
COPY package*.json ./
COPY tsconfig.docker.json ./
COPY nest-cli.json ./
COPY prisma ./prisma/

# Installer les dépendances
RUN npm ci

# Générer le client Prisma
RUN npx prisma generate

# Copier le code source
COPY src ./src/

# Build de l'application avec le tsconfig Docker
RUN npx tsc -p tsconfig.docker.json

# Vérifier que le build a créé les fichiers
RUN ls -la dist/ && test -f dist/main.js

# Exposer le port
EXPOSE 3000

# Commande de démarrage
CMD ["node", "dist/main.js"]
