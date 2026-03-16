import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import type { Response } from 'express';
import { Role } from '@prisma/client';
// eslint-disable-next-line @typescript-eslint/no-require-imports, @typescript-eslint/no-var-requires
const PDFDocument = require('pdfkit') as typeof import('pdfkit');
import { PrismaService } from '../prisma/prisma.service.js';

@Injectable()
export class ResourceGeneratorService {
  constructor(private readonly prisma: PrismaService) {}

  async generate(projectId: string, resourceId: string, user: { id: string; role: Role }, res: Response) {
    // Access control: SUPERADMIN always allowed, others must be project members
    if (user.role !== Role.SUPERADMIN) {
      const membership = await this.prisma.projectMember.findUnique({
        where: { projectId_userId: { projectId, userId: user.id } },
      });
      if (!membership) {
        throw new ForbiddenException('Access denied: you are not a member of this project');
      }
    }
    const resource = await this.prisma.projectResource.findUnique({
      where: { id: resourceId },
    });

    if (!resource || resource.projectId !== projectId) {
      throw new NotFoundException('Resource not found in this project');
    }

    const filename = resource.title
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-zA-Z0-9 ]/g, '_')
      .replace(/\s+/g, '_');

    if (resource.type === 'CSV') {
      return this.generateCsv(projectId, filename, res);
    } else if (resource.type === 'PDF') {
      return this.generatePdf(projectId, filename, res);
    } else {
      throw new NotFoundException(`Unsupported resource type: ${resource.type}`);
    }
  }

  // ─── CSV ────────────────────────────────────────────────────────────────────

  private async generateCsv(projectId: string, filename: string, res: Response) {
    const messages = await this.prisma.message.findMany({
      where: { projectId },
      orderBy: { createdAt: 'asc' },
    });

    const headers = ['filename', 'speaker', 'duration_sec', 'tone', 'transcript'];

    const escape = (v: string | number | null | undefined) => {
      if (v == null) return '';
      const s = String(v).replace(/"/g, '""');
      return s.includes(',') || s.includes('"') || s.includes('\n') ? `"${s}"` : s;
    };

    const rows = messages.map(m => [
      m.filename,
      m.speakerProfile ?? '',
      m.duration ?? '',
      m.tone,
      m.transcriptTxt,
    ].map(escape).join(','));

    const csv = [headers.join(','), ...rows].join('\n');

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}.csv"`);
    res.send('\uFEFF' + csv); // BOM for Excel UTF-8 compatibility
  }

  // ─── PDF ────────────────────────────────────────────────────────────────────

  private async generatePdf(projectId: string, _filename: string, res: Response) {
    const [project, metrics, plutchik, themes, recommendations, featuredVerbatims, strategicActions, transversalAnalyses] =
      await Promise.all([
        this.prisma.project.findUnique({ where: { id: projectId } }),
        this.prisma.projectMetrics.findUnique({ where: { projectId } }),
        this.prisma.projectPlutchik.findUnique({ where: { projectId } }),
        this.prisma.theme.findMany({ where: { projectId }, include: { keywords: true }, orderBy: { count: 'desc' } }),
        this.prisma.recommendation.findMany({ where: { projectId }, orderBy: { position: 'asc' } }),
        this.prisma.featuredVerbatim.findMany({ where: { projectId }, orderBy: { createdAt: 'asc' } }),
        this.prisma.strategicAction.findMany({ where: { projectId }, orderBy: { position: 'asc' } }),
        this.prisma.transversalAnalysis.findMany({ where: { projectId } }),
      ]);

    if (!project) throw new NotFoundException('Project not found');

    // Filename from project title
    const pdfFilename = `${project.title}-rapport`
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-zA-Z0-9 _-]/g, '_')
      .replace(/\s+/g, '_');

    const doc = new PDFDocument({ margin: 50, size: 'A4', compress: true, bufferPages: true });

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${pdfFilename}.pdf"`);
    doc.pipe(res);

    // ── Color palette (Allo Corner) ──────────────────────────────────────────
    const DARK    = '#0f0f0f';
    const ORANGE  = '#f97316';
    const ORANGE2 = '#ea6c10';
    const BODY    = '#1f1f1f';
    const MUTED   = '#6b7280';
    const LIGHT   = '#f9fafb';
    const WHITE   = '#ffffff';
    const L       = 50;              // left margin
    const R       = 545;             // right margin
    const W       = R - L;           // content width (495)

    // ── Helpers ──────────────────────────────────────────────────────────────

    /** Section header bar */
    const section = (title: string) => {
      if (doc.y > 700) doc.addPage();
      doc.moveDown(1.2);
      const y = doc.y;
      doc.rect(L, y, W, 22).fill(ORANGE);
      doc.fillColor(WHITE).fontSize(10).font('Helvetica-Bold')
        .text(title.toUpperCase(), L + 10, y + 6, { width: W - 20 });
      // advance cursor below the bar
      doc.text('', L, y + 22 + 6);
      doc.fillColor(BODY).font('Helvetica').fontSize(10);
    };

    /** Key-value line */
    const kv = (label: string, value: string | number | null | undefined) => {
      if (value == null || value === '') return;
      doc.font('Helvetica-Bold').fillColor(BODY).fontSize(9)
        .text(`${label}  `, { continued: true });
      doc.font('Helvetica').fillColor(MUTED).text(String(value));
    };

    /** Thin orange left-bar paragraph */
    const note = (text: string) => {
      if (!text) return;
      const y = doc.y;
      doc.rect(L, y, 2, doc.heightOfString(text, { width: W - 14 }) + 4).fill(ORANGE);
      doc.font('Helvetica-Oblique').fillColor(MUTED).fontSize(9)
        .text(text, L + 10, y + 2, { width: W - 14 });
      doc.font('Helvetica').fillColor(BODY).fontSize(10);
    };

    /** Horizontal separator */
    const sep = () => {
      doc.moveDown(0.4);
      doc.rect(L, doc.y, W, 0.5).fill('#e5e7eb');
      doc.moveDown(0.5);
    };

    // ─────────────────────────────────────────────────────────────────────────
    // COVER PAGE
    // ─────────────────────────────────────────────────────────────────────────
    doc.rect(0, 0, 595, 240).fill(DARK);
    doc.rect(0, 240, 595, 5).fill(ORANGE);

    // Brand label
    doc.fillColor(ORANGE).fontSize(8).font('Helvetica-Bold')
      .text('ALLO CORNER INSIGHT', L, 42, { width: W, characterSpacing: 2 });

    // Project title
    const titleFontSize = project.title.length > 40 ? 22 : 28;
    doc.fillColor(WHITE).fontSize(titleFontSize).font('Helvetica-Bold')
      .text(project.title, L, 70, { width: W });

    // Client + dates
    doc.fillColor('#9ca3af').fontSize(12).font('Helvetica')
      .text(project.clientName, L, doc.y + 6);
    doc.fillColor('#6b7280').fontSize(10)
      .text(project.dates ?? '', L, doc.y + 4);

    // "Rapport d'analyse" label bottom-left of cover
    doc.fillColor('#374151').fontSize(9).font('Helvetica-Bold')
      .text("RAPPORT D'ANALYSE", L, 210, { characterSpacing: 1.5 });

    // Move cursor below cover + orange bar
    doc.text('', L, 260);
    doc.fillColor(BODY).font('Helvetica').fontSize(10);

    // ─────────────────────────────────────────────────────────────────────────
    // PROJECT INFO
    // ─────────────────────────────────────────────────────────────────────────
    doc.moveDown(0.6);
    if (project.context)              { kv('Contexte :', project.context);              doc.moveDown(0.4); }
    if (project.analyst)              { kv('Analyste :', project.analyst);              doc.moveDown(0.4); }
    if (project.methodology)          { kv('Méthodologie :', project.methodology);      doc.moveDown(0.4); }
    if (project.participantsEstimated){ kv('Participants estimés :', project.participantsEstimated); doc.moveDown(0.4); }

    // ─────────────────────────────────────────────────────────────────────────
    // METRICS
    // ─────────────────────────────────────────────────────────────────────────
    if (metrics) {
      section('Métriques clés');
      const stats: [string, string][] = [
        ['Messages analysés',      String(metrics.messagesCount)],
        ['Score IRC',              `${Math.round(metrics.ircScore)}/100`],
        ['Durée totale',           `${Math.round(metrics.totalDurationSec / 60)} min`],
        ['Durée moyenne / message',`${metrics.avgDurationSec.toFixed(1)}s`],
        ['Taux de participation',  `${(metrics.participationRate * 100).toFixed(1)}%`],
      ];

      // 2-column grid
      const colW = (W - 10) / 2;
      let col = 0;
      let rowY = doc.y;
      stats.forEach(([label, val]) => {
        const x = col === 0 ? L : L + colW + 10;
        const boxY = rowY;
        doc.rect(x, boxY, colW, 36).fill(LIGHT);
        doc.rect(x, boxY, 2, 36).fill(ORANGE);
        doc.fillColor(ORANGE).fontSize(16).font('Helvetica-Bold')
          .text(val, x + 8, boxY + 4, { width: colW - 16 });
        doc.fillColor(MUTED).fontSize(7).font('Helvetica')
          .text(label.toUpperCase(), x + 8, boxY + 24, { width: colW - 16, characterSpacing: 0.5 });
        col++;
        if (col === 2) { col = 0; rowY += 44; }
      });
      if (col === 1) rowY += 44;
      doc.text('', L, rowY + 4);
      doc.fillColor(BODY).font('Helvetica').fontSize(10);

      if (metrics.ircInterpretation) {
        doc.moveDown(0.6);
        note(metrics.ircInterpretation);
      }
    }

    // ─────────────────────────────────────────────────────────────────────────
    // EMOTIONS (Plutchik)
    // ─────────────────────────────────────────────────────────────────────────
    if (plutchik) {
      section('Analyse émotionnelle — Roue de Plutchik');

      const emotions: [string, number][] = [
        ['Joie', plutchik.joy], ['Confiance', plutchik.trust],
        ['Tristesse', plutchik.sadness], ['Anticipation', plutchik.anticipation],
        ['Colère', plutchik.anger], ['Surprise', plutchik.surprise],
        ['Peur', plutchik.fear],
      ].filter(([, v]) => (v as number) > 0) as [string, number][];

      const maxVal = Math.max(...emotions.map(([, v]) => v));
      const barMaxW = W - 120;

      emotions.forEach(([name, val]) => {
        const pct = Math.round(val * 100);
        const barW = Math.max(2, Math.round((val / maxVal) * barMaxW));
        const y = doc.y;
        doc.fillColor(BODY).fontSize(9).font('Helvetica-Bold')
          .text(name, L, y, { width: 95, continued: false });
        doc.rect(L + 100, y, barW, 10).fill(ORANGE);
        doc.fillColor(MUTED).fontSize(8).font('Helvetica')
          .text(`${pct}%`, L + 100 + barW + 5, y + 1);
        doc.moveDown(0.55);
      });

      if (plutchik.cocktailSummary) {
        doc.moveDown(0.6);
        note(plutchik.cocktailSummary);
      }
    }

    // ─────────────────────────────────────────────────────────────────────────
    // THEMES
    // ─────────────────────────────────────────────────────────────────────────
    if (themes.length) {
      section(`Thèmes identifiés — ${themes.length}`);
      themes.forEach((theme, i) => {
        if (doc.y > 700) doc.addPage();
        // Theme name row
        const y = doc.y;
        doc.rect(L, y, W, 18).fill('#fff7ed');
        doc.fillColor(ORANGE).fontSize(9).font('Helvetica-Bold')
          .text(`${String(i + 1).padStart(2, '0')}`, L + 4, y + 4, { width: 20, continued: true });
        doc.fillColor(BODY).fontSize(10)
          .text(`  ${theme.name}`, { continued: false });
        doc.text('', L, y + 22);

        if (theme.emotionLabel)  { kv('  Émotion :', theme.emotionLabel);  doc.moveDown(0.3); }
        if (theme.temporality)   { kv('  Temporalité :', theme.temporality); doc.moveDown(0.3); }
        kv('  Messages :', theme.count);
        if (theme.keywords.length) {
          doc.moveDown(0.3);
          kv('  Mots-clés :', theme.keywords.map(k => k.keyword).join(', '));
        }
        if (theme.analysis) {
          doc.moveDown(0.4);
          note(theme.analysis);
        }
        if (theme.verbatimTotem) {
          doc.moveDown(0.4);
          doc.font('Helvetica-Oblique').fillColor(ORANGE).fontSize(9)
            .text(`"${theme.verbatimTotem}"`, { indent: 12, width: W - 12 });
        }
        doc.font('Helvetica').fillColor(BODY).fontSize(10);
        sep();
      });
    }

    // ─────────────────────────────────────────────────────────────────────────
    // FEATURED VERBATIMS
    // ─────────────────────────────────────────────────────────────────────────
    if (featuredVerbatims.length) {
      section('Verbatims marquants');
      featuredVerbatims.forEach(v => {
        if (doc.y > 700) doc.addPage();
        doc.font('Helvetica-Oblique').fillColor(BODY).fontSize(9)
          .text(`"${v.citation}"`, { indent: 12, width: W - 12 });
        doc.font('Helvetica-Bold').fillColor(ORANGE).fontSize(7)
          .text(v.category, { indent: 12 });
        if (v.implication) {
          doc.font('Helvetica').fillColor(MUTED).fontSize(8)
            .text(v.implication, { indent: 12, width: W - 12 });
        }
        sep();
      });
    }

    // ─────────────────────────────────────────────────────────────────────────
    // TRANSVERSAL ANALYSES
    // ─────────────────────────────────────────────────────────────────────────
    if (transversalAnalyses.length) {
      section('Analyses transversales');
      transversalAnalyses.forEach(t => {
        if (doc.y > 700) doc.addPage();
        doc.font('Helvetica-Bold').fillColor(BODY).fontSize(9)
          .text(t.axis.toUpperCase(), { continued: true, characterSpacing: 1 });
        doc.font('Helvetica').fillColor(MUTED)
          .text(`  —  ${t.category}`, { characterSpacing: 0 });
        if (t.content) {
          doc.moveDown(0.3);
          note(t.content);
        }
        sep();
      });
    }

    // ─────────────────────────────────────────────────────────────────────────
    // RECOMMENDATIONS
    // ─────────────────────────────────────────────────────────────────────────
    if (recommendations.length) {
      section('Recommandations');
      recommendations.forEach((r, i) => {
        if (doc.y > 700) doc.addPage();
        const priorityColor = r.priority === 'HAUTE' ? '#ef4444' : r.priority === 'MOYENNE' ? ORANGE : '#6b7280';
        doc.font('Helvetica-Bold').fillColor(BODY).fontSize(10)
          .text(`${i + 1}.  ${r.title}`, { continued: false });
        doc.font('Helvetica-Bold').fillColor(priorityColor).fontSize(7)
          .text(r.priority, { characterSpacing: 1 });
        if (r.objective) {
          doc.moveDown(0.3);
          doc.font('Helvetica').fillColor(MUTED).fontSize(9)
            .text(r.objective, { indent: 14, width: W - 14 });
        }
        doc.fillColor(BODY).fontSize(10);
        sep();
      });
    }

    // ─────────────────────────────────────────────────────────────────────────
    // STRATEGIC ACTIONS
    // ─────────────────────────────────────────────────────────────────────────
    if (strategicActions.length) {
      section('Actions stratégiques');
      strategicActions.forEach((a, i) => {
        if (doc.y > 700) doc.addPage();
        doc.font('Helvetica-Bold').fillColor(BODY).fontSize(10)
          .text(`${i + 1}.  ${a.title}`);
        if (a.timeline)  { kv('  Timeline :', a.timeline);   doc.moveDown(0.3); }
        if (a.resources) { kv('  Ressources :', a.resources); doc.moveDown(0.3); }
        if (a.description) {
          doc.moveDown(0.3);
          doc.font('Helvetica').fillColor(MUTED).fontSize(9)
            .text(a.description, { indent: 14, width: W - 14 });
        }
        doc.fillColor(BODY).fontSize(10);
        sep();
      });
    }

    // ─────────────────────────────────────────────────────────────────────────
    // FOOTER on every page
    // ─────────────────────────────────────────────────────────────────────────
    const totalPages = (doc as any).bufferedPageRange().count;
    for (let i = 0; i < totalPages; i++) {
      doc.switchToPage(i);
      // Skip cover page footer
      if (i === 0) {
        doc.fillColor('#374151').fontSize(7).font('Helvetica')
          .text('allocorner.fr', L, 826, { width: W / 2 });
        doc.text(`${i + 1} / ${totalPages}`, L, 826, { width: W, align: 'right' });
        continue;
      }
      doc.rect(L, 820, W, 0.5).fill('#e5e7eb');
      doc.fillColor(ORANGE).fontSize(7).font('Helvetica-Bold')
        .text('ALLO CORNER INSIGHT', L, 827, { width: W / 2, characterSpacing: 1 });
      doc.fillColor(MUTED).fontSize(7).font('Helvetica')
        .text(
          `${project.title}  ·  Rapport généré le ${new Date().toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' })}`,
          L, 827, { width: W - 40, align: 'center' },
        );
      doc.fillColor(MUTED).fontSize(7)
        .text(`${i + 1} / ${totalPages}`, L, 827, { width: W, align: 'right' });
    }

    doc.end();
  }
}
