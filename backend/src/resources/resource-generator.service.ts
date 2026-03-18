import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import type { Response } from 'express';
import { Role } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';
// eslint-disable-next-line @typescript-eslint/no-require-imports, @typescript-eslint/no-var-requires
const PDFDocument = require('pdfkit') as typeof import('pdfkit');
import { PrismaService } from '../prisma/prisma.service.js';
import { StorageService } from '../storage/storage.service.js';

@Injectable()
export class ResourceGeneratorService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly storage: StorageService,
  ) {}

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

    const PAGE_H    = 841.89;
    const FOOTER_Y  = PAGE_H - 30;
    const BOTTOM    = FOOTER_Y - 10;   // max y before footer zone

    const doc = new PDFDocument({ margin: 50, size: 'A4', compress: true, bufferPages: true, autoFirstPage: true });

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${pdfFilename}.pdf"`);
    doc.pipe(res);

    // ── Color palette ─────────────────────────────────────────────────────────
    const ORANGE  = '#f97316';
    const BODY    = '#1d1d1f';
    const MUTED   = '#6e6e73';
    const SUBTLE  = '#86868b';
    const RULE    = '#d2d2d7';
    const LIGHT   = '#f5f5f7';
    const L       = 50;
    const W       = 495;
    const PAGE_W  = 595;

    // ── Helpers ───────────────────────────────────────────────────────────────

    const FS = 9; // base font size throughout

    /** Ensure at least `needed` px before footer; add page if not */
    const ensureSpace = (needed: number) => {
      if (doc.y + needed > BOTTOM) doc.addPage();
    };

    /** Apple-style section header: thin rule + bold label + thin rule */
    const section = (title: string) => {
      ensureSpace(44);
      doc.moveDown(0.9);
      doc.rect(L, doc.y, W, 0.5).fill(RULE);
      doc.moveDown(0.55);
      doc.font('Helvetica-Bold').fontSize(9).fillColor(BODY)
        .text(title.toUpperCase(), L, doc.y, { width: W, characterSpacing: 0.6 });
      doc.moveDown(0.45);
      doc.rect(L, doc.y, W, 0.5).fill(RULE);
      doc.moveDown(0.5);
      doc.font('Helvetica').fontSize(FS).fillColor(BODY);
    };

    /** Bold label + muted value — same font size to avoid line height mismatch */
    const kv = (label: string, value: string | number | null | undefined) => {
      if (value == null || value === '') return;
      ensureSpace(14);
      doc.font('Helvetica-Bold').fillColor(BODY).fontSize(FS)
        .text(`${label}  `, { continued: true });
      doc.font('Helvetica').fillColor(MUTED).fontSize(FS)
        .text(String(value));
    };

    /** Indented italic paragraph with subtle left rule */
    const note = (text: string) => {
      if (!text) return;
      doc.font('Helvetica-Oblique').fontSize(FS);
      const textH = (doc as any).heightOfString(text, { width: W - 14 });
      ensureSpace(textH + 6);
      const y = doc.y;
      doc.rect(L, y, 2, textH + 2).fill(ORANGE);
      doc.fillColor(SUBTLE).text(text, L + 10, y, { width: W - 14 });
      doc.font('Helvetica').fillColor(BODY).fontSize(FS);
    };

    /** Thin separator line */
    const sep = () => {
      ensureSpace(12);
      doc.moveDown(0.3);
      doc.rect(L, doc.y, W, 0.5).fill(RULE);
      doc.moveDown(0.5);
    };

    // ─────────────────────────────────────────────────────────────────────────
    // LOGOS
    // ─────────────────────────────────────────────────────────────────────────

    // Allo Corner logo (backend/assets/allocorner-logo.png)
    let acLogoBuffer: Buffer | null = null;
    try {
      const acLogoPath = path.resolve(process.cwd(), 'assets/allocorner-logo.png');
      if (fs.existsSync(acLogoPath)) {
        acLogoBuffer = fs.readFileSync(acLogoPath);
      }
    } catch { /* ignore */ }

    // Client logo from MinIO
    let clientLogoBuffer: Buffer | null = null;
    if (project.logoKey) {
      try {
        clientLogoBuffer = await this.storage.getLogoBuffer(project.logoKey);
      } catch { /* ignore — logo unavailable */ }
    }

    // ─────────────────────────────────────────────────────────────────────────
    // COVER PAGE — white, all elements centered h+v (Apple style)
    // ─────────────────────────────────────────────────────────────────────────

    // Compute total content height for vertical centering
    const acLogoH    = 32;
    const cLogoH     = clientLogoBuffer ? 72 : 0;
    const cLogoGap   = clientLogoBuffer ? 28 : 0;
    const titleFs    = project.title.length > 36 ? 22 : 28;
    const titleLineH = titleFs * 1.3;
    const hasDate    = !!project.dates;

    const contentH = acLogoH + 36       // ac logo + gap
      + 1 + 36                          // orange line + gap
      + cLogoH + cLogoGap               // client logo (optional)
      + titleLineH + 10                 // title + gap
      + 14                              // client name
      + (hasDate ? 8 + 12 : 0)          // date gap + date
      + 48 + 10;                        // bottom gap + tag

    let cy = Math.max(60, (PAGE_H - contentH) / 2);

    // ── Allo Corner logo (centered)
    if (acLogoBuffer) {
      const logoX = (PAGE_W - acLogoH) / 2;
      const logoR = acLogoH / 2;
      doc.save();
      doc.circle(logoX + logoR, cy + logoR, logoR).clip();
      doc.image(acLogoBuffer, logoX, cy, { height: acLogoH });
      doc.restore();
    } else {
      doc.fillColor(ORANGE).fontSize(8).font('Helvetica-Bold')
        .text('ALLO CORNER INSIGHT', L, cy + 10, { width: W, align: 'center', characterSpacing: 2, lineBreak: false });
    }
    cy += acLogoH + 36;

    // ── Orange accent line (full width)
    doc.rect(L, cy, W, 1).fill(ORANGE);
    cy += 1 + 36;

    // ── Client logo (centered, if available)
    if (clientLogoBuffer) {
      const clogoW = 120;
      doc.image(clientLogoBuffer, (PAGE_W - clogoW) / 2, cy, { fit: [clogoW, cLogoH] });
      cy += cLogoH + cLogoGap;
    }

    // ── Project title (centered)
    doc.fillColor(BODY).fontSize(titleFs).font('Helvetica-Bold')
      .text(project.title, L, cy, { width: W, align: 'center', lineBreak: false });
    cy += titleLineH + 10;

    // ── Client name (centered, muted)
    doc.fillColor(MUTED).fontSize(11).font('Helvetica')
      .text(project.clientName, L, cy, { width: W, align: 'center', lineBreak: false });
    cy += 14;

    // ── Dates (centered, subtle)
    if (hasDate) {
      cy += 8;
      doc.fillColor(SUBTLE).fontSize(9)
        .text(project.dates!, L, cy, { width: W, align: 'center', lineBreak: false });
      cy += 12;
    }

    // ── "RAPPORT D'ANALYSE" tag (centered, very subtle)
    cy += 48;
    doc.fillColor(SUBTLE).fontSize(8).font('Helvetica')
      .text("RAPPORT D'ANALYSE", L, cy, { width: W, align: 'center', characterSpacing: 2, lineBreak: false });

    // Start body content below cover
    doc.addPage();
    doc.x = L;
    doc.fillColor(BODY).font('Helvetica').fontSize(10);

    // ─────────────────────────────────────────────────────────────────────────
    // PROJECT INFO
    // ─────────────────────────────────────────────────────────────────────────
    if (project.context || project.analyst || project.methodology || project.participantsEstimated) {
      section('Informations projet');
      if (project.context)               { kv('Contexte :', project.context);               doc.moveDown(0.4); }
      if (project.analyst)               { kv('Analyste :', project.analyst);               doc.moveDown(0.4); }
      if (project.methodology)           { kv('Méthodologie :', project.methodology);       doc.moveDown(0.4); }
      if (project.participantsEstimated) { kv('Participants estimés :', project.participantsEstimated); }
    }

    // ─────────────────────────────────────────────────────────────────────────
    // METRICS
    // ─────────────────────────────────────────────────────────────────────────
    if (metrics) {
      section('Métriques clés');

      // ── Stat cards grid (2 columns, 3 rows) ──────────────────────────────────
      const statCards: { value: string; label: string }[] = [
        { value: String(metrics.messagesCount),                        label: 'Messages analysés' },
        { value: `${Math.round(metrics.ircScore)} / 100`,              label: 'Score IRC' },
        { value: `${Math.round(metrics.totalDurationSec / 60)} min`,   label: 'Durée totale' },
        { value: `${metrics.avgDurationSec.toFixed(1)} s`,             label: 'Durée moy. / message' },
        { value: `${(metrics.participationRate * 100).toFixed(0)} %`,  label: 'Participation' },
        { value: metrics.tonalityAvg?.toFixed(2) ?? '—',               label: 'Tonalité moyenne' },
      ];

      const cardW  = (W - 10) / 2;
      const cardH  = 50;
      const cardGY = 8;
      const rows   = Math.ceil(statCards.length / 2);
      ensureSpace(rows * (cardH + cardGY) + 50);

      const gridStartY = doc.y;
      statCards.forEach(({ value, label }, i) => {
        const col = i % 2;
        const row = Math.floor(i / 2);
        const cx  = L + col * (cardW + 10);
        const cy  = gridStartY + row * (cardH + cardGY);
        doc.roundedRect(cx, cy, cardW, cardH, 6).fill('#f5f5f7');
        doc.fillColor(ORANGE).fontSize(18).font('Helvetica-Bold')
          .text(value, cx + 12, cy + 8, { width: cardW - 24, lineBreak: false });
        doc.fillColor(MUTED).fontSize(8).font('Helvetica')
          .text(label, cx + 12, cy + 32, { width: cardW - 24, lineBreak: false });
      });
      (doc as any).y = gridStartY + rows * (cardH + cardGY) + 4;

      // ── IRC Score gauge bar ───────────────────────────────────────────────────
      doc.moveDown(0.8);
      ensureSpace(30);
      const gaugeScore = Math.round(metrics.ircScore);
      const gaugeY     = doc.y;
      const gaugeH     = 10;
      doc.roundedRect(L, gaugeY, W, gaugeH, gaugeH / 2).fill('#e5e5ea');
      const fillW = Math.max(gaugeH, Math.round((gaugeScore / 100) * W));
      doc.roundedRect(L, gaugeY, fillW, gaugeH, gaugeH / 2).fill(ORANGE);
      doc.fillColor(BODY).fontSize(8).font('Helvetica-Bold')
        .text(`Score IRC  `, L, gaugeY + gaugeH + 5, { continued: true });
      doc.font('Helvetica').fillColor(ORANGE)
        .text(`${gaugeScore} / 100`);
      (doc as any).y = gaugeY + gaugeH + 20;

      if (metrics.ircInterpretation) { doc.moveDown(0.4); note(metrics.ircInterpretation); }
      if (metrics.emotionalClimate)  { doc.moveDown(0.4); kv('Climat émotionnel :', metrics.emotionalClimate); }
    }

    // ─────────────────────────────────────────────────────────────────────────
    // EMOTIONS (Plutchik)
    // ─────────────────────────────────────────────────────────────────────────
    if (plutchik) {
      section('Analyse émotionnelle — Roue de Plutchik');

      const emotionColors: Record<string, string> = {
        'Joie':         '#fbbf24',
        'Confiance':    '#34d399',
        'Peur':         '#818cf8',
        'Surprise':     '#60a5fa',
        'Tristesse':    '#93c5fd',
        'Dégoût':       '#a3a3a3',
        'Colère':       '#f87171',
        'Anticipation': '#fb923c',
      };

      const emotions: [string, number][] = [
        ['Joie', plutchik.joy], ['Confiance', plutchik.trust],
        ['Tristesse', plutchik.sadness], ['Anticipation', plutchik.anticipation],
        ['Colère', plutchik.anger], ['Surprise', plutchik.surprise],
        ['Peur', plutchik.fear],
      ].filter(([, v]) => (v as number) > 0) as [string, number][];
      emotions.sort((a, b) => b[1] - a[1]);

      const eLabelW  = 80;
      const eBarAreaW = W - eLabelW - 44;
      const eBarH    = 8;
      const eRowH    = 20;

      ensureSpace(emotions.length * eRowH + 12);
      const eStartY = doc.y;

      emotions.forEach(([name, val], i) => {
        const pct   = Math.round(val * 100);
        const ey    = eStartY + i * eRowH;
        const color = emotionColors[name] || ORANGE;
        const barX  = L + eLabelW + 6;
        const barY  = ey + (eRowH - eBarH) / 2;

        // Emotion name
        doc.fillColor(BODY).fontSize(FS).font('Helvetica')
          .text(name, L, ey + (eRowH - FS * 1.1) / 2, { width: eLabelW, lineBreak: false });

        // Background track
        doc.roundedRect(barX, barY, eBarAreaW, eBarH, eBarH / 2).fill('#e5e5ea');

        // Filled portion
        const filled = Math.max(eBarH, Math.round((pct / 100) * eBarAreaW));
        doc.roundedRect(barX, barY, filled, eBarH, eBarH / 2).fill(color);

        // Percentage label
        doc.fillColor(MUTED).fontSize(8).font('Helvetica-Bold')
          .text(`${pct} %`, barX + eBarAreaW + 6, ey + (eRowH - 8 * 1.1) / 2, { width: 36, lineBreak: false });
      });

      (doc as any).y = eStartY + emotions.length * eRowH + 8;
      if (plutchik.cocktailSummary) { doc.moveDown(0.5); note(plutchik.cocktailSummary); }
    }

    // ─────────────────────────────────────────────────────────────────────────
    // THEMES
    // ─────────────────────────────────────────────────────────────────────────
    if (themes.length) {
      section(`Thèmes identifiés (${themes.length})`);

      const themeColors = ['#f97316','#3b82f6','#10b981','#8b5cf6','#f59e0b','#ef4444','#06b6d4','#ec4899'];
      const totalCount  = themes.reduce((s, t) => s + t.count, 0);

      // ── Overview: one proportional bar per theme ───────────────────────────
      ensureSpace(themes.length * 14 + 20);
      const ovStartY = doc.y;
      themes.forEach((theme, i) => {
        const pct    = totalCount > 0 ? theme.count / totalCount : 0;
        const color  = themeColors[i % themeColors.length];
        const oy     = ovStartY + i * 14;
        const dotR   = 3;
        // Colored dot
        doc.circle(L + dotR, oy + 7, dotR).fill(color);
        // Theme name (truncated)
        const shortName = theme.name.length > 32 ? theme.name.slice(0, 30) + '…' : theme.name;
        doc.fillColor(BODY).fontSize(8).font('Helvetica')
          .text(shortName, L + dotR * 2 + 6, oy + 1, { width: 180, lineBreak: false });
        // Bar track
        const bx = L + 200;
        const bw = W - 200 - 40;
        doc.roundedRect(bx, oy + 3, bw, 6, 3).fill('#e5e5ea');
        const filled = Math.max(6, Math.round(pct * bw));
        doc.roundedRect(bx, oy + 3, filled, 6, 3).fill(color);
        // Percentage
        doc.fillColor(MUTED).fontSize(7).font('Helvetica-Bold')
          .text(`${Math.round(pct * 100)}%`, bx + bw + 4, oy + 1, { width: 30, lineBreak: false });
      });
      (doc as any).y = ovStartY + themes.length * 14 + 16;

      // ── Detail per theme ───────────────────────────────────────────────────
      themes.forEach((theme, i) => {
        ensureSpace(40);
        const color = themeColors[i % themeColors.length];

        // Theme header row
        const y = doc.y;
        doc.font('Helvetica-Bold').fontSize(FS);
        const titleLineH2 = (doc as any).heightOfString(`${String(i + 1).padStart(2, '0')}  ${theme.name}`, { width: W - 8 });
        const rowH = Math.max(18, titleLineH2 + 8);
        doc.rect(L, y, W, rowH).fill('#f5f5f7');
        // Color accent left bar
        doc.rect(L, y, 3, rowH).fill(color);
        doc.fillColor(MUTED).fontSize(8)
          .text(String(i + 1).padStart(2, '0'), L + 8, y + (rowH - 8) / 2, { width: 16, lineBreak: false });
        doc.fillColor(BODY).font('Helvetica-Bold').fontSize(FS)
          .text(theme.name, L + 28, y + (rowH - FS * 1.1) / 2, { width: W - 36, lineBreak: false });
        if ((doc as any).y < y + rowH + 2) (doc as any).y = y + rowH + 2;

        doc.moveDown(0.3);
        if (theme.emotionLabel) { kv('Émotion :', theme.emotionLabel);   doc.moveDown(0.3); }
        if (theme.temporality)  { kv('Temporalité :', theme.temporality); doc.moveDown(0.3); }

        // Message count mini-bar
        ensureSpace(16);
        const pct = totalCount > 0 ? theme.count / totalCount : 0;
        const mbY = doc.y;
        doc.fillColor(BODY).fontSize(FS).font('Helvetica-Bold')
          .text(`${theme.count}  `, L, mbY, { continued: true });
        doc.font('Helvetica').fillColor(MUTED)
          .text('messages  ', { continued: true });
        const mbBarX = L + 90;
        const mbBarW = 120;
        doc.fillColor('#e5e5ea')
          .rect(mbBarX, mbY + 3, mbBarW, 5).fill('#e5e5ea');
        doc.rect(mbBarX, mbY + 3, Math.max(5, Math.round(pct * mbBarW)), 5).fill(color);
        doc.fillColor(SUBTLE).font('Helvetica').fontSize(8)
          .text(`${Math.round(pct * 100)}%`, mbBarX + mbBarW + 6, mbY, { lineBreak: false });
        (doc as any).y = mbY + 14;

        if (theme.keywords.length) {
          doc.moveDown(0.3);
          // Keywords as pills
          ensureSpace(18);
          const kwY = doc.y;
          let kwX = L;
          theme.keywords.forEach(k => {
            const kw = k.keyword;
            doc.font('Helvetica').fontSize(7);
            const kw_w = (doc as any).widthOfString(kw) + 10;
            if (kwX + kw_w > L + W) { kwX = L; (doc as any).y += 14; }
            const ky = (doc as any).y;
            doc.roundedRect(kwX, ky, kw_w, 12, 6).fill('#f5f5f7');
            doc.fillColor(SUBTLE).text(kw, kwX + 5, ky + 2, { lineBreak: false, width: kw_w });
            kwX += kw_w + 4;
          });
          (doc as any).y += 14;
        }

        if (theme.analysis) {
          doc.moveDown(0.4);
          note(theme.analysis);
        }
        if (theme.verbatimTotem) {
          doc.moveDown(0.4);
          ensureSpace(20);
          doc.font('Helvetica-Oblique').fillColor(ORANGE).fontSize(9)
            .text(`"${theme.verbatimTotem}"`, { indent: 10, width: W - 10 });
        }
        doc.font('Helvetica').fillColor(BODY).fontSize(FS);
        sep();
      });
    }

    // ─────────────────────────────────────────────────────────────────────────
    // FEATURED VERBATIMS
    // ─────────────────────────────────────────────────────────────────────────
    if (featuredVerbatims.length) {
      section('Verbatims marquants');
      featuredVerbatims.forEach(v => {
        const h = doc.heightOfString(`"${v.citation}"`, { width: W - 12, } as any) + 30;
        ensureSpace(h);
        doc.font('Helvetica-Oblique').fillColor(BODY).fontSize(9)
          .text(`"${v.citation}"`, { indent: 10, width: W - 10 });
        doc.font('Helvetica-Bold').fillColor(ORANGE).fontSize(7)
          .text(v.category, { indent: 10 });
        if (v.implication) {
          doc.font('Helvetica').fillColor(MUTED).fontSize(8)
            .text(v.implication, { indent: 10, width: W - 10 });
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
        ensureSpace(40);
        doc.font('Helvetica-Bold').fillColor(BODY).fontSize(9)
          .text(`${t.axis.toUpperCase()}  `, { continued: true });
        doc.font('Helvetica').fillColor(MUTED).fontSize(9)
          .text(`— ${t.category}`);
        if (t.content) { doc.moveDown(0.3); note(t.content); }
        sep();
      });
    }

    // ─────────────────────────────────────────────────────────────────────────
    // RECOMMENDATIONS
    // ─────────────────────────────────────────────────────────────────────────
    if (recommendations.length) {
      section('Recommandations');
      recommendations.forEach((r, i) => {
        const h = 20 + (r.objective ? doc.heightOfString(r.objective, { width: W - 14, } as any) + 10 : 0);
        ensureSpace(h);
        const priorityColor = r.priority === 'HAUTE' ? '#ef4444' : r.priority === 'MOYENNE' ? ORANGE : MUTED;
        doc.font('Helvetica-Bold').fillColor(BODY).fontSize(10)
          .text(`${i + 1}.  ${r.title}`);
        doc.font('Helvetica-Bold').fillColor(priorityColor).fontSize(7)
          .text(r.priority);
        if (r.objective) {
          doc.moveDown(0.2);
          doc.font('Helvetica').fillColor(MUTED).fontSize(9)
            .text(r.objective, { indent: 12, width: W - 12 });
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
        const h = 20 + (a.description ? doc.heightOfString(a.description, { width: W - 14, } as any) + 10 : 0);
        ensureSpace(h);
        doc.font('Helvetica-Bold').fillColor(BODY).fontSize(10)
          .text(`${i + 1}.  ${a.title}`);
        if (a.timeline)    { kv('Timeline :', a.timeline);    doc.moveDown(0.2); }
        if (a.resources)   { kv('Ressources :', a.resources); doc.moveDown(0.2); }
        if (a.description) {
          doc.moveDown(0.2);
          doc.font('Helvetica').fillColor(MUTED).fontSize(9)
            .text(a.description, { indent: 12, width: W - 12 });
        }
        doc.fillColor(BODY).fontSize(10);
        sep();
      });
    }

    // ─────────────────────────────────────────────────────────────────────────
    // FOOTER on every page
    // ─────────────────────────────────────────────────────────────────────────
    const totalPages = (doc as any).bufferedPageRange().count;
    const dateStr = new Date().toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' });

    for (let i = 0; i < totalPages; i++) {
      doc.switchToPage(i);
      // Disable PDFKit's auto-page-break so footer text at fy≈820 doesn't trigger a new page
      (doc.page as any).margins.bottom = 0;
      const fy = PAGE_H - 22;
      doc.rect(L, fy - 4, W, 0.5).fill('#e5e7eb');
      doc.fillColor(ORANGE).fontSize(7).font('Helvetica-Bold')
        .text('ALLO CORNER INSIGHT', L, fy, { width: W / 3, lineBreak: false });
      doc.fillColor(MUTED).fontSize(7).font('Helvetica')
        .text(`${project.title}  ·  ${dateStr}`, L + W / 3, fy, { width: W / 3, align: 'center', lineBreak: false });
      doc.fillColor(MUTED).fontSize(7)
        .text(`${i + 1} / ${totalPages}`, L, fy, { width: W, align: 'right', lineBreak: false });
    }

    doc.end();
  }
}
