// ──────────────────────────────────────────────
// Enums
// ──────────────────────────────────────────────

export type Role = 'SUPERADMIN' | 'MEMBER';

export type EmotionalLoad = 'LOW' | 'MEDIUM' | 'HIGH';

export type VerbatimCategory =
  | 'CONTRASTE'
  | 'ORIGINALITE'
  | 'EMOTION'
  | 'REPRESENTATIVITE'
  | 'TOTEM';

export type Priority = 'HAUTE' | 'MOYENNE' | 'BASSE';

export type InvitationStatus = 'PENDING' | 'ACCEPTED' | 'EXPIRED' | 'REVOKED';

// ──────────────────────────────────────────────
// User
// ──────────────────────────────────────────────

export interface User {
  id: string;
  email: string;
  name: string;
  role: Role;
  createdAt: string;
  updatedAt: string;
}

// ──────────────────────────────────────────────
// Auth
// ──────────────────────────────────────────────

export interface AuthResponse {
  user: Pick<User, 'id' | 'email' | 'name' | 'role'>;
  accessToken: string;
  refreshToken: string;
}

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

// ──────────────────────────────────────────────
// Project
// ──────────────────────────────────────────────

export interface Project {
  id: string;
  clientName: string;
  title: string;
  dates: string;
  context: string;
  analyst: string;
  methodology: string;
  participantsEstimated: number;
  logoKey: string | null;
  createdById: string;
  createdAt: string;
  updatedAt: string;
}

export interface ProjectWithRelations extends Project {
  metrics: ProjectMetrics | null;
  plutchik: ProjectPlutchik | null;
  ircBreakdown: IrcBreakdown | null;
  themes: Theme[];
  objectives: ProjectObjective[];
  strategicActions: StrategicAction[];
  resources: ProjectResource[];
  _count?: { messages: number; members: number };
}

// ──────────────────────────────────────────────
// Metrics
// ──────────────────────────────────────────────

export interface ProjectMetrics {
  id: string;
  projectId: string;
  messagesCount: number;
  avgDurationSec: number;
  totalDurationSec: number;
  participationRate: number;
  ircScore: number;
  tonalityAvg: number;
  highEmotionShare: number;
  ircInterpretation: string;
  emotionalClimate: string;
}

// ──────────────────────────────────────────────
// Plutchik
// ──────────────────────────────────────────────

export interface ProjectPlutchik {
  id: string;
  projectId: string;
  joy: number;
  trust: number;
  sadness: number;
  anticipation: number;
  anger: number;
  surprise: number;
  fear: number;
  cocktailSummary: string;
}

// ──────────────────────────────────────────────
// Message
// ──────────────────────────────────────────────

export interface Message {
  id: string;
  projectId: string;
  filename: string;
  audioKey: string | null;
  duration: number | null;
  speaker: string | null;
  transcriptTxt: string;
  emotionalLoad: EmotionalLoad;
  quote: string;
  createdAt: string;
  updatedAt: string;
  messageThemes?: { theme: Theme }[];
  messageEmotions?: { emotionName: string }[];
}

// ──────────────────────────────────────────────
// Theme
// ──────────────────────────────────────────────

export interface ThemeKeyword {
  id: string;
  themeId: string;
  keyword: string;
}

export interface Theme {
  id: string;
  projectId: string;
  name: string;
  temporality: string;
  emotionLabel: string;
  analysis: string;
  verbatimTotem: string;
  totemMessageId: string | null;
  count: number;
  color: string;
  keywords: ThemeKeyword[];
  totemMessage?: {
    id: string;
    filename: string;
    transcriptTxt: string;
    duration: number | null;
    speaker: string | null;
  } | null;
}

// ──────────────────────────────────────────────
// Featured Verbatim
// ──────────────────────────────────────────────

export interface FeaturedVerbatim {
  id: string;
  projectId: string;
  category: VerbatimCategory;
  messageId: string | null;
  citation: string;
  implication: string;
  createdAt: string;
  message?: Message | null;
}

// ──────────────────────────────────────────────
// Recommendation
// ──────────────────────────────────────────────

export interface Recommendation {
  id: string;
  projectId: string;
  title: string;
  objective: string;
  priority: Priority;
  position: number;
  createdAt: string;
}

// ──────────────────────────────────────────────
// Trends
// ──────────────────────────────────────────────

export interface Trends {
  id: string;
  projectId: string;
  mainTrends: { title: string; content: string }[];
  strengths: { title: string; content: string }[];
  recurringWords: string[];
  weakSignal: string;
  weakSignalDetail: string;
}

export interface ProjectObjective {
  id: string;
  projectId: string;
  content: string;
  position: number;
}

export interface StrategicAction {
  id: string;
  projectId: string;
  title: string;
  description: string;
  priority: Priority;
  timeline: string;
  resources: string;
  position: number;
}

export interface IrcBreakdown {
  id: string;
  projectId: string;
  intensity: number;
  thematicRichness: number;
  narrativeCoherence: number;
  originality: number;
}

export interface ProjectResource {
  id: string;
  projectId: string;
  title: string;
  description: string;
  type: string;
  size: string;
  fileKey: string | null;
  position: number;
  createdAt: string;
}

// ──────────────────────────────────────────────
// Transversal Analysis
// ──────────────────────────────────────────────

export interface TransversalAnalysis {
  id: string;
  projectId: string;
  axis: string;
  category: string;
  content: string;
}

// ──────────────────────────────────────────────
// Invitation
// ──────────────────────────────────────────────

export interface Invitation {
  id: string;
  projectId: string;
  email: string;
  token: string;
  status: InvitationStatus;
  expiresAt: string;
  createdAt: string;
}

// ──────────────────────────────────────────────
// Pagination
// ──────────────────────────────────────────────

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// ──────────────────────────────────────────────
// DTO helpers (for create / update payloads)
// ──────────────────────────────────────────────

export type CreateProjectDto = Omit<
  Project,
  'id' | 'createdById' | 'createdAt' | 'updatedAt' | 'logoKey'
>;

export type UpdateProjectDto = Partial<CreateProjectDto>;

export type UpsertMetricsDto = Omit<ProjectMetrics, 'id' | 'projectId'>;

export type UpsertPlutchikDto = Omit<ProjectPlutchik, 'id' | 'projectId'>;

export type CreateThemeDto = Omit<Theme, 'id' | 'projectId'>;

export type UpdateThemeDto = Partial<CreateThemeDto>;

export type CreateRecommendationDto = Omit<
  Recommendation,
  'id' | 'projectId' | 'createdAt'
>;

export type UpdateRecommendationDto = Partial<CreateRecommendationDto>;

export type UpsertTrendsDto = Omit<Trends, 'id' | 'projectId'>;

export type CreateFeaturedVerbatimDto = Omit<
  FeaturedVerbatim,
  'id' | 'projectId' | 'createdAt' | 'message'
>;

export type CreateTransversalAnalysisDto = Omit<
  TransversalAnalysis,
  'id' | 'projectId'
>;

export type UpdateTransversalAnalysisDto = Partial<CreateTransversalAnalysisDto>;

export type UpdateMessageDto = Partial<
  Pick<Message, 'speaker' | 'transcriptTxt' | 'emotionalLoad' | 'quote'>
>;

// Extension pour l'association theme-messages
export interface MessageWithAssociation extends Message {
  isAssociated: boolean;
}
