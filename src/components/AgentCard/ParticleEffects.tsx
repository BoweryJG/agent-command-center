import React, { useMemo } from 'react';
import { motion } from 'framer-motion';

interface ParticleProps {
  count?: number;
  className?: string;
}

// Floating Leaves Component
export const FloatingLeaves: React.FC<ParticleProps> = ({ count = 5, className = '' }) => {
  const leaves = useMemo(() => Array.from({ length: count }), [count]);
  
  return (
    <div className={`absolute inset-0 overflow-hidden pointer-events-none ${className}`}>
      {leaves.map((_, index) => (
        <motion.div
          key={index}
          className="absolute"
          initial={{
            x: Math.random() * 100 - 50,
            y: -20,
            rotate: 0,
            scale: 0.8 + Math.random() * 0.4,
          }}
          animate={{
            x: [
              Math.random() * 100 - 50,
              Math.random() * 200 - 100,
              Math.random() * 100 - 50,
            ],
            y: [0, 150, 300, 450],
            rotate: [0, 120, 240, 360],
          }}
          transition={{
            duration: 15 + Math.random() * 10,
            repeat: Infinity,
            delay: index * 2,
            ease: "linear",
          }}
          style={{
            left: `${Math.random() * 100}%`,
          }}
        >
          <div 
            className="w-6 h-6 relative"
            style={{
              filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))',
            }}
          >
            {/* Ghibli-style leaf shape */}
            <svg viewBox="0 0 24 24" className="w-full h-full">
              <path
                d="M12 2C6 2 2 6 2 12s4 10 10 10c2 0 4-1 5-2 1-2 2-4 2-6 0-4-3-8-7-12z"
                fill="currentColor"
                className="text-ghibli-forest opacity-80"
              />
              <path
                d="M12 8c0 0 -2 4 -2 6s1 3 2 3s2-1 2-3s-2-6-2-6z"
                fill="currentColor"
                className="text-ghibli-moss opacity-60"
              />
            </svg>
          </div>
        </motion.div>
      ))}
    </div>
  );
};

// Swirling Mist Component
export const SwirlingMist: React.FC<ParticleProps> = ({ count = 3, className = '' }) => {
  const mists = useMemo(() => Array.from({ length: count }), [count]);
  
  return (
    <div className={`absolute inset-0 overflow-hidden pointer-events-none ${className}`}>
      {mists.map((_, index) => (
        <motion.div
          key={index}
          className="absolute"
          initial={{
            x: -100,
            y: Math.random() * 200,
            scale: 1.5,
            opacity: 0,
          }}
          animate={{
            x: ['-10%', '110%'],
            y: [
              Math.random() * 200,
              Math.random() * 200 - 50,
              Math.random() * 200 + 50,
              Math.random() * 200,
            ],
            opacity: [0, 0.3, 0.5, 0.3, 0],
          }}
          transition={{
            duration: 20 + index * 5,
            repeat: Infinity,
            delay: index * 7,
            ease: "linear",
          }}
        >
          <div 
            className="w-96 h-32 bg-gradient-to-r from-transparent via-ghibli-wind to-transparent rounded-full blur-2xl"
            style={{
              background: `radial-gradient(ellipse at center, rgba(224, 229, 229, 0.2), transparent)`,
            }}
          />
        </motion.div>
      ))}
    </div>
  );
};

// Dancing Embers Component
export const DancingEmbers: React.FC<ParticleProps> = ({ count = 8, className = '' }) => {
  const embers = useMemo(() => Array.from({ length: count }), [count]);
  
  return (
    <div className={`absolute inset-0 overflow-hidden pointer-events-none ${className}`}>
      {embers.map((_, index) => (
        <motion.div
          key={index}
          className="absolute bottom-0"
          initial={{
            x: 0,
            y: 0,
            scale: 0,
            opacity: 0,
          }}
          animate={{
            x: [0, Math.random() * 60 - 30, Math.random() * 40 - 20, 0],
            y: [0, -100, -200, -300],
            scale: [0, 1, 0.8, 0],
            opacity: [0, 1, 0.8, 0],
          }}
          transition={{
            duration: 4 + Math.random() * 2,
            repeat: Infinity,
            delay: index * 0.5,
            ease: "easeOut",
          }}
          style={{
            left: `${20 + Math.random() * 60}%`,
          }}
        >
          <div 
            className="w-2 h-2 rounded-full"
            style={{
              background: `radial-gradient(circle, #FF6347, #FF4500)`,
              boxShadow: '0 0 6px #FF6347, 0 0 12px #FF4500',
            }}
          />
        </motion.div>
      ))}
    </div>
  );
};

