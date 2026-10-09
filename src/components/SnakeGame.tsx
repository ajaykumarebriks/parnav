import { useRef, useCallback, useMemo } from 'react';
import { useSnakeGame } from '../hooks/useSnakeGame';
import { useSwipe } from '../hooks/useSwipe';
import type { Difficulty, Direction } from '../hooks/useSnakeGame';


function DifficultyButton({ 
  label, 
  value, 
  current, 
  onClick 
}: { 
  label: string; 
  value: Difficulty; 
  current: Difficulty; 
  onClick: (d: Difficulty) => void;
}) {
  const isActive = value === current;
  return (
    <button
      onClick={() => onClick(value)}
      className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 ${
        isActive
          ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/30 scale-105'
          : 'bg-gray-700/50 text-gray-300 hover:bg-gray-600/50 hover:text-white'
      }`}
    >
      {label}
    </button>
  );
}

function DirectionButton({ 
  icon, 
  direction, 
  onClick,
  className = ''
}: { 
  icon: string; 
  direction: Direction; 
  onClick: (d: Direction) => void;
  className?: string;
}) {
  return (
    <button
      onTouchStart={(e) => { e.preventDefault(); onClick(direction); }}
      onClick={() => onClick(direction)}
      className={`w-14 h-14 rounded-xl bg-gray-700/70 backdrop-blur-sm border border-gray-600/50 
        flex items-center justify-center text-xl text-gray-200 
        active:bg-emerald-500/50 active:scale-95 transition-all duration-100
        shadow-lg hover:bg-gray-600/70 ${className}`}
    >
      {icon}
    </button>
  );
}

export default function SnakeGame() {
  const {
    snake,
    food,
    gameState,
    score,
    highScore,
    difficulty,
    gridSize,
    startGame,
    pauseGame,
    resetGame,
    changeDirection,
    changeDifficulty,
  } = useSnakeGame();

  const boardRef = useRef<HTMLDivElement>(null);

  const handleSwipe = useCallback((dir: Direction) => {
    if (gameState === 'idle') startGame();
    changeDirection(dir);
  }, [gameState, startGame, changeDirection]);

  useSwipe(boardRef, handleSwipe);

  // Build a set for quick lookup
  const snakeSet = useMemo(() => {
    const set = new Set<string>();
    snake.forEach((seg, i) => set.add(`${seg.x},${seg.y},${i}`));
    return set;
  }, [snake]);

  const headKey = `${snake[0].x},${snake[0].y}`;
  const foodKey = `${food.x},${food.y}`;

  const getCellType = (x: number, y: number): string => {
    const key = `${x},${y}`;
    if (key === headKey) return 'head';
    if (snake.some(seg => seg.x === x && seg.y === y)) return 'body';
    if (key === foodKey) return 'food';
    return 'empty';
  };

  const getBodyIndex = (x: number, y: number): number => {
    return snake.findIndex(seg => seg.x === x && seg.y === y);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex flex-col items-center justify-center p-4 select-none overflow-hidden">
      {/* Header */}
      <div className="w-full max-w-lg mb-4">
        <div className="flex items-center justify-between mb-3">
          <h1 className="text-2xl md:text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">
            🐍 Snake
          </h1>
          <div className="flex gap-3">
            <div className="text-center">
              <div className="text-xs text-gray-400 uppercase tracking-wider">Score</div>
              <div className="text-xl font-bold text-emerald-400 tabular-nums">{score}</div>
            </div>
            <div className="text-center">
              <div className="text-xs text-gray-400 uppercase tracking-wider">Best</div>
              <div className="text-xl font-bold text-amber-400 tabular-nums">{highScore}</div>
            </div>
          </div>
        </div>

        {/* Difficulty */}
        <div className="flex items-center justify-center gap-2 mb-3">
          <span className="text-xs text-gray-400 mr-1">Speed:</span>
          <DifficultyButton label="Easy" value="easy" current={difficulty} onClick={changeDifficulty} />
          <DifficultyButton label="Medium" value="medium" current={difficulty} onClick={changeDifficulty} />
          <DifficultyButton label="Hard" value="hard" current={difficulty} onClick={changeDifficulty} />
        </div>
      </div>

      {/* Game Board */}
      <div
        ref={boardRef}
        className="relative w-full max-w-lg aspect-square rounded-2xl overflow-hidden shadow-2xl shadow-black/50 border border-gray-700/50"
        style={{ touchAction: 'none' }}
      >
        {/* Grid Background */}
        <div className="absolute inset-0 bg-gray-900/95">
          <div
            className="w-full h-full grid"
            style={{
              gridTemplateColumns: `repeat(${gridSize}, 1fr)`,
              gridTemplateRows: `repeat(${gridSize}, 1fr)`,
            }}
          >
            {Array.from({ length: gridSize * gridSize }).map((_, idx) => {
              const x = idx % gridSize;
              const y = Math.floor(idx / gridSize);
              const cellType = getCellType(x, y);
              const isEvenCell = (x + y) % 2 === 0;

              let cellClass = 'transition-all duration-75 ';

              if (cellType === 'head') {
                cellClass += 'bg-emerald-400 rounded-sm scale-110 shadow-lg shadow-emerald-400/50 z-10';
              } else if (cellType === 'body') {
                const bodyIdx = getBodyIndex(x, y);
                const opacity = Math.max(0.4, 1 - (bodyIdx / snake.length) * 0.6);
                cellClass += 'rounded-sm';
                return (
                  <div
                    key={idx}
                    className={`${cellClass} bg-emerald-500`}
                    style={{ opacity, transition: 'opacity 100ms' }}
                  />
                );
              } else if (cellType === 'food') {
                cellClass += 'bg-rose-500 rounded-full scale-90 animate-pulse shadow-lg shadow-rose-500/50';
              } else {
                cellClass += isEvenCell ? 'bg-gray-800/30' : 'bg-gray-800/10';
              }

              return <div key={idx} className={cellClass} />;
            })}
          </div>
        </div>

        {/* Overlay States */}
        {gameState === 'idle' && (
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex flex-col items-center justify-center z-20 animate-fade-in">
            <div className="text-6xl mb-4 animate-bounce">🐍</div>
            <h2 className="text-2xl font-bold text-white mb-2">Ready to Play?</h2>
            <p className="text-gray-300 text-sm mb-4 text-center px-4">
              Use arrow keys, WASD, or swipe to control
            </p>
            <button
              onClick={startGame}
              className="px-6 py-3 bg-emerald-500 hover:bg-emerald-400 text-white font-bold rounded-xl 
                shadow-lg shadow-emerald-500/30 transition-all duration-200 hover:scale-105 active:scale-95"
            >
              Start Game
            </button>
          </div>
        )}

        {gameState === 'paused' && (
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex flex-col items-center justify-center z-20">
            <div className="text-5xl mb-4">⏸️</div>
            <h2 className="text-2xl font-bold text-white mb-2">Paused</h2>
            <button
              onClick={pauseGame}
              className="px-6 py-3 bg-emerald-500 hover:bg-emerald-400 text-white font-bold rounded-xl 
                shadow-lg shadow-emerald-500/30 transition-all duration-200 hover:scale-105 active:scale-95"
            >
              Resume
            </button>
          </div>
        )}

        {gameState === 'gameover' && (
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm flex flex-col items-center justify-center z-20">
            <div className="text-5xl mb-3">💀</div>
            <h2 className="text-2xl font-bold text-white mb-1">Game Over!</h2>
            <p className="text-3xl font-bold text-emerald-400 mb-1">{score} pts</p>
            {score >= highScore && score > 0 && (
              <p className="text-amber-400 text-sm font-medium mb-3 animate-pulse">🏆 New High Score!</p>
            )}
            <div className="flex gap-3 mt-2">
              <button
                onClick={() => { resetGame(); setTimeout(startGame, 50); }}
                className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-white font-bold rounded-xl 
                  shadow-lg shadow-emerald-500/30 transition-all duration-200 hover:scale-105 active:scale-95"
              >
                Play Again
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="w-full max-w-lg mt-4">
        {/* Action Buttons */}
        <div className="flex items-center justify-center gap-3 mb-4">
          {gameState === 'playing' && (
            <button
              onClick={pauseGame}
              className="px-4 py-2 bg-gray-700/70 hover:bg-gray-600/70 text-gray-200 rounded-xl 
                border border-gray-600/50 transition-all duration-200 hover:scale-105 active:scale-95
                flex items-center gap-2"
            >
              <span>⏸️</span> Pause
            </button>
          )}
          {gameState === 'paused' && (
            <button
              onClick={pauseGame}
              className="px-4 py-2 bg-emerald-500/80 hover:bg-emerald-400/80 text-white rounded-xl 
                transition-all duration-200 hover:scale-105 active:scale-95
                flex items-center gap-2"
            >
              <span>▶️</span> Resume
            </button>
          )}
          {(gameState === 'playing' || gameState === 'paused') && (
            <button
              onClick={resetGame}
              className="px-4 py-2 bg-gray-700/70 hover:bg-gray-600/70 text-gray-200 rounded-xl 
                border border-gray-600/50 transition-all duration-200 hover:scale-105 active:scale-95
                flex items-center gap-2"
            >
              <span>🔄</span> Restart
            </button>
          )}
        </div>

        {/* D-Pad for mobile */}
        <div className="flex flex-col items-center md:hidden">
          <DirectionButton icon="▲" direction="UP" onClick={(d) => { if (gameState === 'idle') startGame(); changeDirection(d); }} />
          <div className="flex gap-8 mt-1">
            <DirectionButton icon="◀" direction="LEFT" onClick={(d) => { if (gameState === 'idle') startGame(); changeDirection(d); }} />
            <DirectionButton icon="▶" direction="RIGHT" onClick={(d) => { if (gameState === 'idle') startGame(); changeDirection(d); }} />
          </div>
          <DirectionButton icon="▼" direction="DOWN" onClick={(d) => { if (gameState === 'idle') startGame(); changeDirection(d); }} className="-mt-1" />
        </div>

        {/* Desktop hint */}
        <div className="hidden md:flex items-center justify-center gap-4 text-xs text-gray-500 mt-2">
          <span className="flex items-center gap-1">
            <kbd className="px-1.5 py-0.5 bg-gray-700/50 rounded text-gray-400 border border-gray-600/50">↑↓←→</kbd>
            <span>or</span>
            <kbd className="px-1.5 py-0.5 bg-gray-700/50 rounded text-gray-400 border border-gray-600/50">WASD</kbd>
            <span>Move</span>
          </span>
          <span className="flex items-center gap-1">
            <kbd className="px-1.5 py-0.5 bg-gray-700/50 rounded text-gray-400 border border-gray-600/50">Space</kbd>
            <span>Pause</span>
          </span>
        </div>
      </div>
    </div>
  );
}
