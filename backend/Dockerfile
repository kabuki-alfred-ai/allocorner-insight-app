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
COPY scripts ./scripts/

# Créer le dossier data (sera rempli via volume ou manuellement)
RUN mkdir -p data/audios

# Build de l'application avec le tsconfig Docker
RUN npx tsc -p tsconfig.docker.json

# Compiler les scripts admin
RUN npx tsc scripts/create-superadmin-cli.ts --outDir dist/scripts --esModuleInterop --module commonjs --moduleResolution node --target ES2023 --skipLibCheck 2>/dev/null || true
RUN npx tsc scripts/create-superadmin.ts --outDir dist/scripts --esModuleInterop --module commonjs --moduleResolution node --target ES2023 --skipLibCheck 2>/dev/null || true

# Rendre le script shell exécutable
RUN chmod +x scripts/create-superadmin-docker.sh

# Vérifier que le build a créé les fichiers
RUN ls -la dist/ && test -f dist/main.js

# Exposer le port
EXPOSE 3000

# Commande de démarrage
CMD ["node", "dist/main.js"]
