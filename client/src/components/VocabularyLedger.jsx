import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export function VocabularyLedger({ messages, userLanguage }) {
  const [learnedWords, setLearnedWords] = useState([]);
  const [phonetics, setPhonetics] = useState({});
  const [audioUrls, setAudioUrls] = useState({});

  useEffect(() => {
    const wordMap = new Map();

    messages.forEach((msg) => {
      // Skip deleted or system messages
      if (msg.isDeleted || !msg.originalText) return;

      const words = msg.originalText
        .split(/\s+/)
        .map(w => w.replace(/[?!.,]/g, ""))
        .filter((w) => w.length > 3);

      const translation = msg.receiverTranslatedText || msg.translatedText;
      
      // Only process if translation is different from original
      if (translation && translation.toLowerCase() !== msg.originalText.toLowerCase()) {
        words.slice(0, 2).forEach((word) => {
          if (!wordMap.has(word.toLowerCase())) {
            wordMap.set(word.toLowerCase(), {
              word: word,
              translation: translation, // Show full translation as context or first word
              senderLanguage: msg.senderLanguage,
              receiverLanguage: msg.receiverLanguage,
              accuracy: msg.translationAccuracy,
              timestamp: new Date(msg.createdAt),
            });
          }
        });
      }
    });

    const sortedWords = Array.from(wordMap.values())
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, 12);

    setLearnedWords(sortedWords);
  }, [messages]);

  // Fetch Phonetics and Audio URLs from Free Dictionary API (for English)
  useEffect(() => {
    learnedWords.forEach(async (item) => {
      // Fetch phonetic for original word if English
      const wordLower = item.word.toLowerCase();
      if (item.senderLanguage?.toLowerCase() === 'en' && !phonetics[wordLower]) {
        try {
          const res = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(item.word)}`);
          if (res.ok) {
            const data = await res.json();
            const phonetic = data[0]?.phonetic || data[0]?.phonetics?.find(p => p.text)?.text || '';
            const audio = data[0]?.phonetics?.find(p => p.audio && p.audio.trim() !== '')?.audio || '';
            
            if (phonetic) {
              setPhonetics(prev => ({ ...prev, [wordLower]: phonetic }));
            }
            if (audio) {
              setAudioUrls(prev => ({ ...prev, [wordLower]: audio }));
            }
          }
        } catch (e) {
          console.error("Error fetching pronunciation phonetic:", e);
        }
      }

      // Fetch phonetic for translation if English and short phrase
      const translationClean = item.translation.replace(/[?!.,]/g, "").trim();
      const translationLower = translationClean.toLowerCase();
      if (item.receiverLanguage?.toLowerCase() === 'en' && translationClean.split(/\s+/).length <= 2 && !phonetics[translationLower]) {
        try {
          const res = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(translationClean)}`);
          if (res.ok) {
            const data = await res.json();
            const phonetic = data[0]?.phonetic || data[0]?.phonetics?.find(p => p.text)?.text || '';
            const audio = data[0]?.phonetics?.find(p => p.audio && p.audio.trim() !== '')?.audio || '';
            
            if (phonetic) {
              setPhonetics(prev => ({ ...prev, [translationLower]: phonetic }));
            }
            if (audio) {
              setAudioUrls(prev => ({ ...prev, [translationLower]: audio }));
            }
          }
        } catch (e) {
          console.error("Error fetching translation phonetic:", e);
        }
      }
    });
  }, [learnedWords]);

  const handlePronounce = (e, text, langCode) => {
    e?.preventDefault();
    e?.stopPropagation();

    const textClean = text.replace(/[?!.,]/g, "").trim();
    const textLower = textClean.toLowerCase();
    const audioUrl = audioUrls[textLower];

    if (audioUrl) {
      const audio = new Audio(audioUrl);
      audio.play().catch(err => {
        console.warn("Audio element play failed, falling back to SpeechSynthesis", err);
        speakFallback(textClean, langCode);
      });
    } else {
      speakFallback(textClean, langCode);
    }
  };

  const speakFallback = (word, langCode) => {
    if (!window.speechSynthesis) return;
    
    // Cancel any ongoing speech
    window.speechSynthesis.cancel();
    
    const utterance = new SpeechSynthesisUtterance(word);
    
    // Normalize language code to BCP 47
    let voiceLang = langCode || 'en';
    if (voiceLang.toLowerCase() === 'en') voiceLang = 'en-US';
    else if (voiceLang.toLowerCase() === 'tr') voiceLang = 'tr-TR';
    else if (voiceLang.toLowerCase() === 'es') voiceLang = 'es-ES';
    else if (voiceLang.toLowerCase() === 'fr') voiceLang = 'fr-FR';
    else if (voiceLang.toLowerCase() === 'de') voiceLang = 'de-DE';
    
    utterance.lang = voiceLang;
    
    window.speechSynthesis.speak(utterance);
  };

  const containerVariants = {
    initial: { opacity: 0, x: -20 },
    animate: { opacity: 1, x: 0 },
  };

  const itemVariants = {
    initial: { opacity: 0, y: 10, scale: 0.8 },
    animate: { opacity: 1, y: 0, scale: 1 },
    exit: { opacity: 0, y: -10, scale: 0.8 },
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="initial"
      animate="animate"
      className="h-full overflow-y-auto pr-3 custom-scrollbar"
    >
      <div className="space-y-3">
        <div className="sticky top-0 bg-white/5 backdrop-blur p-3 rounded-lg border border-white/10">
          <h3 className="text-xs font-semibold text-white uppercase tracking-widest">
            📚 Vocabulary Ledger
          </h3>
          <p className="text-xs text-white/50 mt-1">
            {learnedWords.length} words learned
          </p>
        </div>

        <div className="space-y-2">
          <AnimatePresence>
            {learnedWords.map((item, idx) => (
              <motion.div
                key={`${item.word}-${item.senderLanguage}`}
                variants={itemVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                transition={{ delay: idx * 0.05 }}
                className="group"
              >
                <div
                  className={`p-3 rounded-lg border backdrop-blur transition-all cursor-pointer hover:scale-105 ${
                    item.accuracy === 'high'
                      ? 'bg-green-500/10 border-green-500/30 hover:border-green-500/50'
                      : item.accuracy === 'medium'
                        ? 'bg-yellow-500/10 border-yellow-500/30 hover:border-yellow-500/50'
                        : 'bg-red-500/10 border-red-500/30 hover:border-red-500/50'
                  }`}
                  onClick={(e) => handlePronounce(e, item.word, item.senderLanguage)}
                  title="Click to play original pronunciation"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      {/* Original Word */}
                      <div className="flex flex-wrap items-center gap-1.5">
                        <div className="font-semibold text-white text-sm truncate">
                          {item.word}
                        </div>
                        {phonetics[item.word.toLowerCase()] && (
                          <span className="text-[10px] text-converso-gold/80 font-mono italic">
                            {phonetics[item.word.toLowerCase()]}
                          </span>
                        )}
                      </div>
                      
                      {/* Translation Word/Phrase */}
                      <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
                        <span className="text-xs text-white/60 italic line-clamp-1">
                          {item.translation}
                        </span>
                        {phonetics[item.translation.toLowerCase()] && (
                          <span className="text-[9px] text-converso-gold/60 font-mono italic">
                            {phonetics[item.translation.toLowerCase()]}
                          </span>
                        )}
                        <motion.button
                          whileHover={{ scale: 1.2 }}
                          whileTap={{ scale: 0.85 }}
                          onClick={(e) => handlePronounce(e, item.translation, item.receiverLanguage)}
                          className="text-xs hover:scale-115 transition-transform"
                          title="Pronounce translation"
                        >
                          🗣️
                        </motion.button>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <motion.button
                        whileHover={{ scale: 1.15 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={(e) => handlePronounce(e, item.word, item.senderLanguage)}
                        className="w-6 h-6 rounded bg-white/10 flex items-center justify-center text-xs text-white/70 hover:bg-white/20 hover:text-white transition-colors"
                        title="Pronounce original word"
                      >
                        🔊
                      </motion.button>

                      {/* Badge for accuracy */}
                      <motion.div
                        whileHover={{ scale: 1.2 }}
                        className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                          item.accuracy === 'high'
                            ? 'bg-green-500/30 text-green-300'
                            : item.accuracy === 'medium'
                              ? 'bg-yellow-500/30 text-yellow-300'
                              : 'bg-red-500/30 text-red-300'
                        }`}
                      >
                        {item.accuracy === 'high'
                          ? '✓'
                          : item.accuracy === 'medium'
                            ? '~'
                            : '?'}
                      </motion.div>
                    </div>
                  </div>

                  {/* Language indicators */}
                  <div className="text-[10px] text-white/40 mt-2 flex items-center gap-2">
                    <span>📍 {item.senderLanguage?.toUpperCase()}</span>
                    <span>➔</span>
                    <span>🎯 {item.receiverLanguage?.toUpperCase()}</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {learnedWords.length === 0 && (
            <motion.div
              variants={itemVariants}
              initial="initial"
              animate="animate"
              className="text-center py-8 text-white/40 text-sm"
            >
              <div className="text-3xl mb-2">📖</div>
              <p>Start a conversation to learn new words</p>
            </motion.div>
          )}
        </div>
      </div>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.2);
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.4);
        }
      `}</style>
    </motion.div>
  );
}
