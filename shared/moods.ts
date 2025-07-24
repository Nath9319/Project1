export interface Mood {
  id: string;
  label: string;
  emoji: string;
  category: 'positive' | 'negative' | 'neutral' | 'energetic' | 'calm';
  color: string;
}

export const AVAILABLE_MOODS: Mood[] = [
  // Positive Moods
  { id: 'happy', label: 'Happy', emoji: '😊', category: 'positive', color: '#FFD700' },
  { id: 'excited', label: 'Excited', emoji: '🤗', category: 'positive', color: '#FF6B6B' },
  { id: 'grateful', label: 'Grateful', emoji: '🙏', category: 'positive', color: '#4ECDC4' },
  { id: 'loved', label: 'Loved', emoji: '🥰', category: 'positive', color: '#FF69B4' },
  { id: 'confident', label: 'Confident', emoji: '😎', category: 'positive', color: '#6A5ACD' },
  { id: 'peaceful', label: 'Peaceful', emoji: '😌', category: 'positive', color: '#87CEEB' },
  { id: 'playful', label: 'Playful', emoji: '😜', category: 'positive', color: '#FFB6C1' },
  { id: 'inspired', label: 'Inspired', emoji: '✨', category: 'positive', color: '#DDA0DD' },
  
  // Energetic Moods
  { id: 'energetic', label: 'Energetic', emoji: '⚡', category: 'energetic', color: '#FFA500' },
  { id: 'motivated', label: 'Motivated', emoji: '💪', category: 'energetic', color: '#FF4500' },
  { id: 'focused', label: 'Focused', emoji: '🎯', category: 'energetic', color: '#4169E1' },
  { id: 'creative', label: 'Creative', emoji: '🎨', category: 'energetic', color: '#9370DB' },
  
  // Calm Moods
  { id: 'relaxed', label: 'Relaxed', emoji: '😇', category: 'calm', color: '#98D8C8' },
  { id: 'content', label: 'Content', emoji: '☺️', category: 'calm', color: '#F0E68C' },
  { id: 'thoughtful', label: 'Thoughtful', emoji: '🤔', category: 'calm', color: '#B0C4DE' },
  { id: 'sleepy', label: 'Sleepy', emoji: '😴', category: 'calm', color: '#778899' },
  
  // Neutral Moods
  { id: 'neutral', label: 'Neutral', emoji: '😐', category: 'neutral', color: '#C0C0C0' },
  { id: 'confused', label: 'Confused', emoji: '😕', category: 'neutral', color: '#D3D3D3' },
  { id: 'surprised', label: 'Surprised', emoji: '😲', category: 'neutral', color: '#FFA07A' },
  { id: 'curious', label: 'Curious', emoji: '🤨', category: 'neutral', color: '#DEB887' },
  
  // Negative Moods
  { id: 'sad', label: 'Sad', emoji: '😢', category: 'negative', color: '#4682B4' },
  { id: 'anxious', label: 'Anxious', emoji: '😰', category: 'negative', color: '#8B7355' },
  { id: 'stressed', label: 'Stressed', emoji: '😣', category: 'negative', color: '#CD5C5C' },
  { id: 'angry', label: 'Angry', emoji: '😠', category: 'negative', color: '#DC143C' },
  { id: 'frustrated', label: 'Frustrated', emoji: '😤', category: 'negative', color: '#B22222' },
  { id: 'disappointed', label: 'Disappointed', emoji: '😞', category: 'negative', color: '#696969' },
  { id: 'lonely', label: 'Lonely', emoji: '😔', category: 'negative', color: '#483D8B' },
  { id: 'overwhelmed', label: 'Overwhelmed', emoji: '😵', category: 'negative', color: '#8B4513' },
];

export const getMoodById = (id: string): Mood | undefined => {
  return AVAILABLE_MOODS.find(mood => mood.id === id);
};

export const getMoodsByCategory = (category: Mood['category']): Mood[] => {
  return AVAILABLE_MOODS.filter(mood => mood.category === category);
};

// Helper to check if mood should reset (after sleep cycle - roughly 6+ hours since last update)
export const shouldResetMood = (lastUpdate: Date | null, lastSleepTime: Date | null): boolean => {
  if (!lastUpdate) return false;
  
  const now = new Date();
  const hoursSinceUpdate = (now.getTime() - lastUpdate.getTime()) / (1000 * 60 * 60);
  
  // If we have sleep time tracking and user slept after mood update
  if (lastSleepTime && lastSleepTime > lastUpdate) {
    return true;
  }
  
  // Otherwise, assume sleep cycle if more than 6 hours passed
  return hoursSinceUpdate >= 6;
};