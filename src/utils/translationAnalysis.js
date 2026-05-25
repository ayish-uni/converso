export async function analyzeTranslationAccuracy(
  originalText,
  deeplTranslation,
  googleTranslation,
) {
  if (!deeplTranslation || !googleTranslation) {
    return "medium";
  }

  const deeplWords = deeplTranslation.toLowerCase().split(/\s+/);
  const googleWords = googleTranslation.toLowerCase().split(/\s+/);

  const maxLen = Math.max(deeplWords.length, googleWords.length);
  let matchCount = 0;

  for (let i = 0; i < Math.min(deeplWords.length, googleWords.length); i++) {
    const similarity = calculateWordSimilarity(deeplWords[i], googleWords[i]);
    if (similarity > 0.8) {
      matchCount++;
    }
  }

  const agreement = (matchCount / maxLen) * 100;

  if (agreement >= 85) {
    return "high";
  } else if (agreement >= 65) {
    return "medium";
  }
  return "low";
}

export function calculateWordSimilarity(word1, word2) {
  const longer = word1.length > word2.length ? word1 : word2;
  const shorter = word1.length > word2.length ? word2 : word1;

  if (longer.length === 0) {
    return 1.0;
  }

  const editDistance = getEditDistance(longer, shorter);
  return (longer.length - editDistance) / longer.length;
}

function getEditDistance(s1, s2) {
  const costs = [];
  for (let i = 0; i <= s1.length; i++) {
    let lastValue = i;
    for (let j = 0; j <= s2.length; j++) {
      if (i === 0) {
        costs[j] = j;
      } else if (j > 0) {
        let newValue = costs[j - 1];
        if (s1.charAt(i - 1) !== s2.charAt(j - 1)) {
          newValue = Math.min(Math.min(newValue, lastValue), costs[j]) + 1;
        }
        costs[j - 1] = lastValue;
        lastValue = newValue;
      }
    }
    if (i > 0) {
      costs[s2.length] = lastValue;
    }
  }
  return costs[s2.length];
}

