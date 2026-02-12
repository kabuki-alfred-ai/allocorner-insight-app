# Déploiement sur Coolify

## Prérequis
- Un serveur Coolify (auto-hébergé ou Coolify Cloud)
- Repo GitHub connecté : `https://github.com/kabuki-alfred-ai/allocorner-insight-app`

---

## 1. Structure des services

Tu dois créer **4 services** sur Coolify :

```
┌─────────────────────────────────────────────────────────────┐
│                      Coolify Instance                        │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐ │
│  │  Frontend   │  │   Backend   │  │     PostgreSQL      │ │
│  │   (Nginx)   │  │   (Node)    │  │      (DB)           │ │
│  │   :8080     │  │   :3000     │  │      :5432          │ │
│  └─────────────┘  └─────────────┘  └─────────────────────┘ │
│  ┌─────────────────────────────────────────────────────────┐│
│  │                      MinIO                              ││
│  │              (Stockage S3)                              ││
│  │                   :9000                                 ││
│  └─────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────┘
```

---

## 2. Configuration PostgreSQL

**Type** : Database → PostgreSQL

**Variables d'environnement** :
```env
POSTGRES_DB=allocorner
POSTGRES_USER=allocorner
POSTGRES_PASSWORD=ton_mot_de_passe_fort
```

**Port exposé** : `5432`

---

## 3. Configuration MinIO

**Type** : Service → MinIO (ou Docker Image `minio/minio`)

**Commande** :
```bash
server /data --console-address ":9001"
```

**Variables d'environnement** :
```env
MINIO_ROOT_USER=allocorner
MINIO_ROOT_PASSWORD=ton_mot_de_passe_minio
```

**Ports** :
- API S3 : `9000`
- Console : `9001`

---

## 4. Configuration Backend

**Type** : Application → Nixpacks (Node.js)

**Build Command** :
```bash
cd backend && npm ci && npm run build
```

**Start Command** :
```bash
cd backend && npm run start:prod
```

**Variables d'environnement** :
```env
# Database
DATABASE_URL=postgresql://allocorner:PASSWORD@postgresql:5432/allocorner?schema=public

# JWT
JWT_SECRET=ta_cle_secrete_super_longue_et_aleatoire
JWT_EXPIRATION=24h

# MinIO
MINIO_ENDPOINT=minio
MINIO_PORT=9000
MINIO_USE_SSL=false
MINIO_ACCESS_KEY=allocorner
MINIO_SECRET_KEY=ton_mot_de_passe_minio
MINIO_AUDIO_BUCKET=allocorner-audio
MINIO_LOGOS_BUCKET=allocorner-logos

# API
PORT=3000
NODE_ENV=production

# Frontend URL (CORS)
FRONTEND_URL=https://ton-frontend.coolify.app
```

**Healthcheck** (optionnel) :
- Path : `/api`
- Port : `3000`

---

## 5. Configuration Frontend

**Type** : Application → Static (ou Nixpacks)

**Build Command** :
```bash
cd frontend && npm ci && npm run build
```

**Publish Directory** :
```
frontend/dist
```

**Variables d'environnement** (build time) :
```env
VITE_API_URL=https://ton-backend.coolify.app
```

---

## 6. Configuration Nginx (pour le frontend)

Si tu utilises Nixpacks, ajoute un fichier `frontend/nginx.conf` :

```nginx
server {
    listen 8080;
    root /app/frontend/dist;
    index index.html;
    
    location / {
        try_files $uri $uri/ /index.html;
    }
    
    # Cache des assets statiques
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

---

## 7. Ordre de déploiement

1. **Démarrer PostgreSQL** → attendre qu'il soit healthy
2. **Démarrer MinIO** → attendre qu'il soit healthy
3. **Démarrer Backend** → attendre le build
4. **Démarrer Frontend** → attendre le build
5. **Exécuter les migrations Prisma** (one-time) :
   ```bash
   cd backend && npx prisma migrate deploy
   ```

---

## 8. Configuration domaines

Dans Coolify, configure les domaines personnalisés :

| Service | Domaine suggéré |
|---------|----------------|
| Frontend | `allocorner.coolify.app` |
| Backend | `api.allocorner.coolify.app` |
| MinIO Console | `minio.allocorner.coolify.app` |

---

## 9. Créer le Super Admin (one-time)

Une fois le backend déployé, exécute :

```bash
# Via Coolify terminal ou SSH
cd backend
npx ts-node scripts/create-superadmin-cli.ts \
  -e admin@allocorner.fr \
  -n "Admin" \
  -p ton_mot_de_passe_admin
```

---

## 10. Troubleshooting

### Problème CORS
Vérifie que `FRONTEND_URL` dans le backend correspond bien au domaine du frontend.

### Problème base de données
Vérifie que `DATABASE_URL` utilise bien le hostname du service PostgreSQL (généralement `postgresql` ou `postgres-xxx`).

### Problème MinIO
Vérifie que les buckets sont créés automatiquement ou crée-les manuellement dans la console MinIO.

---

## Résumé des URLs après déploiement

| Service | URL | Usage |
|---------|-----|-------|
| App | `https://allocorner.coolify.app` | Interface utilisateur |
| API | `https://api.allocorner.coolify.app` | Backend API |
| MinIO Console | `https://minio.allocorner.coolify.app:9001` | Gestion S3 |
