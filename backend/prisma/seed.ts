import { PrismaClient, Role, EmotionalLoad, VerbatimCategory, Priority } from '@prisma/client';
import * as Minio from 'minio';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

// Pour ESM: créer équivalent de __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const prisma = new PrismaClient();

// Configuration MinIO
const minioClient = new Minio.Client({
  endPoint: process.env.MINIO_ENDPOINT || 'localhost',
  port: parseInt(process.env.MINIO_PORT || '9000'),
  useSSL: process.env.MINIO_USE_SSL === 'true',
  accessKey: process.env.MINIO_ACCESS_KEY || 'allocorner',
  secretKey: process.env.MINIO_SECRET_KEY || 'allocorner_minio_password',
});

const BUCKET_NAME = process.env.MINIO_AUDIO_BUCKET || 'allocorner-audio';

// Données du fichier Excel
const PROJECT_DATA = {
  clientName: 'Madame la Présidente',
  title: 'Analyse NHA - Natural Hair Academy',
  dates: '2024',
  context: 'Natural Hair Academy (NHA) - Stand Allo Corner',
  analyst: 'Allo Corner (IA Expert)',
  methodology: 'Analyse de Messages Vocaux',
  participantsEstimated: 85,
};

// Métriques IRC
const METRICS_DATA = {
  messagesCount: 85,
  avgDurationSec: 14.5,
  totalDurationSec: 1232,
  participationRate: 0.95,
  ircScore: 78,
  tonalityAvg: 4.2,
  highEmotionShare: 0.7,
  ircInterpretation: 'Adhésion Identitaire',
  emotionalClimate: 'Solaire, Militant et Fusionnel',
};

// Plutchik
const PLUTCHIK_DATA = {
  joy: 0.50,
  trust: 0.25,
  sadness: 0.05,
  anticipation: 0.15,
  anger: 0,
  surprise: 0,
  fear: 0.05,
  cocktailSummary: 'Solaire-Militant. Une joie de résilience.',
};

// Thèmes avec leurs mots-clés
const THEMES_DATA = [
  {
    name: 'LA RÉPARATION IDENTITAIRE (Le "Care" Profond)',
    temporality: 'Passé / Héritage',
    emotionLabel: 'Acceptation & Sérénité',
    analysis: 'Le cheveu texturé est un ancien champ de bataille pacifié. Le produit est un onguent magique qui répare les traumas (pelade, honte) et reconnecte aux ancêtres.',
    verbatimTotem: '"Ça m\'a beaucoup aidé à me réconcilier avec la pelade... nos cheveux représentent nos ancêtres." (Msg 6)',
    color: '#2F66F5',
    keywords: ['pelade', 'ancêtres', 'réparation', 'honte', 'identité', 'origines', 'acceptation', 'cheveux texturés'],
  },
  {
    name: 'LE CULTE BIENVEILLANT DE LA "PRÉSIDENTE"',
    temporality: 'Présent / Relationnel',
    emotionLabel: 'Admiration & Joie',
    analysis: 'Meriem incarne la réussite ("Black Queen"). Ce n\'est pas une relation client/fournisseur, mais une relation familiale.',
    verbatimTotem: '"Continuez comme ça \'cause you are the real president." (Msg 7)',
    color: '#10B981',
    keywords: ['présidente', 'Meriem', 'black queen', 'admiration', 'famille', 'bienveillance', 'soutien'],
  },
  {
    name: 'L\'HÉRITAGE ET L\'ÉDUCATION (Les Enfants Savants)',
    temporality: 'Futur / Projection',
    emotionLabel: 'Fierté & Vigilance',
    analysis: 'Les filles (8-12 ans) récitent les routines capillaires avec sérieux. Le stand est une école où l\'on valide ses acquis pour se protéger du monde (collège).',
    verbatimTotem: '"Faut bien les hydrater, les nourrir, c\'est notre deuxième nous." (Msg 84)',
    color: '#F59E0B',
    keywords: ['enfants', 'éducation', 'transmission', 'collège', 'hydratation', 'routines', 'protection'],
  },
  {
    name: 'LA "DOSE DE LOVE" (L\'Énergie Collective)',
    temporality: 'Instant / Énergie',
    emotionLabel: 'Extase & Connexion',
    analysis: 'Le stand est un "safe space" et une station de recharge émotionnelle. Économie circulaire de la bienveillance.',
    verbatimTotem: '"Merci pour cette dose de love. Moi j\'envoie tout tout l\'amour." (Msg 6)',
    color: '#EC4899',
    keywords: ['love', 'amour', 'safe space', 'bienveillance', 'recharge', 'énergie', 'connexion'],
  },
  {
    name: 'L\'EMPOWERMENT ET L\'AMBITION ("Black Queen")',
    temporality: 'Intemporel',
    emotionLabel: 'Puissance & Anticipation',
    analysis: 'Le cheveu est un levier de pouvoir économique. "Conquérir le monde" est lié à la santé capillaire.',
    verbatimTotem: '"Qui nous motive pour faire du business... et pour conquérir le monde." (Msg 28)',
    color: '#8B5CF6',
    keywords: ['empowerment', 'business', 'ambition', 'black queen', 'pouvoir', 'entrepreneuriat', 'réussite'],
  },
];

// Verbatims marquants
const FEATURED_VERBATIMS_DATA = [
  {
    category: VerbatimCategory.CONTRASTE,
    citation: '"Je passe au collège l\'année prochaine et je sais que j\'aurai beaucoup de personnes qui vont me dire le contraire."',
    implication: 'Devoir de protection psychologique (Kit Rentrée).',
    speaker: 'Msg 20 (Enfant)',
  },
  {
    category: VerbatimCategory.ORIGINALITE,
    citation: '"Aujourd\'hui je suis fier de moi, je reconnais qui je suis... La vie est trop courte."',
    implication: 'Le stand devient un confessionnal pour les hommes aussi.',
    speaker: 'Msg 72 (Homme)',
  },
  {
    category: VerbatimCategory.EMOTION,
    citation: '"Ça m\'a beaucoup aidé à me réconcilier avec la pelade... nos cheveux représentent nos ancêtres."',
    implication: 'Le produit est un dispositif médical de l\'âme.',
    speaker: 'Msg 06',
  },
  {
    category: VerbatimCategory.REPRESENTATIVITE,
    citation: '"Faut bien les hydrater, les nourrir, c\'est notre deuxième nous."',
    implication: 'La relève est formée et experte.',
    speaker: 'Msg 84 (Enfant)',
  },
  {
    category: VerbatimCategory.TOTEM,
    citation: '"Je n\'irai jamais voir ailleurs... je reviens toujours à toi. Merci, je t\'aime."',
    implication: 'Fidélité exclusive.',
    speaker: 'Msg 15',
  },
];

