import {
  Injectable,
  NotFoundException,
  Logger,
  BadRequestException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Prisma } from '@prisma/client';
import AdmZip from 'adm-zip';
import { PrismaService } from '../prisma/prisma.service.js';
import { StorageService } from '../storage/storage.service.js';
import { CreateMessageDto } from './dto/create-message.dto.js';
import { UpdateMessageDto } from './dto/update-message.dto.js';
import { QueryMessagesDto } from './dto/query-messages.dto.js';

@Injectable()
export class MessagesService {
  private readonly logger = new Logger(MessagesService.name);
  private readonly apiUrl: string;

  constructor(
    private readonly prisma: PrismaService,
    private readonly storage: StorageService,
    private readonly config: ConfigService,
  ) {
    // Construire l'URL de base de l'API pour les URLs absolues
    const port = this.config.get<number>('port') ?? 3000;
    this.apiUrl = `http://localhost:${port}`;
  }

  async create(
    projectId: string,
    dto: CreateMessageDto,
    audioFile?: Express.Multer.File,
  ) {
    let audioKey: string | undefined;

    if (audioFile) {
      audioKey = await this.storage.uploadAudio(
        projectId,
        audioFile.originalname,
        audioFile.buffer,
        audioFile.mimetype,
      );
    }

    const message = await this.prisma.message.create({
      data: {
        projectId,
        filename: dto.filename,
        audioKey,
        duration: dto.duration,
        speaker: dto.speaker,
        transcriptTxt: dto.transcriptTxt,
        emotionalLoad: dto.emotionalLoad,
        quote: dto.quote,
        messageThemes: dto.themeIds?.length
          ? {
              create: dto.themeIds.map((themeId) => ({ themeId })),
            }
          : undefined,
        messageEmotions: dto.emotions?.length
          ? {
              create: dto.emotions.map((emotionName) => ({ emotionName })),
            }
          : undefined,
      },
      include: {
        messageThemes: { include: { theme: true } },
        messageEmotions: true,
      },
    });

    return message;
  }

