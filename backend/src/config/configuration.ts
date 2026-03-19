export default () => ({
  database: {
    url: process.env.DATABASE_URL,
  },
  jwt: {
    secret: process.env.JWT_SECRET || 'dev-jwt-secret',
    refreshSecret: process.env.JWT_REFRESH_SECRET || 'dev-jwt-refresh-secret',
    expiration: process.env.JWT_EXPIRATION || '15m',
    refreshExpiration: process.env.JWT_REFRESH_EXPIRATION || '7d',
  },
  minio: {
    endpoint: process.env.MINIO_ENDPOINT || 'localhost',
    port: parseInt(process.env.MINIO_PORT ?? '9000', 10),
    accessKey: process.env.MINIO_ACCESS_KEY || 'allocorner',
    secretKey: process.env.MINIO_SECRET_KEY || 'allocorner_minio_password',
    useSSL: process.env.MINIO_USE_SSL === 'true',
    audioBucket: process.env.MINIO_AUDIO_BUCKET || 'allocorner-audio',
    logosBucket: process.env.MINIO_LOGOS_BUCKET || 'allocorner-logos',
  },
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379', 10),
    password: process.env.REDIS_PASSWORD,
  },
  google: {
    projectId: process.env.GOOGLE_CLOUD_PROJECT_ID,
    credentialsPath: process.env.GOOGLE_APPLICATION_CREDENTIALS,
    storage: {
      bucket: process.env.GCS_AUDIO_BUCKET || 'your-gcs-bucket',
    },
    speech: {
      languages: (process.env.GOOGLE_SPEECH_LANGUAGES || 'fr-FR,en-US,es-ES,de-DE,it-IT').split(','),
      model: 'long',
      enableDiarization: true,
    },
  },
  gemini: {
    apiKey: process.env.GEMINI_API_KEY,
  },
  queue: {
    concurrency: parseInt(process.env.QUEUE_CONCURRENCY || '5', 10),
    maxRetries: parseInt(process.env.QUEUE_MAX_RETRIES || '3', 10),
  },
});