// Recommandations
const RECOMMENDATIONS_DATA = [
  {
    title: 'LANCER LA GAMME "MONSIEUR LE PRÉSIDENT"',
    objective: 'Ouvrir le marché Homme (Barbe & Cheveux) et inclure les "pères".',
    priority: Priority.MOYENNE,
  },
  {
    title: 'KIT "JUNIOR EXPERT" (RENTRÉE COLLÈGE)',
    objective: 'Répondre à l\'expertise technique des 10-14 ans et à leurs angoisses.',
    priority: Priority.HAUTE,
  },
  {
    title: 'STRATÉGIE B2B "SALONS PARTENAIRES"',
    objective: 'Labelliser les salons (type N\'Kids) qui utilisent déjà les produits.',
    priority: Priority.HAUTE,
  },
  {
    title: 'LA "DOSE DE LOVE" (UGC)',
    objective: 'Exploiter les audios en stories Instagram hebdomadaires.',
    priority: Priority.HAUTE,
  },
  {
    title: 'CAMPAGNE "BUSINESS & CROWN"',
    objective: 'Lier leadership féminin et identité capillaire.',
    priority: Priority.BASSE,
  },
];

// Tendances
const TRENDS_DATA = {
  mainTrends: [
    { title: 'Le Cheveu comme Manifeste Politique et Spirituel', content: 'Le produit capillaire n\'est jamais décrit comme une simple commodité. C\'est un outil de réparation historique et psychologique.' },
    { title: 'L\'Éducation Transgénérationnelle Réussie', content: 'Les jeunes filles (Génération Alpha, 8-12 ans) ont intégré le discours technique et prennent la parole pour "éduquer" à leur tour.' },
    { title: 'La Marque "Refuge" et la Figure Tutélaire', content: '"Madame la Présidente" est perçue comme une entité familiale. Meriem est tutoyée, considérée comme une "sœur" ou une tante bienveillante.' },
  ],
  strengths: [
    { title: 'Impact Émotionnel Majeur', content: 'Larmes de joie, cris d\'hystérie positive, récits de guérison (pelade).' },
    { title: 'Crédibilité Scientifique', content: 'L\'efficacité (pousse, volume) est validée par les clients, ce qui ancre la "Love Brand" dans le réel.' },
    { title: 'Ambassadeurs Spontanés (B2C & B2B)', content: 'Les clients évangélisent la marque et les professionnels (salons enfants) viennent s\'y associer spontanément.' },
  ],
  recurringWords: ['LOVE', 'MERCI', 'FIERTÉ'],
  weakSignal: 'L\'éveil masculin',
  weakSignalDetail: 'Ce n\'est plus une anomalie. Des hommes (pères, conjoints) prennent la parole pour réclamer leur part de soin.',
};

// Analyses transversales
const TRANSVERSAL_DATA = [
  {
    axis: 'A',
    category: 'SOCIOLOGIE',
    content: 'Mixité générationnelle forte (Matriarches, Gen Z, Enfants) et émergence notable des Hommes.',
  },
  {
    axis: 'B',
    category: 'NON-DITS',
    content: 'Le prix (jamais cité) et la concurrence (inexistante dans les discours).',
  },
  {
    axis: 'C',
    category: 'SYSTÉMIQUE',
    content: 'Produit efficace > Réparation > Transmission > Empowerment.',
  },
];

