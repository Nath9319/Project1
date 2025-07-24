import { AVAILABLE_MOODS, type Mood } from "@shared/moods";

// Keywords and phrases associated with each mood
const moodKeywords: Record<string, string[]> = {
  // Positive moods
  happy: ["happy", "joy", "joyful", "glad", "pleased", "delighted", "cheerful", "good mood", "great day", "wonderful", "amazing", "fantastic", "excellent", "smile", "smiling", "laugh", "laughing"],
  excited: ["excited", "thrilled", "enthusiastic", "eager", "pumped", "can't wait", "looking forward", "anticipation", "energy", "energetic", "hyped"],
  grateful: ["grateful", "thankful", "appreciate", "blessed", "fortunate", "lucky", "gratitude", "thanks", "thank you"],
  proud: ["proud", "accomplished", "achieved", "success", "successful", "won", "victory", "milestone", "goal", "pride"],
  content: ["content", "satisfied", "peaceful", "calm", "relaxed", "comfortable", "at ease", "serene", "tranquil"],
  hopeful: ["hope", "hopeful", "optimistic", "positive", "looking forward", "future", "believe", "faith", "possibility"],
  loved: ["love", "loved", "affection", "care", "caring", "cherished", "adored", "beloved", "romance", "romantic"],
  inspired: ["inspired", "motivated", "inspiration", "creative", "ideas", "enlightened", "driven", "passionate"],
  
  // Energetic moods
  energetic: ["energetic", "energy", "active", "dynamic", "vigorous", "lively", "animated", "spirited"],
  playful: ["playful", "fun", "play", "silly", "goofy", "lighthearted", "carefree", "amusing"],
  determined: ["determined", "focused", "committed", "dedicated", "resolved", "persistent", "driven"],
  confident: ["confident", "self-assured", "bold", "certain", "sure", "capable", "strong"],
  
  // Calm moods
  relaxed: ["relaxed", "chill", "laid back", "easy", "unwinding", "rest", "resting", "leisure"],
  peaceful: ["peaceful", "peace", "quiet", "still", "tranquil", "serene", "harmony"],
  thoughtful: ["thoughtful", "thinking", "reflecting", "contemplating", "pondering", "considering", "introspective"],
  mindful: ["mindful", "present", "aware", "conscious", "meditation", "meditate", "breathing"],
  
  // Neutral moods
  okay: ["okay", "fine", "alright", "so-so", "average", "normal", "regular"],
  tired: ["tired", "exhausted", "fatigue", "sleepy", "drowsy", "worn out", "drained"],
  bored: ["bored", "boring", "dull", "monotonous", "tedious", "uninteresting"],
  confused: ["confused", "puzzled", "perplexed", "uncertain", "unsure", "don't know", "unclear"],
  
  // Negative moods
  sad: ["sad", "unhappy", "down", "depressed", "melancholy", "sorrow", "grief", "crying", "tears", "heartbroken"],
  anxious: ["anxious", "anxiety", "worried", "nervous", "stress", "stressed", "tense", "uneasy", "restless", "concerned"],
  angry: ["angry", "mad", "furious", "irritated", "annoyed", "frustrated", "rage", "upset", "pissed"],
  disappointed: ["disappointed", "let down", "discouraged", "dissatisfied", "unfulfilled", "failed", "failure"],
  lonely: ["lonely", "alone", "isolated", "solitary", "lonesome", "miss", "missing"],
  overwhelmed: ["overwhelmed", "too much", "overloaded", "swamped", "buried", "drowning", "can't handle"],
  guilty: ["guilty", "guilt", "ashamed", "regret", "sorry", "remorse", "blame myself"],
  jealous: ["jealous", "envy", "envious", "resentful", "covet"],
  
  // Additional moods
  silly: ["silly", "goofy", "funny", "humor", "joke", "joking", "lol", "haha"],
  creative: ["creative", "creating", "artistic", "imagination", "innovative", "inventive"],
  curious: ["curious", "wonder", "wondering", "interested", "intrigued", "fascinated"],
  nostalgic: ["nostalgic", "memories", "remember", "reminisce", "past", "old times", "used to"],
  restless: ["restless", "antsy", "fidgety", "impatient", "can't sit still", "agitated"],
  grumpy: ["grumpy", "cranky", "irritable", "moody", "cross", "bad mood"],
  embarrassed: ["embarrassed", "embarrassment", "ashamed", "humiliated", "awkward", "cringe"],
  scared: ["scared", "afraid", "fear", "frightened", "terrified", "panic", "horror"],
  sick: ["sick", "ill", "unwell", "nauseous", "pain", "ache", "fever", "cold", "flu"],
  homesick: ["homesick", "miss home", "missing family", "want to go home"],
};

// Analyze text and suggest moods based on content
export function analyzeMoodFromText(text: string): Mood[] {
  const lowerText = text.toLowerCase();
  const scores: Record<string, number> = {};
  
  // Count keyword matches for each mood
  Object.entries(moodKeywords).forEach(([moodId, keywords]) => {
    let score = 0;
    keywords.forEach(keyword => {
      // Use word boundaries for more accurate matching
      const regex = new RegExp(`\\b${keyword}\\b`, 'gi');
      const matches = lowerText.match(regex);
      if (matches) {
        score += matches.length;
      }
    });
    if (score > 0) {
      scores[moodId] = score;
    }
  });
  
  // Sort moods by score and get top suggestions
  const sortedMoods = Object.entries(scores)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 3) // Get top 3 suggestions
    .map(([moodId]) => AVAILABLE_MOODS.find(m => m.id === moodId))
    .filter((mood): mood is Mood => mood !== undefined);
  
  return sortedMoods;
}

// Check if text has emotional content worth suggesting moods for
export function hasEmotionalContent(text: string): boolean {
  const minLength = 20; // Minimum text length to analyze
  if (text.length < minLength) return false;
  
  // Check if text contains any mood-related keywords
  const allKeywords = Object.values(moodKeywords).flat();
  const lowerText = text.toLowerCase();
  
  return allKeywords.some(keyword => {
    const regex = new RegExp(`\\b${keyword}\\b`, 'i');
    return regex.test(lowerText);
  });
}