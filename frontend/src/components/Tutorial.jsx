import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Lightbulb, X, ChevronRight, ChevronLeft, Check } from 'lucide-react';

const STEPS = [
  {
    title: 'Bienvenue dans Akari !',
    description: 'Akari est un puzzle de logique japonais. Ton objectif : illuminer toutes les cases blanches en posant des lampes.',
    visual: 'intro',
  },
  {
    title: 'Poser une lampe',
    description: 'Clique sur une case blanche pour y poser une lampe. La lampe eclaire toutes les cases dans les 4 directions (haut, bas, gauche, droite) jusqu\'aux murs noirs.',
    visual: 'place',
  },
  {
    title: 'Les murs noirs',
    description: 'Les cases noires bloquent la lumiere. Certaines ont un chiffre indiquant combien de lampes doivent etre adjacentes (pas en diagonale).',
    visual: 'walls',
  },
  {
    title: 'Pas de conflit !',
    description: 'Deux lampes ne peuvent pas s\'eclairer mutuellement ! Si deux lampes sont dans la meme ligne sans mur entre elles, c\'est une erreur.',
    visual: 'conflict',
  },
  {
    title: 'Compteur de lampes',
    description: 'Chaque niveau a un nombre maximum de lampes. Le compteur en haut diminue a chaque lampe posee. Utilise-les judicieusement !',
    visual: 'counter',
  },
  {
    title: 'Pret a jouer !',
    description: 'Eclaire toute la grille sans conflits pour gagner. Bonne chance !',
    visual: 'ready',
  },
];

const MiniGrid = ({ step }) => {
  const gridSize = 4;
  const cellSize = 48;
  const pad = 2;
  const w = gridSize * cellSize + pad * 2;

  const walls = step === 'intro' ? [] :
    step === 'place' ? [[0,3],[2,1]] :
    step === 'walls' ? [[1,1],[2,3]] :
    step === 'conflict' ? [[1,2]] :
    step === 'counter' ? [[0,2],[3,1]] :
    [[1,1],[2,3]];

  const wallNums = step === 'walls' ? {['1,1']: 2, ['2,3']: 1} : {};

  const lamps = step === 'intro' ? [] :
    step === 'place' ? [[1,1]] :
    step === 'walls' ? [[0,1],[1,2],[2,2]] :
    step === 'conflict' ? [[0,0],[0,3]] :
    step === 'counter' ? [[0,0],[1,2],[3,3]] :
    [[0,0],[1,3],[3,0],[2,2]];

  const conflictPairs = step === 'conflict' ? [[0,0],[0,3]] : [];

  const isWall = (r,c) => walls.some(([wr,wc])=>wr===r&&wc===c);
  const isLamp = (r,c) => lamps.some(([lr,lc])=>lr===r&&lc===c);
  const isConflict = (r,c) => conflictPairs.some(([cr,cc])=>cr===r&&cc===c);

  // Compute lit cells
  const litCells = new Set();
  for (const [lr,lc] of lamps) {
    litCells.add(`${lr},${lc}`);
    const dirs = [[0,1],[0,-1],[1,0],[-1,0]];
    for (const [dr,dc] of dirs) {
      let nr=lr+dr, nc=lc+dc;
      while(nr>=0&&nr<gridSize&&nc>=0&&nc<gridSize&&!isWall(nr,nc)) {
        litCells.add(`${nr},${nc}`);
        nr+=dr; nc+=dc;
      }
    }
  }

  return (
    <svg width={w} height={w} viewBox={`0 0 ${w} ${w}`} className="mx-auto">
      {Array.from({length: gridSize}, (_, r) =>
        Array.from({length: gridSize}, (_, c) => {
          const x = pad + c * cellSize;
          const y = pad + r * cellSize;
          const wall = isWall(r,c);
          const lamp = isLamp(r,c);
          const lit = litCells.has(`${r},${c}`);
          const conflict = isConflict(r,c);
          return (
            <g key={`${r}-${c}`}>
              <rect
                x={x} y={y} width={cellSize} height={cellSize}
                fill={wall ? '#334155' : conflict ? '#FCA5A5' : lit ? '#FFF4B2' : '#FFFFFF'}
                stroke="#CBD5E1" strokeWidth={1}
                rx={2}
              />
              {wall && wallNums[`${r},${c}`] !== undefined && (
                <text x={x+cellSize/2} y={y+cellSize/2} textAnchor="middle" dominantBaseline="central"
                  fill="white" fontSize="16" fontWeight="bold" fontFamily="Fredoka">
                  {wallNums[`${r},${c}`]}
                </text>
              )}
              {lamp && (
                <>
                  <circle cx={x+cellSize/2} cy={y+cellSize/2} r={cellSize*0.35}
                    fill={conflict ? '#FF6B6B' : '#FBBF24'} opacity={0.3} />
                  <circle cx={x+cellSize/2} cy={y+cellSize/2-2} r={cellSize*0.2}
                    fill={conflict ? '#FF6B6B' : '#F59E0B'} />
                  <rect x={x+cellSize*0.4} y={y+cellSize*0.55} width={cellSize*0.2} height={cellSize*0.08}
                    fill={conflict ? '#FF6B6B' : '#D97706'} rx={1} />
                </>
              )}
            </g>
          );
        })
      )}
    </svg>
  );
};

