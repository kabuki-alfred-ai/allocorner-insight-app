export interface EventData {
  client: string;
  title: string;
  dates: string;
  participants_estimated: number;
  context: string;
  metrics: {
    messages_count: number;
    avg_duration_sec: number;
    total_duration_sec: number;
    participation_rate_estimated: number;
    irc_score: number;
    tonality_avg: number;
    high_emotion_share: number;
  };
  plutchik: {
    joy: number;
    trust: number;
    sadness: number;
    anticipation: number;
    anger: number;
    surprise: number;
  };
}

export interface Theme {
  name: string;
  count: number;
  color: string;
  extract?: string;
}

export interface Message {
  filename: string;
  audio_url: string;
  transcript_txt: string;
  themes: string[];
  emotions: string[];
  emotional_load: 'low' | 'medium' | 'high';
  quote: string;
}

export interface Recommendation {
  title: string;
  objective: string;
  difficulty: number;
  category: string;
}

export const eventData: EventData = {
  client: "Madame la Présidente",
  title: "Natural Hair Academy (NHA) - Stand Allo Corner",
  dates: "02 février 2026",
  participants_estimated: 85,
  context: "Recueillir la parole des visiteurs et clients sur le stand Allo Corner lors de la NHA.",
  metrics: {
    messages_count: 85,
    avg_duration_sec: 12.5,
    total_duration_sec: 1063,
    participation_rate_estimated: 1.0,
    irc_score: 78,
    tonality_avg: 4.2,
    high_emotion_share: 0.70
  },
  plutchik: {
    joy: 0.50,
    trust: 0.25,
    sadness: 0.05,
    anticipation: 0.15,
    anger: 0.00,
    surprise: 0.05
  }
};

export const themes: Theme[] = [
  {
    name: "La Réparation Identitaire (Le \"Care\" Profond)",
    count: 22,
    color: "#2F66F5",
    extract: "Depuis que j'utilise ses produits, je me suis réconciliée avec mes cheveux. C'est pas juste du soin, c'est de la réparation."
  },
  {
    name: "Le Culte Bienveillant de la \"Présidente\"",
    count: 20,
    color: "#FFC629",
    extract: "Elle nous parle comme une grande sœur. On sent qu'elle nous comprend vraiment."
  },
  {
    name: "L'Héritage et l'Éducation (Les Enfants Savants)",
    count: 17,
    color: "#39B36A",
    extract: "Ma fille de 10 ans connaît tous les produits. Elle sait prendre soin de ses cheveux toute seule."
  },
  {
    name: "La \"Dose de Love\" (L'Énergie Collective)",
    count: 14,
    color: "#E35454",
    extract: "À chaque fois que je viens, c'est comme une dose de love. On repart rechargée."
  },
  {
    name: "L'Empowerment et l'Ambition (\"Black Queen\")",
    count: 12,
    color: "#8B5CF6",
    extract: "Elle m'a donné envie de lancer mon propre projet. Si elle a réussi, pourquoi pas moi ?"
  }
];

export const messages: Message[] = [
  {
    filename: "06.mp3",
    audio_url: "/demo/06.mp3",
    transcript_txt: "J'ai eu une pelade il y a trois ans. J'avais honte, je portais des perruques. Depuis que j'utilise ses produits, mes cheveux repoussent. C'est pas juste cosmétique, c'est une renaissance.",
    themes: ["La Réparation Identitaire (Le \"Care\" Profond)"],
    emotions: ["joie", "confiance"],
    emotional_load: "high",
    quote: "C'est pas juste cosmétique, c'est une renaissance."
  },
  {
    filename: "07.mp3",
    audio_url: "/demo/07.mp3",
    transcript_txt: "Madame la Présidente, c'est notre grande sœur à toutes. Elle nous comprend, elle nous parle avec le cœur. On sent que c'est sincère.",
    themes: ["Le Culte Bienveillant de la \"Présidente\""],
    emotions: ["confiance", "joie"],
    emotional_load: "high",
    quote: "Elle nous parle avec le cœur. On sent que c'est sincère."
  },
  {
    filename: "20.mp3",
    audio_url: "/demo/20.mp3",
    transcript_txt: "J'ai 10 ans et je connais tous les produits de Madame la Présidente. C'est ma maman qui m'a appris. Maintenant c'est moi qui fais mes cheveux toute seule.",
    themes: ["L'Héritage et l'Éducation (Les Enfants Savants)"],
    emotions: ["joie", "anticipation"],
    emotional_load: "medium",
    quote: "Maintenant c'est moi qui fais mes cheveux toute seule."
  },
  {
    filename: "28.mp3",
    audio_url: "/demo/28.mp3",
    transcript_txt: "Je suis entrepreneure et Madame la Présidente m'inspire tous les jours. Elle a construit un empire en restant authentique. Ça me donne la force de continuer.",
    themes: ["L'Empowerment et l'Ambition (\"Black Queen\")"],
    emotions: ["anticipation", "joie"],
    emotional_load: "high",
    quote: "Elle a construit un empire en restant authentique."
  },
  {
    filename: "15.mp3",
    audio_url: "/demo/15.mp3",
    transcript_txt: "Je suis cliente depuis le début. À chaque salon, je viens chercher ma dose de love. L'énergie ici, c'est incomparable. On repart toujours rechargée.",
    themes: ["La \"Dose de Love\" (L'Énergie Collective)"],
    emotions: ["joie"],
    emotional_load: "medium",
    quote: "À chaque salon, je viens chercher ma dose de love."
  }
];

export const recommendations: Recommendation[] = [
  {
    title: "Lancer la gamme \"Monsieur le Président\"",
    objective: "Capter le segment masculin émergent",
    difficulty: 2,
    category: "Produit"
  },
  {
    title: "Kit \"Junior Expert\" (Rentrée Collège)",
    objective: "Capitaliser sur la transmission intergénérationnelle",
    difficulty: 3,
    category: "Produit"
  },
  {
    title: "Stratégie B2B \"Salons Partenaires\"",
    objective: "Déployer le format Allo Corner chez les coiffeurs partenaires",
    difficulty: 3,
    category: "Distribution"
  },
  {
    title: "La \"Dose de Love\" (UGC)",
    objective: "Transformer les témoignages spontanés en contenu marketing",
    difficulty: 3,
    category: "Communication"
  },
  {
    title: "Campagne \"Business & Crown\"",
    objective: "Mettre en avant les entrepreneures inspirées par la marque",
    difficulty: 1,
    category: "Communication"
  }
];

export const trends = {
  main_trends: [
    "Le Cheveu comme Manifeste Politique",
    "L'Éducation Transgénérationnelle Réussie",
    "La Marque Refuge"
  ],
  strengths: [
    "Impact Émotionnel Majeur",
    "Crédibilité Scientifique",
    "Ambassadeurs Spontanés"
  ],
  frequent_words: [
    "love", "merci", "fierté", "cheveux", "confiance", "belle", "force", "soin", "ancêtres", "présidente"
  ],
  weak_signal: "L'éveil masculin"
};
