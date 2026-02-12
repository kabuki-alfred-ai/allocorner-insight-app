#!/usr/bin/env ts-node
import { PrismaClient, Role } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import * as readline from 'readline';

const prisma = new PrismaClient();

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function question(prompt: string): Promise<string> {
  return new Promise((resolve) => {
    rl.question(prompt, (answer) => resolve(answer));
  });
}

async function main() {
  console.log('👤 Création d\'un Super Admin\n');

  const email = await question('Email: ');
  if (!email || !email.includes('@')) {
    console.error('❌ Email invalide');
    process.exit(1);
  }

  // Vérifier si l'email existe déjà
  const existingUser = await prisma.user.findUnique({
    where: { email },
  });

  if (existingUser) {
    console.log(`⚠️  Un utilisateur existe déjà avec cet email (${existingUser.role})`);
    const updateRole = await question('Mettre à jour le rôle en SUPERADMIN ? (o/N): ');
    
    if (updateRole.toLowerCase() === 'o' || updateRole.toLowerCase() === 'oui') {
      await prisma.user.update({
        where: { email },
        data: { role: Role.SUPERADMIN },
      });
      console.log(`✅ ${email} est maintenant SUPERADMIN`);
    } else {
      console.log('❌ Opération annulée');
    }
    rl.close();
    return;
  }

  const name = await question('Nom: ');
  if (!name) {
    console.error('❌ Nom requis');
    process.exit(1);
  }

  const password = await question('Mot de passe: ');
  if (!password || password.length < 6) {
    console.error('❌ Mot de passe trop court (min 6 caractères)');
    process.exit(1);
  }

  // Hasher le mot de passe
  const passwordHash = await bcrypt.hash(password, 10);

  // Créer le super admin
  const user = await prisma.user.create({
    data: {
      email,
      name,
      passwordHash,
      role: Role.SUPERADMIN,
    },
  });

  console.log(`\n✅ Super Admin créé avec succès !`);
  console.log(`   ID: ${user.id}`);
  console.log(`   Email: ${user.email}`);
  console.log(`   Nom: ${user.name}`);
  console.log(`   Rôle: ${user.role}`);
}

main()
  .catch((e) => {
    console.error('❌ Erreur:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    rl.close();
  });
