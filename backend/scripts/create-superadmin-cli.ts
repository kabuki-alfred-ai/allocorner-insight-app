#!/usr/bin/env ts-node
import { PrismaClient, Role } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

function showHelp() {
  console.log(`
Usage: npx ts-node scripts/create-superadmin-cli.ts [options]

Options:
  --email, -e      Email du super admin (requis)
  --name, -n       Nom du super admin (requis)
  --password, -p   Mot de passe (requis, min 6 caractères)
  --help, -h       Afficher cette aide

Exemple:
  npx ts-node scripts/create-superadmin-cli.ts -e admin@example.com -n "Admin" -p admin123
`);
}

function parseArgs() {
  const args: Record<string, string> = {};
  const argv = process.argv.slice(2);

  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    const nextArg = argv[i + 1];

    if (arg === '--help' || arg === '-h') {
      args.help = 'true';
    } else if ((arg === '--email' || arg === '-e') && nextArg) {
      args.email = nextArg;
      i++;
    } else if ((arg === '--name' || arg === '-n') && nextArg) {
      args.name = nextArg;
      i++;
    } else if ((arg === '--password' || arg === '-p') && nextArg) {
      args.password = nextArg;
      i++;
    }
  }

  return args;
}

async function main() {
  const args = parseArgs();

  if (args.help) {
    showHelp();
    process.exit(0);
  }

  const { email, name, password } = args;

  if (!email || !name || !password) {
    console.error('❌ Erreur: Email, nom et mot de passe sont requis\n');
    showHelp();
    process.exit(1);
  }

  if (!email.includes('@')) {
    console.error('❌ Email invalide');
    process.exit(1);
  }

  if (password.length < 6) {
    console.error('❌ Mot de passe trop court (min 6 caractères)');
    process.exit(1);
  }

  // Vérifier si l'email existe déjà
  const existingUser = await prisma.user.findUnique({
    where: { email },
  });

  if (existingUser) {
    console.error(`⚠️  Un utilisateur existe déjà avec cet email (${existingUser.role})`);
    console.log('Pour mettre à jour le rôle en SUPERADMIN, utilisez le script interactif:');
    console.log('  npx ts-node scripts/create-superadmin.ts');
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

  console.log(`✅ Super Admin créé avec succès !`);
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
  });
