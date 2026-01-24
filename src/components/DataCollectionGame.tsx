'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Image from 'next/image';

interface Block {
  id: number;
  x: number;
  y: number;
  color: string;
  size: number;
  speed: number;
  points: number;
  velocityX?: number;
  velocityY?: number;
  isLogo?: boolean;
}

interface LeaderboardEntry {
  name: string;
  score: number;
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

const GAME_DURATION = 30; // 30 seconds
const LOGO_SPAWN_MIN_INTERVAL = 5000; // 5 seconds minimum between logo spawns
const LOGO_SPAWN_MAX_INTERVAL = 10000; // 10 seconds maximum between logo spawns

export default function DataCollectionGame({ onClose }: { onClose: () => void }) {
  const [score, setScore] = useState(0);
  const [totalDataCollected, setTotalDataCollected] = useState(0);
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [basketX, setBasketX] = useState(0);
  const [basketVelocity, setBasketVelocity] = useState(0);
  const [gameActive, setGameActive] = useState(false);
  const [countdown, setCountdown] = useState(3);
  const [timeLeft, setTimeLeft] = useState(GAME_DURATION);
  const [gameState, setGameState] = useState<'intro' | 'countdown' | 'playing' | 'ended'>('intro');
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [playerName, setPlayerName] = useState('');
  const [showNameInput, setShowNameInput] = useState(false);
  const [showPlayAgain, setShowPlayAgain] = useState(false);
  const [logoSpawned, setLogoSpawned] = useState(false);
  const [playAgainSelection, setPlayAgainSelection] = useState<'yes' | 'no'>('yes');
  
  const gameRef = useRef<HTMLDivElement>(null);
  const animationFrameRef = useRef<number | undefined>(undefined);
  const blockIdCounter = useRef(0);
  const lastSpawnTime = useRef(Date.now());
  const lastLogoSpawnTime = useRef<number>(0); // Start at 0 to allow first spawn
  const gameStartTime = useRef<number>(0);
  const keysPressed = useRef<Set<string>>(new Set());

  const BASKET_WIDTH = 134; // 33% less than 200
  const BASKET_HEIGHT = 40; // Half of 80
  const BASKET_SIDE_WIDTH = 10; // 50% less than 20

  // Load leaderboard and total data from localStorage
  useEffect(() => {
    // Load leaderboard (persists across all games)
    const saved = localStorage.getItem('dataGameLeaderboard');
    if (saved) {
      setLeaderboard(JSON.parse(saved));
    }
    
    // Load total data collected (cumulative across all games)
    const savedTotal = localStorage.getItem('totalDataCollected');
    if (savedTotal) {
      setTotalDataCollected(parseInt(savedTotal, 10));
    }
    
    // To reset leaderboard and total data, uncomment the following lines:
    // localStorage.removeItem('dataGameLeaderboard');
    // localStorage.removeItem('totalDataCollected');
    // setLeaderboard([]);
    // setTotalDataCollected(0);
  }, []);

  // Format number with commas
  const formatNumber = (num: number): string => {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  };

  // Calculate percentage of global data volume
  const calculateGlobalPercentage = (totalGB: number): string => {
    const GLOBAL_DATA_ZETTABYTES = 175;
    const GIGABYTES_PER_ZETTABYTE = 1e12; // 1 trillion GB = 1 ZB (1 ZB = 1e9 TB, 1 TB = 1000 GB)
    const globalDataInGB = GLOBAL_DATA_ZETTABYTES * GIGABYTES_PER_ZETTABYTE;
    const percentage = (totalGB / globalDataInGB) * 100;
    
    if (percentage === 0) return '0';
    
    // Round to 2 significant figures
    const rounded = parseFloat(percentage.toPrecision(2));
    
    // Convert to string with enough precision and remove trailing zeros
    let result = rounded.toFixed(20);
    
    // Remove trailing zeros after decimal point
    result = result.replace(/(\.\d*?[1-9])0+$/, '$1');
    
    // Remove decimal point if no decimals remain
    result = result.replace(/\.$/, '');
    
    return result;
  };

  // Save leaderboard to localStorage
  const saveLeaderboard = (newLeaderboard: LeaderboardEntry[]) => {
    localStorage.setItem('dataGameLeaderboard', JSON.stringify(newLeaderboard));
    setLeaderboard(newLeaderboard);
  };

  // Get high score
  const highScore = leaderboard.length > 0 ? leaderboard[0] : null;

  // Handle intro screen
  useEffect(() => {
    if (gameState === 'intro') {
      const timer = setTimeout(() => {
        setGameState('countdown');
      }, 2500); // Show intro for 2.5 seconds
      return () => clearTimeout(timer);
    }
  }, [gameState]);

  // Countdown timer before game starts
  useEffect(() => {
    if (gameState === 'countdown' && countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown(countdown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (gameState === 'countdown' && countdown === 0) {
      setGameState('playing');
      setGameActive(true);
      gameStartTime.current = Date.now();
      lastLogoSpawnTime.current = Date.now(); // Reset logo spawn timer when game starts
    }
  }, [countdown, gameState]);

  // Game timer
  useEffect(() => {
    if (gameState === 'playing' && timeLeft > 0) {
      const timer = setTimeout(() => {
        setTimeLeft(timeLeft - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (gameState === 'playing' && timeLeft === 0) {
      endGame();
    }
  }, [timeLeft, gameState]);

  // End game
  const endGame = () => {
    setGameActive(false);
    setGameState('ended');
    
    // Update total data collected
    const newTotal = totalDataCollected + score;
    setTotalDataCollected(newTotal);
    localStorage.setItem('totalDataCollected', newTotal.toString());
    
    // Check if score makes top 5
    const isTopFive = leaderboard.length < 5 || score > leaderboard[leaderboard.length - 1].score;
    setShowNameInput(isTopFive);
    
    if (!isTopFive) {
      setShowPlayAgain(true);
    }
  };

  // Handle name submission
  const handleNameSubmit = () => {
    if (playerName.length < 1 || playerName.length > 4) return;
    
    const newEntry: LeaderboardEntry = {
      name: playerName.toUpperCase(),
      score: score,
    };
    
    const newLeaderboard = [...leaderboard, newEntry]
      .sort((a, b) => b.score - a.score)
      .slice(0, 5);
    
    saveLeaderboard(newLeaderboard);
    setShowNameInput(false);
    setShowPlayAgain(true);
  };

  // Reset game
  const resetGame = () => {
    setScore(0);
    setBlocks([]);
    setBasketVelocity(0);
    setTimeLeft(GAME_DURATION);
    setCountdown(3);
    setGameState('intro');
    setGameActive(false);
    setPlayerName('');
    setShowNameInput(false);
    setShowPlayAgain(false);
    setLogoSpawned(false);
    setPlayAgainSelection('yes');
    blockIdCounter.current = 0;
    lastLogoSpawnTime.current = 0;
    gameStartTime.current = 0;
    keysPressed.current.clear();
  };

  // Handle close
  const handleClose = () => {
    setGameActive(false);
    onClose();
  };

  // Handle mouse movement
  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (gameRef.current && gameActive) {
      const rect = gameRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left - BASKET_WIDTH / 2;
      const maxX = rect.width - BASKET_WIDTH;
      setBasketX(Math.max(0, Math.min(x, maxX)));
    }
  }, [gameActive, BASKET_WIDTH]);

  // Handle keyboard movement with momentum
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    // Escape key closes game at any time
    if (e.key === 'Escape') {
      e.preventDefault();
      handleClose();
      return;
    }

    // Handle game controls
    if (gameActive) {
      if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
        e.preventDefault();
        keysPressed.current.add(e.key);
      }
      return;
    }

    // Handle name input confirmation
    if (showNameInput) {
      if (e.key === 'Enter' && playerName.length >= 1 && playerName.length <= 4) {
        e.preventDefault();
        handleNameSubmit();
      }
      return;
    }

    // Handle play again navigation
    if (showPlayAgain) {
      if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
        e.preventDefault();
        setPlayAgainSelection(prev => prev === 'yes' ? 'no' : 'yes');
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (playAgainSelection === 'yes') {
          resetGame();
        } else {
          handleClose();
        }
      }
    }
  }, [gameActive, showNameInput, showPlayAgain, playerName, playAgainSelection, handleClose]);

  const handleKeyUp = useCallback((e: KeyboardEvent) => {
    if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
      keysPressed.current.delete(e.key);
    }
  }, []);

