-- Add neutral gender variants to SpeakerProfile enum
ALTER TYPE "SpeakerProfile" ADD VALUE IF NOT EXISTS 'TEENAGER';
ALTER TYPE "SpeakerProfile" ADD VALUE IF NOT EXISTS 'YOUNG_ADULT';
ALTER TYPE "SpeakerProfile" ADD VALUE IF NOT EXISTS 'ADULT';
ALTER TYPE "SpeakerProfile" ADD VALUE IF NOT EXISTS 'SENIOR';
