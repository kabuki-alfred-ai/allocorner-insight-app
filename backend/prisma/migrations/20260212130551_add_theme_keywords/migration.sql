-- CreateTable
CREATE TABLE "theme_keywords" (
    "id" TEXT NOT NULL,
    "theme_id" TEXT NOT NULL,
    "keyword" TEXT NOT NULL,

    CONSTRAINT "theme_keywords_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "theme_keywords_theme_id_keyword_key" ON "theme_keywords"("theme_id", "keyword");

-- AddForeignKey
ALTER TABLE "theme_keywords" ADD CONSTRAINT "theme_keywords_theme_id_fkey" FOREIGN KEY ("theme_id") REFERENCES "themes"("id") ON DELETE CASCADE ON UPDATE CASCADE;