  // Update basket position with momentum physics
  useEffect(() => {
    if (!gameActive || !gameRef.current) return;

    const updateBasket = () => {
      setBasketVelocity(prevVelocity => {
        let newVelocity = prevVelocity;
        const acceleration = 2; // Increased from 1
        const friction = 0.92; // Air hockey-like friction

        // Apply acceleration from key presses
        if (keysPressed.current.has('ArrowLeft')) {
          newVelocity -= acceleration;
        }
        if (keysPressed.current.has('ArrowRight')) {
          newVelocity += acceleration;
        }

        // Apply friction
        newVelocity *= friction;

        // Stop if velocity is very small
        if (Math.abs(newVelocity) < 0.1) {
          newVelocity = 0;
        }

        // Cap maximum velocity
        const maxVelocity = 15;
        newVelocity = Math.max(-maxVelocity, Math.min(maxVelocity, newVelocity));

        return newVelocity;
      });

      setBasketX(prevX => {
        if (!gameRef.current) return prevX;
        const rect = gameRef.current.getBoundingClientRect();
        const maxX = rect.width - BASKET_WIDTH;
        let newX = prevX + basketVelocity;

        // Bounce off edges
        if (newX < 0) {
          newX = 0;
          setBasketVelocity(v => -v * 0.5); // Bounce with energy loss
        } else if (newX > maxX) {
          newX = maxX;
          setBasketVelocity(v => -v * 0.5); // Bounce with energy loss
        }

        return newX;
      });
    };

    const interval = setInterval(updateBasket, 16); // ~60fps
    return () => clearInterval(interval);
  }, [gameActive, basketVelocity, BASKET_WIDTH]);

