import { apiClient } from './client';

export interface DurationDistribution {
    range: string;
    count: number;
    percentage: number;
}

export interface EmotionalLoadDistribution {
    load: 'Faible' | 'Modérée' | 'Forte';
    count: number;
    percentage: number;
    color: string;
}

export interface TonalityDistribution {
    tone: string;
    count: number;
    percentage: number;
    color: string;
}

export interface MessagesStats {
    durationDistribution: DurationDistribution[];
    emotionalLoadDistribution: EmotionalLoadDistribution[];
    tonalityDistribution: TonalityDistribution[];
}

export async function getMessagesStats(projectId: string): Promise<MessagesStats> {
    const response = await apiClient.get<MessagesStats>(`/projects/${projectId}/messages/stats`
    );
    return response.data;
}
