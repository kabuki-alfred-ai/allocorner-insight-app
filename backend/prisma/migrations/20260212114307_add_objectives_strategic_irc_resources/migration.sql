-- CreateTable
CREATE TABLE "project_objectives" (
    "id" TEXT NOT NULL,
    "project_id" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "position" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "project_objectives_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "strategic_actions" (
    "id" TEXT NOT NULL,
    "project_id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL DEFAULT '',
    "priority" "Priority" NOT NULL DEFAULT 'MOYENNE',
    "timeline" TEXT NOT NULL DEFAULT '',
    "resources" TEXT NOT NULL DEFAULT '',
    "position" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "strategic_actions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "irc_breakdown" (
    "id" TEXT NOT NULL,
    "project_id" TEXT NOT NULL,
    "intensity" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "thematic_richness" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "narrative_coherence" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "originality" DOUBLE PRECISION NOT NULL DEFAULT 0,

    CONSTRAINT "irc_breakdown_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "project_resources" (
    "id" TEXT NOT NULL,
    "project_id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL DEFAULT '',
    "type" TEXT NOT NULL,
    "size" TEXT NOT NULL DEFAULT '',
    "file_key" TEXT,
    "position" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "project_resources_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "irc_breakdown_project_id_key" ON "irc_breakdown"("project_id");

-- AddForeignKey
ALTER TABLE "project_objectives" ADD CONSTRAINT "project_objectives_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "strategic_actions" ADD CONSTRAINT "strategic_actions_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "irc_breakdown" ADD CONSTRAINT "irc_breakdown_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "project_resources" ADD CONSTRAINT "project_resources_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;
