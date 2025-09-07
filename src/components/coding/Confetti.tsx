"use client";

import React, { useEffect, useState } from 'react';
import './confetti.css';

export const Confetti = () => {
  const [pieces, setPieces] = useState<JSX.Element[]>([]);

  useEffect(() => {
    const newPieces = Array.from({ length: 150 }).map((_, i) => {
      const style = {
        left: `${Math.random() * 100}%`,
        animationDelay: `${Math.random() * 5}s`,
        backgroundColor: `hsl(${Math.random() * 360}, 70%, 50%)`,
      };
      return <div key={i} className="confetti-piece" style={style} />;
    });
    setPieces(newPieces);
  }, []);

  return <div className="confetti-container">{pieces}</div>;
};

// Create a corresponding CSS file for animations
// Since we can't create a new file, here is the CSS content
// to be placed in a new file named `src/components/coding/confetti.css`
// Or injected into a style tag. For this case we create a new css file.
