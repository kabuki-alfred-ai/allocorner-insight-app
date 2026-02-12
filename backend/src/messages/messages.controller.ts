import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  Query,
  UseGuards,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Role } from '@prisma/client';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { RolesGuard } from '../common/guards/roles.guard.js';
import { ProjectMemberGuard } from '../common/guards/project-member.guard.js';
import { Roles } from '../common/decorators/roles.decorator.js';
import { MessagesService } from './messages.service.js';
import { CreateMessageDto } from './dto/create-message.dto.js';
import { UpdateMessageDto } from './dto/update-message.dto.js';
import { QueryMessagesDto } from './dto/query-messages.dto.js';

@Controller('projects/:pid/messages')
@UseGuards(JwtAuthGuard, RolesGuard)
export class MessagesController {
  constructor(private readonly messagesService: MessagesService) {}

  @Get('stats')
  @UseGuards(ProjectMemberGuard)
  getStats(@Param('pid') projectId: string) {
    return this.messagesService.getStats(projectId);
  }

  @Get()
  @UseGuards(ProjectMemberGuard)
  findAll(
    @Param('pid') projectId: string,
    @Query() query: QueryMessagesDto,
  ) {
    return this.messagesService.findAll(projectId, query);
  }

  @Get(':id')
  @UseGuards(ProjectMemberGuard)
  findOne(
    @Param('pid') projectId: string,
    @Param('id') id: string,
  ) {
    return this.messagesService.findOne(id);
  }

  @Post()
  @Roles(Role.SUPERADMIN)
  @UseInterceptors(FileInterceptor('audio'))
  create(
    @Param('pid') projectId: string,
    @Body() dto: CreateMessageDto,
    @UploadedFile() audioFile?: Express.Multer.File,
  ) {
    return this.messagesService.create(projectId, dto, audioFile);
  }

  @Post('bulk')
  @Roles(Role.SUPERADMIN)
  @UseInterceptors(FileInterceptor('zip'))
  bulkUpload(
    @Param('pid') projectId: string,
    @UploadedFile() zipFile: Express.Multer.File,
  ) {
    return this.messagesService.bulkUpload(projectId, zipFile.buffer);
  }

  @Patch(':id')
  @Roles(Role.SUPERADMIN)
  @UseInterceptors(FileInterceptor('audio'))
  update(
    @Param('pid') _projectId: string,
    @Param('id') id: string,
    @Body() dto: UpdateMessageDto,
    @UploadedFile() audioFile?: Express.Multer.File,
  ) {
    return this.messagesService.update(id, dto, audioFile);
  }

  @Delete(':id')
  @Roles(Role.SUPERADMIN)
  remove(
    @Param('pid') _projectId: string,
    @Param('id') id: string,
  ) {
    return this.messagesService.remove(id);
  }
}