const Tutorial = ({ onClose }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const step = STEPS[currentStep];

  const next = () => {
    if (currentStep < STEPS.length - 1) setCurrentStep(currentStep + 1);
    else onClose();
  };

  const prev = () => {
    if (currentStep > 0) setCurrentStep(currentStep - 1);
  };

  return (
    <motion.div
      data-testid="tutorial-overlay"
      className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        data-testid="tutorial-modal"
        className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden border-2 border-slate-200"
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        transition={{ type: 'spring', damping: 20 }}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-amber-50 to-yellow-50 p-4 flex items-center justify-between border-b border-amber-100">
          <div className="flex items-center gap-2">
            <Lightbulb className="w-5 h-5 text-amber-500" />
            <span className="font-heading font-bold text-slate-700 text-sm">
              Tutoriel {currentStep + 1}/{STEPS.length}
            </span>
          </div>
          <button
            data-testid="tutorial-close-btn"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/80 flex items-center justify-center hover:bg-white transition-colors"
          >
            <X className="w-4 h-4 text-slate-400" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
            >
              <h3 className="font-heading text-xl font-bold text-slate-800 mb-2">{step.title}</h3>
              <p className="text-sm text-slate-500 mb-5 leading-relaxed">{step.description}</p>
              <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
                <MiniGrid step={step.visual} />
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Progress dots */}
        <div className="flex justify-center gap-1.5 pb-3">
          {STEPS.map((_, i) => (
            <div
              key={i}
              className={`w-2 h-2 rounded-full transition-all duration-300 ${
                i === currentStep ? 'bg-amber-400 w-6' : i < currentStep ? 'bg-amber-300' : 'bg-slate-200'
              }`}
            />
          ))}
        </div>

        {/* Buttons */}
        <div className="p-4 pt-0 flex gap-3">
          {currentStep > 0 && (
            <button
              data-testid="tutorial-prev-btn"
              onClick={prev}
              className="flex-1 py-3 rounded-2xl border-2 border-slate-200 text-slate-500 font-bold text-sm
                hover:bg-slate-50 active:translate-y-0.5 transition-all flex items-center justify-center gap-1"
            >
              <ChevronLeft className="w-4 h-4" /> Retour
            </button>
          )}
          <button
            data-testid="tutorial-next-btn"
            onClick={next}
            className={`flex-1 py-3 rounded-2xl border-2 border-slate-800 font-bold text-sm
              shadow-[0_4px_0_0_#1E293B] active:translate-y-1 active:shadow-none transition-all
              flex items-center justify-center gap-1
              ${currentStep === STEPS.length - 1
                ? 'bg-emerald-400 text-white border-emerald-600 shadow-[0_4px_0_0_#059669]'
                : 'bg-amber-400 text-slate-800'}`}
          >
            {currentStep === STEPS.length - 1 ? (
              <><Check className="w-4 h-4" /> Commencer</>
            ) : (
              <>Suivant <ChevronRight className="w-4 h-4" /></>
            )}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default Tutorial;
