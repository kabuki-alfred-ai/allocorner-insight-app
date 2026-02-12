export class CreateIrcBreakdownDto {
  intensity: number;
  thematicRichness: number;
  narrativeCoherence: number;
  originality: number;
}

export class UpdateIrcBreakdownDto {
  intensity?: number;
  thematicRichness?: number;
  narrativeCoherence?: number;
  originality?: number;
}
