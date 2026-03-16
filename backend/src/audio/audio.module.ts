import { Module } from '@nestjs/common';
import { PitchAnalysisService } from './pitch-analysis.service';

@Module({
  providers: [PitchAnalysisService],
  exports: [PitchAnalysisService],
})
export class AudioModule {}
