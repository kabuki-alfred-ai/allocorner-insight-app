

# Mise a jour du Dashboard avec les donnees "Madame la Presidente"

## Resume

Remplacer toutes les donnees statiques dans `src/lib/data.ts` par les donnees extraites du fichier XLSX fourni. Cela mettra a jour automatiquement le Dashboard et toutes les pages qui consomment ces donnees.

## Donnees a mettre a jour

### 1. eventData (informations generales et metriques)

| Champ | Ancienne valeur | Nouvelle valeur |
|-------|----------------|-----------------|
| client | Archives de la Charente | Madame la Presidente |
| title | Journees Europeennes du Patrimoine | Natural Hair Academy (NHA) - Stand Allo Corner |
| dates | 21 & 22 septembre 2024 | 02 fevrier 2026 |
| participants_estimated | 200 | 85 (corpus analyse) |
| context | Sonder les representations... | Recueillir la parole des visiteurs et clients sur le stand Allo Corner lors de la NHA |
| messages_count | 163 | 85 |
| avg_duration_sec | 54.5 | 12.5 (estimation basee sur les durees du fichier) |
| irc_score | 66 | 78 |
| tonality_avg | 3.2 | 4.2 |
| high_emotion_share | 0.59 | 0.70 |

**Plutchik (emotions)** selon Page 8 :
- joy: 0.50
- trust: 0.25
- anticipation: 0.15
- sadness: 0.05
- anger: 0.00
- surprise: 0.05

### 2. themes (5 thematiques)

Remplacement complet par les 5 themes de la Page 5 :

1. **La Reparation Identitaire (Le "Care" Profond)** - couleur bleue
2. **Le Culte Bienveillant de la "Presidente"** - couleur jaune
3. **L'Heritage et l'Education (Les Enfants Savants)** - couleur verte
4. **La "Dose de Love" (L'Energie Collective)** - couleur rouge
5. **L'Empowerment et l'Ambition ("Black Queen")** - couleur violette

Chaque theme avec son verbatim totem et un nombre de messages estime (repartition proportionnelle sur 85 messages).

### 3. messages (verbatims)

Remplacer les 5 messages d'exemple par 5 verbatims representatifs du fichier :
- Message 6 (Reparation identitaire / pelade)
- Message 7 (Culte de la Presidente)
- Message 20 (Enfant 10 ans / Heritage)
- Message 28 (Entrepreneure / Empowerment)
- Message 15 (Cliente fidele / Dose de Love)

### 4. recommendations

Remplacement par les 5 recommandations de la Page 9 :
1. Lancer la gamme "Monsieur le President" (priorite moyenne)
2. Kit "Junior Expert" (Rentree College) (priorite haute)
3. Strategie B2B "Salons Partenaires" (priorite haute)
4. La "Dose de Love" (UGC) (priorite haute)
5. Campagne "Business & Crown" (priorite basse)

### 5. trends

Mise a jour avec les donnees des Pages 3 et 7 :
- **main_trends** : Le Cheveu comme Manifeste Politique, L'Education Transgenerationnelle Reussie, La Marque Refuge
- **strengths** : Impact Emotionnel Majeur, Credibilite Scientifique, Ambassadeurs Spontanes
- **frequent_words** : love, merci, fierte, cheveux, confiance, belle, force, soin, ancetres, presidente
- **weak_signal** : L'eveil masculin

## Details techniques

Un seul fichier a modifier : `src/lib/data.ts`. Toutes les pages (Dashboard, Themes, Verbatims, Emotions, Tendances, Recommandations) se mettront a jour automatiquement car elles importent les donnees depuis ce fichier.

