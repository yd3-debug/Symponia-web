'use client';

import React from 'react';
import { motion } from 'framer-motion';

type GradientDotsProps = React.ComponentProps<typeof motion.div> & {
  dotSize?: number;
  spacing?: number;
  duration?: number;
  backgroundColor?: string;
};

export function GradientDots({
  dotSize = 6,
  spacing = 14,
  duration = 40,
  backgroundColor = 'var(--background)',
  className,
  ...props
}: GradientDotsProps) {
  const hexSpacing = spacing * 1.732;

  return (
    <motion.div
      className={`absolute inset-0 ${className ?? ''}`}
      style={{
        backgroundColor,
        backgroundImage: `
          radial-gradient(circle at 50% 50%, transparent 1.5px, ${backgroundColor} 0 ${dotSize}px, transparent ${dotSize}px),
          radial-gradient(circle at 50% 50%, transparent 1.5px, ${backgroundColor} 0 ${dotSize}px, transparent ${dotSize}px),
          radial-gradient(ellipse at 20% 30%, rgba(92,232,208,0.55), transparent 55%),
          radial-gradient(ellipse at 80% 70%, rgba(167,139,250,0.45), transparent 55%),
          radial-gradient(ellipse at 60% 20%, rgba(92,232,208,0.3), transparent 50%),
          radial-gradient(ellipse at 30% 80%, rgba(100,120,255,0.35), transparent 50%)
        `,
        backgroundSize: `
          ${spacing}px ${hexSpacing}px,
          ${spacing}px ${hexSpacing}px,
          200% 200%,
          200% 200%,
          180% 180%,
          180% 180%
        `,
        backgroundPosition: `
          0px 0px,
          ${spacing / 2}px ${hexSpacing / 2}px,
          0% 0%,
          100% 100%,
          60% 0%,
          30% 100%
        `,
      }}
      animate={{
        backgroundPosition: [
          `0px 0px, ${spacing / 2}px ${hexSpacing / 2}px, 0% 0%, 100% 100%, 60% 0%, 30% 100%`,
          `0px 0px, ${spacing / 2}px ${hexSpacing / 2}px, 30% 20%, 70% 80%, 40% 30%, 60% 70%`,
          `0px 0px, ${spacing / 2}px ${hexSpacing / 2}px, 0% 0%, 100% 100%, 60% 0%, 30% 100%`,
        ],
      }}
      transition={{
        backgroundPosition: {
          duration,
          ease: 'easeInOut',
          repeat: Infinity,
        },
      }}
      {...props}
    />
  );
}
