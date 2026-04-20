import React from 'react';
import { motion } from 'framer-motion';
import { Sun, Leaf, TreePine, Flame, Palette, Map, Lightbulb } from 'lucide-react';

const HomeScreen = ({ onStartGame, streak }) => {
  const menuItems = [
    { mode: 'classic', diff: 'daily', icon: Sun, title: 'Defi du jour', sub: 'Meme grille pour tous', featured: true, color: 'amber' },
    { mode: 'classic', diff: 'easy', icon: Leaf, title: 'Facile', sub: '6x6 - Illimite', color: 'emerald' },
    { mode: 'classic', diff: 'medium', icon: TreePine, title: 'Moyen', sub: '8x8 - Illimite', color: 'blue' },
    { mode: 'classic', diff: 'hard', icon: Flame, title: 'Difficile', sub: '10x10 - Illimite', color: 'red' },
    { mode: 'color', diff: 'medium', icon: Palette, title: 'Colore', sub: 'Lumieres de couleurs', color: 'purple' },
    { mode: 'regional', diff: 'medium', icon: Map, title: 'Regional', sub: '1 ampoule par zone', color: 'teal' },
  ];

  const colorMap = {
    amber: 'from-amber-50 to-yellow-50 border-amber-200 hover:border-amber-300',
    emerald: 'from-emerald-50 to-green-50 border-emerald-200 hover:border-emerald-300',
    blue: 'from-blue-50 to-sky-50 border-blue-200 hover:border-blue-300',
    red: 'from-red-50 to-orange-50 border-red-200 hover:border-red-300',
    purple: 'from-purple-50 to-violet-50 border-purple-200 hover:border-purple-300',
    teal: 'from-teal-50 to-cyan-50 border-teal-200 hover:border-teal-300',
  };

  const iconColorMap = {
    amber: 'text-amber-500 bg-amber-100',
    emerald: 'text-emerald-500 bg-emerald-100',
    blue: 'text-blue-500 bg-blue-100',
    red: 'text-red-500 bg-red-100',
    purple: 'text-purple-500 bg-purple-100',
    teal: 'text-teal-500 bg-teal-100',
  };

  return (
    <div data-testid="home-screen" className="min-h-screen bg-gradient-to-b from-slate-50 to-white flex flex-col items-center px-4 py-8">
      {/* Logo */}
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: 'spring', damping: 15 }}
        className="text-center mb-8"
      >
        <motion.div
          animate={{ y: [0, -6, 0] }}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
          className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-gradient-to-b from-amber-100 to-amber-50 border-2 border-amber-200 shadow-lg shadow-amber-100/50 mb-4"
        >
          <Lightbulb className="w-10 h-10 text-amber-500" />
        </motion.div>
        <h1 className="font-heading text-4xl sm:text-5xl font-bold text-slate-800 tracking-tight">
          Akari
        </h1>
        <p className="text-slate-400 text-sm tracking-widest uppercase mt-1">Puzzle de lumiere</p>
      </motion.div>

      {/* Streak Bar */}
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.1 }}
        data-testid="streak-bar"
        className="w-full max-w-sm bg-white rounded-2xl border-2 border-slate-200 shadow-[0_4px_0_0_#E2E8F0] p-4 flex items-center gap-3 mb-6"
      >
        <div className="w-12 h-12 rounded-xl bg-orange-100 flex items-center justify-center">
          <Flame className="w-6 h-6 text-orange-500" />
        </div>
        <div className="flex-1">
          <div className="font-heading text-2xl font-bold text-slate-800" data-testid="streak-count">{streak}</div>
          <div className="text-xs text-slate-400 uppercase tracking-wider">jours consecutifs</div>
        </div>
      </motion.div>

      {/* Menu Grid */}
      <div className="w-full max-w-sm space-y-3">
        {menuItems.map((item, i) => {
          const Icon = item.icon;
          const featured = item.featured;
          return (
            <motion.button
              key={`${item.mode}-${item.diff}`}
              data-testid={`menu-btn-${item.mode}-${item.diff}`}
              initial={{ x: i % 2 === 0 ? -20 : 20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.1 + i * 0.05 }}
              onClick={() => onStartGame(item.mode, item.diff)}
              className={`w-full flex items-center gap-4 p-4 rounded-2xl border-2 bg-gradient-to-r
                ${colorMap[item.color]}
                shadow-[0_4px_0_0_#E2E8F0] active:translate-y-1 active:shadow-none
                transition-all duration-150 text-left group
                ${featured ? 'py-5' : ''}`}
            >
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${iconColorMap[item.color]} 
                group-hover:scale-110 transition-transform`}>
                <Icon className="w-6 h-6" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-heading font-bold text-slate-700 text-base flex items-center gap-2">
                  {item.title}
                  {featured && (
                    <span className="text-[10px] bg-amber-400 text-white px-2 py-0.5 rounded-full font-bold uppercase">
                      Daily
                    </span>
                  )}
                </div>
                <div className="text-xs text-slate-400 mt-0.5">{item.sub}</div>
              </div>
              <div className="text-slate-300 group-hover:text-slate-400 transition-colors">
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <path d="M7 5l5 5-5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
            </motion.button>
          );
        })}
      </div>

      {/* Bottom Ad Banner Space */}
      <div className="w-full max-w-sm mt-6">
        <div
          data-testid="home-ad-banner"
          className="border-2 border-dashed border-slate-200 bg-slate-50/50 rounded-2xl p-6 flex flex-col items-center justify-center"
        >
          <span className="text-[10px] font-bold uppercase tracking-widest text-slate-300 bg-white px-2 py-0.5 rounded-full border border-slate-200 mb-2">
            Sponsorise
          </span>
          <div className="text-slate-300 text-xs">Espace Publicitaire</div>
        </div>
      </div>
    </div>
  );
};

export default HomeScreen;