// Données des 85 verbatims
const VERBATIMS_DATA = [
  { filename: '1.mp3', duration: 8, speaker: 'Un homme (Anonyme)', transcript: 'Test effectué la veille de l\'événement NHA, j\'espère recevoir le message. Ciao.', emotionalLoad: EmotionalLoad.LOW },
  { filename: '2.mp3', duration: 7, speaker: 'Un homme (Anonyme)', transcript: 'Ouais Dédikira, trop bien ton message. Euh bonne chance pour la NHA.', emotionalLoad: EmotionalLoad.MEDIUM },
  { filename: '3.mp3', duration: 4, speaker: 'Un homme (Anonyme)', transcript: 'Et bon salon, chez Madame la Présidente !', emotionalLoad: EmotionalLoad.MEDIUM },
  { filename: '4.mp3', duration: 3, speaker: 'Une femme (Anonyme)', transcript: 'I\'m Black Queen. Voilà.', emotionalLoad: EmotionalLoad.MEDIUM },
  { filename: '5.mp3', duration: 9, speaker: 'Une femme (Anonyme)', transcript: 'Euh je sais pas ce qu\'il faut dire mais merci beaucoup. Et euh voilà, vraiment merci pour le message.', emotionalLoad: EmotionalLoad.MEDIUM },
  { filename: '6.mp3', duration: 41, speaker: 'Une femme (Cliente)', transcript: 'Merci pour ces mots, j\'ai adoré, clairement Madame la Présidente, ça m\'a beaucoup aidé à me réconcilier avec la pelade que j\'avais eue parce que comme on le dit très bien, nos cheveux représentent nos ancêtres, nos origines, notre identité. Et c\'est vrai qu\'aujourd\'hui euh je porte fièrement ma couronne, sans avoir honte euh de problématiques que je peux avoir puisque on est tous humains. Donc merci pour cette dose de love. Moi j\'envoie tout tout l\'amour à tout le monde parce qu\'il faut s\'aimer comme on est. On est unique, on représente moins de 1% de la population avec des cheveux texturés alors euh portons fièrement notre couronne.', emotionalLoad: EmotionalLoad.HIGH },
  { filename: '7.mp3', duration: 17, speaker: 'Une femme (Cliente)', transcript: 'Merci Madame la Présidente pour ces mots, c\'était vraiment vraiment incroyable. Merci pour ces produits, merci de nous rendre belles, merci euh de nous donner confiance en nous davantage et continuez comme ça \'cause you are the real president. Bye.', emotionalLoad: EmotionalLoad.HIGH },
  { filename: '8.mp3', duration: 35, speaker: 'Une femme (Cliente fidèle)', transcript: 'Merci à toute l\'équipe de Madame la Présidente. Merci Meriem d\'avoir conçu des produits au top qui nous donnent en fait des produits... des cheveux plus forts. J\'ai j\'ai eu en fait quelques soucis de avec mes cheveux. Et grâce à à ta cure Madame la Présidente numéro 1, ils ont été fortifiés. Dans mes résultats d\'analyse ça s\'est vu puisque les médecins m\'ont dit \'mais vous prenez quoi comme vitamines ?\' Et en fait franchement merci merci pour tout. Que du love. Bye.', emotionalLoad: EmotionalLoad.HIGH },
  { filename: '9.mp3', duration: 17, speaker: 'Un homme (Anonyme)', transcript: 'Merci à vous franchement, là franchement j\'ai ça fait du bien d\'entendre ce message surtout dans la situation dans laquelle je suis. J\'avais besoin d\'être reboosté, de reprendre confiance en moi donc merci énormément pour tout ce que vous m\'avez dit et voilà, je vous souhaite plein de bonnes choses à vous également et pour tout ce que vous faites.', emotionalLoad: EmotionalLoad.HIGH },
  { filename: '10.mp3', duration: 12, speaker: 'Visiteuse et Hôtesse', transcript: '[Visiteuse] : Du coup ? [Hôtesse] : En fait, ça laisse un beau message et vous, vous pouvez laisser un beau message aussi. [Visiteuse] : Ah ok. [Hôtesse] : Vers la fumée. Bon après vous pouvez vous rapprocher un peu.', emotionalLoad: EmotionalLoad.LOW },
  { filename: '11.mp3', duration: 24, speaker: 'Hôtesse et Visiteuse', transcript: '[Visiteuse] : Euh oui bonjour... (inaudible). [Hôtesse] : (Inaudible)... [Visiteuse] : Allô allô allô ? Million dollar ? [Hôtesse] : C\'est à vous de parler. [Visiteuse] : Et qu\'est-ce que je dois dire ? Moi je ne sais pas hein ! (Rires)', emotionalLoad: EmotionalLoad.LOW },
  { filename: '12.mp3', duration: 11, speaker: 'Une femme (Anonyme)', transcript: 'On va me tirer ? (Rire gêné). Euh merci pour le message. Et euh voilà quoi.', emotionalLoad: EmotionalLoad.LOW },
  { filename: '13.mp3', duration: 15, speaker: 'Karine (Gagnante)', transcript: 'Allô Madame la Présidente ? Et ben écoute euh c\'est Karine, je te remercie pour tous tes produits. En plus tu m\'as fait gagner une place à la NHA, c\'était génial. J\'ai pris la nouvelle brume et vivement l\'année prochaine. Bisous.', emotionalLoad: EmotionalLoad.MEDIUM },
  { filename: '14.mp3', duration: 18, speaker: 'Une femme (Gagnante)', transcript: 'Alors merci beaucoup pour le jeu concours que j\'ai remporté, c\'est grâce à vous que je suis là aujourd\'hui. Merci pour tout le bien-être que vous... toutes les choses que vous mettez en place pour nos cheveux, notre bien-être. J\'ai testé plusieurs cures et j\'en ai toujours été satisfaite et aujourd\'hui bah je repars pour six mois de cure et des soins. Merci beaucoup.', emotionalLoad: EmotionalLoad.MEDIUM },
  { filename: '15.mp3', duration: 20, speaker: 'Une femme (Cliente fidèle)', transcript: 'Merci beaucoup Madame la Présidente, j\'en suis déjà à ma troisième cou... cure avec toi et je peux dire que vraiment je n\'irai jamais voir ailleurs. J\'ai testé toutes les autres cures parce qu\'au départ je voulais comparer et je reviens toujours à toi. Donc merci, merci, merci, je t\'aime, je t\'aime.', emotionalLoad: EmotionalLoad.HIGH },
  { filename: '16.mp3', duration: 22, speaker: 'Mère et Enfant', transcript: '(Bruits de fond et rires) [Hôtesse] : C\'est à vous de parler. [Mère] : Allô Madame la Présidente, juste un petit mot pour vous remercier pour tout ce que vous faites pour nous. À bientôt. [Enfant] : Merci beaucoup.', emotionalLoad: EmotionalLoad.MEDIUM },
  { filename: '17.mp3', duration: 4, speaker: 'Une femme (Anonyme)', transcript: 'Euh moi aussi je t\'aime. (Rires)', emotionalLoad: EmotionalLoad.MEDIUM },
  { filename: '18.mp3', duration: 3, speaker: 'Jeune fille / Enfant', transcript: 'Merci, c\'est très touchant.', emotionalLoad: EmotionalLoad.MEDIUM },
  { filename: '19.mp3', duration: 3, speaker: 'Jeune fille / Enfant', transcript: 'Vive Madame la Présidente !', emotionalLoad: EmotionalLoad.MEDIUM },
  { filename: '20.mp3', duration: 19, speaker: 'Jeune fille (10 ans)', transcript: 'C\'est très encourageant d\'entendre ça parce que moi je suis une enfant de 10 ans, je passe au collège l\'année prochaine et je sais que j\'aurai beaucoup de de personnes qui vont me dire le contraire. Donc euh merci beaucoup, c\'est c\'est très touchant. Au revoir.', emotionalLoad: EmotionalLoad.HIGH },
  { filename: '21.mp3', duration: 28, speaker: 'Une femme (Cliente)', transcript: 'Euh bah déjà merci, c\'est super beau le le petit audio qui vient de passer, c\'est vraiment très fortifiant. Merci. En tout cas c\'est juste pour vous dire que je vous avais vue à la Foire de Paris et là je viens de vous voir ici et même je vous avais envoyé un message sur Insta et ben vraiment merci parce que au niveau de la communication vous êtes vraiment présents, ça se passe super bien. J\'ai eu Jekira ? Jekira, Jekira je crois. En tout cas souvenir et euh vous faites vraiment un travail formidable, ça m\'a vraiment donné envie donc là j\'ai pris une cure. Euh là ma main...', emotionalLoad: EmotionalLoad.MEDIUM },
  { filename: '22.mp3', duration: 6, speaker: 'Une femme (Anonyme)', transcript: 'Alors franchement, je m\'y attendais pas. Allez vous faire foutre.', emotionalLoad: EmotionalLoad.MEDIUM },
  { filename: '23.mp3', duration: 12, speaker: 'Mère et Enfant', transcript: '[Mère] : Ben vas-y maman, tu dis euh "super, mes cheveux sont super". Vas-y. [Enfant] : Mes cheveux sont super, mes cheveux sont super. [Mère] : Voilà.', emotionalLoad: EmotionalLoad.LOW },
  { filename: '24.mp3', duration: 5, speaker: 'Une femme (Anonyme)', transcript: 'Merci, oui vous avez raison. (Rire). Bon par contre elle a dit...', emotionalLoad: EmotionalLoad.LOW },
  { filename: '25.mp3', duration: 16, speaker: 'Ambassadrice', transcript: 'Merci Madame la Présidente d\'avoir pris soin de mes cheveux, c\'est la marque de complément alimentaire que j\'utilise depuis des années. Je suis fière d\'être l\'une de vos ambassadrices. Merci et bisous à toute l\'équipe.', emotionalLoad: EmotionalLoad.MEDIUM },
  { filename: '26.mp3', duration: 6, speaker: 'Une femme (Anonyme)', transcript: '(Rire) Bon bah j\'ai rien à dire mais merci pour ces messages.', emotionalLoad: EmotionalLoad.LOW },
  { filename: '27.mp3', duration: 2, speaker: 'Un homme (Anonyme)', transcript: 'Ma dose de love.', emotionalLoad: EmotionalLoad.MEDIUM },
  { filename: '28.mp3', duration: 21, speaker: 'Une femme (Entrepreneure)', transcript: 'Beaucoup de love à tout le monde. Je vous aime de tout mon cœur, merci pour cet événement qui est génial, empowering, qui nous rend forts, puissants et qui booste, qui nous motive pour faire du business, pour faire de l\'argent et pour conquérir le monde entier. Gros bisous à tout le monde.', emotionalLoad: EmotionalLoad.HIGH },
  { filename: '29.mp3', duration: 26, speaker: 'Christelle (Influenceuse)', transcript: 'Madame la Présidente, on vous adore, keep going, on vous kiffe de ouf ! Merci pour l\'innovation, merci pour l\'inclusivité. C\'est Crystal, Crystal Chris 4 Inc sur les réseaux sociaux. Gros bisous à Meriem, la CEO. Voilà, on vous envoie plein de love à la team et s\'il vous plaît continuez d\'innover, ça nous aide énormément au quotidien, ça nous inspire. Et merci pour le petit message de love avant là, on a kiffé. Love love love y\'all, très bonne NHA et euh voilà on s\'attrape très très vite et merci pour le dropage de de la brume, elle est incroyable.', emotionalLoad: EmotionalLoad.HIGH },
  { filename: '30.mp3', duration: 18, speaker: 'Une femme (Visiteuse)', transcript: 'Je suis hyper contente d\'être venue. Euh merci pour tous ces... cette dose de love. Je vous en envoie tout autant. Merci pour ce que vous faites, superbement. Au revoir. Euh j\'attends le la fin du décompte. Je suppose. Hop. Ou peut-être que je prenne...', emotionalLoad: EmotionalLoad.MEDIUM },
  { filename: '31.mp3', duration: 17, speaker: 'Une femme (Cliente)', transcript: 'Wouh ! J\'ai adoré ce message de prise de confiance en soi. Mes cheveux sont magnifiques, je suis magnifique, on arrive à avancer et on avancera. Merci beaucoup pour ces paroles de motivation et bon NHA pour la suite. Bisous bisous.', emotionalLoad: EmotionalLoad.HIGH },
  { filename: '32.mp3', duration: 8, speaker: 'Une femme (Cliente)', transcript: 'Merci pour tout, merci Madame la Présidente. Franchement grâce à vous, on y croit, on y croit, on y croit et nos cheveux seront encore plus beaux que jamais. Merci pour tout.', emotionalLoad: EmotionalLoad.MEDIUM },
  { filename: '33.mp3', duration: 8, speaker: 'Deux femmes (Amies)', transcript: 'Ah merde, c\'est pas iPhone, c\'est pas iPhone mais... Ah oui. Moi dès que c\'est pas mon téléphone c\'est pas grave. Je mets peut-être le sac dans ce sens-là, non ? Ouais ouais mais... Ah oui.', emotionalLoad: EmotionalLoad.LOW },
  { filename: '34.mp3', duration: 15, speaker: 'Deux femmes (Photo)', transcript: 'Je me mets dans ce sens-là ? Parce que je suis un peu sombre, non ? Vas-y. Attends, je fais la pause. [...] Parce qu\'en fait là l\'iPhone tu vois là... ça c\'est le cadre... ça veut dire que... Qu\'est-ce qu\'il y a ? Très bien, très naturel. La photo, la photo est stylée. Ah ouais ?', emotionalLoad: EmotionalLoad.LOW },
  { filename: '35.mp3', duration: 25, speaker: 'Une femme (Émue)', transcript: 'Bonjour Meriem. Alors c\'est la deuxième fois que j\'écoute le message parce que la première fois j\'étais tellement intimidée parce que bah merci pour tout cet amour en fait. Merci d\'exister tout simplement, merci de nous donner notre voix. Merci d\'avoir créé ben tous ces produits, ton entreprise qui nous permet de de mieux exister en fait. Donc ben voilà. J\'ai j\'ai pas d\'autres mots, juste à te dire merci et et tes gammes enfin ta gamme, tous tes produits en fait sont vraiment géniaux. Donc voilà.', emotionalLoad: EmotionalLoad.HIGH },
  { filename: '36.mp3', duration: 16, speaker: 'Une femme (Guadeloupéenne)', transcript: 'Nous c\'est des femmes fortes, nous c\'est des femmes potomitan. Nous c\'est des femmes doubout. Alors c\'est créole guadeloupéen. Et ça veut dire que nous sommes des femmes fortes, nous sommes des piliers, nous sommes des une force, grande force.', emotionalLoad: EmotionalLoad.HIGH },
  { filename: '37.mp3', duration: 20, speaker: 'Un homme (Client)', transcript: 'Bonjour Madame la Présidente, ça serait bien de considérer aussi les présidents, donc de refaire votre message au masculin. Vos produits sont incroyables, on adore. Les gummies pour la pousse sont ouf, la brume, miss, incroyable aussi. Euh continuez à faire des des des produits incroyables comme ça et puis à bientôt pour de nouvelles aventures et on se voit l\'année prochaine pour la NHA. Gros bisous à Meriem et à toute l\'équipe. Ciao ciao.', emotionalLoad: EmotionalLoad.MEDIUM },
  { filename: '38.mp3', duration: 20, speaker: 'Farel Perry (Influenceur)', transcript: 'Hello hello, c\'est Farel Perry. Alors c\'est un petit message pour dire que Madame la Présidente, je vous remercie pour tout ce que vous faites, tous les bienfaits. Je connaissais pas quand j\'ai appris la marque, quand j\'ai connu la marque et tout. J\'ai testé tous les produits et j\'en suis clairement satisfait. Aujourd\'hui ma famille utilise la marque de cosmétique et franchement je vous remercie encore. Big love à vous et à très bientôt. Bisous.', emotionalLoad: EmotionalLoad.MEDIUM },
  { filename: '39.mp3', duration: 11, speaker: 'Une femme (Locksée)', transcript: 'Yes, we are. On est belles, on est magnifiques, on est superbes, on déchire tout. Vive les locks, hashtag Madame la Présidente locksée.', emotionalLoad: EmotionalLoad.MEDIUM },
  { filename: '40.mp3', duration: 15, speaker: 'Noussily (Cliente fidèle)', transcript: 'Madame la Présidente c\'est Noussily. Merci, merci, merci pour tout ce que tu fais pour nos cheveux. Merci pour le love, merci pour toutes ces années où j\'ai pu avoir de la pousse, où mes boucles ont pu être sublimées, où j\'ai pu accepter toute ma chevelure sans problème. Je vous aime ! Bisous !', emotionalLoad: EmotionalLoad.HIGH },
  { filename: '41.mp3', duration: 13, speaker: 'Une femme (Visiteuse)', transcript: 'Merci ! Ça fait du bien d\'entendre des paroles comme ça. Je vous envoie toute ma force, du love. Merci pour le Hermès [phonétique] qui sent super bon. Merci pour toute la gamme de produits que t\'as pu mettre en avant. Je suis trop contente. Merci infiniment, on est ensemble. À bientôt.', emotionalLoad: EmotionalLoad.MEDIUM },
  { filename: '42.mp3', duration: 16, speaker: 'Jeune femme / Ado', transcript: 'Oui, tu es la femme que tu es, tu es la meilleure. Chaque mèche que tu as reflète la femme que tu es. On se connait pas mais en tout cas on restera ensemble toute la vie. Parce que chaque mèche qu\'on a, on restera. Voilà, c\'est ce que je voulais te dire. Et merci pour ce message. Au revoir.', emotionalLoad: EmotionalLoad.MEDIUM },
  { filename: '43.mp3', duration: 20, speaker: 'Jeune femme (Enjouée)', transcript: 'Euh magnifique, qu\'elles sont folies, contrôle au lit [phonétique]. Je crois que c\'est la folie, laisse-les penser qu\'entre nous c\'est molli [phonétique]. Mes cheveux sont magnifiques, cheveux de tout le monde, cheveux crépus, afro, partout. C\'est magnifique. Et euh tout le monde devrait accepter ses cheveux tels qu\'ils soient. Parce qu\'on a tous des cheveux magnifiques. Et euh voilà. Voilà voilà voilà. Et brrrrr [bruit de bouche]. Brrrr [rire].', emotionalLoad: EmotionalLoad.HIGH },
  { filename: '44.mp3', duration: 22, speaker: 'Une femme (Motivante)', transcript: 'Salut. Tu es bien arrivée au bon endroit ? Tu as trouvé ta voie. Ce que tu avais besoin d\'entendre aujourd\'hui, c\'est que tu as raison dans ce que tu fais. Continue et tu y arriveras. De la jamais, les grands gagnants n\'arrivent jamais sans échec. L\'échec est une erreur et un apprentissage qui te mènera loin. Allez vas-y ma go, tu vas tout déchirer !', emotionalLoad: EmotionalLoad.HIGH },
  { filename: '45.mp3', duration: 24, speaker: 'Une femme (Militante)', transcript: 'Alors, moi ce que je peux vous dire, c\'est que euh la vie c\'est un combat, il faut pas baisser les bras. C\'est vrai que quand on est une femme noire, on doit se battre encore deux, dix fois, plusieurs fois. On doit se battre et pas baisser les bras. Quelles que soient les portes qui nous ferment, il y a toujours une porte qui s\'ouvrira. Nous sommes des femmes courageuses, battantes et solidaires. Il faut que notre couleur soit notre force.', emotionalLoad: EmotionalLoad.HIGH },
  { filename: '46.mp3', duration: 6, speaker: 'Une femme (Visiteuse)', transcript: 'Franchement merci pour ce message de motivation euh féminin euh merci beaucoup. Au revoir.', emotionalLoad: EmotionalLoad.MEDIUM },
  { filename: '47.mp3', duration: 2, speaker: 'Anonyme', transcript: 'Bah merci beaucoup hein.', emotionalLoad: EmotionalLoad.LOW },
  { filename: '48.mp3', duration: 4, speaker: 'Anonyme', transcript: 'Bah merci beaucoup hein, ça m\'a fait plaisir.', emotionalLoad: EmotionalLoad.LOW },
  { filename: '49.mp3', duration: 5, speaker: 'Une femme', transcript: 'Merci beaucoup ! Ça fait plaisir. Merci beaucoup bisous.', emotionalLoad: EmotionalLoad.MEDIUM },
  { filename: '50.mp3', duration: 11, speaker: 'Une femme (Bienveillante)', transcript: 'Merci pour tout ce love et je le reporte à quelqu\'un d\'autre qui le mérite tout autant. Tu es belle, magnifique et euh apprends à t\'aimer comme tu es au lieu de te changer.', emotionalLoad: EmotionalLoad.MEDIUM },
  { filename: '51.mp3', duration: 10, speaker: 'Femme (Salon "N\'Kids")', transcript: 'N\'Kids bonjour, nous sommes un salon de coiffure spécialisé pour les enfants à Vaires-sur-Marne. N\'hésitez pas à emmener vos enfants. Bye !', emotionalLoad: EmotionalLoad.LOW },
  { filename: '52.mp3', duration: 13, speaker: 'Une jeune fille', transcript: 'Bah c\'est très gentil comme remarque. On se connait pas mais moi j\'aime beaucoup ce que ce que t\'as dit. Merci. Beaucoup ! Allô ?', emotionalLoad: EmotionalLoad.MEDIUM },
  { filename: '53.mp3', duration: 11, speaker: 'Une femme', transcript: 'Merci pour cette magnifique dose de love, merci pour tout. Et euh nous sommes fortes, nous sommes belles et nous avons du pouvoir. (Rires)', emotionalLoad: EmotionalLoad.MEDIUM },
  { filename: '54.mp3', duration: 28, speaker: 'Gladys (Cliente)', transcript: 'Madame la Présidente bonjour. Tout ce que vous faites est très très très très très bien pour nos cheveux. Soyons rayonnantes, soyons belles, soyons radieuses car nous sommes des femmes avec des cheveux magnifiques. Et grâce à vous, vous nous mettez en valeur chaque jour. Alors moi Gladys, je vous dis merci pour tout ce que vous avez fait à mes cheveux. Au plaisir.', emotionalLoad: EmotionalLoad.HIGH },
  { filename: '55.mp3', duration: 8, speaker: 'Jeune fille / Enfant', transcript: 'Euh merci pour les produits, ma mère elle va être trop belle. Merci. Bisous, merci.', emotionalLoad: EmotionalLoad.MEDIUM },
  { filename: '56.mp3', duration: 11, speaker: 'Une femme (Cliente)', transcript: 'Merci à vous Madame la Présidente. Merci. Ces paroles me vont droit au cœur. Merci beaucoup, on est ensemble, on est fières. Noire et fière. Bisous.', emotionalLoad: EmotionalLoad.HIGH },
  { filename: '57.mp3', duration: 3, speaker: 'Une femme', transcript: 'Girl Power !', emotionalLoad: EmotionalLoad.MEDIUM },
  { filename: '58.mp3', duration: 10, speaker: 'Une femme (Amie)', transcript: 'Tu es forte, tu es capable, tu es puissante. Le monde est à tes pieds. Euh avance et crois en toi.', emotionalLoad: EmotionalLoad.MEDIUM },
  { filename: '59.mp3', duration: 5, speaker: 'Une femme', transcript: 'Super le message, ça me plait. Je je rappellerai.', emotionalLoad: EmotionalLoad.LOW },
  { filename: '60.mp3', duration: 20, speaker: 'Une femme et son fils', transcript: 'Merci ! Le combat continue. Et aimons nous ce qu\'on est, et aimons nos cheveux. Et encore merci. [Enfant] : À moi ! À moi maman ! Ça va ? Il a dit quoi ? Ça va ?', emotionalLoad: EmotionalLoad.MEDIUM },
  { filename: '61.mp3', duration: 5, speaker: 'Une femme', transcript: 'Ah merci c\'est gentil.', emotionalLoad: EmotionalLoad.LOW },
  { filename: '62.mp3', duration: 5, speaker: 'Une femme', transcript: 'Quel café ? Attends pas de parler, attends attends.', emotionalLoad: EmotionalLoad.LOW },
  { filename: '63.mp3', duration: 15, speaker: 'Jeune fille', transcript: 'Bah merci Au revoir. Bah et merci quand même pour tous ces gentils compliments. Et toi aussi je pense que tu as des beaux cheveux même si on se connait pas, bah peut-être qu\'on se connait mais que on voit pas qui on est. Bref merci pour tout ce que tu m\'as dit.', emotionalLoad: EmotionalLoad.MEDIUM },
  { filename: '64.mp3', duration: 15, speaker: 'Jeune fille', transcript: 'Bah merci Au revoir. Bah et merci quand même pour tous ces gentils compliments. Et toi aussi je pense que tu as des beaux cheveux même si on se connait pas, bah peut-être qu\'on se connait mais que on voit pas qui on est. Bref merci pour tout ce que tu m\'as dit.', emotionalLoad: EmotionalLoad.MEDIUM },
  { filename: '65.mp3', duration: 8, speaker: 'Enfant', transcript: 'Aïe aïe ! Dis un truc, dis un truc, dis merci j\'sais pas. Merci pour mes cheveux, vous aussi.', emotionalLoad: EmotionalLoad.LOW },
  { filename: '66.mp3', duration: 15, speaker: 'Une femme', transcript: 'Aaaaaah ! ... Ceci [Crier ?] ... Ah pendant 20 secondes ... Oui encore ? Aaaaaah ! ... Attends attends ! T\'as raccroché ? Bon j\'ai plus de voix pour crier alors je continue par parler. Aaaaaah ! ... Désolée.', emotionalLoad: EmotionalLoad.HIGH },
  { filename: '67.mp3', duration: 12, speaker: 'Une femme', transcript: 'Merci de penser à nous, merci de penser à tous nos cheveux. Merci pour ces mots doux qui font vraiment plaisir et bonne continuation à vous, j\'espère que vous resterez là encore très très longtemps.', emotionalLoad: EmotionalLoad.MEDIUM },
  { filename: '68.mp3', duration: 25, speaker: 'Message (Voix off)', transcript: 'La vie est parfois compliquée, la vie peut te paraître dure, mais ne laisse jamais personne te dire que ce n\'est pas possible. Tu es la seule maîtresse de ton destin, tu es la seule actionnaire de ton avenir, alors mise sur toi. Si tu ne le fais pas, personne ne le fera. Merci à toi. Merci à toi d\'être là. Merci à toi d\'être toi et surtout tous les jours quand tu te lèves continue à croire en toi. Parce que tu sais ce que tu vaux.', emotionalLoad: EmotionalLoad.HIGH },
  { filename: '69.mp3', duration: 20, speaker: 'Enfant', transcript: 'Et Tati Nounié et Tonton Roro. Oh moi je t\'aime trop. Et tu dis : la NHA c\'est trop bien. La NHA c\'est trop bien. Je me suis bien amusée. Je me suis bien amusée. Et j\'ai mangé un snowball. Et j\'ai mangé des sticobos [phonétique]. En fait c\'est Madame la Présidente, faut que tu laisses des messages. Bonjour. Le loulou de... Allô ?', emotionalLoad: EmotionalLoad.MEDIUM },
  { filename: '70.mp3', duration: 18, speaker: 'Séléna (19 ans)', transcript: 'Bonjour, je m\'appelle Séléna, j\'ai 19 ans. Alors j\'ai les cheveux afros, crépus. Aimez vos cheveux, c\'est important. Aimez votre couleur de peau, n\'ayez pas honte. Et prenez soin de vos cheveux. Aimez-vous comme vous êtes. C\'est le principal, c\'est comme ça qu\'on apprend à avoir confiance en soi. Merci beaucoup ! Yeah yeah... Hallelujah [Chant].', emotionalLoad: EmotionalLoad.HIGH },
  { filename: '71.mp3', duration: 15, speaker: 'Une femme (et une amie)', transcript: 'Bonjour, n\'ayez pas honte de votre peau, soyez fière de vous-même, aimez vos cheveux, aimez-vous comme vous êtes... Mais pas le... c\'est pour toi ! Oui. Aimez-vous comme vous êtes, n\'ayez pas honte de votre peau, soyez fière de vous-même. (Rires) Arrête t\'es pas...', emotionalLoad: EmotionalLoad.MEDIUM },
  { filename: '72.mp3', duration: 25, speaker: 'Un homme', transcript: 'Aujourd\'hui je suis fier de moi, je reconnais qui je suis, je veux ma vie. Je dois penser à moi au lieu de penser aux autres. Aujourd\'hui c\'est un jour meilleur, c\'est un renouveau et je me dis la vie elle est belle. La vie elle est très belle, on n\'a pas à se laisser aller, y a tellement de belles choses autour de nous, tellement de choses à partager. Ah c\'est trop, c\'est trop. Mais euh comme je dis vive la vie et il faut s\'aimer et il faut faire les choses comme on en a envie. La vie elle est trop courte, donc...', emotionalLoad: EmotionalLoad.HIGH },
  { filename: '73.mp3', duration: 5, speaker: 'Un homme', transcript: 'Tu es là là comme ça c\'est bon là ? (Rires) Préféré. Salade tomate oignon.', emotionalLoad: EmotionalLoad.LOW },
  { filename: '74.mp3', duration: 5, speaker: 'Noé Mandy (Enfant)', transcript: 'Allô ? Ça va ? Oui je suis Noé Mandy. Je suis l\'agent secret 2.0. Bye bye.', emotionalLoad: EmotionalLoad.LOW },
  { filename: '75.mp3', duration: 8, speaker: 'Mère et Enfant (Chanel)', transcript: 'Coucou ma Chanel, tu es forte, tu es puissante, tu es toute belle et tu passes une super journée ! Tu veux dire allô ? [Enfant] : Allô ? Allô ? Allô ? Allô ?', emotionalLoad: EmotionalLoad.MEDIUM },
  { filename: '76.mp3', duration: 5, speaker: 'Une femme', transcript: '(Chant) My love is your love and your love is my love. Bye.', emotionalLoad: EmotionalLoad.MEDIUM },
  { filename: '77.mp3', duration: 2, speaker: 'Une femme', transcript: 'Merci !', emotionalLoad: EmotionalLoad.LOW },
  { filename: '78.mp3', duration: 3, speaker: 'Une femme', transcript: 'Ah c\'est trop bien !', emotionalLoad: EmotionalLoad.MEDIUM },
  { filename: '79.mp3', duration: 3, speaker: 'Une femme', transcript: 'Merci... (Rires)', emotionalLoad: EmotionalLoad.LOW },
  { filename: '80.mp3', duration: 7, speaker: 'Une femme', transcript: 'Tu es la plus belle. N\'oublie jamais ça. Tu es la plus forte. Tu n\'es pas seule. N\'oublie jamais cela.', emotionalLoad: EmotionalLoad.MEDIUM },
  { filename: '81.mp3', duration: 10, speaker: 'Fatou (Visiteuse)', transcript: 'Coucou, je voudrais vous remercier pour tous les produits que vous avez partagé et tous les produits que vous avez fait découvrir pendant la NHA. Merci beaucoup, un gros bisous Fatou.', emotionalLoad: EmotionalLoad.MEDIUM },
  { filename: '82.mp3', duration: 10, speaker: 'Jeune fille', transcript: 'Euh... vos cheveux c\'est une fierté, c\'est euh c\'est euh quelque chose qui est important, il faut en prendre soin, il faut dire les coiffer, il faut euh il faut euh voilà quoi.', emotionalLoad: EmotionalLoad.MEDIUM },
  { filename: '83.mp3', duration: 15, speaker: 'Jeune fille', transcript: 'Je suis je soyez soyez très fier de vos cheveux car c\'est votre force et vous aussi vous êtes les présidents de vous êtes tous les présidents même si je vous connais pas. Et je vous fais plein de gros bisous. Au revoir. M\'avez donné confiance en moi.', emotionalLoad: EmotionalLoad.MEDIUM },
  { filename: '84.mp3', duration: 20, speaker: 'Jeune fille', transcript: 'Allô ? Oui alors je suis là pour vous dire que vos cheveux c\'est votre fierté, c\'est tout ce qu\'il y a de plus important, faut bien les les hydrater, les euh euh les les nourrir, les euh c\'est notre deuxième nous euh c\'est notre c\'est comme si c\'était une partie enfin c\'est une partie de nous, faut vraiment beaucoup en prendre soin et puis ben voilà. Nos cheveux c\'est notre fierté, prenez-en beaucoup soin comme ça vous aurez un gros tafro [Afro ?] quand vous serez grande.', emotionalLoad: EmotionalLoad.HIGH },
  { filename: '85.mp3', duration: 18, speaker: 'Jeune fille', transcript: 'Je suis euh nos cheveux sont notre deuxième nous. On doit on doit les hydrater comme on le fait pour nous, on doit les nourrir comme on le fait pour nous. On doit en prendre soin comme on le fait pour nous. C\'est une grandeur. Pour les femmes, les cheveux sont importants. Ça reflète tout.', emotionalLoad: EmotionalLoad.HIGH },
];

