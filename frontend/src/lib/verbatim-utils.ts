import { SpeakerProfile, Tone } from "./types";

export const speakerProfileLabel: Record<SpeakerProfile, string> = {
    CHILD: "Enfant",
    TEENAGER: "Adolescent(e)",
    TEENAGER_GIRL: "Adolescente",
    TEENAGER_BOY: "Adolescent",
    YOUNG_ADULT: "Jeune adulte",
    YOUNG_WOMAN: "Jeune femme",
    YOUNG_MAN: "Jeune homme",
    ADULT: "Adulte",
    ADULT_WOMAN: "Femme adulte",
    ADULT_MAN: "Homme adulte",
    SENIOR: "Senior",
    SENIOR_WOMAN: "Femme senior",
    SENIOR_MAN: "Homme senior",
    PROFESSIONAL: "Professionnel",
    PARENT: "Parent",
    STUDENT: "Étudiant(e)",
    OTHER: "Autre",
};

export const speakerProfileColor: Record<SpeakerProfile, string> = {
    CHILD: "bg-yellow-400/10 text-yellow-600",
    TEENAGER: "bg-lime-400/10 text-lime-600",
    TEENAGER_GIRL: "bg-pink-500/10 text-pink-600",
    TEENAGER_BOY: "bg-sky-400/10 text-sky-600",
    YOUNG_ADULT: "bg-cyan-400/10 text-cyan-600",
    YOUNG_WOMAN: "bg-fuchsia-500/10 text-fuchsia-600",
    YOUNG_MAN: "bg-blue-400/10 text-blue-500",
    ADULT: "bg-slate-400/10 text-slate-600",
    ADULT_WOMAN: "bg-violet-500/10 text-violet-600",
    ADULT_MAN: "bg-blue-600/10 text-blue-700",
    SENIOR: "bg-amber-400/10 text-amber-700",
    SENIOR_WOMAN: "bg-rose-400/10 text-rose-600",
    SENIOR_MAN: "bg-indigo-500/10 text-indigo-700",
    PROFESSIONAL: "bg-emerald-500/10 text-emerald-700",
    PARENT: "bg-orange-400/10 text-orange-600",
    STUDENT: "bg-teal-400/10 text-teal-600",
    OTHER: "bg-muted text-muted-foreground/60",
};

export const toneLabel: Record<Tone, string> = {
    POSITIVE: "Positif",
    NEGATIVE: "Négatif",
    NEUTRAL: "Neutre",
};

export const toneColor: Record<Tone, string> = {
    POSITIVE: "bg-green-500/10 text-green-600",
    NEGATIVE: "bg-red-500/10 text-red-600",
    NEUTRAL: "bg-muted text-muted-foreground/60",
};
