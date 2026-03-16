-- Migration: expand SpeakerProfile enum with more granular profiles

-- Step 1: Create new enum type with all values
CREATE TYPE "SpeakerProfile_new" AS ENUM (
  'CHILD',
  'TEENAGER_GIRL',
  'TEENAGER_BOY',
  'YOUNG_WOMAN',
  'YOUNG_MAN',
  'ADULT_WOMAN',
  'ADULT_MAN',
  'SENIOR_WOMAN',
  'SENIOR_MAN',
  'PROFESSIONAL',
  'PARENT',
  'STUDENT',
  'OTHER'
);

-- Step 2: Migrate existing data (YOUNG_GIRL → YOUNG_WOMAN, rest kept or fallback to OTHER)
ALTER TABLE "messages"
  ALTER COLUMN "speaker_profile" TYPE "SpeakerProfile_new"
  USING (
    CASE "speaker_profile"::text
      WHEN 'YOUNG_GIRL' THEN 'YOUNG_WOMAN'::"SpeakerProfile_new"
      WHEN 'ADULT_MAN'  THEN 'ADULT_MAN'::"SpeakerProfile_new"
      WHEN 'OTHER'      THEN 'OTHER'::"SpeakerProfile_new"
      ELSE 'OTHER'::"SpeakerProfile_new"
    END
  );

-- Step 3: Drop old enum
DROP TYPE "SpeakerProfile";

-- Step 4: Rename new enum to final name
ALTER TYPE "SpeakerProfile_new" RENAME TO "SpeakerProfile";