async function ensureBucketExists() {
  try {
    const exists = await minioClient.bucketExists(BUCKET_NAME);
    if (!exists) {
      await minioClient.makeBucket(BUCKET_NAME);
      console.log(`Bucket ${BUCKET_NAME} créé`);
    } else {
      console.log(`Bucket ${BUCKET_NAME} existe déjà`);
    }
  } catch (error) {
    console.error('Erreur lors de la vérification/création du bucket:', error);
    throw error;
  }
}

async function uploadAudioFile(filename: string, projectId: string): Promise<string> {
  // Cherche dans plusieurs chemins possibles (local et Docker)
  const possiblePaths = [
    path.join(process.cwd(), 'data', 'audios', filename),      // Docker: /app/data/audios
    path.join(process.cwd(), '..', 'data', 'audios', filename), // Local: backend/../data/audios
    path.join(__dirname, '..', '..', 'data', 'audios', filename), // Docker depuis prisma/
  ];
  
  let localPath: string | null = null;
  for (const p of possiblePaths) {
    if (fs.existsSync(p)) {
      localPath = p;
      break;
    }
  }
  
  if (!localPath) {
    console.warn(`Fichier audio non trouvé: ${filename} (cherché dans: ${possiblePaths.join(', ')})`);
    return '';
  }
  
  console.log(`Fichier trouvé: ${localPath}`);

  const objectName = `${projectId}/${filename}`;
  
  try {
    await minioClient.fPutObject(BUCKET_NAME, objectName, localPath, {
      'Content-Type': 'audio/mpeg',
    });
    console.log(`Uploadé: ${filename} -> ${objectName}`);
    return objectName;
  } catch (error) {
    console.error(`Erreur upload ${filename}:`, error);
    return '';
  }
}

