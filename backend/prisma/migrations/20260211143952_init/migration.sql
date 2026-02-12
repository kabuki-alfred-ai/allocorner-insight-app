-- CreateEnum
CREATE TYPE "Role" AS ENUM ('SUPERADMIN', 'MEMBER');

-- CreateEnum
CREATE TYPE "EmotionalLoad" AS ENUM ('LOW', 'MEDIUM', 'HIGH');

-- CreateEnum
CREATE TYPE "VerbatimCategory" AS ENUM ('CONTRASTE', 'ORIGINALITE', 'EMOTION', 'REPRESENTATIVITE', 'TOTEM');

-- CreateEnum
CREATE TYPE "Priority" AS ENUM ('HAUTE', 'MOYENNE', 'BASSE');

-- CreateEnum
CREATE TYPE "InvitationStatus" AS ENUM ('PENDING', 'ACCEPTED', 'EXPIRED', 'REVOKED');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'MEMBER',
    "refresh_token" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "projects" (
    "id" TEXT NOT NULL,
    "client_name" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "dates" TEXT NOT NULL,
    "context" TEXT NOT NULL DEFAULT '',
    "analyst" TEXT NOT NULL DEFAULT '',
    "methodology" TEXT NOT NULL DEFAULT '',
    "participants_estimated" INTEGER NOT NULL DEFAULT 0,
    "logo_key" TEXT,
    "created_by_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "projects_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "project_members" (
    "id" TEXT NOT NULL,
    "project_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "invited_by_id" TEXT,
    "accepted_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "project_members_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "project_metrics" (
    "id" TEXT NOT NULL,
    "project_id" TEXT NOT NULL,
    "messages_count" INTEGER NOT NULL DEFAULT 0,
    "avg_duration_sec" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "total_duration_sec" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "participation_rate" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "irc_score" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "tonality_avg" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "high_emotion_share" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "irc_interpretation" TEXT NOT NULL DEFAULT '',
    "emotional_climate" TEXT NOT NULL DEFAULT '',

    CONSTRAINT "project_metrics_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "project_plutchik" (
    "id" TEXT NOT NULL,
    "project_id" TEXT NOT NULL,
    "joy" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "trust" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "sadness" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "anticipation" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "anger" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "surprise" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "fear" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "cocktail_summary" TEXT NOT NULL DEFAULT '',

    CONSTRAINT "project_plutchik_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "messages" (
    "id" TEXT NOT NULL,
    "project_id" TEXT NOT NULL,
    "filename" TEXT NOT NULL,
    "audio_key" TEXT,
    "duration" DOUBLE PRECISION,
    "speaker" TEXT,
    "transcript_txt" TEXT NOT NULL DEFAULT '',
    "emotional_load" "EmotionalLoad" NOT NULL DEFAULT 'MEDIUM',
    "quote" TEXT NOT NULL DEFAULT '',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "messages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "message_themes" (
    "id" TEXT NOT NULL,
    "message_id" TEXT NOT NULL,
    "theme_id" TEXT NOT NULL,

    CONSTRAINT "message_themes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "message_emotions" (
    "id" TEXT NOT NULL,
    "message_id" TEXT NOT NULL,
    "emotion_name" TEXT NOT NULL,

    CONSTRAINT "message_emotions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "themes" (
    "id" TEXT NOT NULL,
    "project_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "temporality" TEXT NOT NULL DEFAULT '',
    "emotion_label" TEXT NOT NULL DEFAULT '',
    "analysis" TEXT NOT NULL DEFAULT '',
    "verbatim_totem" TEXT NOT NULL DEFAULT '',
    "count" INTEGER NOT NULL DEFAULT 0,
    "color" TEXT NOT NULL DEFAULT '#2F66F5',

    CONSTRAINT "themes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "featured_verbatims" (
    "id" TEXT NOT NULL,
    "project_id" TEXT NOT NULL,
    "category" "VerbatimCategory" NOT NULL,
    "message_id" TEXT,
    "citation" TEXT NOT NULL,
    "implication" TEXT NOT NULL DEFAULT '',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "featured_verbatims_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "recommendations" (
    "id" TEXT NOT NULL,
    "project_id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "objective" TEXT NOT NULL DEFAULT '',
    "priority" "Priority" NOT NULL DEFAULT 'MOYENNE',
    "position" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "recommendations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "trends" (
    "id" TEXT NOT NULL,
    "project_id" TEXT NOT NULL,
    "main_trends" JSONB NOT NULL DEFAULT '[]',
    "strengths" JSONB NOT NULL DEFAULT '[]',
    "recurring_words" JSONB NOT NULL DEFAULT '[]',
    "weak_signal" TEXT NOT NULL DEFAULT '',
    "weak_signal_detail" TEXT NOT NULL DEFAULT '',

    CONSTRAINT "trends_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "transversal_analyses" (
    "id" TEXT NOT NULL,
    "project_id" TEXT NOT NULL,
    "axis" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "content" TEXT NOT NULL DEFAULT '',

    CONSTRAINT "transversal_analyses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "invitations" (
    "id" TEXT NOT NULL,
    "project_id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "status" "InvitationStatus" NOT NULL DEFAULT 'PENDING',
    "expires_at" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "invitations_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "project_members_project_id_user_id_key" ON "project_members"("project_id", "user_id");

-- CreateIndex
CREATE UNIQUE INDEX "project_metrics_project_id_key" ON "project_metrics"("project_id");

-- CreateIndex
CREATE UNIQUE INDEX "project_plutchik_project_id_key" ON "project_plutchik"("project_id");

-- CreateIndex
CREATE UNIQUE INDEX "message_themes_message_id_theme_id_key" ON "message_themes"("message_id", "theme_id");

-- CreateIndex
CREATE UNIQUE INDEX "message_emotions_message_id_emotion_name_key" ON "message_emotions"("message_id", "emotion_name");

-- CreateIndex
CREATE UNIQUE INDEX "themes_project_id_name_key" ON "themes"("project_id", "name");

-- CreateIndex
CREATE UNIQUE INDEX "trends_project_id_key" ON "trends"("project_id");

-- CreateIndex
CREATE UNIQUE INDEX "invitations_token_key" ON "invitations"("token");

-- CreateIndex
CREATE UNIQUE INDEX "invitations_project_id_email_key" ON "invitations"("project_id", "email");

-- AddForeignKey
ALTER TABLE "projects" ADD CONSTRAINT "projects_created_by_id_fkey" FOREIGN KEY ("created_by_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "project_members" ADD CONSTRAINT "project_members_invited_by_id_fkey" FOREIGN KEY ("invited_by_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "project_members" ADD CONSTRAINT "project_members_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "project_members" ADD CONSTRAINT "project_members_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "project_metrics" ADD CONSTRAINT "project_metrics_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "project_plutchik" ADD CONSTRAINT "project_plutchik_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "messages" ADD CONSTRAINT "messages_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "message_themes" ADD CONSTRAINT "message_themes_message_id_fkey" FOREIGN KEY ("message_id") REFERENCES "messages"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "message_themes" ADD CONSTRAINT "message_themes_theme_id_fkey" FOREIGN KEY ("theme_id") REFERENCES "themes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "message_emotions" ADD CONSTRAINT "message_emotions_message_id_fkey" FOREIGN KEY ("message_id") REFERENCES "messages"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "themes" ADD CONSTRAINT "themes_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "featured_verbatims" ADD CONSTRAINT "featured_verbatims_message_id_fkey" FOREIGN KEY ("message_id") REFERENCES "messages"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "featured_verbatims" ADD CONSTRAINT "featured_verbatims_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "recommendations" ADD CONSTRAINT "recommendations_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "trends" ADD CONSTRAINT "trends_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transversal_analyses" ADD CONSTRAINT "transversal_analyses_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invitations" ADD CONSTRAINT "invitations_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;
