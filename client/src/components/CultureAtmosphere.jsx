import React, { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export function CultureAtmosphere({ theme, active }) {
  if (!active || !theme) return null;

  return (
    <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none select-none">
      {/* 
        LAYER 1: CINEMATIC MESH GRADIENT 
        This creates a deep, organic 'Aurora' effect that matches the cultural palette
      */}
      <div className="absolute inset-0 opacity-80 mix-blend-screen">
        <motion.div 
          animate={{ 
            scale: [1, 1.2, 1],
            rotate: [0, 5, 0],
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute inset-0 transition-colors duration-1000"
          style={{ 
            background: `
              radial-gradient(circle at 20% 30%, ${theme.accentColor}aa 0%, transparent 50%),
              radial-gradient(circle at 80% 20%, ${theme.accentColor}88 0%, transparent 40%),
              radial-gradient(circle at 40% 70%, ${theme.accentColor}66 0%, transparent 60%),
              radial-gradient(circle at 70% 80%, ${theme.accentColor}99 0%, transparent 50%)
            `,
            filter: 'blur(100px) saturate(1.8)',
          }}
        />
      </div>

      {/* 
        LAYER 1.5: CULTURAL SCENIC LANDMARK IMAGE 
        AI-generated watercolor hand-drawn sketch landmark of the corresponding country
      */}
      {theme.bgImage && (
        <div 
          className="absolute inset-0 transition-all duration-1000 bg-cover bg-center"
          style={{ 
            backgroundImage: `url(${theme.bgImage})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            opacity: 0.20,
            mixBlendMode: 'screen',
            filter: 'contrast(1.05) saturate(0.95)'
          }}
        />
      )}

      {/* 
        LAYER 2: ORGANIC NOISE & GRAIN 
        Removes the 'digital' look and adds premium texture
      */}
      <div className="absolute inset-0 opacity-[0.03] mix-blend-overlay pointer-events-none" 
           style={{ backgroundImage: `url('https://grainy-gradients.vercel.app/noise.svg')` }} />

      {/* 
        LAYER 3: VIGNETTE & DEPTH FOG 
        Directs focus to the chat content
      */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,transparent_0%,rgba(2,6,23,0.6)_100%)]" />
      
      {/* Cinematic Color Wash */}
      <div 
        className="absolute inset-0 mix-blend-color opacity-20 pointer-events-none"
        style={{ backgroundColor: theme.accentColor }}
      />
    </div>
  );
}
