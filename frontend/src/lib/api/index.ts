// Client & token helpers
export {
  apiClient,
  getAccessToken,
  getRefreshToken,
  setTokens,
  clearTokens,
} from './client';

// Auth
export {
  register,
  login,
  refresh,
  logout,
  getMe,
} from './auth';
export type { RegisterDto, LoginDto } from './auth';

// Projects
export {
  getProjects,
  getProject,
  createProject,
  updateProject,
  deleteProject,
  upsertMetrics,
  upsertPlutchik,
} from './projects';

// Messages
export {
  getMessages,
  createMessage,
  bulkUploadMessages,
  updateMessage,
  deleteMessage,
} from './messages';
export type { GetMessagesParams } from './messages';

// Themes
export {
  getThemes,
  createTheme,
  updateTheme,
  deleteTheme,
} from './themes';

// Recommendations
export {
  getRecommendations,
  createRecommendation,
  updateRecommendation,
  deleteRecommendation,
} from './recommendations';

// Trends
export { getTrends, upsertTrends } from './trends';

// Featured Verbatims
export {
  getFeaturedVerbatims,
  createFeaturedVerbatim,
  deleteFeaturedVerbatim,
} from './featured-verbatims';

// Transversal Analyses
export {
  getTransversalAnalyses,
  createTransversalAnalysis,
  updateTransversalAnalysis,
  deleteTransversalAnalysis,
} from './transversal';

// Invitations
export {
  createInvitation,
  getInvitations,
  revokeInvitation,
  validateInvitation,
  acceptInvitation,
} from './invitations';
export type {
  CreateInvitationDto,
  AcceptInvitationDto,
} from './invitations';

// Storage
export { getAudioUrl, getLogoUrl } from './storage';
export type { SignedUrlResponse } from './storage';
