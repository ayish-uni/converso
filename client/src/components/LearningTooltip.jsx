import React, { useState, useEffect, useRef } from "react";

/**
 * LearningTooltip Component
 * Displays on word hover in Modern mode with:
 * - Original word
 * - Phonetic pronunciation
 * - Cultural tip
 * Features soft purple border and elegant fade-in animation
 */
export function LearningTooltip({
  word,
  language,
  isVisible,
  position,
  onClose,
}) {
  const [tooltipData, setTooltipData] = useState(null);
  const [loading, setLoading] = useState(false);
  const tooltipRef = useRef(null);

  // Mock cultural tips data - in real app, fetch from backend
  const culturalTipsMap = {
    "formal-greeting": "This is a formal greeting used in business contexts",
    casual: "This is casual/informal language for friends",
    respectful: "This expression shows respect and formality",
    slang: "This is colloquial slang - use with caution",
    idiom: "This is an idiomatic expression with cultural significance",
  };

  // Mock phonetic data - in real app, fetch from API
  const mockPhoneticData = {
    hola: { phonetic: "OH-lah", tip: culturalTipsMap["formal-greeting"] },
    gracias: { phonetic: "GRAH-see-ahs", tip: culturalTipsMap["respectful"] },
    konnichiwa: {
      phonetic: "koh-nee-chee-WAH",
      tip: culturalTipsMap["formal-greeting"],
    },
    bonjour: { phonetic: "bon-ZHUR", tip: culturalTipsMap["formal-greeting"] },
    hello: { phonetic: "huh-LOH", tip: culturalTipsMap["casual"] },
    goodbye: { phonetic: "good-BY", tip: culturalTipsMap["casual"] },
  };

  useEffect(() => {
    if (!isVisible || !word) {
      setTooltipData(null);
      return;
    }

    setLoading(true);
    // Simulate API call with mock data
    setTimeout(() => {
      const mockData = mockPhoneticData[word.toLowerCase()];
      if (mockData) {
        setTooltipData({
          word,
          pronunciation: mockData.phonetic,
          culturalTip: mockData.tip,
        });
      } else {
        // Fallback for unknown words
        setTooltipData({
          word,
          pronunciation: "[pronunciation not available]",
          culturalTip: "Learn more about this word and its cultural context.",
        });
      }
      setLoading(false);
    }, 200);
  }, [isVisible, word]);

  if (!isVisible || !tooltipData) {
    return null;
  }

  return (
    <div
      ref={tooltipRef}
      style={{
        position: "fixed",
        left: `${position?.x || 0}px`,
        top: `${position?.y || 0}px`,
        zIndex: 10000,
        pointerEvents: "none",
      }}
    >
      <div
        style={{
          background: "rgba(139, 92, 246, 0.95)",
          backdropFilter: "blur(8px)",
          border: "2px solid rgba(168, 85, 247, 0.6)",
          borderRadius: "8px",
          padding: "10px 12px",
          minWidth: "200px",
          maxWidth: "280px",
          boxShadow:
            "0 8px 24px rgba(0, 0, 0, 0.3), 0 0 16px rgba(168, 85, 247, 0.3)",
          animation: "fadeIn 0.2s ease-in-out",
        }}
      >
        {loading ? (
          <div
            style={{ color: "white", fontSize: "12px", textAlign: "center" }}
          >
            Loading...
          </div>
        ) : (
          <>
            {/* Original Word */}
            <div style={{ marginBottom: "6px" }}>
              <div
                style={{ fontSize: "12px", opacity: 0.7, fontWeight: "500" }}
              >
                Word
              </div>
              <div
                style={{ fontSize: "14px", fontWeight: "600", color: "white" }}
              >
                {tooltipData.word}
              </div>
            </div>

            {/* Pronunciation */}
            <div
              style={{
                marginBottom: "8px",
                paddingBottom: "8px",
                borderBottom: "1px solid rgba(255, 255, 255, 0.2)",
              }}
            >
              <div
                style={{ fontSize: "12px", opacity: 0.7, fontWeight: "500" }}
              >
                Pronunciation
              </div>
              <div
                style={{
                  fontSize: "13px",
                  color: "rgba(255, 255, 255, 0.9)",
                  fontFamily: "monospace",
                }}
              >
                {tooltipData.pronunciation}
              </div>
            </div>

            {/* Cultural Tip */}
            <div>
              <div
                style={{ fontSize: "12px", opacity: 0.7, fontWeight: "500" }}
              >
                Cultural Context
              </div>
              <div
                style={{
                  fontSize: "12px",
                  color: "rgba(255, 255, 255, 0.85)",
                  lineHeight: "1.4",
                }}
              >
                {tooltipData.culturalTip}
              </div>
            </div>
          </>
        )}
      </div>

      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(-4px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}