  async bulkUpload(projectId: string, zipBuffer: Buffer) {
    const zip = new AdmZip(zipBuffer);
    const entries = zip.getEntries();

    // Find CSV file
    const csvEntry = entries.find((entry) => {
      const name = entry.entryName.toLowerCase();
      return (
        !entry.isDirectory &&
        name.endsWith('.csv') &&
        !name.startsWith('__MACOSX') &&
        !name.includes('__MACOSX/')
      );
    });

    // Parse CSV if found
    const metadataMap = new Map<string, { transcript?: string; speaker?: string }>();
    
    if (csvEntry) {
      const csvContent = csvEntry.getData().toString('utf-8');
      const lines = csvContent.split(/\r?\n/).filter(line => line.trim());
      
      // Skip header line
      for (let i = 1; i < lines.length; i++) {
        const line = lines[i];
        // Simple CSV parsing - handles basic quoted fields
        const parts: string[] = [];
        let current = '';
        let inQuotes = false;
        
        for (let j = 0; j < line.length; j++) {
          const char = line[j];
          if (char === '"') {
            inQuotes = !inQuotes;
          } else if (char === ',' && !inQuotes) {
            parts.push(current.trim());
            current = '';
          } else {
            current += char;
          }
        }
        parts.push(current.trim());
        
        if (parts.length >= 3) {
          const [filename, transcript, speaker] = parts;
          const cleanFilename = filename.replace(/^["']|["']$/g, '');
          const cleanTranscript = transcript.replace(/^["']|["']$/g, '');
          const cleanSpeaker = speaker.replace(/^["']|["']$/g, '');
          
          if (cleanFilename) {
            metadataMap.set(cleanFilename, {
              transcript: cleanTranscript || undefined,
              speaker: cleanSpeaker || undefined,
            });
          }
        }
      }
      
      this.logger.log(`Parsed CSV with ${metadataMap.size} entries`);
    }

    const mp3Entries = entries.filter((entry) => {
      const name = entry.entryName.toLowerCase();
      return (
        !entry.isDirectory &&
        name.endsWith('.mp3') &&
        !name.startsWith('__MACOSX') &&
        !name.includes('__MACOSX/')
      );
    });

    if (mp3Entries.length === 0) {
      throw new BadRequestException('No MP3 files found in the ZIP archive');
    }

    const results: { filename: string; id: string }[] = [];

    for (const entry of mp3Entries) {
      const buffer = entry.getData();
      const filename = entry.entryName.split('/').pop() || entry.entryName;
      
      // Get metadata from CSV if available
      const metadata = metadataMap.get(filename) || {};

      const audioKey = await this.storage.uploadAudio(
        projectId,
        filename,
        buffer,
        'audio/mpeg',
      );

      const message = await this.prisma.message.create({
        data: {
          projectId,
          filename,
          audioKey,
          transcriptTxt: metadata.transcript || undefined,
          speaker: metadata.speaker || undefined,
        },
      });

      results.push({ filename: message.filename, id: message.id });
    }

    this.logger.log(
      `Bulk uploaded ${results.length} audio files to project ${projectId}`,
    );

    return { uploaded: results.length, messages: results };
  }

  async findAll(projectId: string, query: QueryMessagesDto) {
    const { page = 1, limit = 20, themeId, emotion, emotionalLoad, search } = query;
    const skip = (page - 1) * limit;

    const where: Prisma.MessageWhereInput = { projectId };

    if (emotionalLoad) {
      where.emotionalLoad = emotionalLoad;
    }

    if (themeId) {
      where.messageThemes = {
        some: { themeId },
      };
    }

    if (emotion) {
      where.messageEmotions = {
        some: { emotionName: emotion },
      };
    }

    if (search) {
      where.OR = [
        { transcriptTxt: { contains: search, mode: 'insensitive' } },
        { filename: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [data, total] = await this.prisma.$transaction([
      this.prisma.message.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          messageThemes: { include: { theme: true } },
          messageEmotions: true,
        },
      }),
      this.prisma.message.count({ where }),
    ]);

    // Construire les URLs de streaming absolues pour les audios
    const dataWithUrls = data.map((message) => {
      let audioUrl: string | null = null;
      if (message.audioKey) {
        // URL de streaming absolue via le backend
        audioUrl = `${this.apiUrl}/api/storage/audio/${projectId}/${message.id}/stream`;
      }
      return { ...message, audioUrl };
    });

    return {
      data: dataWithUrls,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOne(id: string) {
    const message = await this.prisma.message.findUnique({
      where: { id },
      include: {
        messageThemes: { include: { theme: true } },
        messageEmotions: true,
      },
    });

    if (!message) {
      throw new NotFoundException(`Message with id "${id}" not found`);
    }

    // Construire l'URL de streaming absolue pour l'audio
    let audioUrl: string | null = null;
    if (message.audioKey) {
      audioUrl = `${this.apiUrl}/api/storage/audio/${message.projectId}/${message.id}/stream`;
    }

    return { ...message, audioUrl };
  }

  async update(
    id: string,
    dto: UpdateMessageDto,
    audioFile?: Express.Multer.File,
  ) {
    const existing = await this.prisma.message.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new NotFoundException(`Message with id "${id}" not found`);
    }

    let audioKey: string | undefined;

    if (audioFile) {
      // Delete old audio if it exists
      if (existing.audioKey) {
        await this.storage.deleteAudio(existing.audioKey);
      }

      audioKey = await this.storage.uploadAudio(
        existing.projectId,
        audioFile.originalname,
        audioFile.buffer,
        audioFile.mimetype,
      );
    }

    const { themeIds, emotions, ...messageFields } = dto;

    const message = await this.prisma.$transaction(async (tx) => {
      // Update theme links if provided
      if (themeIds !== undefined) {
        await tx.messageTheme.deleteMany({ where: { messageId: id } });

        if (themeIds.length > 0) {
          await tx.messageTheme.createMany({
            data: themeIds.map((themeId) => ({ messageId: id, themeId })),
          });
        }
      }

      // Update emotion links if provided
      if (emotions !== undefined) {
        await tx.messageEmotion.deleteMany({ where: { messageId: id } });

        if (emotions.length > 0) {
          await tx.messageEmotion.createMany({
            data: emotions.map((emotionName) => ({
              messageId: id,
              emotionName,
            })),
          });
        }
      }

      // Update message fields
      return tx.message.update({
        where: { id },
        data: {
          ...messageFields,
          ...(audioKey !== undefined && { audioKey }),
        },
        include: {
          messageThemes: { include: { theme: true } },
          messageEmotions: true,
        },
      });
    });

    return message;
  }

  async remove(id: string) {
    const message = await this.prisma.message.findUnique({
      where: { id },
    });

    if (!message) {
      throw new NotFoundException(`Message with id "${id}" not found`);
    }

    if (message.audioKey) {
      await this.storage.deleteAudio(message.audioKey);
    }

    await this.prisma.message.delete({ where: { id } });

    return { deleted: true };
  }

  async getStats(projectId: string) {
    const messages = await this.prisma.message.findMany({
      where: { projectId },
      select: {
        duration: true,
        emotionalLoad: true,
      },
    });

    const total = messages.length;

    if (total === 0) {
      return {
        durationDistribution: [],
        emotionalLoadDistribution: [],
      };
    }

    // Distribution des durées
    const ranges = [
      { range: '0-30s', min: 0, max: 30 },
      { range: '30-60s', min: 30, max: 60 },
      { range: '60-90s', min: 60, max: 90 },
      { range: '90s+', min: 90, max: Infinity },
    ];

    const durationDistribution = ranges.map(({ range, min, max }) => {
      const count = messages.filter((m) => {
        const duration = m.duration ?? 0;
        return duration >= min && (max === Infinity ? true : duration < max);
      }).length;
      return {
        range,
        count,
        percentage: Math.round((count / total) * 100 * 10) / 10,
      };
    });

    // Distribution de la charge émotionnelle
    const loadConfig = [
      { load: 'Faible', value: 'LOW', color: '#39B36A' },
      { load: 'Modérée', value: 'MEDIUM', color: '#FFC629' },
      { load: 'Forte', value: 'HIGH', color: '#E35454' },
    ];

    const emotionalLoadDistribution = loadConfig.map(({ load, value, color }) => {
      const count = messages.filter((m) => m.emotionalLoad === value).length;
      return {
        load,
        count,
        percentage: Math.round((count / total) * 100 * 10) / 10,
        color,
      };
    });

    return {
      durationDistribution,
      emotionalLoadDistribution,
    };
  }
}
