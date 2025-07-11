import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';

interface WaveformVisualizerProps {
  isActive: boolean;
  audioStream?: MediaStream;
  color?: string;
}

const WaveformVisualizer: React.FC<WaveformVisualizerProps> = ({ 
  isActive, 
  audioStream,
  color = '#8B5CF6'
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameRef = useRef<number>();
  const audioContextRef = useRef<AudioContext>();
  const analyserRef = useRef<AnalyserNode>();
  const [bars, setBars] = useState<number[]>(Array(50).fill(20));

  useEffect(() => {
    if (isActive && audioStream) {
      initializeAudioAnalyser();
    } else {
      stopVisualization();
    }

    return () => {
      stopVisualization();
    };
  }, [isActive, audioStream]);

  const initializeAudioAnalyser = () => {
    try {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      analyserRef.current = audioContextRef.current.createAnalyser();
      analyserRef.current.fftSize = 256;

      if (audioStream) {
        const source = audioContextRef.current.createMediaStreamSource(audioStream);
        source.connect(analyserRef.current);
      } else {
        // Use microphone if no stream provided
        navigator.mediaDevices.getUserMedia({ audio: true }).then(stream => {
          const source = audioContextRef.current!.createMediaStreamSource(stream);
          source.connect(analyserRef.current!);
        });
      }

      visualize();
    } catch (error) {
      console.error('Error initializing audio:', error);
    }
  };

  const visualize = () => {
    if (!analyserRef.current) return;

    const bufferLength = analyserRef.current.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const draw = () => {
      animationFrameRef.current = requestAnimationFrame(draw);
      analyserRef.current!.getByteFrequencyData(dataArray);

      // Convert frequency data to bar heights
      const barCount = 50;
      const barData: number[] = [];
      const step = Math.floor(bufferLength / barCount);

      for (let i = 0; i < barCount; i++) {
        const index = i * step;
        const value = dataArray[index];
        const height = Math.max(20, (value / 255) * 150);
        barData.push(height);
      }

      setBars(barData);

      // Canvas visualization
      if (canvasRef.current) {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        const barWidth = (canvas.width / bufferLength) * 2.5;
        let x = 0;

        for (let i = 0; i < bufferLength; i++) {
          const barHeight = (dataArray[i] / 255) * canvas.height;
          
          const gradient = ctx.createLinearGradient(0, canvas.height - barHeight, 0, canvas.height);
          gradient.addColorStop(0, color);
          gradient.addColorStop(1, '#EC4899');
          
          ctx.fillStyle = gradient;
          ctx.fillRect(x, canvas.height - barHeight, barWidth, barHeight);
          
          x += barWidth + 1;
        }
      }
    };

    draw();
  };

  const stopVisualization = () => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    if (audioContextRef.current) {
      audioContextRef.current.close();
    }
    setBars(Array(50).fill(20));
  };

  return (
    <div className="space-y-4">
      {/* Bar Visualization */}
      <div className="h-32 flex items-center justify-center gap-1">
        {bars.map((height, i) => (
          <motion.div
            key={i}
            className="w-1 bg-gradient-to-t from-electric-purple to-electric-pink rounded-full"
            animate={{
              height: isActive ? `${height}px` : '20px',
              opacity: isActive ? 1 : 0.3,
            }}
            transition={{
              duration: 0.1,
              ease: 'easeOut',
            }}
          />
        ))}
      </div>

      {/* Canvas Visualization */}
      <div className="relative h-32 bg-neural-darker rounded-lg overflow-hidden">
        <canvas
          ref={canvasRef}
          width={800}
          height={128}
          className="w-full h-full"
          style={{ opacity: isActive ? 1 : 0.3 }}
        />
        {!isActive && (
          <div className="absolute inset-0 flex items-center justify-center">
            <p className="text-text-muted">Click to start visualization</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default WaveformVisualizer;