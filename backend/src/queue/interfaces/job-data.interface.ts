export interface AudioJobData {
  messageId: string;
  projectId: string;
}

export interface ProcessingResult {
  text: string;
  primarySpeaker: string;
  allSpeakers: string[];
  duration: number;
  tone: 'POSITIVE' | 'NEGATIVE' | 'NEUTRAL';
  sentiment: {
    score: number;
    magnitude: number;
  };
}
