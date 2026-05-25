import axios from "axios";
import { env } from "../config/env.js";

const canUseDeepL = !!(env.deeplApiKey && env.deeplApiKey !== 'your_deepl_key');

const CACHE_TTL_MS = 1000 * 60 * 10;
const translationCache = new Map();

const DEEPL_SUPPORTED_LANGUAGES = new Set([
  "EN",
  "ES",
  "FR",
  "DE",
  "IT",
  "PT",
  "NL",
  "PL",
  "ZH",
  "JA",
  "KO",
  "AR",
  "HI",
  "UR",
  "BN",
  "TR",
  "ID",
  "RU",
]);

const NEURAL_RELAY_MOCK = {
  "hi": { "tr": "merhaba", "es": "hola", "fr": "salut" },
  "hello": { "tr": "merhaba", "es": "hola", "fr": "salut" },
  "how are you": { "tr": "nasılsın?", "es": "¿cómo estás?", "fr": "comment ça va?" },
  "good morning": { "tr": "günaydın", "es": "buenos días", "fr": "bonjour" },
  "good night": { "tr": "iyi geceler", "es": "buenas noches", "fr": "bonne nuit" },
  "kardeshim": { "en": "my brother", "es": "mi hermano", "fr": "mon frère" },
  "iyi akşamlar": { "en": "good evening", "es": "buenas tardes", "fr": "bonsoir" },
  "merhaba": { "en": "hello", "es": "hola", "fr": "salut" },
  "tamam": { "en": "okay", "es": "está bien", "fr": "d'accord" },
  "teşekkürler": { "en": "thanks", "es": "gracias", "fr": "merci" },
};

const SLANG_DICTIONARY = {
  // English Slangs / Gen Z abbreviations
  "fr": { en: "for real", es: "de verdad", fr: "sérieusement", de: "echt jetzt", ur: "سچ میں", tr: "harbiden", ar: "بالفعل" },
  "rn": { en: "right now", es: "ahora mismo", fr: "tout de suite", de: "sofort", ur: "ابھی", tr: "şu an", ar: "الآن" },
  "idk": { en: "I don't know", es: "no lo sé", fr: "je ne sais pas", de: "ich weiß nicht", ur: "مجھے نہیں معلوم", tr: "bilmiyorum", ar: "لا أعلم" },
  "btw": { en: "by the way", es: "por cierto", fr: "au fait", de: "übrigens", ur: "ویسے", tr: "bu arada", ar: "على الفكرة" },
  "tbh": { en: "to be honest", es: "para ser honesto", fr: "pour être honnête", de: "um ehrlich zu sein", ur: "سچ کہوں تو", tr: "dürüst olmak gerekirse", ar: "بصراحة" },
  "no cap": { en: "no lie / seriously", es: "en serio / sin mentiras", fr: "sans mentir", de: "ohne Scheiß", ur: "سچ میں", tr: "cidden", ar: "بدون كذب" },
  "rizz": { en: "charisma", es: "carisma / encanto", fr: "charme / charisme", de: "Ausstrahlung", ur: "کشش", tr: "çekicilik / karizma", ar: "جاذبية" },
  "bet": { en: "agree / absolutely", es: "de acuerdo / por supuesto", fr: "d'accord / carrément", de: "abgemacht / auf jeden Fall", ur: "بالکل", tr: "tamamdır", ar: "تحدي / بالتأكيد" },
  "bruh": { en: "brother / seriously?", es: "hermano / ¿cómo?", fr: "frère / sérieux?", de: "Kumpel / im Ernst?", ur: "بھائی", tr: "kardeşim / ciddi misin?", ar: "يا أخي" },
  "fam": { en: "family / close friends", es: "familia / amigos cercanos", fr: "la famille / les proches", de: "Familie / Kumpels", ur: "خاندان", tr: "kardeşler / tayfa", ar: "الأهل" },
  "lit": { en: "amazing / exciting", es: "increíble / genial", fr: "incroyable / génial", de: "mega / abgefahren", ur: "بہت زبردست", tr: "harika / ateş ediyor", ar: "رائع جداً" },
  "giga chad": { en: "ultimate alpha male", es: "macho alfa supremo", fr: "homme alpha suprême", de: "Super-Alpha-Mann", ur: "بہترین مرد", tr: "en klas adam", ar: "رجل خارق" },
  "slay": { en: "doing amazingly well", es: "haciéndolo genial / rompiéndola", fr: "tout déchirer", de: "abräumen / rocken", ur: "شاندار کارکردگی", tr: "ortalığı yakmak / harika yapmak", ar: "أبدعت" },
  
  // Spanish Slangs
  "wey": { en: "dude / mate", es: "güey", fr: "mec", de: "Kumpel", ur: "دوست", tr: "kanka / dostum", ar: "يا صاح" },
  "tio": { en: "dude / buddy", es: "tío", fr: "mec", de: "Alter", ur: "یار", tr: "kanka / dostum", ar: "يا صاح" },
  "chaval": { en: "kid / mate", es: "chaval", fr: "gamin / mec", de: "Junge / Typ", ur: "بچہ", tr: "genç / çocuk", ar: "شاب" },

  // Turkish Slangs
  "kanka": { en: "mate / buddy", es: "amigo / tío", fr: "pote / mec", de: "Kumpel / Alter", ur: "دوست", tr: "kanka", ar: "يا صاح" },
  "kanka naber": { en: "hey mate, what's up?", es: "hola tío, ¿qué tal?", fr: "salut mec, ça va?", de: "hey Kumpel, wie geht's?", ur: "کیا حال ہے دوست؟", tr: "kanka naber?", ar: "كيف الحال يا صاح؟" },

  // Urdu Slangs
  "jigar": { en: "close friend / bro", es: "amigo íntimo / hermano", fr: "ami proche / frère", de: "enger Freund / Bruder", ur: "جگر", tr: "can ciğer kanka / kardeşim", ar: "حبيبي / صديق مقرب" },
  "yar": { en: "friend / buddy", es: "amigo / tío", fr: "pote / mec", de: "Kumpel", ur: "یار", tr: "kanka", ar: "يا صاح" }
};

