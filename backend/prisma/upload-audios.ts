import * as Minio from 'minio';
import * as fs from 'fs';
import * as path from 'path';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const minioClient = new Minio.Client({
  endPoint: process.env.MINIO_ENDPOINT || 'localhost',
  port: parseInt(process.env.MINIO_PORT || '9000'),
  useSSL: process.env.MINIO_USE_SSL === 'true',
  accessKey: process.env.MINIO_ACCESS_KEY || 'allocorner',
  secretKey: process.env.MINIO_SECRET_KEY || 'allocorner_minio_password',
});

const BUCKET_NAME = process.env.MINIO_AUDIO_BUCKET || 'allocorner-audio';

async function main() {
  console.log('🎙️ Upload des fichiers audio vers MinIO...\n');

  // Récupérer le projet
  const project = await prisma.project.findFirst();
  if (!project) {
    console.error('❌ Aucun projet trouvé');
    return;
  }
  console.log('Projet:', project.id);

  // Vérifier/créer le bucket
  const exists = await minioClient.bucketExists(BUCKET_NAME);
  if (!exists) {
    await minioClient.makeBucket(BUCKET_NAME);
    console.log('Bucket créé:', BUCKET_NAME);
  }

  // Récupérer tous les messages
  const messages = await prisma.message.findMany({
    where: { projectId: project.id },
  });

  console.log('Messages à traiter:', messages.length);

  for (const message of messages) {
    const localPath = path.join(process.cwd(), '..', 'data', 'audios', message.filename);
    
    if (!fs.existsSync(localPath)) {
      console.warn('❌ Fichier non trouvé:', message.filename);
      continue;
    }

    const objectName = `${project.id}/${message.filename}`;
    
    try {
      // Vérifier si l'objet existe déjà
      try {
        await minioClient.statObject(BUCKET_NAME, objectName);
        console.log('✅ Déjà uploadé:', message.filename);
        continue;
      } catch (e) {
        // L'objet n'existe pas, on continue pour l'uploader
      }

      await minioClient.fPutObject(BUCKET_NAME, objectName, localPath, {
        'Content-Type': 'audio/mpeg',
      });
      
      // Mettre à jour le message avec la clé audio
      await prisma.message.update({
        where: { id: message.id },
        data: { audioKey: objectName },
      });
      
      console.log('✅ Uploadé:', message.filename);
    } catch (error) {
      console.error('❌ Erreur upload', message.filename, ':', error.message);
    }
  }

  console.log('\n🎉 Upload terminé!');
  await prisma.$disconnect();
}

main().catch(console.error);
