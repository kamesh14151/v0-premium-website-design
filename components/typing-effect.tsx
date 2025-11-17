"use client";

import { useState, useEffect } from "react";

interface TypingEffectProps {
  text: string;
  speed?: number;
  onComplete?: () => void;
}

export function TypingEffect({
  text,
  speed = 30,
  onComplete,
}: TypingEffectProps) {
  const [displayedText, setDisplayedText] = useState("");
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    if (displayedText.length === text.length) {
      setIsComplete(true);
      onComplete?.();
      return;
    }

    const timeout = setTimeout(() => {
      setDisplayedText(text.slice(0, displayedText.length + 1));
    }, speed);

    return () => clearTimeout(timeout);
  }, [displayedText, text, speed, onComplete]);

  return (
    <span className="font-mono">
      {displayedText}
      {!isComplete && (
        <span className="animate-pulse ml-1 inline-block w-2 h-4 bg-cyan-500"></span>
      )}
    </span>
  );
}
