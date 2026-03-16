import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { Tone, SpeakerProfile } from '@prisma/client';
import { VoiceGender } from '../audio/pitch-analysis.service';

export interface AudioAnalysisResult {
  tone: Tone;
  speakerProfile: SpeakerProfile;
}

@Injectable()
export class ClaudeService {
  private readonly logger = new Logger(ClaudeService.name);
  private readonly genAI: GoogleGenerativeAI;

  constructor(private configService: ConfigService) {
    const apiKey = this.configService.get<string>('gemini.apiKey');
    this.genAI = new GoogleGenerativeAI(apiKey!);
  }

  async analyzeTranscription(transcriptTxt: string, voiceGender?: VoiceGender): Promise<AudioAnalysisResult> {
    const pitchContext = voiceGender && voiceGender !== 'UNKNOWN'
      ? `\nINFORMATION ACOUSTIQUE FIABLE : L'analyse du pitch audio indique une ${
          voiceGender === 'MALE' ? 'voix masculine' :
          voiceGender === 'FEMALE' ? 'voix féminine' : 'voix enfantine'
        }. Utilise cette information comme critère déterminant pour le genre dans speakerProfile.\n`
      : '';

    const prompt = `Tu es un expert en analyse sociolinguistique de verbatims issus d'études qualitatives en français.
${pitchContext}

Analyse cette transcription et détermine :

1. La **tonalité** :
   - POSITIVE : satisfaction, enthousiasme, confiance, appréciation
   - NEGATIVE : mécontentement, frustration, critique, inquiétude
   - NEUTRAL : factuel, descriptif, sans émotion marquée

2. Le **profil du locuteur** — procède en DEUX ÉTAPES :

ÉTAPE A — Détermine la tranche d'âge et le rôle social à partir du vocabulaire, des références culturelles et du registre :
   - CHILD (< 12 ans) : syntaxe imparfaite, vocabulaire très simple, références école primaire/jeux d'enfants
   - TEENAGER (12-17 ans) : argot adolescent, verlan, références réseaux sociaux/jeux vidéo/lycée
   - YOUNG_ADULT (18-25 ans) : références études supérieures, sorties, premiers emplois, vocabulaire courant
   - ADULT (26-45 ans) : vocabulaire varié et posé, références travail/famille/responsabilités
   - SENIOR (46+ ans) : registre formel ou traditionnel, références carrière/retraite/santé/passé
   - PROFESSIONAL (tout âge) : jargon métier très marqué, discours analytique et structuré
   - PARENT (tout âge) : les enfants/l'éducation sont la priorité centrale et explicite du discours
   - STUDENT (18-25 ans) : références explicites aux études supérieures, campus, examens, vie étudiante

ÉTAPE B — Affine avec le genre UNIQUEMENT s'il existe des marqueurs grammaticaux explicites en français :
   Marqueurs féminins : accords au féminin à la 1ère personne ("je suis contente", "je suis allée", "je me suis sentie", "ravie", "fatiguée", "stressée", "désolée", etc.)
   Marqueurs masculins : accords au masculin à la 1ère personne ("je suis content", "je suis allé", "je me suis senti", "ravi", "fatigué", "stressé", "désolé", etc.)
   Marqueurs explicites : mention directe du genre ("en tant que femme/mère/fille", "en tant qu'homme/père/fils")

   Si des marqueurs féminins sont présents → utilise la variante féminine : TEENAGER_GIRL / YOUNG_WOMAN / ADULT_WOMAN / SENIOR_WOMAN
   Si des marqueurs masculins sont présents → utilise la variante masculine : TEENAGER_BOY / YOUNG_MAN / ADULT_MAN / SENIOR_MAN
   Si AUCUN marqueur de genre n'est identifiable → utilise la variante neutre : TEENAGER / YOUNG_ADULT / ADULT / SENIOR

RÈGLE ABSOLUE : Ne jamais deviner le genre à partir du sujet abordé, du style ou des suppositions culturelles. Uniquement sur la base de marqueurs grammaticaux ou d'auto-identification explicite.

Transcription : "${transcriptTxt}"

Réponds UNIQUEMENT avec un objet JSON valide, sans texte autour :
{"tone": "POSITIVE", "speakerProfile": "ADULT_WOMAN"}`;

    try {
      const model = this.genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
      const result = await model.generateContent(prompt);
      const text = result.response.text().trim();

      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) throw new Error(`No JSON in response: ${text}`);

      const parsed = JSON.parse(jsonMatch[0]) as { tone: string; speakerProfile: string };

      const tone = this.validateTone(parsed.tone);
      const speakerProfile = this.validateSpeakerProfile(parsed.speakerProfile);

      this.logger.log(`Gemini analysis: tone=${tone}, speakerProfile=${speakerProfile}`);
      return { tone, speakerProfile };
    } catch (error) {
      this.logger.error('Gemini analysis failed, using defaults', error.message);
      return { tone: 'NEUTRAL', speakerProfile: 'OTHER' };
    }
  }

  private validateTone(value: string): Tone {
    const valid: Tone[] = ['POSITIVE', 'NEGATIVE', 'NEUTRAL'];
    return valid.includes(value as Tone) ? (value as Tone) : 'NEUTRAL';
  }

  private validateSpeakerProfile(value: string): SpeakerProfile {
    const valid = [
      'CHILD',
      'TEENAGER', 'TEENAGER_GIRL', 'TEENAGER_BOY',
      'YOUNG_ADULT', 'YOUNG_WOMAN', 'YOUNG_MAN',
      'ADULT', 'ADULT_WOMAN', 'ADULT_MAN',
      'SENIOR', 'SENIOR_WOMAN', 'SENIOR_MAN',
      'PROFESSIONAL', 'PARENT', 'STUDENT', 'OTHER',
    ];
    return (valid.includes(value) ? value : 'OTHER') as SpeakerProfile;
  }
}
