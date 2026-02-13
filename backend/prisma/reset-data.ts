import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function resetData() {
  console.log('🗑️  Suppression des données (sauf utilisateurs)...\n');

  // Supprimer dans l'ordre pour respecter les contraintes de clés étrangères
  
  // 1. Messages (dépendent des projects)
  const { count: messagesCount } = await prisma.message.deleteMany({});
  console.log(`  ✅ ${messagesCount} messages supprimés`);

  // 2. Analyses transversales (dépendent des projects)
  const { count: transversalCount } = await prisma.transversalAnalysis.deleteMany({});
  console.log(`  ✅ ${transversalCount} analyses transversales supprimées`);

  // 3. Thèmes (dépendent des projects)
  const { count: themesCount } = await prisma.theme.deleteMany({});
  console.log(`  ✅ ${themesCount} thèmes supprimés`);

  // 4. Tendances (dépendent des projects)
  const { count: trendsCount } = await prisma.trends.deleteMany({});
  console.log(`  ✅ ${trendsCount} tendances supprimées`);

  // 5. Actions stratégiques (dépendent des projects)
  const { count: actionsCount } = await prisma.strategicAction.deleteMany({});
  console.log(`  ✅ ${actionsCount} actions stratégiques supprimées`);

  // 6. Métriques projet (dépendent des projects)
  const { count: metricsCount } = await prisma.projectMetrics.deleteMany({});
  console.log(`  ✅ ${metricsCount} métriques projet supprimées`);

  // 7. Données Plutchik projet (dépendent des projects)
  const { count: plutchikCount } = await prisma.projectPlutchik.deleteMany({});
  console.log(`  ✅ ${plutchikCount} données Plutchik supprimées`);

  // 8. Membres de projet (dépendent des projects)
  const { count: membersCount } = await prisma.projectMember.deleteMany({});
  console.log(`  ✅ ${membersCount} membres de projet supprimés`);

  // 9. Projets (en dernier car tout dépend des projets)
  const { count: projectsCount } = await prisma.project.deleteMany({});
  console.log(`  ✅ ${projectsCount} projets supprimés`);

  console.log('\n✨ Données supprimées avec succès !');
  console.log('👤 Les utilisateurs sont conservés.');
}

resetData()
  .catch((e) => {
    console.error('❌ Erreur lors de la suppression:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