async function main() {
  console.log('🌱 Démarrage du seed...\n');

  // Vérifier/créer le bucket MinIO
  await ensureBucketExists();

  // 1. Créer l'utilisateur admin
  console.log('👤 Création de l\'utilisateur admin...');
  const admin = await prisma.user.upsert({
    where: { email: 'admin@allocorner.com' },
    update: {},
    create: {
      email: 'admin@allocorner.com',
      passwordHash: '$2b$10$K3KS63e.4q.Fj0JgAkOhcu.DigtSNkhvFROSfkOZAtf45e0k8hcxC', // admin123
      name: 'Administrateur',
      role: Role.SUPERADMIN,
    },
  });
  console.log(`✅ Utilisateur créé: ${admin.email} (${admin.id})\n`);

  // 2. Créer le projet
  console.log('📁 Création du projet...');
  const project = await prisma.project.create({
    data: {
      clientName: PROJECT_DATA.clientName,
      title: PROJECT_DATA.title,
      dates: PROJECT_DATA.dates,
      context: PROJECT_DATA.context,
      analyst: PROJECT_DATA.analyst,
      methodology: PROJECT_DATA.methodology,
      participantsEstimated: PROJECT_DATA.participantsEstimated,
      createdById: admin.id,
    },
  });
  console.log(`✅ Projet créé: ${project.title} (${project.id})\n`);

  // 3. Créer les métriques IRC
  console.log('📊 Création des métriques IRC...');
  await prisma.projectMetrics.create({
    data: {
      projectId: project.id,
      messagesCount: METRICS_DATA.messagesCount,
      avgDurationSec: METRICS_DATA.avgDurationSec,
      totalDurationSec: METRICS_DATA.totalDurationSec,
      participationRate: METRICS_DATA.participationRate,
      ircScore: METRICS_DATA.ircScore,
      tonalityAvg: METRICS_DATA.tonalityAvg,
      highEmotionShare: METRICS_DATA.highEmotionShare,
      ircInterpretation: METRICS_DATA.ircInterpretation,
      emotionalClimate: METRICS_DATA.emotionalClimate,
    },
  });
  console.log('✅ Métriques IRC créées\n');

  // 4. Créer les données Plutchik
  console.log('🎨 Création des données Plutchik...');
  await prisma.projectPlutchik.create({
    data: {
      projectId: project.id,
      joy: PLUTCHIK_DATA.joy,
      trust: PLUTCHIK_DATA.trust,
      sadness: PLUTCHIK_DATA.sadness,
      anticipation: PLUTCHIK_DATA.anticipation,
      anger: PLUTCHIK_DATA.anger,
      surprise: PLUTCHIK_DATA.surprise,
      fear: PLUTCHIK_DATA.fear,
      cocktailSummary: PLUTCHIK_DATA.cocktailSummary,
    },
  });
  console.log('✅ Données Plutchik créées\n');

  // 5. Créer les thèmes avec leurs mots-clés
  console.log('🎭 Création des thèmes...');
  const themeMap = new Map<string, string>();
  for (let i = 0; i < THEMES_DATA.length; i++) {
    const themeData = THEMES_DATA[i];
    const theme = await prisma.theme.create({
      data: {
        projectId: project.id,
        name: themeData.name,
        temporality: themeData.temporality,
        emotionLabel: themeData.emotionLabel,
        analysis: themeData.analysis,
        verbatimTotem: themeData.verbatimTotem,
        color: themeData.color,
        count: Math.floor(Math.random() * 20) + 5,
        keywords: {
          create: themeData.keywords.map(keyword => ({ keyword })),
        },
      },
      include: {
        keywords: true,
      },
    });
    themeMap.set(theme.name, theme.id);
    console.log(`  Thème créé: ${theme.name} (${theme.keywords.length} mots-clés)`);
  }
  console.log('✅ Thèmes créés\n');

  // 6. Créer les messages et uploader les fichiers audio
  console.log('🎙️ Création des messages et upload des fichiers audio...');
  const messageMap = new Map<string, string>();
  
  for (let i = 0; i < VERBATIMS_DATA.length; i++) {
    const verbatim = VERBATIMS_DATA[i];
    const audioKey = await uploadAudioFile(verbatim.filename, project.id);
    
    const message = await prisma.message.create({
      data: {
        projectId: project.id,
        filename: verbatim.filename,
        audioKey: audioKey,
        duration: verbatim.duration,
        speaker: verbatim.speaker,
        transcriptTxt: verbatim.transcript,
        emotionalLoad: verbatim.emotionalLoad,
      },
    });
    messageMap.set(verbatim.filename, message.id);
    console.log(`  Message créé: ${verbatim.filename}`);
  }
  console.log('✅ Messages créés\n');

  // 7. Créer les verbatims marquants
  console.log('⭐ Création des verbatims marquants...');
  for (const verbatim of FEATURED_VERBATIMS_DATA) {
    await prisma.featuredVerbatim.create({
      data: {
        projectId: project.id,
        category: verbatim.category,
        citation: verbatim.citation,
        implication: verbatim.implication,
      },
    });
    console.log(`  Verbatim marquant: ${verbatim.category}`);
  }
  console.log('✅ Verbatims marquants créés\n');

  // 8. Créer les recommandations
  console.log('💡 Création des recommandations...');
  for (let i = 0; i < RECOMMENDATIONS_DATA.length; i++) {
    const rec = RECOMMENDATIONS_DATA[i];
    await prisma.recommendation.create({
      data: {
        projectId: project.id,
        title: rec.title,
        objective: rec.objective,
        priority: rec.priority,
        position: i,
      },
    });
    console.log(`  Recommandation: ${rec.title}`);
  }
  console.log('✅ Recommandations créées\n');

  // 9. Créer les tendances
  console.log('📈 Création des tendances...');
  await prisma.trends.create({
    data: {
      projectId: project.id,
      mainTrends: JSON.stringify(TRENDS_DATA.mainTrends),
      strengths: JSON.stringify(TRENDS_DATA.strengths),
      recurringWords: JSON.stringify(TRENDS_DATA.recurringWords),
      weakSignal: TRENDS_DATA.weakSignal,
      weakSignalDetail: TRENDS_DATA.weakSignalDetail,
    },
  });
  console.log('✅ Tendances créées\n');

  // 10. Créer les analyses transversales
  console.log('🔍 Création des analyses transversales...');
  for (const trans of TRANSVERSAL_DATA) {
    await prisma.transversalAnalysis.create({
      data: {
        projectId: project.id,
        axis: trans.axis,
        category: trans.category,
        content: trans.content,
      },
    });
    console.log(`  Analyse: ${trans.axis} - ${trans.category}`);
  }
  console.log('✅ Analyses transversales créées\n');

  // 11. Créer les objectifs du projet
  console.log('🎯 Création des objectifs...');
  const OBJECTIVES_DATA = [
    "Recueillir la parole spontanée des visiteurs en sortie d'expérience stand.",
    "Analyse sémantique et émotionnelle profonde des verbatims récoltés.",
    "Identifier les signaux faibles et les piliers de satisfaction client.",
    "Mesurer l'alignement entre les objectifs de marque et le ressenti réel."
  ];
  
  for (let i = 0; i < OBJECTIVES_DATA.length; i++) {
    await prisma.projectObjective.create({
      data: {
        projectId: project.id,
        content: OBJECTIVES_DATA[i],
        position: i,
      },
    });
  }
  console.log(`✅ ${OBJECTIVES_DATA.length} objectifs créés\n`);

  // 12. Créer les actions stratégiques
  console.log('💡 Création des actions stratégiques...');
  const STRATEGIC_ACTIONS_DATA = [
    {
      title: "Lancer la gamme 'Monsieur le Président'",
      description: "Capter le segment masculin émergent avec des produits dédiés",
      priority: Priority.MOYENNE,
      timeline: "6-9 mois",
      resources: "R&D, Marketing, Production",
    },
    {
      title: "Kit 'Junior Expert' (Rentrée Collège)",
      description: "Capitaliser sur la transmission intergénérationnelle",
      priority: Priority.HAUTE,
      timeline: "3-6 mois",
      resources: "R&D, Packaging, Marketing",
    },
    {
      title: "Stratégie B2B 'Salons Partenaires'",
      description: "Déployer le format Allo Corner chez les coiffeurs partenaires",
      priority: Priority.HAUTE,
      timeline: "6-12 mois",
      resources: "Sales, Partnerships",
    },
  ];
  
  for (let i = 0; i < STRATEGIC_ACTIONS_DATA.length; i++) {
    await prisma.strategicAction.create({
      data: {
        projectId: project.id,
        ...STRATEGIC_ACTIONS_DATA[i],
        position: i,
      },
    });
  }
  console.log(`✅ ${STRATEGIC_ACTIONS_DATA.length} actions stratégiques créées\n`);

  // 13. Créer l'IRC Breakdown
  console.log('📊 Création de la décomposition IRC...');
  await prisma.ircBreakdown.create({
    data: {
      projectId: project.id,
      intensity: 72,
      thematicRichness: 68,
      narrativeCoherence: 61,
      originality: 58,
    },
  });
  console.log('✅ Décomposition IRC créée\n');

  // 14. Créer les ressources téléchargeables
  console.log('📁 Création des ressources...');
  const RESOURCES_DATA = [
    {
      title: "Rapport complet d'analyse",
      description: "Document PDF synthétisant l'ensemble des résultats et recommandations",
      type: "PDF",
      size: "2.4 MB",
    },
    {
      title: "Dataset des messages",
      description: "Fichier CSV avec métadonnées, transcriptions et classifications thématiques",
      type: "CSV",
      size: "456 KB",
    },
  ];
  
  for (let i = 0; i < RESOURCES_DATA.length; i++) {
    await prisma.projectResource.create({
      data: {
        projectId: project.id,
        ...RESOURCES_DATA[i],
        position: i,
      },
    });
  }
  console.log(`✅ ${RESOURCES_DATA.length} ressources créées\n`);

  console.log('🎉 Seed terminé avec succès !');
  console.log(`\nRésumé:`);
  console.log(`  - Projet: ${project.title}`);
  console.log(`  - 85 messages audio uploadés`);
  console.log(`  - 5 thèmes créés`);
  console.log(`  - 5 verbatims marquants`);
  console.log(`  - 5 recommandations`);
  console.log(`  - Métriques IRC et Plutchik`);
  console.log(`  - ${OBJECTIVES_DATA.length} objectifs`);
  console.log(`  - ${STRATEGIC_ACTIONS_DATA.length} actions stratégiques`);
  console.log(`  - Décomposition IRC`);
  console.log(`  - ${RESOURCES_DATA.length} ressources`);
}

main()
  .catch((e) => {
    console.error('❌ Erreur lors du seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
