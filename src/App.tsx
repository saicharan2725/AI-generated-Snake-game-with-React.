import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Play, Pause, SkipForward, SkipBack, Volume2, VolumeX, Terminal } from 'lucide-react';

const TRACKS = [
  { id: 1, title: 'SYS.OP.01 // NEON_GRID', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3' },
  { id: 2, title: 'SYS.OP.02 // CYBER_PULSE', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3' },
  { id: 3, title: 'SYS.OP.03 // OVERRIDE', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3' },
];

const GRID_SIZE = 20;
const INITIAL_SNAKE = [{ x: 10, y: 10 }];
const INITIAL_DIRECTION = { x: 0, y: -1 };
const GAME_SPEED = 120;

export default function App() {
  // Music Player State
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  // Snake Game State
  const [snake, setSnake] = useState(INITIAL_SNAKE);
  const [direction, setDirection] = useState(INITIAL_DIRECTION);
  const [food, setFood] = useState({ x: 5, y: 5 });
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [isGameRunning, setIsGameRunning] = useState(false);

  // Music Player Logic
  useEffect(() => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.play().catch(e => console.error("Audio play error:", e));
      } else {
        audioRef.current.pause();
      }
    }
  }, [isPlaying, currentTrackIndex]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.muted = isMuted;
    }
  }, [isMuted]);

  const togglePlay = () => setIsPlaying(!isPlaying);
  
  const nextTrack = () => {
    setCurrentTrackIndex((prev) => (prev + 1) % TRACKS.length);
    setIsPlaying(true);
  };

  const prevTrack = () => {
    setCurrentTrackIndex((prev) => (prev - 1 + TRACKS.length) % TRACKS.length);
    setIsPlaying(true);
  };

  // Snake Game Logic
  const generateFood = useCallback(() => {
    let newFood;
    while (true) {
      newFood = {
        x: Math.floor(Math.random() * GRID_SIZE),
        y: Math.floor(Math.random() * GRID_SIZE)
      };
      // eslint-disable-next-line no-loop-func
      if (!snake.some(segment => segment.x === newFood.x && segment.y === newFood.y)) {
        break;
      }
    }
    setFood(newFood);
  }, [snake]);

  const resetGame = () => {
    setSnake(INITIAL_SNAKE);
    setDirection(INITIAL_DIRECTION);
    setScore(0);
    setGameOver(false);
    setIsGameRunning(true);
    generateFood();
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isGameRunning) return;
      
      switch (e.key) {
        case 'ArrowUp':
        case 'w':
          e.preventDefault();
          if (direction.y !== 1) setDirection({ x: 0, y: -1 });
          break;
        case 'ArrowDown':
        case 's':
          e.preventDefault();
          if (direction.y !== -1) setDirection({ x: 0, y: 1 });
          break;
        case 'ArrowLeft':
        case 'a':
          e.preventDefault();
          if (direction.x !== 1) setDirection({ x: -1, y: 0 });
          break;
        case 'ArrowRight':
        case 'd':
          e.preventDefault();
          if (direction.x !== -1) setDirection({ x: 1, y: 0 });
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [direction, isGameRunning]);

  useEffect(() => {
    if (!isGameRunning || gameOver) return;

    const moveSnake = () => {
      setSnake(prevSnake => {
        const head = prevSnake[0];
        const newHead = { x: head.x + direction.x, y: head.y + direction.y };

        // Check collision with walls
        if (
          newHead.x < 0 || 
          newHead.x >= GRID_SIZE || 
          newHead.y < 0 || 
          newHead.y >= GRID_SIZE
        ) {
          setGameOver(true);
          setIsGameRunning(false);
          return prevSnake;
        }

        // Check collision with self
        if (prevSnake.some(segment => segment.x === newHead.x && segment.y === newHead.y)) {
          setGameOver(true);
          setIsGameRunning(false);
          return prevSnake;
        }

        const newSnake = [newHead, ...prevSnake];

        // Check food collision
        if (newHead.x === food.x && newHead.y === food.y) {
          setScore(s => s + 10);
          generateFood();
        } else {
          newSnake.pop();
        }

        return newSnake;
      });
    };

    const gameInterval = setInterval(moveSnake, GAME_SPEED);
    return () => clearInterval(gameInterval);
  }, [direction, food, gameOver, isGameRunning, generateFood]);

  return (
    <div className="min-h-screen bg-[#050505] text-[#0ff] font-mono p-4 md:p-8 flex flex-col items-center justify-center relative overflow-hidden crt-flicker">
      <div className="scanlines"></div>
      
      {/* Background decorative elements */}
      <div className="absolute top-4 left-4 text-[#f0f] opacity-50 text-xs md:text-sm">
        <p>SYS.MEM: 0x00FF4A</p>
        <p>STATUS: COMPROMISED</p>
        <p>UPLINK: OFFLINE</p>
      </div>

      <div className="absolute bottom-4 right-4 text-[#0ff] opacity-50 text-xs md:text-sm text-right">
        <p>V. 2.0.4.9</p>
        <p>PROTOCOL: OMEGA</p>
      </div>

      <header className="mb-8 text-center screen-tear z-10">
        <h1 className="text-4xl md:text-6xl font-bold glitch-text uppercase tracking-widest flex items-center justify-center gap-4">
          <span className="text-[#f0f] font-normal">&gt;_</span>
          NEON_SERPENT
        </h1>
        <p className="text-[#f0f] mt-2 tracking-widest text-sm md:text-base">EXECUTE_SEQUENCE // AUDIO_SYNC</p>
      </header>

      <div className="flex flex-col gap-8 w-full max-w-4xl z-10 items-center justify-center">
        
        {/* Music Player Panel */}
        <div className="w-full border-2 border-[#0ff] bg-black/80 p-6 shadow-[0_0_15px_rgba(0,255,255,0.3)] relative">
          <div className="absolute -top-3 -left-3 w-6 h-6 border-t-2 border-l-2 border-[#f0f]"></div>
          <div className="absolute -bottom-3 -right-3 w-6 h-6 border-b-2 border-r-2 border-[#f0f]"></div>
          
          <h2 className="text-xl text-[#f0f] mb-4 border-b border-[#f0f]/30 pb-2 uppercase tracking-wider">Audio_Subsystem</h2>
          
          <div className="mb-6">
            <p className="text-xs text-gray-500 mb-1">CURRENT_TRACK:</p>
            <div className="bg-[#0ff]/10 p-4 border border-[#0ff]/30 overflow-hidden text-center">
              <p className="text-2xl md:text-4xl inline-block glitch-text font-bold tracking-widest">
                {TRACKS[currentTrackIndex].title}
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between mb-6">
            <button onClick={prevTrack} className="p-2 hover:bg-[#f0f]/20 hover:text-[#f0f] transition-colors border border-transparent hover:border-[#f0f]">
              <SkipBack className="w-6 h-6" />
            </button>
            <button onClick={togglePlay} className="w-16 h-16 flex items-center justify-center border border-[#0ff] hover:bg-[#0ff]/30 hover:shadow-[0_0_10px_#0ff] transition-all">
              {isPlaying ? <Pause className="w-8 h-8" /> : <Play className="w-8 h-8 ml-1" />}
            </button>
            <button onClick={nextTrack} className="p-2 hover:bg-[#f0f]/20 hover:text-[#f0f] transition-colors border border-transparent hover:border-[#f0f]">
              <SkipForward className="w-6 h-6" />
            </button>
          </div>

          <div className="flex items-center justify-between border-t border-[#0ff]/30 pt-4">
            <div className="flex items-center gap-2">
              <button onClick={() => setIsMuted(!isMuted)} className="hover:text-[#f0f] transition-colors">
                {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
              </button>
              <div className="w-24 h-2 bg-gray-800 relative overflow-hidden">
                <div className={`absolute top-0 left-0 h-full bg-[#0ff] transition-all ${isMuted ? 'w-0' : 'w-full'}`}></div>
              </div>
            </div>
            <div className="text-xs text-[#f0f] animate-pulse">
              {isPlaying ? 'SYNCING...' : 'IDLE'}
            </div>
          </div>

          <audio 
            ref={audioRef} 
            src={TRACKS[currentTrackIndex].url} 
            onEnded={nextTrack}
            className="hidden"
          />
        </div>

        {/* Game Panel */}
        <div className="w-full border-2 border-[#f0f] bg-black/80 p-6 shadow-[0_0_15px_rgba(255,0,255,0.3)] relative flex flex-col items-center">
          <div className="absolute -top-3 -right-3 w-6 h-6 border-t-2 border-r-2 border-[#0ff]"></div>
          <div className="absolute -bottom-3 -left-3 w-6 h-6 border-b-2 border-l-2 border-[#0ff]"></div>

          <div className="w-full flex justify-between items-center mb-4 border-b border-[#f0f]/30 pb-2">
            <h2 className="text-xl text-[#0ff] uppercase tracking-wider">Visual_Interface</h2>
            <div className="text-lg">
              SCORE: <span className="text-[#f0f]">{score.toString().padStart(4, '0')}</span>
            </div>
          </div>

          <div 
            className="relative bg-[#050505] border border-[#333] grid"
            style={{ 
              gridTemplateColumns: `repeat(${GRID_SIZE}, minmax(0, 1fr))`,
              width: 'min(100%, 400px)',
              aspectRatio: '1/1'
            }}
          >
            {/* Grid cells */}
            {Array.from({ length: GRID_SIZE * GRID_SIZE }).map((_, i) => {
              const x = i % GRID_SIZE;
              const y = Math.floor(i / GRID_SIZE);
              const isSnake = snake.some(segment => segment.x === x && segment.y === y);
              const isHead = snake[0].x === x && snake[0].y === y;
              const isFood = food.x === x && food.y === y;

              return (
                <div 
                  key={i} 
                  className={`
                    w-full h-full border-[0.5px] border-[#111]
                    ${isHead ? 'bg-[#fff] shadow-[0_0_8px_#fff]' : ''}
                    ${isSnake && !isHead ? 'bg-[#0ff] shadow-[0_0_5px_#0ff]' : ''}
                    ${isFood ? 'bg-[#f0f] shadow-[0_0_8px_#f0f] animate-pulse' : ''}
                  `}
                />
              );
            })}

            {/* Overlays */}
            {!isGameRunning && !gameOver && (
              <div className="absolute inset-0 bg-black/80 flex items-center justify-center flex-col z-10">
                <p className="text-[#0ff] mb-4 text-center px-4">AWAITING_INPUT<br/>USE WASD OR ARROWS</p>
                <button 
                  onClick={resetGame}
                  className="px-6 py-2 bg-transparent border-2 border-[#f0f] text-[#f0f] hover:bg-[#f0f] hover:text-black transition-colors uppercase tracking-widest font-bold"
                >
                  INITIALIZE
                </button>
              </div>
            )}

            {gameOver && (
              <div className="absolute inset-0 bg-black/90 flex items-center justify-center flex-col z-10 border-4 border-red-600">
                <h3 className="text-3xl text-red-500 mb-2 glitch-text uppercase">FATAL_ERROR</h3>
                <p className="text-white mb-6">FINAL_SCORE: {score}</p>
                <button 
                  onClick={resetGame}
                  className="px-6 py-2 bg-transparent border-2 border-[#0ff] text-[#0ff] hover:bg-[#0ff] hover:text-black transition-colors uppercase tracking-widest font-bold"
                >
                  REBOOT_SYSTEM
                </button>
              </div>
            )}
          </div>
          
          <div className="mt-4 text-xs text-gray-500 w-full text-center">
            [ WARNING: PROLONGED EXPOSURE MAY CAUSE COGNITIVE DISSONANCE ]
          </div>
        </div>

      </div>
    </div>
  );
}
