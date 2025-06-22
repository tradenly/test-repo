
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
    // Create background music element - using the Pixabay game music loop
    backgroundMusicRef.current = new Audio('/audio/game-music-loop.mp3');
    backgroundMusicRef.current.loop = true;
    backgroundMusicRef.current.volume = settings.musicVolume;
    
    // Initialize sound effects with simple beep tones for now
    // These can be replaced with proper sound files later
    const soundEffects: { [key in SoundEffect]: () => AudioBuffer | null } = {
      match: () => createBeepTone(440, 0.2),
      booster: () => createBeepTone(660, 0.3),
      levelComplete: () => createBeepTone(880, 0.5),
      gameOver: () => createBeepTone(220, 0.8),
      shuffle: () => createBeepTone(330, 0.3),
      hint: () => createBeepTone(550, 0.2),
      hammer: () => createBeepTone(770, 0.2)
    };

    // Create simple beep sounds using Web Audio API
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    
    Object.entries(soundEffects).forEach(([key, createTone]) => {
      const buffer = createTone();
      if (buffer) {
        const audio = new Audio();
        audio.volume = settings.sfxVolume;
        soundEffectsRef.current[key as SoundEffect] = audio;
      }
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

  // Helper function to create simple beep tones
  const createBeepTone = (frequency: number, duration: number): AudioBuffer | null => {
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const sampleRate = audioContext.sampleRate;
      const numSamples = sampleRate * duration;
      const buffer = audioContext.createBuffer(1, numSamples, sampleRate);
      const channelData = buffer.getChannelData(0);
      
      for (let i = 0; i < numSamples; i++) {
        const t = i / sampleRate;
        channelData[i] = Math.sin(2 * Math.PI * frequency * t) * 0.1;
      }
      
      return buffer;
    } catch (error) {
      console.warn('Failed to create beep tone:', error);
      return null;
    }
  };

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
    
    // For now, create a simple beep using Web Audio API
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      // Different frequencies for different effects
      const frequencies: { [key in SoundEffect]: number } = {
        match: 440,
        booster: 660,
        levelComplete: 880,
        gameOver: 220,
        shuffle: 330,
        hint: 550,
        hammer: 770
      };
      
      oscillator.frequency.setValueAtTime(frequencies[effect], audioContext.currentTime);
      gainNode.gain.setValueAtTime(settings.sfxVolume * 0.1, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.2);
      
      console.log(`🔊 [Audio] Played ${effect} sound effect`);
    } catch (error) {
      console.warn(`⚠️ [Audio] Failed to play ${effect} sound:`, error);
    }
  }, [settings.sfxEnabled, settings.sfxVolume]);

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