export function translateSlangInText(text, targetLangCode) {
  if (!text) return text;
  const target = String(targetLangCode || "en").toLowerCase().trim();
  let cleanText = String(text);

  const sortedSlangKeys = Object.keys(SLANG_DICTIONARY).sort((a, b) => b.length - a.length);

  for (const slang of sortedSlangKeys) {
    const translations = SLANG_DICTIONARY[slang];
    const replacement = translations[target] || translations["en"] || slang;
    
    const escapedSlang = slang.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
    const regex = new RegExp(`\\b${escapedSlang}\\b`, 'gi');
    
    cleanText = cleanText.replace(regex, replacement);
  }

  return cleanText;
}

export function detectLanguageLocally(text) {
  const clean = String(text || "").trim();
  if (!clean) return null;

  // 1. Japanese check
  if (/[\u3040-\u309F\u30A0-\u30FF]/.test(clean)) {
    return "ja";
  }
  // 2. Korean check
  if (/[\uAC00-\uD7AF]/.test(clean)) {
    return "ko";
  }
  // 3. Chinese check
  if (/[\u4E00-\u9FFF]/.test(clean)) {
    return "zh";
  }
  // 4. Urdu vs Arabic check
  if (/[\u0600-\u06FF]/.test(clean)) {
    // Urdu specific characters: ٹ, ڈ, ڑ, ں, ے, ہ, ڑ, چ, پ, گ
    if (/[\u067E\u0686\u0698\u06AF\u0671-\u06D3]/.test(clean) || /[ٹڈڑںےہپچگ]/.test(clean)) {
      return "ur";
    }
    return "ar";
  }
  // 5. Cyrillic (Russian) check
  if (/[\u0400-\u04FF]/.test(clean)) {
    return "ru";
  }
  // 6. Devanagari (Hindi) check
  if (/[\u0900-\u097F]/.test(clean)) {
    return "hi";
  }
  // 7. Bengali check
  if (/[\u0980-\u09FF]/.test(clean)) {
    return "bn";
  }
  // 8. Greek check
  if (/[\u0370-\u03FF]/.test(clean)) {
    return "el";
  }

  // 9. Quick common word detection for Latin languages
  const lower = clean.toLowerCase();
  
  // Spanish
  if (/\b(hola|gracias|buenos|noches|tarde|por\s+favor|amigo|casa|hacer|tengo)\b/.test(lower)) {
    return "es";
  }
  // French
  if (/\b(bonjour|merci|salut|s'il\s+plaît|oui|non|ami|avec|pour|suis|est)\b/.test(lower)) {
    return "fr";
  }
  // German
  if (/\b(hallo|danke|bitte|ja|nein|freund|mit|für|nicht|und|ist|ich)\b/.test(lower)) {
    return "de";
  }
  // Italian
  if (/\b(ciao|grazie|prego|amico|con|per|non|si|tutto|bene|casa)\b/.test(lower)) {
    return "it";
  }
  // Portuguese
  if (/\b(olá|obrigado|por\s+favor|amigo|sim|não|com|para|tudo|bem|casa)\b/.test(lower)) {
    return "pt";
  }
  // Turkish
  if (/\b(merhaba|teşekkürler|lütfen|evet|hayır|arkadaş|ile|için|değil|ve|nasılsın)\b/.test(lower)) {
    return "tr";
  }
  // Dutch
  if (/\b(hallo|bedankt|alsjeblieft|ja|nee|vriend|met|voor|niet|en|is|ik)\b/.test(lower)) {
    return "nl";
  }
  // Polish
  if (/\b(cześć|dziękuję|proszę|tak|nie|przyjaciel|z|dla|nie|i|jest|ja)\b/.test(lower)) {
    return "pl";
  }

  return null;
}

const GOOGLE_LANGUAGE_ALIASES = {
  "ZH-CN": "zh-CN",
  "ZH-TW": "zh-TW",
  EN: "en",
  ES: "es",
  FR: "fr",
  DE: "de",
  IT: "it",
  PT: "pt",
  NL: "nl",
  PL: "pl",
  UR: "ur",
  HI: "hi",
  AR: "ar",
  ZH: "zh",
  JA: "ja",
  KO: "ko",
  BN: "bn",
  TR: "tr",
  ID: "id",
  RU: "ru",
};

function cacheKey(parts) {
  return parts.join("::");
}

function getCachedValue(key) {
  const cached = translationCache.get(key);
  if (!cached) {
    return null;
  }

  if (cached.expiresAt < Date.now()) {
    translationCache.delete(key);
    return null;
  }

  return cached.value;
}

function setCachedValue(key, value) {
  translationCache.set(key, {
    value,
    expiresAt: Date.now() + CACHE_TTL_MS,
  });
}

function normalizeLanguageCode(language) {
  if (!language) {
    return null;
  }

  return String(language).trim().replace("_", "-").toUpperCase();
}

function toGoogleLanguageCode(language) {
  if (!language) return null;
  const normalized = normalizeLanguageCode(language);
  
  if (GOOGLE_LANGUAGE_ALIASES[normalized]) {
    return GOOGLE_LANGUAGE_ALIASES[normalized];
  }

  const languageMap = {
    'TURKISH': 'tr',
    'ENGLISH': 'en',
    'SPANISH': 'es',
    'FRENCH': 'fr',
    'GERMAN': 'de',
    'JAPANESE': 'ja',
    'CHINESE': 'zh',
    'ARABIC': 'ar',
    'HINDI': 'hi',
    'PORTUGUESE': 'pt',
    'ITALIAN': 'it',
    'RUSSIAN': 'ru',
    'KOREAN': 'ko',
    'GREEK': 'el',
    'DUTCH': 'nl',
    'THAI': 'th',
    'SWEDISH': 'sv',
    'VIETNAMESE': 'vi'
  };

  return languageMap[normalized] || normalized.toLowerCase();
}

function toDeepLLanguageCode(language) {
  const normalized = normalizeLanguageCode(language);
  if (!normalized) {
    return null;
  }

  // DeepL supported languages mapping
  const deepLMapping = {
    EN: "EN",
    ES: "ES",
    FR: "FR",
    DE: "DE",
    IT: "IT",
    PT: "PT",
    NL: "NL",
    PL: "PL",
    ZH: "ZH",
    JA: "JA",
    KO: "KO",
    AR: "AR",
    HI: "HI",
    UR: "UR",
    BN: "BN",
    TR: "TR",
    ID: "ID",
    RU: "RU",
  };

  return deepLMapping[normalized] || normalized;
}


export async function detectLanguage(text) {
  const cleanText = String(text || "").trim();
  if (!cleanText) {
    return "unknown";
  }

  // Local instant detection check
  const localDetected = detectLanguageLocally(cleanText);
  if (localDetected) {
    return localDetected;
  }

  const key = cacheKey(["detect", cleanText]);
  const cached = getCachedValue(key);
  if (cached) {
    return cached;
  }

  if (env.googleApiKey && env.googleApiKey !== 'your_google_key') {
    try {
      const response = await axios.post(env.googleDetectApiUrl, null, {
        params: {
          key: env.googleApiKey,
          q: cleanText,
        },
        timeout: env.translationTimeoutMs,
      });

      const language =
        response.data?.data?.detections?.[0]?.[0]?.language?.toLowerCase() ||
        "unknown";
      setCachedValue(key, language);
      return language;
    } catch (error) {
      console.error(
        "Language detection failed.",
        error.response?.data || error.message,
      );
    }
  }

  // Free Google Translate API Fallback for Language Detection
  try {
    const response = await axios.get("https://translate.googleapis.com/translate_a/single", {
      params: {
        client: "gtx",
        sl: "auto",
        tl: "en",
        dt: "t",
        q: cleanText,
      },
      timeout: env.translationTimeoutMs || 8000,
    });
    
    // The detected language is at index 2 in the response array
    const language = (response.data && response.data[2]) ? response.data[2].toLowerCase() : "unknown";
    setCachedValue(key, language);
    return language;
  } catch (error) {
    console.error("Free Language detection failed.", error.message);
    return "unknown";
  }
}

export async function translateWithDeepL(text, sourceLang, targetLang) {
  const sourceLanguage = toDeepLLanguageCode(sourceLang);
  const targetLanguage = toDeepLLanguageCode(targetLang);
  const key = cacheKey([
    "deepl",
    text,
    sourceLanguage || "auto",
    targetLanguage || "auto",
  ]);
  const cached = getCachedValue(key);

  if (cached) {
    return cached;
  }

  const response = await axios.post(
    env.deeplApiUrl,
    new URLSearchParams({
      text,
      ...(sourceLanguage && sourceLanguage !== "UNKNOWN"
        ? { source_lang: sourceLanguage }
        : {}),
      target_lang: targetLanguage,
    }),
    {
      headers: {
        Authorization: `DeepL-Auth-Key ${env.deeplApiKey}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      timeout: env.translationTimeoutMs,
    },
  );

  const translation = response.data?.translations?.[0];
  const result = {
    originalText: text,
    translatedText: translation?.text || text,
    sourceLanguage: (
      translation?.detected_source_language ||
      sourceLanguage ||
      "unknown"
    ).toLowerCase(),
    targetLanguage: (targetLanguage || "unknown").toLowerCase(),
    provider: "DeepL",
  };

  setCachedValue(key, result);
  return result;
}

export async function translateWithGoogle(text, sourceLang, targetLang) {
  const sourceLanguage = toGoogleLanguageCode(sourceLang);
  const targetLanguage = toGoogleLanguageCode(targetLang);
  const key = cacheKey([
    "google",
    text,
    sourceLanguage || "auto",
    targetLanguage || "auto",
  ]);
  const cached = getCachedValue(key);

  if (cached) {
    return cached;
  }

  const response = await axios.post(env.googleTranslateApiUrl, null, {
    params: {
      key: env.googleApiKey,
      q: text,
      target: targetLanguage,
      format: "text",
      ...(sourceLanguage && sourceLanguage !== "unknown"
        ? { source: sourceLanguage }
        : {}),
    },
    timeout: env.translationTimeoutMs,
  });

  const translation = response.data?.data?.translations?.[0];
  const result = {
    originalText: text,
    translatedText: translation?.translatedText || text,
    sourceLanguage: (
      translation?.detectedSourceLanguage ||
      sourceLanguage ||
      "unknown"
    ).toLowerCase(),
    targetLanguage: (targetLanguage || "unknown").toLowerCase(),
    provider: "Google",
  };

  setCachedValue(key, result);
  return result;
}

export async function translateWithGoogleFree(text, sourceLang, targetLang) {
  const sourceLanguage = toGoogleLanguageCode(sourceLang) || "auto";
  const targetLanguage = toGoogleLanguageCode(targetLang) || "en";
  const key = cacheKey([
    "google_free",
    text,
    sourceLanguage,
    targetLanguage,
  ]);
  const cached = getCachedValue(key);

  if (cached) {
    return cached;
  }

  const response = await axios.get("https://translate.googleapis.com/translate_a/single", {
    params: {
      client: "gtx",
      sl: sourceLanguage,
      tl: targetLanguage,
      dt: "t",
      q: text,
    },
    timeout: env.translationTimeoutMs || 8000,
  });

  if (!response.data || !response.data[0]) {
    return null;
  }

  const translatedText = response.data[0].map(segment => segment[0]).join("");
  const detectedSource = response.data[2] || sourceLanguage;

  const result = {
    originalText: text,
    translatedText,
    sourceLanguage: detectedSource.toLowerCase(),
    targetLanguage: targetLanguage.toLowerCase(),
    provider: "Google",
  };

  setCachedValue(key, result);
  return result;
}

export async function translateWithMyMemory(text, sourceLang, targetLang) {
  const source = (sourceLang && sourceLang !== "unknown") ? sourceLang : "auto";
  const target = targetLang || "en";
  const key = cacheKey(["mymemory", text, source, target]);
  const cached = getCachedValue(key);
  if (cached) return cached;

  try {
    const sourcePart = (source && source !== 'unknown') ? source.toLowerCase() : 'auto';
    const response = await axios.get("https://api.mymemory.translated.net/get", {
      params: {
        q: text,
        langpair: `${sourcePart}|${target.toLowerCase()}`,
      },
      timeout: 8000,
    });

    if (response.data?.responseStatus !== 200) {
      console.warn("MyMemory API error:", response.data?.responseDetails);
      return null;
    }

    const translatedText = response.data?.responseData?.translatedText || text;
    const result = {
      originalText: text,
      translatedText,
      sourceLanguage: source.toLowerCase(),
      targetLanguage: target.toLowerCase(),
      provider: "Neural Relay Fallback",
    };

    setCachedValue(key, result);
    return result;
  } catch (error) {
    console.error("MyMemory translation failed:", error.message);
    return null;
  }
}

export async function translateHybrid(text, sourceLang, targetLang) {
  const cleanText = String(text || "").trim();
  const normalizedTarget = normalizeLanguageCode(targetLang);

  if (!cleanText || !normalizedTarget) {
    return buildFallbackTranslation({
      text: cleanText,
      sourceLanguage: sourceLang,
      targetLanguage: targetLang,
    });
  }

  const detectedSourceLanguage = await detectLanguage(cleanText);
  const targetCode = toGoogleLanguageCode(normalizedTarget);

  let rawResult;

  // Only skip translation if we confidently know source == target
  if (detectedSourceLanguage !== "unknown" && detectedSourceLanguage === targetCode) {
    rawResult = buildFallbackTranslation({
      text: cleanText,
      sourceLanguage: detectedSourceLanguage,
      targetLanguage: normalizedTarget,
    });
  } else {
    // Also check if user's preferred source language matches target
    const sourceCode = toGoogleLanguageCode(sourceLang);
    if (detectedSourceLanguage !== "unknown" && sourceCode === targetCode && sourceCode !== "unknown") {
      rawResult = buildFallbackTranslation({
        text: cleanText,
        sourceLanguage: sourceCode,
        targetLanguage: normalizedTarget,
      });
    } else {
      const mockResult = NEURAL_RELAY_MOCK[cleanText.toLowerCase()];
      const targetLangLower = normalizedTarget.toLowerCase();
      
      if (mockResult && mockResult[targetLangLower]) {
        rawResult = {
          originalText: cleanText,
          translatedText: mockResult[targetLangLower],
          sourceLanguage: sourceLang || "auto",
          targetLanguage: normalizedTarget,
          provider: "Neural Relay (Local)",
        };
      } else {
        let success = false;
        if (canUseDeepL) {
          try {
            rawResult = await translateWithDeepL(
              cleanText,
              detectedSourceLanguage,
              normalizedTarget,
            );
            success = true;
          } catch (error) {
            console.error(
              "DeepL translation failed. Falling back to Google.",
              error.response?.data || error.message,
            );
          }
        }

        if (!success && env.googleApiKey && env.googleApiKey !== 'your_google_key') {
          try {
            rawResult = await translateWithGoogle(
              cleanText,
              detectedSourceLanguage,
              normalizedTarget,
            );
            success = true;
          } catch (error) {
            console.error(
              "Google translation failed.",
              error.response?.data || error.message,
            );
          }
        }

        if (!success) {
          try {
            const freeGoogleResult = await translateWithGoogleFree(
              cleanText,
              detectedSourceLanguage,
              normalizedTarget,
            );
            if (freeGoogleResult) {
              rawResult = freeGoogleResult;
              success = true;
            }
          } catch (error) {
            console.error("Google Free translation failed. Falling back to MyMemory.", error.message);
          }
        }

        if (!success) {
          let myMemorySource = (detectedSourceLanguage && detectedSourceLanguage !== "unknown")
            ? toGoogleLanguageCode(detectedSourceLanguage)
            : toGoogleLanguageCode(sourceLang);

          if (!myMemorySource || myMemorySource === "unknown" || myMemorySource === "auto") {
            const hasNonAscii = /[^\x00-\x7F]/.test(cleanText);
            myMemorySource = hasNonAscii ? "ur" : "en";
          }

          const myMemoryTarget = toGoogleLanguageCode(normalizedTarget);
          
          if (myMemorySource === myMemoryTarget) {
            rawResult = buildFallbackTranslation({
              text: cleanText,
              sourceLanguage: myMemorySource,
              targetLanguage: normalizedTarget,
            });
          } else {
            const myMemoryResult = await translateWithMyMemory(
              cleanText,
              myMemorySource,
              myMemoryTarget,
            );

            if (myMemoryResult) {
              rawResult = myMemoryResult;
            } else {
              rawResult = buildFallbackTranslation({
                text: cleanText,
                sourceLanguage: detectedSourceLanguage,
                targetLanguage: normalizedTarget,
              });
            }
          }
        }
      }
    }
  }

  // Intercept and post-process with slang translation!
  if (rawResult && rawResult.translatedText) {
    rawResult.translatedText = translateSlangInText(rawResult.translatedText, targetCode || normalizedTarget);
  }

  return rawResult;
}

function buildFallbackTranslation({ text, sourceLanguage, targetLanguage }) {
  return {
    originalText: text,
    translatedText: text,
    sourceLanguage: sourceLanguage || "auto",
    targetLanguage: targetLanguage || "en",
    provider: "Neural Relay Fallback",
  };
}

export async function translateText({ text, sourceLanguage, targetLanguage }) {
  const result = await translateHybrid(text, sourceLanguage, targetLanguage);
  return result.translatedText;
}
