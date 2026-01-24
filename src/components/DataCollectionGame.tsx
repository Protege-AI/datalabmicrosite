'use client';

import { useState, useEffect, useRef, useCallback } from 'react';

interface Block {
  id: number;
  x: number;
  y: number;
  color: string;
  size: number;
  speed: number;
  points: number;
}

const COLORS = [
  { hex: '#683EF3', name: 'purple', basePoints: 50 },
  { hex: '#E5E5E5', name: 'cloud', basePoints: 10 },
  { hex: '#A5C5F2', name: 'sky', basePoints: 20 },
  { hex: '#CACEF2', name: 'powder', basePoints: 15 },
  { hex: '#5F1390', name: 'deep-purple', basePoints: 75 },
  { hex: '#4575EC', name: 'blue', basePoints: 40 },
  { hex: '#F4614A', name: 'orange', basePoints: 60 },
  { hex: '#F7CD68', name: 'yellow', basePoints: 30 },
  { hex: '#D5C09D', name: 'sand', basePoints: 25 },
];

const SIZES = [
  { size: 30, multiplier: 0.5 },
  { size: 40, multiplier: 1 },
  { size: 50, multiplier: 1.5 },
  { size: 60, multiplier: 2 },
];

export default function DataCollectionGame({ onClose }: { onClose: () => void }) {
  const [score, setScore] = useState(0);
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [basketX, setBasketX] = useState(0);
  const [gameActive, setGameActive] = useState(true);
  const gameRef = useRef<HTMLDivElement>(null);
  const animationFrameRef = useRef<number>();
  const blockIdCounter = useRef(0);
  const lastSpawnTime = useRef(Date.now());

  const BASKET_WIDTH = 200;
  const BASKET_HEIGHT = 80;

  // Handle mouse movement
  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (gameRef.current) {
      const rect = gameRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left - BASKET_WIDTH / 2;
      const maxX = rect.width - BASKET_WIDTH;
      setBasketX(Math.max(0, Math.min(x, maxX)));
    }
  }, []);

  // Spawn new blocks
  const spawnBlock = useCallback(() => {
    if (!gameRef.current) return;

    const now = Date.now();
    if (now - lastSpawnTime.current < 800) return; // Spawn every 800ms

    lastSpawnTime.current = now;

    const rect = gameRef.current.getBoundingClientRect();
    const colorData = COLORS[Math.floor(Math.random() * COLORS.length)];
    const sizeData = SIZES[Math.floor(Math.random() * SIZES.length)];

    const newBlock: Block = {
      id: blockIdCounter.current++,
      x: Math.random() * (rect.width - sizeData.size),
      y: -sizeData.size,
      color: colorData.hex,
      size: sizeData.size,
      speed: 1 + Math.random() * 2, // Random speed between 1-3
      points: Math.round(colorData.basePoints * sizeData.multiplier),
    };

    setBlocks((prev) => [...prev, newBlock]);
  }, []);

  // Game loop
  const gameLoop = useCallback(() => {
    if (!gameActive || !gameRef.current) return;

    const rect = gameRef.current.getBoundingClientRect();
    const basketY = rect.height - BASKET_HEIGHT - 20;

    setBlocks((prevBlocks) => {
      const updatedBlocks = prevBlocks
        .map((block) => ({
          ...block,
          y: block.y + block.speed,
        }))
        .filter((block) => {
          // Check collision with basket
          const blockCenterX = block.x + block.size / 2;
          const blockBottom = block.y + block.size;

          const basketLeft = basketX;
          const basketRight = basketX + BASKET_WIDTH;
          const basketTop = basketY;

          // Check if block is caught
          if (
            blockBottom >= basketTop &&
            blockBottom <= basketTop + 30 &&
            blockCenterX >= basketLeft &&
            blockCenterX <= basketRight
          ) {
            setScore((prev) => prev + block.points);
            return false; // Remove caught block
          }

          // Remove blocks that fell off screen
          return block.y < rect.height;
        });

      return updatedBlocks;
    });

    spawnBlock();
    animationFrameRef.current = requestAnimationFrame(gameLoop);
  }, [gameActive, basketX, spawnBlock]);

  // Start game loop
  useEffect(() => {
    if (gameActive) {
      animationFrameRef.current = requestAnimationFrame(gameLoop);
    }

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [gameActive, gameLoop]);

  // Add mouse move listener
  useEffect(() => {
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [handleMouseMove]);

  const handleClose = () => {
    setGameActive(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Dark overlay with transparency */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

      {/* Game container */}
      <div
        ref={gameRef}
        className="relative w-full h-full"
        style={{ cursor: 'none' }}
      >
        {/* Close button */}
        <button
          onClick={handleClose}
          className="absolute top-6 left-6 z-10 w-10 h-10 flex items-center justify-center border border-white/40 bg-black/40 text-white hover:bg-white/20 transition-colors font-mono text-xl"
          aria-label="Close game"
        >
          ×
        </button>

        {/* Score display */}
        <div className="absolute top-6 right-6 z-10 bg-black/60 border border-white/40 px-6 py-3">
          <div className="font-mono text-xs uppercase tracking-wide text-white/60">
            Score
          </div>
          <div className="font-mono text-2xl text-white">{score}</div>
        </div>

        {/* Game title */}
        <div className="absolute top-6 left-1/2 -translate-x-1/2 z-10 bg-black/60 border border-white/40 px-6 py-3">
          <div className="font-mono text-sm uppercase tracking-wide text-white">
            Collect Data
          </div>
        </div>

        {/* Falling blocks */}
        {blocks.map((block) => (
          <div
            key={block.id}
            className="absolute rounded transition-none"
            style={{
              left: `${block.x}px`,
              top: `${block.y}px`,
              width: `${block.size}px`,
              height: `${block.size}px`,
              backgroundColor: block.color,
              boxShadow: '0 4px 6px rgba(0, 0, 0, 0.3)',
            }}
          />
        ))}

        {/* U-shaped basket */}
        <div
          className="absolute transition-none"
          style={{
            left: `${basketX}px`,
            bottom: '20px',
            width: `${BASKET_WIDTH}px`,
            height: `${BASKET_HEIGHT}px`,
          }}
        >
          {/* Left side */}
          <div
            className="absolute left-0 bottom-0 bg-white/90 border-2 border-white"
            style={{
              width: '20px',
              height: '100%',
            }}
          />
          {/* Bottom */}
          <div
            className="absolute left-0 bottom-0 bg-white/90 border-2 border-white"
            style={{
              width: '100%',
              height: '20px',
            }}
          />
          {/* Right side */}
          <div
            className="absolute right-0 bottom-0 bg-white/90 border-2 border-white"
            style={{
              width: '20px',
              height: '100%',
            }}
          />
        </div>
      </div>
    </div>
  );
}
