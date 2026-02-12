import { PartialType } from '@nestjs/swagger';
import { CreateThemeDto } from './create-theme.dto.js';

export class UpdateThemeDto extends PartialType(CreateThemeDto) {}
