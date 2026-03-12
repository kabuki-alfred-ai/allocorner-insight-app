import React, { createContext, useContext, useState, useRef, useEffect } from 'react';
import type { Message } from './types';
import { getAudioUrl } from './api/storage';

interface AudioContextType {
  currentMessage: Message | null;
  isPlaying: boolean;
  progress: number;
  duration: number;
  currentTime: number;
  volume: number;
  audioLoading: boolean;
  queue: Message[];
  playMessage: (message: Message, projectId: string, newQueue?: Message[]) => void;
  togglePlay: () => void;
  stopAudio: () => void;
  playNext: () => void;
  playPrevious: () => void;
  seek: (value: number) => void;
  setVolume: (value: number) => void;
}

const AudioContext = createContext<AudioContextType | undefined>(undefined);

export const AudioProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentMessage, setCurrentMessage] = useState<Message | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [volume, setVolume] = useState(50);
  const [audioLoading, setAudioLoading] = useState(false);
  const [audioSrc, setAudioSrc] = useState<string | null>(null);
  const [currentProjectId, setCurrentProjectId] = useState<string | null>(null);
  const [queue, setQueue] = useState<Message[]>([]);

  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (!audioRef.current) {
      audioRef.current = new Audio();
    }
    const audio = audioRef.current;

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
      if (audio.duration) {
        setProgress((audio.currentTime / audio.duration) * 100);
      }
    };

    const handleLoadedMetadata = () => {
      setDuration(audio.duration);
    };

    const handleEnded = () => {
      playNext();
    };

    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('ended', handleEnded);
    };
  }, [queue, currentMessage, currentProjectId]); // Re-bind handleEnded when queue or message changes

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume / 100;
    }
  }, [volume]);

  const playMessage = async (message: Message, projectId: string, newQueue?: Message[]) => {
    if (currentMessage?.id === message.id && audioSrc) {
      if (isPlaying) {
        audioRef.current?.pause();
        setIsPlaying(false);
      } else {
        audioRef.current?.play().catch(console.error);
        setIsPlaying(true);
      }
      return;
    }

    if (newQueue) {
      setQueue(newQueue);
    }

    setAudioLoading(true);
    setCurrentMessage(message);
    setCurrentProjectId(projectId);

    try {
      const { url } = await getAudioUrl(projectId, message.id);
      setAudioSrc(url);
      if (audioRef.current) {
        audioRef.current.src = url;
        await audioRef.current.play();
        setIsPlaying(true);
      }
    } catch (error) {
      console.error('Error loading audio:', error);
    } finally {
      setAudioLoading(false);
    }
  };

  const playNext = () => {
    if (queue.length === 0 || !currentMessage) return;
    const currentIndex = queue.findIndex(m => m.id === currentMessage.id);
    if (currentIndex !== -1 && currentIndex < queue.length - 1) {
      playMessage(queue[currentIndex + 1], currentProjectId!);
    } else {
      setIsPlaying(false);
      setProgress(0);
      setCurrentTime(0);
    }
  };

  const playPrevious = () => {
    if (queue.length === 0 || !currentMessage) return;
    const currentIndex = queue.findIndex(m => m.id === currentMessage.id);
    if (currentIndex > 0) {
      playMessage(queue[currentIndex - 1], currentProjectId!);
    }
  };

  const togglePlay = () => {
    if (!audioRef.current || !audioSrc) return;

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play().catch(console.error);
      setIsPlaying(true);
    }
  };

  const stopAudio = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = '';
    }
    setCurrentMessage(null);
    setAudioSrc(null);
    setIsPlaying(false);
    setProgress(0);
    setCurrentTime(0);
    setQueue([]);
  };

  const seek = (value: number) => {
    if (!audioRef.current || !duration) return;
    const newTime = (value / 100) * duration;
    audioRef.current.currentTime = newTime;
    setProgress(value);
  };

  return (
    <AudioContext.Provider
      value={{
        currentMessage,
        isPlaying,
        progress,
        duration,
        currentTime,
        volume,
        audioLoading,
        queue,
        playMessage,
        togglePlay,
        stopAudio,
        playNext,
        playPrevious,
        seek,
        setVolume,
      }}
    >
      {children}
    </AudioContext.Provider>
  );
};

export const useAudio = () => {
  const context = useContext(AudioContext);
  if (context === undefined) {
    throw new Error('useAudio must be used within an AudioProvider');
  }
  return context;
};
