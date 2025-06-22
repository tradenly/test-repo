
import { useState, useEffect, useRef, useCallback } from 'react';

export type SoundEffect = 
  | 'match' 
  | 'booster' 
  | 'levelComplete' 
  | 'gameOver' 
  | 'shuffle' 
  | 'hint' 
  | 'hammer';

interface AudioSettings {
  musicEnabled: boolean;
  sfxEnabled: boolean;
  musicVolume: number;
  sfxVolume: number;
}

export const useGameAudio = () => {
  const [settings, setSettings] = useState<AudioSettings>(() => {
    const saved = localStorage.getItem('poopee-crush-audio-settings');
    return saved ? JSON.parse(saved) : {
      musicEnabled: true,
      sfxEnabled: true,
      musicVolume: 0.3,
      sfxVolume: 0.5
    };
  });

  const [isPlaying, setIsPlaying] = useState(false);
  const backgroundMusicRef = useRef<HTMLAudioElement | null>(null);
  const soundEffectsRef = useRef<{ [key in SoundEffect]?: HTMLAudioElement }>({});

  // Save settings to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('poopee-crush-audio-settings', JSON.stringify(settings));
  }, [settings]);

  // Initialize audio elements
  useEffect(() => {
    // Create background music element
    backgroundMusicRef.current = new Audio();
    backgroundMusicRef.current.loop = true;
    backgroundMusicRef.current.volume = settings.musicVolume;
    
    // For now, we'll use a simple tone generator or placeholder
    // In a real implementation, you'd load actual audio files
    backgroundMusicRef.current.src = 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmASBkOX2+/AZyAELIzS9duaVwkZe8ry16hSFAlGn+DyvmASBkOX2+/AZyAELIzS9duaVwkZe8ry16hSFAlGn+DyvmASBkOX2+/AZyAELIzS9duaVwkZe8ry16hSFAlGn+DyvmASBkOX2+/AZyAELIzS9duaVwkZe8ry16hSFAlGn+DyvmASBkOX2+/AZyAELIzS9duaVwkZe8ry16hSFAlGn+DyvmASBkOX2+/AZyAELIzS9duaVwkZe8ry16hSFAlGn+DyvmASBkOX2+/AZyAELIzS9duaVwkZe8ry16hSFAlGn+DyvmASBkOX2+/AZyAELIzS9duaVwkZe8ry16hSFAlGn+DyvmASBkOX2+/AZyAELIzS9duaVwkZe8ry16hSFAlGn+DyvmASBkOX2+/AZyAELIzS9duaVwkZe8ry16hSFAlGn+DyvmASBkOX2+/AZyAELIzS9duaVwkZe8ry16hSFAlGn+DyvmASBkOX2+/AZyAELIzS9duaVwkZe8ry16hSFAlGn+DyvmASBkOX2+/AZyAELIzS9duaVwkZe8ry16hSFAlGn+DyvmASBkOX2+/AZyAELIzS9duaVwkZe8ry16hSFAlGn+DyvmASBkOX2+/AZyAELIzS9duaVwkZe8ry16hSFAlGn+DyvmASBkOX2+/AZyAELIzS9duaVwkZe8ry16hSFAlGn+DyvmASBkOX2+/AZyAELIzS9duaVwkZe8ry16hSFAlGn+DyvmASBkOX2+/AZyAELIzS9duaVwkZe8ry16hSFAlGn+DyvmASBkOX2+/AZyAELIzS9duaVwkZe8ry16hSFAlGn+DyvmASBkOX2+/AZyAELIzS9duaVwkZe8ry16hSFAlGn+DyvmASBkOX2+/AZyAELIzS9duaVwkZe8ry16hSFAlGn+DyvmASBkOX2+/AZyAELIzS9duaVwkZe8ry16hSFAlGn+DyvmASBkOX2+/AZyAELIzS9duaVwkZe8ry16hSFAlGn+DyvmASBkOX2+/AZyAELIzS9duaVwkZe8ry16hSFAlGn+DyvmASBkOX2+/AZyAELIzS9duaVwkZe8ry16hSFAlGn+DyvmASBkOX2+/AZyAELIzS9duaVwkZe8ry16hSFAlGn+DyvmASBkOX2+/AZyAELIzS9duaVwkZe8ry16hSFAlGn+DyvmASBkOX2+/AZyAELIzS9duaVwkZe8ry16hSFAlGn+DyvmASBkOX2+/AZyAELIzS9duaVwkZe8ry16hSFA';

    // Initialize sound effects with simple tones
    const soundEffects: { [key in SoundEffect]: string } = {
      match: 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmASBkOX2+/AZyAELIzS9duaVwkZe8ry16hSFAlGn+DyvmASBkOX2+/AZyAELIzS9duaVwkZe8ry16hSFAlGn+DyvmASBkOX2+/AZyAELIzS9duaVwkZe8ry16hSFAlGn+DyvmASBkOX2+/AZyAELIzS9duaVwkZe8ry16hSFAlGn+DyvmASBkOX2+/AZyAELIzS9duaVwkZe8ry16hSFAlGn+DyvmASBkOX2+/AZyAELIzS9duaVwkZe8ry16hSFAlGn+DyvmASBkOX2+/AZyAELIzS9duaVwkZe8ry16hSFAlGn+DyvmASBkOX2+/AZyAELIzS9duaVwkZe8ry16hSFAlGn+DyvmASBkOX2+/AZyAELIzS9duaVwkZe8ry16hSFAlGn+DyvmASBkOX2+/AZyAELIzS9duaVwkZe8ry16hSFAlGn+DyvmASBkOX2+/AZyAELIzS9duaVwkZe8ry16hSFAlGn+DyvmASBkOX2+/AZyAELIzS9duaVwkZe8ry16hSFAlGn+DyvmASBkOX2+/AZyAELIzS9duaVwkZe8ry16hSFAlGn+DyvmASBkOX2+/AZyAELIzS9duaVwkZe8ry16hSFAlGn+DyvmASBkOX2+/AZyAELIzS9duaVwkZe8ry16hSFAlGn+DyvmASBkOX2+/AZyAELIzS9duaVwkZe8ry16hSFAlGn+DyvmASBkOX2+/AZyAELIzS9duaVwkZe8ry16hSFAlGn+DyvmASBkOX2+/AZyAELIzS9duaVwkZe8ry16hSFAlGn+DyvmASBkOX2+/AZyAELIzS9duaVwkZe8ry16hSFAlGn+DyvmASBkOX2+/AZyAELIzS9duaVwkZe8ry16hSFAlGn+DyvmASBkOX2+/AZyAELIzS9duaVwkZe8ry16hSFAlGn+DyvmASBkOX2+/AZyAELIzS9duaVwkZe8ry16hSFAlGn+DyvmASBkOX2+/AZyAELIzS9duaVwkZe8ry16hSFAlGn+DyvmASBkOX2+/AZyAELIzS9duaVwkZe8ry16hSFAlGn+DyvmASBkOX2+/AZyAELIzS9duaVwkZe8ry16hSFAlGn+DyvmASBkOX2+/AZyAELIzS9duaVwkZe8ry16hSFAlGn+DyvmASBkOX2+/AZyAELIzS9duaVwkZe8ry16hSFAlGn+DyvmASBkOX2+/AZyAELIzS9duaVwkZe8ry16hSFAlGn+DyvmASBkOX2+/AZyAELIzS9duaVwkZe8ry16hSFA',
      booster: 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmASBkOX2+/AZyAELIzS9duaVwkZe8ry16hSFAlGn+DyvmASBkOX2+/AZyAELIzS9duaVwkZe8ry16hSFAlGn+DyvmASBkOX2+/AZyAELIzS9duaVwkZe8ry16hSFAlGn+DyvmASBkOX2+/AZyAELIzS9duaVwkZe8ry16hSFAlGn+DyvmASBkOX2+/AZyAELIzS9duaVwkZe8ry16hSFAlGn+DyvmASBkOX2+/AZyAELIzS9duaVwkZe8ry16hSFAlGn+DyvmASBkOX2+/AZyAELIzS9duaVwkZe8ry16hSFAlGn+DyvmASBkOX2+/AZyAELIzS9duaVwkZe8ry16hSFAlGn+DyvmASBkOX2+/AZyAELIzS9duaVwkZe8ry16hSFAlGn+DyvmASBkOX2+/AZyAELIzS9duaVwkZe8ry16hSFAlGn+DyvmASBkOX2+/AZyAELIzS9duaVwkZe8ry16hSFAlGn+DyvmASBkOX2+/AZyAELIzS9duaVwkZe8ry16hSFAlGn+DyvmASBkOX2+/AZyAELIzS9duaVwkZe8ry16hSFAlGn+DyvmASBkOX2+/AZyAELIzS9duaVwkZe8ry16hSFAlGn+DyvmASBkOX2+/AZyAELIzS9duaVwkZe8ry16hSFAlGn+DyvmASBkOX2+/AZyAELIzS9duaVwkZe8ry16hSFAlGn+DyvmASBkOX2+/AZyAELIzS9duaVwkZe8ry16hSFAlGn+DyvmASBkOX2+/AZyAELIzS9duaVwkZe8ry16hSFAlGn+DyvmASBkOX2+/AZyAELIzS9duaVwkZe8ry16hSFAlGn+DyvmASBkOX2+/AZyAELIzS9duaVwkZe8ry16hSFAlGn+DyvmASBkOX2+/AZyAELIzS9duaVwkZe8ry16hSFAlGn+DyvmASBkOX2+/AZyAELIzS9duaVwkZe8ry16hSFAlGn+DyvmASBkOX2+/AZyAELIzS9duaVwkZe8ry16hSFAlGn+DyvmASBkOX2+/AZyAELIzS9duaVwkZe8ry16hSFAlGn+DyvmASBkOX2+/AZyAELIzS9duaVwkZe8ry16hSFAlGn+DyvmASBkOX2+/AZyAELIzS9duaVwkZe8ry16hSFAlGn+DyvmASBkOX2+/AZyAELIzS9duaVwkZe8ry16hSFAlGn+DyvmASBkOX2+/AZyAELIzS9duaVwkZe8ry16hSFAlGn+DyvmASBkOX2+/AZyAELIzS9duaVwkZe8ry16hSFAlGn+DyvmASBkOX2+/AZyAELIzS9duaVwkZe8ry16hSFAlGn+DyvmASBkOX2+/AZyAELIzS9duaVwkZe8ry16hSFAlGn+DyvmASBkOX2+/AZyAELIzS9duaVwkZe8ry16hSFA',
      levelComplete: 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmASBkOX2+/AZyAELIzS9duaVwkZe8ry16hSFAlGn+DyvmASBkOX2+/AZyAELIzS9duaVwkZe8ry16hSFAlGn+DyvmASBkOX2+/AZyAELIzS9duaVwkZe8ry16hSFAlGn+DyvmASBkOX2+/AZyAELIzS9duaVwkZe8ry16hSFAlGn+DyvmASBkOX2+/AZyAELIzS9duaVwkZe8ry16hSFAlGn+DyvmASBkOX2+/AZyAELIzS9duaVwkZe8ry16hSFAlGn+DyvmASBkOX2+/AZyAELIzS9duaVwkZe8ry16hSFAlGn+DyvmASBkOX2+/AZyAELIzS9duaVwkZe8ry16hSFAlGn+DyvmASBkOX2+/AZyAELIzS9duaVwkZe8ry16hSFAlGn+DyvmASBkOX2+/AZyAELIzS9duaVwkZe8ry16hSFAlGn+DyvmASBkOX2+/AZyAELIzS9duaVwkZe8ry16hSFAlGn+DyvmASBkOX2+/AZyAELIzS9duaVwkZe8ry16hSFAlGn+DyvmASBkOX2+/AZyAELIzS9duaVwkZe8ry16hSFAlGn+DyvmASBkOX2+/AZyAELIzS9duaVwkZe8ry16hSFAlGn+DyvmASBkOX2+/AZyAELIzS9duaVwkZe8ry16hSFAlGn+DyvmASBkOX2+/AZyAELIzS9duaVwkZe8ry16hSFAlGn+DyvmASBkOX2+/AZyAELIzS9duaVwkZe8ry16hSFAlGn+DyvmASBkOX2+/AZyAELIzS9duaVwkZe8ry16hSFAlGn+DyvmASBkOX2+/AZyAELIzS9duaVwkZe8ry16hSFAlGn+DyvmASBkOX2+/AZyAELIzS9duaVwkZe8ry16hSFAlGn+DyvmASBkOX2+/AZyAELIzS9duaVwkZe8ry16hSFAlGn+DyvmASBkOX2+/AZyAELIzS9duaVwkZe8ry16hSFAlGn+DyvmASBkOX2+/AZyAELIzS9duaVwkZe8ry16hSFAlGn+DyvmASBkOX2+/AZyAELIzS9duaVwkZe8ry16hSFAlGn+DyvmASBkOX2+/AZyAELIzS9duaVwkZe8ry16hSFAlGn+DyvmASBkOX2+/AZyAELIzS9duaVwkZe8ry16hSFAlGn+DyvmASBkOX2+/AZyAELIzS9duaVwkZe8ry16hSFAlGn+DyvmASBkOX2+/AZyAELIzS9duaVwkZe8ry16hSFAlGn+DyvmASBkOX2+/AZyAELIzS9duaVwkZe8ry16hSFAlGn+DyvmASBkOX2+/AZyAELIzS9duaVwkZe8ry16hSFAlGn+DyvmASBkOX2+/AZyAELIzS9duaVwkZe8ry16hSFAlGn+DyvmASBkOX2+/AZyAELIzS9duaVwkZe8ry16hSFAlGn+DyvmASBkOX2+/AZyAELIzS9duaVwkZe8ry16hSFAlGn+DyvmASBkOX2+/AZyAELIzS9duaVwkZe8ry16hSFAlGn+DyvmASBkOX2+/AZyAELIzS9duaVwkZe8ry16hSFA',
      gameOver: 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmASBkOX2+/AZyAELIzS9duaVwkZe8ry16hSFAlGn+DyvmASBkOX2+/AZyAELIzS9duaVwkZe8ry16hSFAlGn+DyvmASBkOX2+/AZyAELIzS9duaVwkZe8ry16hSFAlGn+DyvmASBkOX2+/AZyAELIzS9duaVwkZe8ry16hSFAlGn+DyvmASBkOX2+/AZyAELIzS9duaVwkZe8ry16hSFAlGn+DyvmASBkOX2+/AZyAELIzS9duaVwkZe8ry16hSFAlGn+DyvmASBkOX2+/AZyAELIzS9duaVwkZe8ry16hSFAlGn+DyvmASBkOX2+/AZyAELIzS9duaVwkZe8ry16hSFAlGn+DyvmASBkOX2+/AZyAELIzS9duaVwkZe8ry16hSFAlGn+DyvmASBkOX2+/AZyAELIzS9duaVwkZe8ry16hSFAlGn+DyvmASBkOX2+/AZyAELIzS9duaVwkZe8ry16hSFAlGn+DyvmASBkOX2+/AZyAELIzS9duaVwkZe8ry16hSFAlGn+DyvmASBkOX2+/AZyAELIzS9duaVwkZe8ry16hSFAlGn+DyvmASBkOX2+/AZyAELIzS9duaVwkZe8ry16hSFAlGn+DyvmASBkOX2+/AZyAELIzS9duaVwkZe8ry16hSFAlGn+DyvmASBkOX2+/AZyAELIzS9duaVwkZe8ry16hSFAlGn+DyvmASBkOX2+/AZyAELIzS9duaVwkZe8ry16hSFAlGn+DyvmASBkOX2+/AZyAELIzS9duaVwkZe8ry16hSFAlGn+DyvmASBkOX2+/AZyAELIzS9duaVwkZe8ry16hSFAlGn+DyvmASBkOX2+/AZyAELIzS9duaVwkZe8ry16hSFAlGn+DyvmASBkOX2+/AZyAELIzS9duaVwkZe8ry16hSFAlGn+DyvmASBkOX2+/AZyAELIzS9duaVwkZe8ry16hSFAlGn+DyvmASBkOX2+/AZyAELIzS9duaVwkZe8ry16hSFAlGn+DyvmASBkOX2+/AZyAELIzS9duaVwkZe8ry16hSFAlGn+DyvmASBkOX2+/AZyAELIzS9duaVwkZe8ry16hSFAlGn+DyvmASBkOX2+/AZyAELIzS9duaVwkZe8ry16hSFAlGn+DyvmASBkOX2+/AZyAELIzS9duaVwkZe8ry16hSFAlGn+DyvmASBkOX2+/AZyAELIzS9duaVwkZe8ry16hSFAlGn+DyvmASBkOX2+/AZyAELIzS9duaVwkZe8ry16hSFAlGn+DyvmASBkOX2+/AZyAELIzS9duaVwkZe8ry16hSFAlGn+DyvmASBkOX2+/AZyAELIzS9duaVwkZe8ry16hSFAlGn+DyvmASBkOX2+/AZyAELIzS9duaVwkZe8ry16hSFAlGn+DyvmASBkOX2+/AZyAELIzS9duaVwkZe8ry16hSFAlGn+DyvmASBkOX2+/AZyAELIzS9duaVwkZe8ry16hSFAlGn+DyvmASBkOX2+/AZyAELIzS9duaVwkZe8ry16hSFAlGn+DyvmASBkOX2+/AZyAELIzS9duaVwkZe8ry16hSFAlGn+DyvmASBkOX2+/AZyAELIzS9duaVwkZe8ry16hSFAlGn+DyvmASBkOX2+/AZyAELIzS9duaVwkZe8ry16hSFAlGn+DyvmASBkOX2+/AZyAELIzS9duaVwkZe8ry16hSFAlGn+DyvmASBkOX2+/AZyAELIzS9duaVwkZe8ry16hSFAlGn+DyvmASBkOX2+/AZyAELIzS9duaVwkZe8ry16hSFA',
      shuffle: 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmASBkOX2+/AZyAELIzS9duaVwkZe8ry16hSFAlGn+DyvmASBkOX2+/AZyAELIzS9duaVwkZe8ry16hSFAlGn+DyvmASBkOX2+/AZyAELIzS9duaVwkZe8ry16hSFAlGn+DyvmASBkOX2+/AZyAELIzS9duaVwkZe8ry16hSFAlGn+DyvmASBkOX2+/AZyAELIzS9duaVwkZe8ry16hSFAlGn+DyvmASBkOX2+/AZyAELIzS9duaVwkZe8ry16hSFAlGn+DyvmASBkOX2+/AZyAELIzS9duaVwkZe8ry16hSFAlGn+DyvmASBkOX2+/AZyAELIzS9duaVwkZe8ry16hSFAlGn+DyvmASBkOX2+/AZyAELIzS9duaVwkZe8ry16hSFAlGn+DyvmASBkOX2+/AZyAELIzS9duaVwkZe8ry16hSFAlGn+DyvmASBkOX2+/AZyAELIzS9duaVwkZe8ry16hSFAlGn+DyvmASBkOX2+/AZyAELIzS9duaVwkZe8ry16hSFAlGn+DyvmASBkOX2+/AZyAELIzS9duaVwkZe8ry16hSFAlGn+DyvmASBkOX2+/AZyAELIzS9duaVwkZe8ry16hSFAlGn+DyvmASBkOX2+/AZyAELIzS9duaVwkZe8ry16hSFAlGn+DyvmASBkOX2+/AZyAELIzS9duaVwkZe8ry16hSFAlGn+DyvmASBkOX2+/AZyAELIzS9duaVwkZe8ry16hSFAlGn+DyvmASBkOX2+/AZyAELIzS9duaVwkZe8ry16hSFAlGn+DyvmASBkOX2+/AZyAELIzS9duaVwkZe8ry16hSFAlGn+DyvmASBkOX2+/AZyAELIzS9duaVwkZe8ry16hSFAlGn+DyvmASBkOX2+/AZyAELIzS9duaVwkZe8ry16hSFAlGn+DyvmASBkOX2+/AZyAELIzS9duaVwkZe8ry16hSFAlGn+DyvmASBkOX2+/AZyAELIzS9duaVwkZe8ry16hSFAlGn+DyvmASBkOX2+/AZyAELIzS9duaVwkZe8ry16hSFAlGn+DyvmASBkOX2+/AZyAELIzS9duaVwkZe8ry16hSFAlGn+DyvmASBkOX2+/AZyAELIzS9duaVwkZe8ry16hSFAlGn+DyvmASBkOX2+/AZyAELIzS9duaVwkZe8ry16hSFAlGn+DyvmASBkOX2+/AZyAELIzS9duaVwkZe8ry16hSFAlGn+DyvmASBkOX2+/AZyAELIzS9duaVwkZe8ry16hSFAlGn+DyvmASBkOX2+/AZyAELIzS9duaVwkZe8ry16hSFAlGn+DyvmASBkOX2+/AZyAELIzS9duaVwkZe8ry16hSFAlGn+DyvmASBkOX2+/AZyAELIzS9duaVwkZe8ry16hSFAlGn+DyvmASBkOX2+/AZyAELIzS9duaVwkZe8ry16hSFAlGn+DyvmASBkOX2+/AZyAELIzS9duaVwkZe8ry16hSFAlGn+DyvmASBkOX2+/AZyAELIzS9duaVwkZe8ry16hSFAlGn+DyvmASBkOX2+/AZyAELIzS9duaVwkZe8ry16hSFAlGn+DyvmASBkOX2+/AZyAELIzS9duaVwkZe8ry16hSFAlGn+DyvmASBkOX2+/AZyAELIzS9duaVwkZe8ry16hSFAlGn+DyvmASBkOX2+/AZyAELIzS9duaVwkZe8ry16hSFAlGn+DyvmASBkOX2+/AZyAELIzS9duaVwkZe8ry16hSFAlGn+DyvmASBkOX2+/AZyAELIzS9duaVwkZe8ry16hSFA',
      hint: 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmASBkOX2+/AZyAELIzS9duaVwkZe8ry16hSFAlGn+DyvmASBkOX2+/AZyAELIzS9duaVwkZe8ry16hSFAlGn+DyvmASBkOX2+/AZyAELIzS9duaVwkZe8ry16hSFAlGn+DyvmASBkOX2+/AZyAELIzS9duaVwkZe8ry16hSFAlGn+DyvmASBkOX2+/AZyAELIzS9duaVwkZe8ry16hSFAlGn+DyvmASBkOX2+/AZyAELIzS9duaVwkZe8ry16hSFAlGn+DyvmASBkOX2+/AZyAELIzS9duaVwkZe8ry16hSFAlGn+DyvmASBkOX2+/AZyAELIzS9duaVwkZe8ry16hSFAlGn+DyvmASBkOX2+/AZyAELIzS9duaVwkZe8ry16hSFAlGn+DyvmASBkOX2+/AZyAELIzS9duaVwkZe8ry16hSFAlGn+DyvmASBkOX2+/AZyAELIzS9duaVwkZe8ry16hSFAlGn+DyvmASBkOX2+/AZyAELIzS9duaVwkZe8ry16hSFAlGn+DyvmASBkOX2+/AZyAELIzS9duaVwkZe8ry16hSFAlGn+DyvmASBkOX2+/AZyAELIzS9duaVwkZe8ry16hSFAlGn+DyvmASBkOX2+/AZyAELIzS9duaVwkZe8ry16hSFAlGn+DyvmASBkOX2+/AZyAELIzS9duaVwkZe8ry16hSFAlGn+DyvmASBkOX2+/AZyAELIzS9duaVwkZe8ry16hSFAlGn+DyvmASBkOX2+/AZyAELIzS9duaVwkZe8ry16hSFAlGn+DyvmASBkOX2+/AZyAELIzS9duaVwkZe8ry16hSFAlGn+DyvmASBkOX2+/AZyAELIzS9duaVwkZe8ry16hSFAlGn+DyvmASBkOX2+/AZyAELIzS9duaVwkZe8ry16hSFAlGn+DyvmASBkOX2+/AZyAELIzS9duaVwkZe8ry16hSFAlGn+DyvmASBkOX2+/AZyAELIzS9duaVwkZe8ry16hSFAlGn+DyvmASBkOX2+/AZyAELIzS9duaVwkZe8ry16hSFAlGn+DyvmASBkOX2+/AZyAELIzS9duaVwkZe8ry16hSFAlGn+DyvmASBkOX2+/AZyAELIzS9duaVwkZe8ry16hSFAlGn+DyvmASBkOX2+/AZyAELIzS9duaVwkZe8ry16hSFAlGn+DyvmASBkOX2+/AZyAELIzS9duaVwkZe8ry16hSFAlGn+DyvmASBkOX2+/AZyAELIzS9duaVwkZe8ry16hSFAlGn+DyvmASBkOX2+/AZyAELIzS9duaVwkZe8ry16hSFAlGn+DyvmASBkOX2+/AZyAELIzS9duaVwkZe8ry16hSFAlGn+DyvmASBkOX2+/AZyAELIzS9duaVwkZe8ry16hSFAlGn+DyvmASBkOX2+/AZyAELIzS9duaVwkZe8ry16hSFAlGn+DyvmASBkOX2+/AZyAELIzS9duaVwkZe8ry16hSFAlGn+DyvmASBkOX2+/AZyAELIzS9duaVwkZe8ry16hSFAlGn+DyvmASBkOX2+/AZyAELIzS9duaVwkZe8ry16hSFAlGn+DyvmASBkOX2+/AZyAELIzS9duaVwkZe8ry16hSFAlGn+DyvmASBkOX2+/AZyAELIzS9duaVwkZe8ry16hSFAlGn+DyvmASBkOX2+/AZyAELIzS9duaVwkZe8ry16hSFAlGn+DyvmASBkOX2+/AZyAELIzS9duaVwkZe8ry16hSFAlGn+DyvmASBkOX2+/AZyAELIzS9duaVwkZe8ry16hSFAlGn+DyvmASBkOX2+/AZyAELIzS9duaVwkZe8ry16hSFAlGn+DyvmASBkOX2+/AZyAELIzS9duaVwkZe8ry16hSFAlGn+DyvmASBkOX2+/AZyAELIzS9duaVwkZe8ry16hSFAlGn+DyvmASBkOX2+/AZyAELIzS9duaVwkZe8ry16hSFA',
      hammer: 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmASBkOX2+/AZyAELIzS9duaVwkZe8ry16hSFAlGn+DyvmASBkOX2+/AZyAELIzS9duaVwkZe8ry16hSFAlGn+DyvmASBkOX2+/AZyAELIzS9duaVwkZe8ry16hSFAlGn+DyvmASBkOX2+/AZyAELIzS9duaVwkZe8ry16hSFAlGn+DyvmASBkOX2+/AZyAELIzS9duaVwkZe8ry16hSFAlGn+DyvmASBkOX2+/AZyAELIzS9duaVwkZe8ry16hSFAlGn+DyvmASBkOX2+/AZyAELIzS9duaVwkZe8ry16hSFAlGn+DyvmASBkOX2+/AZyAELIzS9duaVwkZe8ry16hSFAlGn+DyvmASBkOX2+/AZyAELIzS9duaVwkZe8ry16hSFAlGn+DyvmASBkOX2+/AZyAELIzS9duaVwkZe8ry16hSFAlGn+DyvmASBkOX2+/AZyAELIzS9duaVwkZe8ry16hSFAlGn+DyvmASBkOX2+/AZyAELIzS9duaVwkZe8ry16hSFAlGn+DyvmASBkOX2+/AZyAELIzS9duaVwkZe8ry16hSFAlGn+DyvmASBkOX2+/AZyAELIzS9duaVwkZe8ry16hSFAlGn+DyvmASBkOX2+/AZyAELIzS9duaVwkZe8ry16hSFAlGn+DyvmASBkOX2+/AZyAELIzS9duaVwkZe8ry16hSFAlGn+DyvmASBkOX2+/AZyAELIzS9duaVwkZe8ry16hSFAlGn+DyvmASBkOX2+/AZyAELIzS9duaVwkZe8ry16hSFAlGn+DyvmASBkOX2+/AZyAELIzS9duaVwkZe8ry16hSFAlGn+DyvmASBkOX2+/AZyAELIzS9duaVwkZe8ry16hSFAlGn+DyvmASBkOX2+/AZyAELIzS9duaVwkZe8ry16hSFAlGn+DyvmASBkOX2+/AZyAELIzS9duaVwkZe8ry16hSFAlGn+DyvmASBkOX2+/AZyAELIzS9duaVwkZe8ry16hSFAlGn+DyvmASBkOX2+/AZyAELIzS9duaVwkZe8ry16hSFAlGn+DyvmASBkOX2+/AZyAELIzS9duaVwkZe8ry16hSFAlGn+DyvmASBkOX2+/AZyAELIzS9duaVwkZe8ry16hSFAlGn+DyvmASBkOX2+/AZyAELIzS9duaVwkZe8ry16hSFAlGn+DyvmASBkOX2+/AZyAELIzS9duaVwkZe8ry16hSFAlGn+DyvmASBkOX2+/AZyAELIzS9duaVwkZe8ry16hSFAlGn+DyvmASBkOX2+/AZyAELIzS9duaVwkZe8ry16hSFAlGn+DyvmASBkOX2+/AZyAELIzS9duaVwkZe8ry16hSFAlGn+DyvmASBkOX2+/AZyAELIzS9duaVwkZe8ry16hSFAlGn+DyvmASBkOX2+/AZyAELIzS9duaVwkZe8ry16hSFAlGn+DyvmASBkOX2+/AZyAELIzS9duaVwkZe8ry16hSFAlGn+DyvmASBkOX2+/AZyAELIzS9duaVwkZe8ry16hSFAlGn+DyvmASBkOX2+/AZyAELIzS9duaVwkZe8ry16hSFAlGn+DyvmASBkOX2+/AZyAELIzS9duaVwkZe8ry16hSFAlGn+DyvmASBkOX2+/AZyAELIzS9duaVwkZe8ry16hSFAlGn+DyvmASBkOX2+/AZyAELIzS9duaVwkZe8ry16hSFAlGn+DyvmASBkOX2+/AZyAELIzS9duaVwkZe8ry16hSFAlGn+DyvmASBkOX2+/AZyAELIzS9duaVwkZe8ry16hSFAlGn+DyvmASBkOX2+/AZyAELIzS9duaVwkZe8ry16hSFAlGn+DyvmASBkOX2+/AZyAELIzS9duaVwkZe8ry16hSFAlGn+DyvmASBkOX2+/AZyAELIzS9duaVwkZe8ry16hSFAlGn+DyvmASBkOX2+/AZyAELIzS9duaVwkZe8ry16hSFA'
    };

    Object.entries(soundEffects).forEach(([key, src]) => {
      const audio = new Audio(src);
      audio.volume = settings.sfxVolume;
      soundEffectsRef.current[key as SoundEffect] = audio;
    });

    // Cleanup function
    return () => {
      if (backgroundMusicRef.current) {
        backgroundMusicRef.current.pause();
        backgroundMusicRef.current = null;
      }
      
      Object.values(soundEffectsRef.current).forEach(audio => {
        if (audio) {
          audio.pause();
        }
      });
      soundEffectsRef.current = {};
    };
  }, []);

  // Update volumes when settings change
  useEffect(() => {
    if (backgroundMusicRef.current) {
      backgroundMusicRef.current.volume = settings.musicVolume;
    }
    
    Object.values(soundEffectsRef.current).forEach(audio => {
      if (audio) {
        audio.volume = settings.sfxVolume;
      }
    });
  }, [settings.musicVolume, settings.sfxVolume]);

  const playBackgroundMusic = useCallback(async () => {
    if (!settings.musicEnabled || !backgroundMusicRef.current) return;
    
    try {
      await backgroundMusicRef.current.play();
      setIsPlaying(true);
      console.log('🎵 [Audio] Background music started');
    } catch (error) {
      console.warn('⚠️ [Audio] Failed to play background music:', error);
      // Autoplay might be blocked, we'll try again on user interaction
    }
  }, [settings.musicEnabled]);

  const stopBackgroundMusic = useCallback(() => {
    if (backgroundMusicRef.current) {
      backgroundMusicRef.current.pause();
      backgroundMusicRef.current.currentTime = 0;
      setIsPlaying(false);
      console.log('🔇 [Audio] Background music stopped');
    }
  }, []);

  const playSoundEffect = useCallback((effect: SoundEffect) => {
    if (!settings.sfxEnabled) return;
    
    const audio = soundEffectsRef.current[effect];
    if (audio) {
      audio.currentTime = 0; // Reset to beginning
      audio.play().catch(error => {
        console.warn(`⚠️ [Audio] Failed to play ${effect} sound:`, error);
      });
      console.log(`🔊 [Audio] Played ${effect} sound effect`);
    }
  }, [settings.sfxEnabled]);

  const updateSettings = useCallback((newSettings: Partial<AudioSettings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
    console.log('🎚️ [Audio] Settings updated:', newSettings);
  }, []);

  return {
    settings,
    isPlaying,
    playBackgroundMusic,
    stopBackgroundMusic,
    playSoundEffect,
    updateSettings
  };
};
