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
  difficulty: number; // 1-3 stars
  category: string;
}

export const eventData: EventData = {
  client: "Archives de la Charente",
  title: "Journées Européennes du Patrimoine",
  dates: "21 & 22 septembre 2024",
  participants_estimated: 200,
  context: "Sonder les représentations liées au Département de la Charente et recueillir la parole citoyenne.",
  metrics: {
    messages_count: 163,
    avg_duration_sec: 54.5,
    total_duration_sec: 1636,
    participation_rate_estimated: 0.815,
    irc_score: 66,
    tonality_avg: 3.2,
    high_emotion_share: 0.59
  },
  plutchik: {
    joy: 0.33,
    trust: 0.26,
    sadness: 0.18,
    anticipation: 0.12,
    anger: 0.07,
    surprise: 0.04
  }
};

export const themes: Theme[] = [
  {
    name: "Fierté territoriale & attachement",
    count: 33,
    color: "#2F66F5",
    extract: "Un département qu'on protège, qu'on développe. Et qui survivra à l'an 3000."
  },
  {
    name: "Nostalgie, transmission & mémoire",
    count: 43,
    color: "#FFC629",
    extract: "Je laisse ce message pour mes enfants… s'il reste quelque chose de la Charente."
  },
  {
    name: "Critique de la centralisation & besoin de représentation locale",
    count: 22,
    color: "#E35454",
    extract: "Si le Département disparaît, on perd notre relais, notre voix."
  },
  {
    name: "Humour & dérision futuriste",
    count: 43,
    color: "#39B36A",
    extract: "J'espère qu'il y aura des charentaises volantes !"
  },
  {
    name: "Identité locale & perte potentielle",
    count: 22,
    color: "#8B5CF6",
    extract: "Si le Département disparaît… on aura perdu notre identité charentaise."
  }
];

export const messages: Message[] = [
  {
    filename: "03.mp3",
    audio_url: "/demo/03.mp3",
    transcript_txt: "On est nés ici, et on veut que ça continue. C'est notre terre, notre histoire, nos racines. Le département, c'est pas juste une administration, c'est notre identité.",
    themes: ["Fierté territoriale & attachement"],
    emotions: ["joie", "confiance"],
    emotional_load: "high",
    quote: "On est nés ici, et on veut que ça continue."
  },
  {
    filename: "07.mp3",
    audio_url: "/demo/07.mp3",
    transcript_txt: "Je veux que mes enfants entendent ça un jour. Qu'ils comprennent d'où ils viennent, ce que leurs ancêtres ont construit ici. C'est important de transmettre.",
    themes: ["Nostalgie, transmission & mémoire"],
    emotions: ["anticipation", "joie"],
    emotional_load: "high",
    quote: "Je veux que mes enfants entendent ça un jour."
  },
  {
    filename: "10.mp3",
    audio_url: "/demo/10.mp3",
    transcript_txt: "Ça me fait peur, si le Département disparaît, c'est un bout de nous qui s'efface. On sera juste un numéro dans une grande région anonyme.",
    themes: ["Identité locale & perte potentielle"],
    emotions: ["tristesse", "peur"],
    emotional_load: "high",
    quote: "Ça me fait peur, si le Département disparaît, c'est un bout de nous qui s'efface."
  },
  {
    filename: "16.mp3",
    audio_url: "/demo/16.mp3",
    transcript_txt: "J'ai ramené mon père, qui a 82 ans, pour qu'il laisse un message. Il a tant d'histoires à raconter sur la Charente d'avant.",
    themes: ["Nostalgie, transmission & mémoire"],
    emotions: ["confiance"],
    emotional_load: "medium",
    quote: "J'ai ramené mon père, qui a 82 ans, pour qu'il laisse un message."
  },
  {
    filename: "23.mp3",
    audio_url: "/demo/23.mp3",
    transcript_txt: "Charentais de cœur et pour toujours ! Peu importe ce qui arrive, on restera fiers de nos origines.",
    themes: ["Fierté territoriale & attachement"],
    emotions: ["joie"],
    emotional_load: "medium",
    quote: "Charentais de cœur et pour toujours !"
  }
];

export const recommendations: Recommendation[] = [
  {
    title: "Valoriser le lien affectif au territoire",
    objective: "S'appuyer sur l'attachement local",
    difficulty: 3,
    category: "Communication"
  },
  {
    title: "Espace en ligne pour prolonger la mémoire",
    objective: "Transmission intergénérationnelle",
    difficulty: 2,
    category: "Numérique"
  },
  {
    title: "Intégrer des extraits audio dans une expo",
    objective: "Mettre en valeur le point de vue citoyen",
    difficulty: 2,
    category: "Médiation"
  },
  {
    title: "Inviter des publics éloignés à s'exprimer",
    objective: "Inclusion",
    difficulty: 2,
    category: "Participation"
  }
];

export const trends = {
  main_trends: [
    "Affection locale forte",
    "Besoin de laisser une trace",
    "Crainte d'effacement identitaire"
  ],
  strengths: [
    "Diversité des tonalités",
    "Spontanéité des témoignages",
    "Richesse émotionnelle"
  ],
  frequent_words: [
    "Charente", "mémoire", "département", "enfants", "territoire", "identité", "histoire", "avenir"
  ],
  weak_signal: "Critiques de la centralisation"
};