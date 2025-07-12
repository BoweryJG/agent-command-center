import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence, useMotionValue, useTransform } from 'framer-motion';
import { GhibliAgentCard, GhibliAgent } from './GhibliAgentCard';
import { FloatingLeaves, SpiritOrbs, SwirlingMist } from './ParticleEffects';

interface AgentCardCarouselProps {
  agents: GhibliAgent[];
  onSelectAgent?: (agent: GhibliAgent) => void;
  className?: string;
}

export const AgentCardCarousel: React.FC<AgentCardCarouselProps> = ({
  agents,
  onSelectAgent,
  className = '',
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  
  // Transform for 3D perspective
  const rotateY = useTransform(x, [-200, 0, 200], [-25, 0, 25]);
  const scale = useTransform(x, [-200, 0, 200], [0.9, 1, 0.9]);
  
  // Auto-play functionality
  useEffect(() => {
    if (!isAutoPlaying) return;
    
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % agents.length);
    }, 5000);
    
    return () => clearInterval(interval);
  }, [isAutoPlaying, agents.length]);
  
  const handleNext = () => {
    setIsAutoPlaying(false);
    setCurrentIndex((prev) => (prev + 1) % agents.length);
  };
  
  const handlePrev = () => {
    setIsAutoPlaying(false);
    setCurrentIndex((prev) => (prev - 1 + agents.length) % agents.length);
  };
  
  const handleDotClick = (index: number) => {
    setIsAutoPlaying(false);
    setCurrentIndex(index);
  };
  
  const handleCardClick = (agent: GhibliAgent) => {
    onSelectAgent?.(agent);
  };
  
  // Nature-inspired navigation buttons
  const NavigationButton: React.FC<{
    direction: 'prev' | 'next';
    onClick: () => void;
  }> = ({ direction, onClick }) => (
    <motion.button
      className={`
        absolute top-1/2 -translate-y-1/2 z-20
        ${direction === 'prev' ? 'left-4' : 'right-4'}
        w-12 h-12 rounded-full
        bg-gradient-to-br from-ghibli-moonlight/20 to-ghibli-spirit/20
        backdrop-blur-md border border-white/20
        flex items-center justify-center
        group transition-all duration-300
        hover:bg-gradient-to-br hover:from-ghibli-moonlight/40 hover:to-ghibli-spirit/40
      `}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
    >
      <motion.div
        animate={{ x: direction === 'prev' ? [-2, 2, -2] : [2, -2, 2] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        {/* Leaf-shaped arrow */}
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          className={`${direction === 'next' ? 'rotate-180' : ''}`}
        >
          <path
            d="M15 19L8 12L15 5"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-white group-hover:text-ghibli-spirit transition-colors"
          />
        </svg>
      </motion.div>
    </motion.button>
  );
  
  return (
    <div className={`relative overflow-hidden ${className}`}>
      {/* Background atmosphere */}
      <div className="absolute inset-0 bg-gradient-to-b from-neural-dark via-neural-darker to-neural-dark">
        <SwirlingMist count={2} className="opacity-30" />
        <FloatingLeaves count={3} className="opacity-20" />
        <SpiritOrbs count={2} className="opacity-40" />
      </div>
      
      {/* Carousel Container */}
      <div className="relative z-10 px-20 py-16" ref={containerRef}>
        <div className="flex items-center justify-center perspective-1000">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentIndex}
              className="relative"
              style={{
                rotateY,
                scale,
                transformStyle: 'preserve-3d',
              }}
              initial={{ opacity: 0, x: 300, rotateY: 45 }}
              animate={{ opacity: 1, x: 0, rotateY: 0 }}
              exit={{ opacity: 0, x: -300, rotateY: -45 }}
              transition={{
                type: 'spring',
                stiffness: 300,
                damping: 30,
              }}
              drag="x"
              dragConstraints={{ left: -200, right: 200 }}
              dragElastic={0.2}
              onDragEnd={(_, info) => {
                if (info.offset.x < -100) {
                  handleNext();
                } else if (info.offset.x > 100) {
                  handlePrev();
                }
              }}
            >
              {/* Shadow cards for depth effect */}
              {[-1, 1].map((offset) => {
                const shadowIndex = (currentIndex + offset + agents.length) % agents.length;
                return (
                  <motion.div
                    key={`shadow-${offset}`}
                    className="absolute top-0"
                    style={{
                      left: `${offset * 320}px`,
                      zIndex: -Math.abs(offset),
                    }}
                    initial={{ opacity: 0 }}
                    animate={{ 
                      opacity: 0.3,
                      scale: 0.9,
                      rotateY: offset * 15,
                    }}
                  >
                    <div className="pointer-events-none opacity-50 blur-sm">
                      <GhibliAgentCard agent={agents[shadowIndex]} />
                    </div>
                  </motion.div>
                );
              })}
              
              {/* Main card */}
              <GhibliAgentCard
                agent={agents[currentIndex]}
                isSelected={true}
                onClick={() => handleCardClick(agents[currentIndex])}
              />
            </motion.div>
          </AnimatePresence>
        </div>
        
        {/* Navigation */}
        <NavigationButton direction="prev" onClick={handlePrev} />
        <NavigationButton direction="next" onClick={handleNext} />
        
        {/* Dots indicator with nature theme */}
        <div className="flex justify-center items-center gap-3 mt-8">
          {agents.map((agent, index) => (
            <motion.button
              key={agent.id}
              className={`
                relative w-3 h-3 rounded-full transition-all duration-300
                ${index === currentIndex 
                  ? 'bg-ghibli-spirit w-8' 
                  : 'bg-white/30 hover:bg-white/50'}
              `}
              whileHover={{ scale: 1.2 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => handleDotClick(index)}
            >
              {index === currentIndex && (
                <motion.div
                  className="absolute inset-0 rounded-full bg-ghibli-spirit"
                  layoutId="activeDot"
                  initial={false}
                  transition={{
                    type: 'spring',
                    stiffness: 500,
                    damping: 30,
                  }}
                />
              )}
            </motion.button>
          ))}
        </div>
        
        {/* Auto-play toggle */}
        <div className="absolute top-4 right-4">
          <motion.button
            className={`
              px-4 py-2 rounded-full text-xs
              backdrop-blur-md border transition-all duration-300
              ${isAutoPlaying 
                ? 'bg-ghibli-spirit/20 border-ghibli-spirit/50 text-ghibli-spirit' 
                : 'bg-white/10 border-white/20 text-white/60'}
            `}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsAutoPlaying(!isAutoPlaying)}
          >
            {isAutoPlaying ? 'Auto-Play On' : 'Auto-Play Off'}
          </motion.button>
        </div>
      </div>
      
      {/* Agent Info Panel */}
      <AnimatePresence>
        {agents[currentIndex] && (
          <motion.div
            className="absolute bottom-0 left-0 right-0 p-8 bg-gradient-to-t from-black/80 to-transparent"
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            transition={{ type: 'spring', damping: 25 }}
          >
            <div className="max-w-2xl mx-auto text-center">
              <h2 className="text-3xl font-bold mb-2">{agents[currentIndex].name}</h2>
              <p className="text-lg opacity-80 mb-4">{agents[currentIndex].title}</p>
              <p className="text-sm opacity-70 mb-6">{agents[currentIndex].description}</p>
              
              {/* Stats overview */}
              <div className="flex justify-center gap-6">
                {Object.entries(agents[currentIndex].stats).map(([stat, value]) => (
                  <div key={stat} className="text-center">
                    <div className="text-2xl font-bold text-ghibli-spirit">{value}</div>
                    <div className="text-xs uppercase opacity-60">{stat}</div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};