export const CULTURAL_NOTES = {
  es: {
    greeting: "Spanish culture emphasizes warmth and personal connection in greetings.",
    formal:
      "Spanish has formal/informal distinctions (tú vs usted). Use accordingly.",
    slang: "Colloquial Spanish varies greatly by region (Spain vs Latin America).",
  },
  ja: {
    greeting: "Japanese greetings require deep respect, especially in formal settings.",
    formal: "Keigo (敬語) is essential in business; casual speech among friends.",
    slang: "Modern Japanese incorporates katakana for trendy/foreign terms.",
  },
  ar: {
    greeting:
      "Arabic greetings often include religious phrases (Assalamu alaikum).",
    formal: "Modern Standard Arabic (MSA) vs colloquial dialects vary by region.",
    slang: "Younger generations mix Arabic with English in casual digital speech.",
  },
  hi: {
    greeting: "Hindi greetings reflect hierarchy (elders get Namaste, peers get Hi).",
    formal: "Hindi has formal/casual pronouns and verb forms.",
    slang: "Hinglish (Hindi + English) is common in modern conversations.",
  },
  tr: {
    greeting: "Turkish culture values hospitality; greetings are warm and welcoming.",
    formal: "Turkish uses -siz suffix for formal address vs -sin for informal.",
    slang: "Youth culture heavily influences Turkish internet language.",
  },
  pt: {
    greeting:
      "Portuguese greetings vary between Brazil (warm) and Portugal (formal).",
    formal: "Brazilian Portuguese is more casual; European Portuguese is formal.",
    slang: "Internet slang differs significantly between regions.",
  },
  fr: {
    greeting:
      "French culture emphasizes politeness; always use formal address unless invited.",
    formal: "Tu vs Vous distinction is critical in French society.",
    slang: "Verlan and SMS language popular among younger generations.",
  },
  de: {
    greeting: "German greetings are polite but reserved; handshakes are common.",
    formal: "Du vs Sie distinction reflects social hierarchy and respect.",
    slang: "German internet culture is playful with compound words.",
  },
  zh: {
    greeting: "Chinese greetings often inquire about well-being and meals.",
    formal:
      "Mandarin has formal and informal registers; honorifics are important.",
    slang: "Internet language uses simplified characters and memes.",
  },
  ko: {
    greeting: "Korean greetings are deeply tied to age and social hierarchy.",
    formal: "Korean has multiple formality levels; respect speech is essential.",
    slang: "K-pop and gaming culture influence modern Korean slang.",
  },
  en: {
    greeting: "English greetings are casual and direct; informality is common.",
    formal: "English relies on word choice rather than grammar for formality.",
    slang: "English slang evolves rapidly, especially in digital spaces.",
  },
  ru: {
    greeting: "Russian greetings are warm; gender-specific greetings exist.",
    formal: "Russian uses formal/informal 'you' (Вы vs ты).",
    slang: "Russian internet language is creative with abbreviations.",
  },
  id: {
    greeting:
      "Indonesian greetings are polite; 'Selamat' is used for various occasions.",
    formal: "Indonesian uses formal 'Anda' vs casual 'kamu'.",
    slang: "Indonesian youth culture blends Javanese, Sundanese, and slang.",
  },
  it: {
    greeting: "Italian greetings are expressive and warm.",
    formal: "Italian uses lei/tu distinction for formality.",
    slang: "Italian has strong regional dialects and modern internet slang.",
  },
  nl: {
    greeting: "Dutch culture is direct; handshakes and eye contact are valued.",
    formal: "Dutch uses u/je for formal/informal address.",
    slang: "Dutch internet language is playful and borrows from English.",
  },
  pl: {
    greeting: "Polish greetings are respectful; formal address is common initially.",
    formal: "Polish uses formal/informal pronouns and verb forms.",
    slang: "Polish youth culture is vibrant with modern slang.",
  },
};

export function getCulturalNote(languageCode, category = "greeting") {
  const notes = CULTURAL_NOTES[languageCode];
  if (!notes) {
    return null;
  }
  return notes[category] || null;
}

export function extractKeywords(text) {
  const stopWords = new Set([
    "the",
    "a",
    "an",
    "and",
    "or",
    "but",
    "in",
    "on",
    "at",
    "to",
    "for",
    "of",
    "with",
    "by",
    "from",
    "is",
    "are",
    "was",
    "were",
    "been",
    "be",
    "have",
    "has",
    "had",
    "do",
    "does",
    "did",
    "will",
    "would",
    "could",
    "should",
    "may",
    "might",
    "must",
    "can",
  ]);

  const words = text
    .toLowerCase()
    .split(/\s+/)
    .filter((word) => word.length > 3 && !stopWords.has(word));

  return [...new Set(words)].slice(0, 5);
}

export function determineFormalityLevel(text) {
  const formalPatterns =
    /\b(therefore|furthermore|nevertheless|consequently|regarding|concerning)\b/i;
  const informalPatterns =
    /\b(gonna|wanna|gotta|ain't|y'all|dunno|kinda|sorta)\b/i;
  const slangPatterns =
    /\b(lit|fire|salty|savage|flex|vibe|lowkey|highkey|tea)\b/i;

  if (slangPatterns.test(text)) {
    return "slang";
  }
  if (informalPatterns.test(text)) {
    return "informal";
  }
  if (formalPatterns.test(text)) {
    return "formal";
  }
  return "neutral";
}

export function generateLearningTip(originalText, keyword, languageCode) {
  const formality = determineFormalityLevel(originalText);
  const culturalNote = getCulturalNote(languageCode, "slang");

  return {
    keyword,
    formality,
    culturalNote,
    tip: `This word is ${formality}. Context: ${culturalNote}`,
  };
}
