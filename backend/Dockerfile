# Backend Dockerfile
FROM node:22-alpine

# Installer les dépendances système nécessaires
RUN apk add --no-cache openssl

WORKDIR /app

# Copier les fichiers de dépendances
COPY package*.json ./
COPY prisma ./prisma/

# Installer les dépendances
RUN npm ci

# Générer le client Prisma
RUN npx prisma generate

# Copier le code source
COPY . .

# Build de l'application
RUN npm run build

# Vérifier que le build a créé les fichiers
RUN ls -la dist/ && test -f dist/main.js

# Exposer le port
EXPOSE 3000

# Commande de démarrage (sans .js car Node résout automatiquement)
CMD ["node", "dist/main"]