// Sea Foam Bubbles Component
export const SeaFoamBubbles: React.FC<ParticleProps> = ({ count = 10, className = '' }) => {
  const bubbles = useMemo(() => Array.from({ length: count }), [count]);
  
  return (
    <div className={`absolute inset-0 overflow-hidden pointer-events-none ${className}`}>
      {bubbles.map((_, index) => {
        const size = 4 + Math.random() * 12;
        const duration = 8 + Math.random() * 4;
        
        return (
          <motion.div
            key={index}
            className="absolute"
            initial={{
              x: Math.random() * 300 - 150,
              y: '110%',
              scale: 0,
            }}
            animate={{
              x: [
                Math.random() * 300 - 150,
                Math.random() * 300 - 150,
                Math.random() * 300 - 150,
              ],
              y: ['110%', '50%', '-10%'],
              scale: [0, 1, 1, 0.8, 0],
            }}
            transition={{
              duration,
              repeat: Infinity,
              delay: index * 0.8,
              ease: [0.4, 0.0, 0.2, 1],
            }}
            style={{
              left: `${Math.random() * 100}%`,
            }}
          >
            <div 
              className="rounded-full border border-ghibli-water/30 bg-ghibli-water/10"
              style={{
                width: `${size}px`,
                height: `${size}px`,
                boxShadow: `inset 0 0 ${size/2}px rgba(70, 130, 180, 0.2)`,
              }}
            >
              <div 
                className="absolute top-1 left-1 w-1/3 h-1/3 bg-white/40 rounded-full"
                style={{
                  filter: 'blur(1px)',
                }}
              />
            </div>
          </motion.div>
        );
      })}
    </div>
  );
};

// Spirit Orbs Component
export const SpiritOrbs: React.FC<ParticleProps> = ({ count = 4, className = '' }) => {
  const orbs = useMemo(() => Array.from({ length: count }), [count]);
  
  return (
    <div className={`absolute inset-0 overflow-hidden pointer-events-none ${className}`}>
      {orbs.map((_, index) => (
        <motion.div
          key={index}
          className="absolute"
          initial={{
            x: Math.random() * 200 - 100,
            y: Math.random() * 200 - 100,
            scale: 0.5,
            opacity: 0,
          }}
          animate={{
            x: [
              Math.random() * 200 - 100,
              Math.random() * 300 - 150,
              Math.random() * 200 - 100,
            ],
            y: [
              Math.random() * 200 - 100,
              Math.random() * 300 - 150,
              Math.random() * 200 - 100,
            ],
            scale: [0.5, 1.2, 0.8, 0.5],
            opacity: [0, 0.8, 0.6, 0],
          }}
          transition={{
            duration: 10 + index * 2,
            repeat: Infinity,
            delay: index * 2.5,
            ease: "easeInOut",
          }}
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
          }}
        >
          <div 
            className="w-8 h-8 rounded-full"
            style={{
              background: `radial-gradient(circle, ${
                ['#DDA0DD', '#87CEEB', '#98FB98', '#FFB6C1'][index % 4]
              } 0%, transparent 70%)`,
              boxShadow: `0 0 20px ${
                ['#DDA0DD', '#87CEEB', '#98FB98', '#FFB6C1'][index % 4]
              }`,
              filter: 'blur(2px)',
            }}
          />
        </motion.div>
      ))}
    </div>
  );
};

// Wind Lines Component
export const WindLines: React.FC<ParticleProps> = ({ count = 6, className = '' }) => {
  const lines = useMemo(() => Array.from({ length: count }), [count]);
  
  return (
    <div className={`absolute inset-0 overflow-hidden pointer-events-none ${className}`}>
      {lines.map((_, index) => (
        <motion.div
          key={index}
          className="absolute"
          initial={{
            x: '-100%',
            y: Math.random() * 100,
            scaleX: 0,
          }}
          animate={{
            x: ['0%', '200%'],
            scaleX: [0, 1, 1, 0],
          }}
          transition={{
            duration: 2 + Math.random(),
            repeat: Infinity,
            delay: index * 0.8,
            ease: "easeInOut",
          }}
          style={{
            top: `${Math.random() * 100}%`,
          }}
        >
          <div 
            className="h-[1px] w-32 bg-gradient-to-r from-transparent via-ghibli-wind/30 to-transparent"
          />
        </motion.div>
      ))}
    </div>
  );
};

// Helper function to get particles by nature element
export const getParticlesByElement = (element: string) => {
  switch (element.toLowerCase()) {
    case 'forest':
    case 'earth':
      return FloatingLeaves;
    case 'fire':
      return DancingEmbers;
    case 'water':
      return SeaFoamBubbles;
    case 'wind':
    case 'air':
      return SwirlingMist;
    case 'spirit':
    case 'magic':
      return SpiritOrbs;
    default:
      return FloatingLeaves;
  }
};