import React, { useRef, useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Lightbulb, X as XIcon, Undo2, CheckCircle, RotateCcw } from 'lucide-react';
import {
  CONFIGS, generatePuzzle, generateRegionalPuzzle, generateColorPuzzle,
  computeLitMap, findErrors, isWon, getDailySeed, countBulbs
} from '@/utils/puzzleEngine';
import { playPopSound, playRemoveSound, playWinSound, playErrorSound } from '@/utils/audioUtils';
import WinModal from './WinModal';
import AdBanner from './AdBanner';

const BULB_DRAW_COLORS = ['','#F59E0B','#3B82F6','#8B5CF6','#10B981','#EF4444'];
const LIT_BG_COLORS = ['','rgba(251,191,36,0.15)','rgba(59,130,246,0.12)','rgba(139,92,246,0.12)','rgba(16,185,129,0.12)','rgba(239,68,68,0.12)'];

const GameScreen = ({ mode, diff, streak, hints, onGoHome, onUseHint, onWin }) => {
  const canvasRef = useRef(null);
  const [puzzle, setPuzzle] = useState(null);
  const [solution, setSolution] = useState(null);
  const [historyStack, setHistoryStack] = useState([]);
  const [markMode, setMarkMode] = useState(false);
  const [showWin, setShowWin] = useState(false);
  const [hintsUsed, setHintsUsed] = useState(0);
  const [startTime] = useState(Date.now());
  const [elapsed, setElapsed] = useState(0);
  const [currentDiff, setCurrentDiff] = useState(diff);
  const [lampAnimation, setLampAnimation] = useState(null);
  const isDaily = currentDiff === 'daily';

  const modeNames = { classic: 'Akari Classique', color: 'Akari Colore', regional: 'Akari Regional' };
  const diffNames = { easy: 'Facile - 6x6', medium: 'Moyen - 8x8', hard: 'Difficile - 10x10', daily: 'Defi du jour - 8x8' };

  // Generate puzzle
  const newPuzzle = useCallback((m, d) => {
    const cfg = CONFIGS[d] || CONFIGS.easy;
    const seed = d === 'daily' ? getDailySeed() : undefined;
    let p;
    if (m === 'color') p = generateColorPuzzle(cfg.rows, cfg.cols);
    else if (m === 'regional') p = generateRegionalPuzzle(cfg.rows, cfg.cols);
    else p = generatePuzzle(cfg.rows, cfg.cols, d === 'daily' ? 'medium' : d, seed);
    setPuzzle(p);
    setSolution(Array.from({ length: p.rows }, () => Array(p.cols).fill(0)));
    setHistoryStack([]);
    setMarkMode(false);
    setShowWin(false);
    setHintsUsed(0);
    setLampAnimation(null);
  }, []);

  useEffect(() => { newPuzzle(mode, currentDiff); }, [mode, currentDiff, newPuzzle]);

  // Cell size calculation
  const getCellSize = useCallback(() => {
    if (!puzzle) return 40;
    const maxW = Math.min(window.innerWidth - 48, 400);
    const maxH = window.innerHeight - 340;
    return Math.floor(Math.min(maxW / puzzle.cols, maxH / puzzle.rows, 50));
  }, [puzzle]);

  // Draw grid
  const drawGrid = useCallback(() => {
    if (!puzzle || !solution || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const { rows, cols, isBlack, nums, regions, bulbColors } = puzzle;
    const cs = getCellSize();
    const pad = 2;
    const dpr = window.devicePixelRatio || 1;

    canvas.width = (cols * cs + pad * 2) * dpr;
    canvas.height = (rows * cs + pad * 2) * dpr;
    canvas.style.width = `${cols * cs + pad * 2}px`;
    canvas.style.height = `${rows * cs + pad * 2}px`;
    ctx.scale(dpr, dpr);

    const { litMap, litColor } = computeLitMap(puzzle, solution);
    const errs = findErrors(puzzle, solution);
    const errSet = new Set(errs.map(([r, c]) => `${r},${c}`));

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) {
      const x = pad + c * cs;
      const y = pad + r * cs;

      if (isBlack[r][c]) {
        ctx.fillStyle = '#334155';
        ctx.fillRect(x, y, cs, cs);
        ctx.strokeStyle = '#1E293B';
        ctx.lineWidth = 1;
        ctx.strokeRect(x + 0.5, y + 0.5, cs - 1, cs - 1);
        if (nums[r][c] >= 0) {
          ctx.fillStyle = '#FFFFFF';
          ctx.font = `bold ${Math.round(cs * 0.4)}px Fredoka, sans-serif`;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(nums[r][c], x + cs / 2, y + cs / 2);
        }
      } else {
        // Cell bg
        const isErr = errSet.has(`${r},${c}`);
        if (isErr) {
          ctx.fillStyle = '#FEE2E2';
        } else if (litMap[r][c]) {
          const col = litColor[r][c];
          ctx.fillStyle = LIT_BG_COLORS[col] || LIT_BG_COLORS[1];
        } else {
          ctx.fillStyle = '#FFFFFF';
        }
        ctx.fillRect(x, y, cs, cs);

        // Grid lines
        if (puzzle.mode === 'regional' && regions) {
          ctx.strokeStyle = 'rgba(59,130,246,0.3)';
          ctx.lineWidth = 1.5;
          // Draw region borders
          if (r === 0 || regions[r - 1]?.[c] !== regions[r][c]) {
            ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + cs, y); ctx.stroke();
          }
          if (c === 0 || regions[r][c - 1] !== regions[r][c]) {
            ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x, y + cs); ctx.stroke();
          }
          if (r === rows - 1 || regions[r + 1]?.[c] !== regions[r][c]) {
            ctx.beginPath(); ctx.moveTo(x, y + cs); ctx.lineTo(x + cs, y + cs); ctx.stroke();
          }
          if (c === cols - 1 || regions[r][c + 1] !== regions[r][c]) {
            ctx.beginPath(); ctx.moveTo(x + cs, y); ctx.lineTo(x + cs, y + cs); ctx.stroke();
          }
        } else {
          ctx.strokeStyle = '#E2E8F0';
          ctx.lineWidth = 0.5;
          ctx.strokeRect(x + 0.5, y + 0.5, cs - 1, cs - 1);
        }

        // Bulb
        if (solution[r][c] === 1) {
          const col = (bulbColors && bulbColors[r][c]) || 1;
          const bc = BULB_DRAW_COLORS[col] || BULB_DRAW_COLORS[1];

          // Glow
          const grad = ctx.createRadialGradient(x + cs / 2, y + cs / 2, 0, x + cs / 2, y + cs / 2, cs * 0.45);
          grad.addColorStop(0, bc + 'CC');
          grad.addColorStop(0.6, bc + '44');
          grad.addColorStop(1, bc + '00');
          ctx.fillStyle = grad;
          ctx.beginPath();
          ctx.arc(x + cs / 2, y + cs / 2, cs * 0.45, 0, Math.PI * 2);
          ctx.fill();

          // Bulb body
          ctx.fillStyle = bc;
          ctx.beginPath();
          ctx.arc(x + cs / 2, y + cs * 0.42, cs * 0.22, 0, Math.PI * 2);
          ctx.fill();
          // Base
          ctx.fillStyle = bc + 'BB';
          ctx.fillRect(x + cs * 0.38, y + cs * 0.56, cs * 0.24, cs * 0.1);
          ctx.fillRect(x + cs * 0.4, y + cs * 0.64, cs * 0.2, cs * 0.06);
        } else if (solution[r][c] === 2) {
          // Mark X
          ctx.strokeStyle = '#EF4444AA';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(x + cs * 0.3, y + cs * 0.3);
          ctx.lineTo(x + cs * 0.7, y + cs * 0.7);
          ctx.stroke();
          ctx.beginPath();
          ctx.moveTo(x + cs * 0.7, y + cs * 0.3);
          ctx.lineTo(x + cs * 0.3, y + cs * 0.7);
          ctx.stroke();
        }
      }
    }

    // Lamp placement animation ripple
    if (lampAnimation) {
      const { r: ar, c: ac, progress } = lampAnimation;
      const ax = pad + ac * cs + cs / 2;
      const ay = pad + ar * cs + cs / 2;
      const radius = progress * cs * 2;
      const alpha = Math.max(0, 0.4 * (1 - progress));
      ctx.beginPath();
      ctx.arc(ax, ay, radius, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(251, 191, 36, ${alpha})`;
      ctx.fill();
    }
  }, [puzzle, solution, getCellSize, lampAnimation]);

  useEffect(() => { drawGrid(); }, [drawGrid]);

  // Animate lamp placement
  const animateLamp = (r, c) => {
    let frame = 0;
    const totalFrames = 15;
    const animate = () => {
      frame++;
      const progress = frame / totalFrames;
      setLampAnimation({ r, c, progress });
      if (frame < totalFrames) requestAnimationFrame(animate);
      else setLampAnimation(null);
    };
    requestAnimationFrame(animate);
  };

  // Handle canvas click
  const handleCanvasClick = (e) => {
    if (!puzzle || !solution || showWin) return;
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const cs = getCellSize();
    const pad = 2;
    const mx = (e.clientX - rect.left) * (canvas.width / window.devicePixelRatio / rect.width) - pad;
    const my = (e.clientY - rect.top) * (canvas.height / window.devicePixelRatio / rect.height) - pad;
    const c = Math.floor(mx / cs);
    const r = Math.floor(my / cs);
    if (r < 0 || r >= puzzle.rows || c < 0 || c >= puzzle.cols) return;
    if (puzzle.isBlack[r][c]) return;

    // Save history
    setHistoryStack(prev => [...prev, solution.map(row => [...row])]);

    const newSol = solution.map(row => [...row]);
    if (markMode) {
      newSol[r][c] = newSol[r][c] === 2 ? 0 : 2;
    } else {
      if (newSol[r][c] === 1) {
        newSol[r][c] = 0;
        playRemoveSound();
      } else {
        newSol[r][c] = 1;
        playPopSound();
        animateLamp(r, c);
      }
    }
    setSolution(newSol);

    // Check win
    if (isWon(puzzle, newSol)) {
      const t = Math.round((Date.now() - startTime) / 1000);
      setElapsed(t);
      setShowWin(true);
      playWinSound();
      onWin(isDaily);
    }
  };

  const handleTouch = (e) => {
    e.preventDefault();
    handleCanvasClick(e.touches[0]);
  };

  // Actions
  const handleUndo = () => {
    if (historyStack.length === 0) return;
    const prev = historyStack[historyStack.length - 1];
    setHistoryStack(historyStack.slice(0, -1));
    setSolution(prev);
  };

  const handleCheck = () => {
    if (!puzzle || !solution) return;
    const errs = findErrors(puzzle, solution);
    if (errs.length > 0) {
      playErrorSound();
      drawGrid();
      return;
    }
    if (isWon(puzzle, solution)) {
      const t = Math.round((Date.now() - startTime) / 1000);
      setElapsed(t);
      setShowWin(true);
      playWinSound();
      onWin(isDaily);
      return;
    }
    playErrorSound();
  };

  const handleHint = () => {
    if (!puzzle || !solution) return;
    if (hints <= 0) return;
    for (let r = 0; r < puzzle.rows; r++) for (let c = 0; c < puzzle.cols; c++) {
      if (!puzzle.isBlack[r][c] && puzzle.solution[r][c] && solution[r][c] !== 1) {
        setHistoryStack(prev => [...prev, solution.map(row => [...row])]);
        const newSol = solution.map(row => [...row]);
        newSol[r][c] = 1;
        setSolution(newSol);
        setHintsUsed(prev => prev + 1);
        onUseHint();
        playPopSound();
        animateLamp(r, c);
        if (isWon(puzzle, newSol)) {
          const t = Math.round((Date.now() - startTime) / 1000);
          setElapsed(t);
          setShowWin(true);
          playWinSound();
          onWin(isDaily);
        }
        return;
      }
    }
  };

  const handleNewGame = () => {
    newPuzzle(mode, currentDiff);
  };

  const switchDiff = (d) => {
    setCurrentDiff(d);
  };

  // Progress
  const getProgress = () => {
    if (!puzzle || !solution) return { pct: 0, lit: 0, total: 0 };
    const { litMap } = computeLitMap(puzzle, solution);
    let total = 0, litCount = 0;
    for (let r = 0; r < puzzle.rows; r++) for (let c = 0; c < puzzle.cols; c++) {
      if (!puzzle.isBlack[r][c]) { total++; if (litMap[r][c]) litCount++; }
    }
    return { pct: total > 0 ? Math.round(litCount / total * 100) : 0, lit: litCount, total };
  };

  const { pct, lit, total } = getProgress();
  const currentBulbs = solution ? countBulbs(solution) : 0;
  const maxLamps = puzzle ? puzzle.maxLamps : 0;
  const lampsRemaining = maxLamps - currentBulbs;

  return (
    <div data-testid="game-screen" className="min-h-screen bg-gradient-to-b from-slate-50 to-white flex flex-col">
      {/* Header */}
      <div className="bg-white border-b-2 border-slate-100 px-4 py-3 flex items-center gap-3">
        <button
          data-testid="back-btn"
          onClick={onGoHome}
          className="w-10 h-10 rounded-xl border-2 border-slate-200 flex items-center justify-center
            hover:bg-slate-50 active:translate-y-0.5 transition-all"
        >
          <ArrowLeft className="w-5 h-5 text-slate-500" />
        </button>
        <div className="flex-1 min-w-0">
          <div className="font-heading font-bold text-slate-700 text-sm" data-testid="game-mode-name">
            {modeNames[mode] || 'Akari'}
          </div>
          <div className="text-xs text-slate-400" data-testid="game-level-name">
            {diffNames[currentDiff] || currentDiff}
          </div>
        </div>

        {/* Lamp Counter */}
        <motion.div
          data-testid="lamp-counter"
          className={`flex items-center gap-2 px-3 py-2 rounded-xl border-2 font-heading font-bold text-sm
            ${lampsRemaining < 0
              ? 'bg-red-50 border-red-300 text-red-500'
              : lampsRemaining === 0
                ? 'bg-amber-50 border-amber-300 text-amber-600'
                : 'bg-amber-50 border-amber-200 text-amber-600'}`}
          animate={lampsRemaining < 0 ? { scale: [1, 1.05, 1] } : {}}
          transition={{ duration: 0.3, repeat: lampsRemaining < 0 ? Infinity : 0, repeatDelay: 0.5 }}
        >
          <Lightbulb className="w-4 h-4" />
          <span>{lampsRemaining}</span>
          <span className="text-xs font-normal opacity-60">/ {maxLamps}</span>
        </motion.div>

        {/* Hint Button */}
        <button
          data-testid="hint-btn"
          onClick={handleHint}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl border-2 border-blue-200 bg-blue-50 text-blue-500 text-sm font-bold
            hover:bg-blue-100 active:translate-y-0.5 transition-all"
        >
          <Lightbulb className="w-4 h-4" />
          <span data-testid="hint-count">{hints}</span>
        </button>
      </div>

      {/* Difficulty Tabs */}
      {mode === 'classic' && !isDaily && (
        <div className="bg-white border-b-2 border-slate-100 px-4 py-2 flex gap-1" data-testid="diff-tabs">
          {['easy', 'medium', 'hard'].map(d => (
            <button
              key={d}
              data-testid={`diff-tab-${d}`}
              onClick={() => switchDiff(d)}
              className={`flex-1 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all
                ${currentDiff === d
                  ? 'bg-amber-400 text-white shadow-[0_3px_0_0_#D97706]'
                  : 'bg-slate-100 text-slate-400 hover:bg-slate-200'}`}
            >
              {d === 'easy' ? 'Facile' : d === 'medium' ? 'Moyen' : 'Difficile'}
            </button>
          ))}
        </div>
      )}

      {/* Ad Banner */}
      <AdBanner />

      {/* Canvas */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 py-3 gap-3" data-testid="canvas-container">
        <div className="rounded-2xl border-2 border-slate-200 bg-white shadow-lg overflow-hidden p-1">
          <canvas
            ref={canvasRef}
            data-testid="game-canvas"
            className="cursor-pointer block"
            style={{ touchAction: 'none' }}
            onClick={handleCanvasClick}
            onTouchStart={handleTouch}
          />
        </div>

        {/* Progress */}
        <div className="flex items-center gap-3 w-full max-w-sm" data-testid="progress-bar">
          <span className="text-xs font-bold text-slate-400 min-w-[32px]">{pct}%</span>
          <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-amber-400 to-yellow-400 rounded-full"
              style={{ width: `${pct}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
          <span className="text-xs text-slate-300">{lit}/{total}</span>
        </div>
      </div>

      {/* Action Bar */}
      <div className="bg-white border-t-2 border-slate-100 px-4 py-3 flex gap-2" data-testid="action-bar">
        <button
          data-testid="mark-btn"
          onClick={() => setMarkMode(!markMode)}
          className={`flex-1 flex items-center justify-center gap-1.5 py-3 rounded-xl border-2 text-sm font-bold transition-all
            active:translate-y-0.5
            ${markMode
              ? 'bg-red-50 border-red-300 text-red-500 shadow-[0_3px_0_0_#FCA5A5]'
              : 'bg-white border-slate-200 text-slate-500 shadow-[0_3px_0_0_#E2E8F0]'}`}
        >
          <XIcon className="w-4 h-4" /> Marquer
        </button>
        <button
          data-testid="undo-btn"
          onClick={handleUndo}
          className="flex-1 flex items-center justify-center gap-1.5 py-3 rounded-xl border-2 border-slate-200 bg-white text-slate-500 text-sm font-bold
            shadow-[0_3px_0_0_#E2E8F0] active:translate-y-0.5 transition-all"
        >
          <Undo2 className="w-4 h-4" /> Annuler
        </button>
        <button
          data-testid="check-btn"
          onClick={handleCheck}
          className="flex-1 flex items-center justify-center gap-1.5 py-3 rounded-xl border-2 border-slate-200 bg-white text-slate-500 text-sm font-bold
            shadow-[0_3px_0_0_#E2E8F0] active:translate-y-0.5 transition-all"
        >
          <CheckCircle className="w-4 h-4" /> Verifier
        </button>
        <button
          data-testid="newgame-btn"
          onClick={handleNewGame}
          className="flex-1 flex items-center justify-center gap-1.5 py-3 rounded-xl border-2 border-emerald-500 bg-emerald-400 text-white text-sm font-bold
            shadow-[0_3px_0_0_#059669] active:translate-y-1 active:shadow-none transition-all"
        >
          <RotateCcw className="w-4 h-4" /> Nouveau
        </button>
      </div>

      {/* Win Modal */}
      <WinModal
        show={showWin}
        time={elapsed}
        hintsUsed={hintsUsed}
        streak={streak}
        isDaily={isDaily}
        onNewGame={handleNewGame}
        onGoHome={onGoHome}
      />
    </div>
  );
};

export default GameScreen;
