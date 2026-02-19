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
      include: {
        messageEmotions: true,
        messageThemes: { include: { theme: true } },
      },
      orderBy: { createdAt: 'asc' },
    });

    const headers = [
      'id', 'filename', 'speaker', 'duration_sec', 'emotional_load',
      'tone', 'transcript', 'quote', 'themes', 'emotions', 'processing_status', 'processed_at',
    ];

    const escape = (v: string | number | null | undefined) => {
      if (v == null) return '';
      const s = String(v).replace(/"/g, '""');
      return s.includes(',') || s.includes('"') || s.includes('\n') ? `"${s}"` : s;
    };

    const rows = messages.map(m => [
      m.id,
      m.filename,
      m.speaker ?? '',
      m.duration ?? '',
      m.emotionalLoad,
      m.tone,
      m.transcriptTxt,
      m.quote,
      m.messageThemes.map(mt => mt.theme.name).join('; '),
      m.messageEmotions.map(me => me.emotionName).join('; '),
      m.processingStatus,
      m.processedAt?.toISOString() ?? '',
    ].map(escape).join(','));

    const csv = [headers.join(','), ...rows].join('\n');

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}.csv"`);
    res.send('\uFEFF' + csv); // BOM for Excel UTF-8 compatibility
  }

  // ─── PDF ────────────────────────────────────────────────────────────────────

  private async generatePdf(projectId: string, filename: string, res: Response) {
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

    const doc = new PDFDocument({ margin: 50, size: 'A4', compress: true });

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}.pdf"`);
    doc.pipe(res);

    const PRIMARY = '#1a1a2e';
    const ACCENT = '#2F66F5';
    const LIGHT = '#f8f9fa';
    const MUTED = '#6c757d';
    const PAGE_WIDTH = 595 - 100; // A4 minus margins

    const section = (title: string) => {
      doc.moveDown(1.5);
      doc.rect(50, doc.y, PAGE_WIDTH, 28).fill(ACCENT);
      doc.fillColor('#ffffff').fontSize(12).font('Helvetica-Bold')
        .text(title, 60, doc.y - 22, { width: PAGE_WIDTH - 20 });
      doc.fillColor(PRIMARY).font('Helvetica').fontSize(10);
      doc.moveDown(0.8);
    };

    const kv = (label: string, value: string | number | null | undefined) => {
      if (value == null || value === '') return;
      doc.font('Helvetica-Bold').fillColor(PRIMARY).fontSize(9).text(`${label} `, { continued: true });
      doc.font('Helvetica').fillColor(MUTED).text(String(value));
    };

    const badge = (label: string, color: string) => {
      const w = doc.widthOfString(label) + 12;
      doc.rect(doc.x, doc.y, w, 14).fill(color);
      doc.fillColor('#fff').fontSize(7).font('Helvetica-Bold')
        .text(label.toUpperCase(), doc.x - w + 6, doc.y - 12, { width: w });
    };

    // ── Cover ────────────────────────────────────────────────────────────────
    doc.rect(0, 0, 595, 200).fill(PRIMARY);
    doc.fillColor('#ffffff').fontSize(22).font('Helvetica-Bold')
      .text(project.title, 50, 60, { width: PAGE_WIDTH });
    doc.fontSize(13).font('Helvetica').fillColor('#c8d0e8')
      .text(project.clientName, 50, doc.y + 6);
    doc.fillColor('#8896b8').fontSize(10)
      .text(project.dates, 50, doc.y + 4);

    doc.rect(0, 200, 595, 4).fill(ACCENT);
    doc.moveDown(2);

    // ── Project info ─────────────────────────────────────────────────────────
    doc.fillColor(PRIMARY).fontSize(10).font('Helvetica');
    if (project.context) { kv('Contexte :', project.context); doc.moveDown(0.3); }
    if (project.analyst) { kv('Analyste :', project.analyst); doc.moveDown(0.3); }
    if (project.methodology) { kv('Méthodologie :', project.methodology); doc.moveDown(0.3); }
    kv('Participants estimés :', project.participantsEstimated);

    // ── Metrics ──────────────────────────────────────────────────────────────
    if (metrics) {
      section('Métriques clés');
      const cols = [
        ['Messages analysés', metrics.messagesCount],
        ['Score IRC', `${Math.round(metrics.ircScore)}/100`],
        ['Durée moyenne', `${metrics.avgDurationSec.toFixed(1)}s`],
        ['Taux de participation', `${(metrics.participationRate * 100).toFixed(1)}%`],
        ['Charge émotionnelle élevée', `${(metrics.highEmotionShare * 100).toFixed(1)}%`],
      ];
      cols.forEach(([label, val]) => {
        kv(`${label} :`, String(val));
        doc.moveDown(0.3);
      });
      if (metrics.ircInterpretation) {
        doc.moveDown(0.4);
        doc.font('Helvetica-Oblique').fillColor(MUTED).fontSize(9)
          .text(metrics.ircInterpretation, { indent: 10 });
        doc.font('Helvetica').fillColor(PRIMARY).fontSize(10);
      }
    }

    // ── Emotions (Plutchik) ───────────────────────────────────────────────────
    if (plutchik) {
      section('Analyse émotionnelle (Roue de Plutchik)');
      const emotions: [string, number][] = [
        ['Joie', plutchik.joy], ['Confiance', plutchik.trust],
        ['Tristesse', plutchik.sadness], ['Anticipation', plutchik.anticipation],
        ['Colère', plutchik.anger], ['Surprise', plutchik.surprise],
        ['Peur', plutchik.fear],
      ].filter(([, v]) => (v as number) > 0) as [string, number][];

      emotions.forEach(([name, val]) => {
        const pct = Math.round((val as number) * 100);
        const barW = Math.round((pct / 100) * (PAGE_WIDTH - 140));
        doc.fillColor(MUTED).fontSize(9).font('Helvetica-Bold').text(`${name}`, 50, doc.y, { continued: false, width: 100 });
        const barY = doc.y - 12;
        doc.rect(155, barY, barW, 10).fill(ACCENT);
        doc.fillColor(MUTED).fontSize(8).text(`${pct}%`, 155 + barW + 5, barY + 1);
        doc.moveDown(0.3);
      });

      if (plutchik.cocktailSummary) {
        doc.moveDown(0.4);
        doc.font('Helvetica-Oblique').fillColor(MUTED).fontSize(9)
          .text(plutchik.cocktailSummary, { indent: 10 });
        doc.font('Helvetica').fillColor(PRIMARY).fontSize(10);
      }
    }

    // ── Themes ───────────────────────────────────────────────────────────────
    if (themes.length) {
      section(`Thèmes identifiés (${themes.length})`);
      themes.forEach((theme, i) => {
        doc.font('Helvetica-Bold').fillColor(PRIMARY).fontSize(10)
          .text(`${i + 1}. ${theme.name}`, { continued: false });
        if (theme.emotionLabel) kv('  Émotion dominante :', theme.emotionLabel);
        if (theme.temporality) kv('  Temporalité :', theme.temporality);
        kv('  Messages :', theme.count);
        if (theme.keywords.length) {
          kv('  Mots-clés :', theme.keywords.map(k => k.keyword).join(', '));
        }
        if (theme.analysis) {
          doc.moveDown(0.3);
          doc.font('Helvetica').fillColor(MUTED).fontSize(9)
            .text(theme.analysis, { indent: 20, width: PAGE_WIDTH - 20 });
          doc.fillColor(PRIMARY).fontSize(10);
        }
        if (theme.verbatimTotem) {
          doc.moveDown(0.3);
          doc.font('Helvetica-Oblique').fillColor(ACCENT).fontSize(9)
            .text(`"${theme.verbatimTotem}"`, { indent: 20, width: PAGE_WIDTH - 20 });
        }
        doc.font('Helvetica').fillColor(PRIMARY).fontSize(10);
        doc.moveDown(0.8);
      });
    }

    // ── Featured Verbatims ────────────────────────────────────────────────────
    if (featuredVerbatims.length) {
      section('Verbatims marquants');
      featuredVerbatims.forEach(v => {
        doc.font('Helvetica-Oblique').fillColor('#333').fontSize(9)
          .text(`"${v.citation}"`, { indent: 10, width: PAGE_WIDTH - 20 });
        doc.font('Helvetica').fillColor(MUTED).fontSize(8)
          .text(`[${v.category}]${v.implication ? ` — ${v.implication}` : ''}`, { indent: 10 });
        doc.moveDown(0.6);
      });
    }

    // ── Transversal ───────────────────────────────────────────────────────────
    if (transversalAnalyses.length) {
      section('Analyses transversales');
      transversalAnalyses.forEach(t => {
        doc.font('Helvetica-Bold').fillColor(PRIMARY).fontSize(9).text(`${t.axis} — ${t.category}`);
        if (t.content) {
          doc.font('Helvetica').fillColor(MUTED).fontSize(9)
            .text(t.content, { indent: 10, width: PAGE_WIDTH - 20 });
        }
        doc.moveDown(0.6);
      });
    }

    // ── Recommendations ───────────────────────────────────────────────────────
    if (recommendations.length) {
      section('Recommandations');
      recommendations.forEach((r, i) => {
        doc.font('Helvetica-Bold').fillColor(PRIMARY).fontSize(10)
          .text(`${i + 1}. ${r.title}`);
        kv('  Priorité :', r.priority);
        if (r.objective) {
          doc.font('Helvetica').fillColor(MUTED).fontSize(9)
            .text(r.objective, { indent: 20, width: PAGE_WIDTH - 20 });
        }
        doc.fillColor(PRIMARY).fontSize(10);
        doc.moveDown(0.7);
      });
    }

    // ── Strategic Actions ─────────────────────────────────────────────────────
    if (strategicActions.length) {
      section('Actions stratégiques');
      strategicActions.forEach((a, i) => {
        doc.font('Helvetica-Bold').fillColor(PRIMARY).fontSize(10)
          .text(`${i + 1}. ${a.title}`);
        kv('  Priorité :', a.priority);
        if (a.timeline) kv('  Timeline :', a.timeline);
        if (a.resources) kv('  Ressources :', a.resources);
        if (a.description) {
          doc.font('Helvetica').fillColor(MUTED).fontSize(9)
            .text(a.description, { indent: 20, width: PAGE_WIDTH - 20 });
        }
        doc.fillColor(PRIMARY).fontSize(10);
        doc.moveDown(0.7);
      });
    }

    // ── Footer ────────────────────────────────────────────────────────────────
    doc.moveDown(2);
    doc.fontSize(8).fillColor(MUTED).font('Helvetica')
      .text(`Rapport généré le ${new Date().toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' })}`, { align: 'center' });

    doc.end();
  }
}