  // Spawn new blocks
  const spawnBlock = useCallback(() => {
    if (!gameRef.current || !gameActive) return;

    const now = Date.now();
    if (now - lastSpawnTime.current < 800) return; // Spawn every 800ms

    lastSpawnTime.current = now;

    const rect = gameRef.current.getBoundingClientRect();
    
    // Initialize logo spawn time if not set
    if (lastLogoSpawnTime.current === 0) {
      lastLogoSpawnTime.current = now;
    }
    
    // Logo spawns every 5-10 seconds
    const timeSinceLastLogo = now - lastLogoSpawnTime.current;
    
    // Force spawn if it's been more than 10 seconds since last logo
    const shouldForceLogoSpawn = timeSinceLastLogo >= LOGO_SPAWN_MAX_INTERVAL;
    // Can spawn if at least 5 seconds have passed
    const canSpawnLogo = timeSinceLastLogo >= LOGO_SPAWN_MIN_INTERVAL;
    // High chance to spawn when eligible
    const shouldSpawnLogo = shouldForceLogoSpawn || (Math.random() < 0.5 && canSpawnLogo);
    
    if (shouldSpawnLogo && gameStartTime.current > 0) {
      lastLogoSpawnTime.current = now;
      
      // Vary logo size between 40-70px
      const logoSize = 40 + Math.random() * 30;
      const averageSpeed = 2;
      
      const newBlock: Block = {
        id: blockIdCounter.current++,
        x: Math.random() * (rect.width - logoSize),
        y: -logoSize,
        color: '', // Not used for logo
        size: logoSize,
        speed: averageSpeed * 2, // Twice as fast
        points: 1000, // 1000 bonus points for logo
        isLogo: true,
      };
      
      setBlocks((prev) => [...prev, newBlock]);
      console.log('🎯 LOGO SPAWNED! Size:', logoSize.toFixed(0), 'px, Time since last:', (timeSinceLastLogo / 1000).toFixed(1), 's'); // Debug log
    } else {
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
        isLogo: false,
      };

      setBlocks((prev) => [...prev, newBlock]);
    }
  }, [gameActive]);

  // Game loop
  const gameLoop = useCallback(() => {
    if (!gameActive || !gameRef.current) return;

    const rect = gameRef.current.getBoundingClientRect();
    const basketY = rect.height - BASKET_HEIGHT - 20;
    const basketLeft = basketX;
    const basketRight = basketX + BASKET_WIDTH;
    const basketBottom = basketY + BASKET_HEIGHT;

    setBlocks((prevBlocks) => {
      const updatedBlocks = prevBlocks
        .map((block) => {
          let newX = block.x;
          let newY = block.y;
          let newVelocityX = block.velocityX || 0;
          let newVelocityY = block.velocityY || block.speed;

          // Apply velocity
          newX += newVelocityX;
          newY += newVelocityY;

          // Check collision with basket sides
          const blockLeft = newX;
          const blockRight = newX + block.size;
          const blockBottom = newY + block.size;
          const blockTop = newY;

          // Left side of basket collision - only if block is falling (not already bouncing)
          if (
            blockRight > basketLeft &&
            blockLeft < basketLeft + BASKET_SIDE_WIDTH &&
            blockBottom >= basketY &&
            blockTop < basketBottom &&
            newVelocityX <= 0
          ) {
            newVelocityX = -4; // Bounce left with consistent force
            newX = basketLeft - block.size - 2;
          }

          // Right side of basket collision - only if block is falling (not already bouncing)
          if (
            blockLeft < basketRight &&
            blockRight > basketRight - BASKET_SIDE_WIDTH &&
            blockBottom >= basketY &&
            blockTop < basketBottom &&
            newVelocityX >= 0
          ) {
            newVelocityX = 4; // Bounce right with consistent force
            newX = basketRight + 2;
          }

          // Bounce off screen edges
          if (newX < 0) {
            newX = 0;
            newVelocityX = Math.abs(newVelocityX || 2);
          } else if (newX + block.size > rect.width) {
            newX = rect.width - block.size;
            newVelocityX = -Math.abs(newVelocityX || 2);
          }

          // Apply gravity to horizontal velocity (slow down bounces)
          if (newVelocityX !== 0) {
            newVelocityX *= 0.98;
            if (Math.abs(newVelocityX) < 0.1) newVelocityX = 0;
          }

          return {
            ...block,
            x: newX,
            y: newY,
            velocityX: newVelocityX,
            velocityY: newVelocityY,
          };
        })
        .filter((block) => {
          const blockCenterX = block.x + block.size / 2;
          const blockBottom = block.y + block.size;
          const blockLeft = block.x;
          const blockRight = block.x + block.size;

          // More forgiving catch detection
          const catchMargin = 8; // Extra margin for forgiveness
          const inBasketHorizontally = blockCenterX > basketLeft + BASKET_SIDE_WIDTH - catchMargin && 
                                       blockCenterX < basketRight - BASKET_SIDE_WIDTH + catchMargin;
          
          // More forgiving vertical detection
          const landedInBasket = blockBottom >= basketBottom - block.speed - 3 &&
                                blockBottom <= basketBottom + BASKET_SIDE_WIDTH + 5 &&
                                inBasketHorizontally &&
                                blockLeft > basketLeft - catchMargin &&
                                blockRight < basketRight + catchMargin;

          if (landedInBasket) {
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
  }, [gameActive, basketX, spawnBlock, BASKET_WIDTH, BASKET_HEIGHT, BASKET_SIDE_WIDTH]);

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

  // Add mouse move and keyboard listeners
  useEffect(() => {
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [handleMouseMove, handleKeyDown, handleKeyUp]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Dark overlay with transparency */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

      {/* Game container */}
      <div
        ref={gameRef}
        className="relative w-full h-full"
        style={{ 
          cursor: gameActive ? 'none' : 'default',
          backgroundImage: `
            linear-gradient(rgba(255, 255, 255, 0.05) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255, 255, 255, 0.05) 1px, transparent 1px)
          `,
          backgroundSize: '40px 40px',
        }}
      >
        {/* Close button */}
        <button
          onClick={handleClose}
          className="absolute top-6 left-6 z-50 w-10 h-10 flex items-center justify-center border border-white/40 bg-black/40 text-white hover:bg-white/20 transition-colors font-mono text-xl"
          aria-label="Close game"
        >
          ×
        </button>

        {/* Intro message */}
        {gameState === 'intro' && (
          <div className="absolute inset-0 flex items-center justify-center z-20">
            <div className="font-mono text-4xl md:text-6xl text-white font-bold text-center px-4 animate-pulse">
              COLLECT THE REAL WORLD DATA
            </div>
          </div>
        )}

        {/* Countdown display */}
        {gameState === 'countdown' && countdown > 0 && (
          <div className="absolute inset-0 flex items-center justify-center z-20">
            <div className="font-mono text-9xl text-white font-bold animate-pulse">
              {countdown}
            </div>
          </div>
        )}

        {/* Red flash overlay for last 5 seconds */}
        {gameState === 'playing' && timeLeft <= 5 && timeLeft > 0 && (
          <div 
            className="absolute inset-0 pointer-events-none z-15 animate-pulse"
            style={{
              backgroundColor: 'rgba(244, 97, 74, 0.15)',
            }}
          />
        )}

        {/* Center countdown for last 5 seconds */}
        {gameState === 'playing' && timeLeft <= 5 && timeLeft > 0 && (
          <div className="absolute inset-0 flex items-center justify-center z-20 pointer-events-none">
            <div className="font-mono text-9xl text-red-500 font-bold animate-pulse">
              {timeLeft}
            </div>
          </div>
        )}

        {/* Game HUD */}
        {gameState === 'playing' && (
          <>
            {/* Timer */}
            <div className="absolute top-6 right-6 z-10 bg-black/60 border border-white/40 px-6 py-3">
              <div className="font-mono text-xs uppercase tracking-wide text-white/60">
                Time
              </div>
              <div className={`font-mono text-2xl ${timeLeft <= 5 ? 'text-red-500' : 'text-red-500'}`}>{timeLeft}s</div>
            </div>

            {/* Score display */}
            <div className="absolute top-24 right-6 z-10 bg-black/60 border border-white/40 px-6 py-3">
              <div className="font-mono text-xs uppercase tracking-wide text-white/60">
                Data Collected
              </div>
              <div className="font-mono text-2xl text-white">{formatNumber(score)} GB</div>
            </div>

            {/* High Score */}
            {highScore && (
              <div className="absolute top-6 left-1/2 -translate-x-1/2 z-10 bg-black/60 border border-white/40 px-6 py-3">
                <div className="font-mono text-xs uppercase tracking-wide text-white/60 text-center">
                  High Score
                </div>
                <div className="font-mono text-xl text-white text-center">
                  {highScore.name}: {formatNumber(highScore.score)} GB
                </div>
              </div>
            )}
          </>
        )}

        {/* Falling blocks */}
        {gameState === 'playing' && blocks.map((block) => (
          block.isLogo ? (
            <div
              key={block.id}
              className="absolute rounded transition-none flex items-center justify-center"
              style={{
                left: `${block.x}px`,
                top: `${block.y}px`,
                width: `${block.size}px`,
                height: `${block.size}px`,
                backgroundColor: 'white',
                boxShadow: '0 4px 6px rgba(0, 0, 0, 0.3)',
                padding: '8px',
              }}
            >
              <Image
                src="/images/protege-logo-black.png"
                alt="Protege Logo"
                width={block.size - 16}
                height={block.size - 16}
                className="w-full h-full object-contain"
                priority
                unoptimized
              />
            </div>
          ) : (
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
          )
        ))}

        {/* U-shaped basket */}
        {gameState === 'playing' && (
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
                width: `${BASKET_SIDE_WIDTH}px`,
                height: '100%',
              }}
            />
            {/* Bottom */}
            <div
              className="absolute left-0 bottom-0 bg-white/90 border-2 border-white"
              style={{
                width: '100%',
                height: `${BASKET_SIDE_WIDTH}px`,
              }}
            />
            {/* Right side */}
            <div
              className="absolute right-0 bottom-0 bg-white/90 border-2 border-white"
              style={{
                width: `${BASKET_SIDE_WIDTH}px`,
                height: '100%',
              }}
            />
          </div>
        )}

        {/* Name Input Modal */}
        {gameState === 'ended' && showNameInput && (
          <div className="absolute inset-0 flex items-center justify-center z-30">
            <div className="bg-black/90 border-2 border-white p-8 max-w-md w-full mx-4">
              <h2 className="font-mono text-2xl text-white mb-4 text-center">
                You've unlocked real world data!
              </h2>
              <p className="font-mono text-lg text-white mb-2 text-center">
                {formatNumber(score)} GB
              </p>
              <p className="font-mono text-xs text-white/60 mb-2 text-center">
                Total Collected: {formatNumber(totalDataCollected)} GB
              </p>
              <p className="font-mono text-xs text-white/40 mb-6 text-center">
                That's {calculateGlobalPercentage(totalDataCollected)}% of est. global data volume
              </p>
              <p className="font-mono text-sm text-white mb-4 text-center">
                Enter your name (1-4 characters):
              </p>
              <input
                type="text"
                maxLength={4}
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value.toUpperCase())}
                className="w-full bg-black/60 border border-white/40 px-4 py-3 font-mono text-2xl text-white text-center uppercase tracking-widest focus:outline-none focus:border-white"
                placeholder="ABCD"
                autoFocus
              />
              <button
                onClick={handleNameSubmit}
                disabled={playerName.length < 1 || playerName.length > 4}
                className="w-full mt-4 border border-white bg-white px-6 py-3 font-mono text-sm uppercase tracking-wide text-black hover:bg-white/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Confirm
              </button>
            </div>
          </div>
        )}

        {/* Play Again Modal */}
        {gameState === 'ended' && showPlayAgain && (
          <div className="absolute inset-0 flex items-center justify-center z-30">
            <div className="bg-black/90 border-2 border-white p-8 max-w-md w-full mx-4">
              <h2 className="font-mono text-2xl text-white mb-4 text-center">
                You've unlocked real world data!
              </h2>
              <p className="font-mono text-xl text-white mb-2 text-center">
                {formatNumber(score)} GB
              </p>
              <p className="font-mono text-xs text-white/60 mb-2 text-center">
                Total Collected: {formatNumber(totalDataCollected)} GB
              </p>
              <p className="font-mono text-xs text-white/40 mb-8 text-center">
                That's {calculateGlobalPercentage(totalDataCollected)}% of est. global data volume
              </p>
              
              {/* Leaderboard */}
              <div className="mb-8">
                <h3 className="font-mono text-sm uppercase tracking-wide text-white/60 mb-4 text-center">
                  Leaderboard
                </h3>
                <div className="space-y-2">
                  {leaderboard.map((entry, index) => (
                    <div
                      key={index}
                      className="flex justify-between items-center border border-white/20 px-4 py-2"
                    >
                      <span className="font-mono text-sm text-white">
                        {index + 1}. {entry.name}
                      </span>
                      <span className="font-mono text-sm text-white">
                        {formatNumber(entry.score)} GB
                      </span>
                    </div>
                  ))}
                  {leaderboard.length === 0 && (
                    <p className="font-mono text-sm text-white/40 text-center py-4">
                      No scores yet
                    </p>
                  )}
                </div>
              </div>

              <p className="font-mono text-sm text-white mb-4 text-center">
                Collect more?
              </p>
              <div className="flex gap-4">
                <button
                  onClick={resetGame}
                  className={`flex-1 border px-6 py-3 font-mono text-sm uppercase tracking-wide transition-colors ${
                    playAgainSelection === 'yes'
                      ? 'border-white bg-white text-black'
                      : 'border-white/40 bg-transparent text-white hover:border-white'
                  }`}
                >
                  Yes
                </button>
                <button
                  onClick={handleClose}
                  className={`flex-1 border px-6 py-3 font-mono text-sm uppercase tracking-wide transition-colors ${
                    playAgainSelection === 'no'
                      ? 'border-white bg-white text-black'
                      : 'border-white/40 bg-transparent text-white hover:border-white'
                  }`}
                >
                  No
                </button>
              </div>
              <p className="font-mono text-xs text-white/40 mt-4 text-center">
                Use ← → to select, Enter to confirm
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
