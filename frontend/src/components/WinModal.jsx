import React, { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, RotateCcw, Home, Clock, Lightbulb, Flame } from 'lucide-react';
import confetti from 'canvas-confetti';

const WinModal = ({ show, time, hintsUsed, streak, isDaily, onNewGame, onGoHome }) => {
  const confettiFired = useRef(false);

  useEffect(() => {
    if (show && !confettiFired.current) {
      confettiFired.current = true;
      const duration = 2000;
      const end = Date.now() + duration;
      const colors = ['#FBBF24', '#F59E0B', '#10B981', '#3B82F6', '#8B5CF6'];
      const frame = () => {
        confetti({
          particleCount: 4,
          angle: 60,
          spread: 55,
          origin: { x: 0, y: 0.6 },
          colors,
        });
        confetti({
          particleCount: 4,
          angle: 120,
          spread: 55,
          origin: { x: 1, y: 0.6 },
          colors,
        });
        if (Date.now() < end) requestAnimationFrame(frame);
      };
      frame();
    }
    if (!show) confettiFired.current = false;
  }, [show]);

  const mins = Math.floor(time / 60);
  const secs = time % 60;
  const timeStr = mins > 0 ? `${mins}m${secs}s` : `${secs}s`;

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          data-testid="win-modal-overlay"
          className="fixed inset-0 bg-black/30 z-50 flex items-end sm:items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            data-testid="win-modal"
            className="bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl w-full max-w-md border-2 border-slate-200 overflow-hidden"
            initial={{ y: 200, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 200, opacity: 0 }}
            transition={{ type: 'spring', damping: 20, stiffness: 300 }}
          >
            {/* Handle */}
            <div className="flex justify-center pt-3 pb-1 sm:hidden">
              <div className="w-10 h-1 rounded-full bg-slate-200" />
            </div>

            {/* Trophy Section */}
            <div className="text-center pt-6 pb-4">
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: 'spring', damping: 10, delay: 0.2 }}
                className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-b from-amber-100 to-amber-50 border-2 border-amber-200 mb-4"
              >
                <Trophy className="w-10 h-10 text-amber-500" />
              </motion.div>
              <h2 className="font-heading text-2xl font-bold text-slate-800">
                {isDaily ? 'Defi quotidien reussi !' : 'Bravo !'}
              </h2>
              <p className="text-sm text-slate-500 mt-1">
                {isDaily ? `Streak : ${streak} jours` : 'Tu as illumine toute la grille !'}
              </p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-3 px-6 pb-5">
              <div className="bg-slate-50 rounded-2xl p-3 text-center border border-slate-100">
                <Clock className="w-5 h-5 text-blue-400 mx-auto mb-1" />
                <div className="font-heading font-bold text-lg text-slate-700" data-testid="win-time">{timeStr}</div>
                <div className="text-[10px] text-slate-400 uppercase tracking-wider">Temps</div>
              </div>
              <div className="bg-slate-50 rounded-2xl p-3 text-center border border-slate-100">
                <Lightbulb className="w-5 h-5 text-amber-400 mx-auto mb-1" />
                <div className="font-heading font-bold text-lg text-slate-700" data-testid="win-hints">
                  {hintsUsed > 0 ? `-${hintsUsed}` : '0'}
                </div>
                <div className="text-[10px] text-slate-400 uppercase tracking-wider">Indices</div>
              </div>
              <div className="bg-slate-50 rounded-2xl p-3 text-center border border-slate-100">
                <Flame className="w-5 h-5 text-orange-400 mx-auto mb-1" />
                <div className="font-heading font-bold text-lg text-slate-700" data-testid="win-streak">{streak}</div>
                <div className="text-[10px] text-slate-400 uppercase tracking-wider">Streak</div>
              </div>
            </div>

            {/* Buttons */}
            <div className="px-6 pb-6 flex gap-3">
              <button
                data-testid="win-home-btn"
                onClick={onGoHome}
                className="flex-1 py-3.5 rounded-2xl border-2 border-slate-200 text-slate-500 font-bold text-sm
                  hover:bg-slate-50 active:translate-y-0.5 transition-all flex items-center justify-center gap-2"
              >
                <Home className="w-4 h-4" /> Accueil
              </button>
              <button
                data-testid="win-newgame-btn"
                onClick={onNewGame}
                className="flex-1 py-3.5 rounded-2xl border-2 border-emerald-600 bg-emerald-400 text-white font-bold text-sm
                  shadow-[0_4px_0_0_#059669] active:translate-y-1 active:shadow-none transition-all
                  flex items-center justify-center gap-2"
              >
                <RotateCcw className="w-4 h-4" /> Nouveau
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default WinModal;
