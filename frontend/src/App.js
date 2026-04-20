import React, { useState, useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';
import HomeScreen from '@/components/HomeScreen';
import GameScreen from '@/components/GameScreen';
import Tutorial from '@/components/Tutorial';
import '@/App.css';

const TODAY = new Date().toISOString().split('T')[0];

function App() {
  const [screen, setScreen] = useState('home');
  const [gameMode, setGameMode] = useState('classic');
  const [gameDiff, setGameDiff] = useState('easy');

  // Persistent state via localStorage
  const [streak, setStreak] = useState(() => parseInt(localStorage.getItem('akari_streak') || '0'));
  const [lastPlay, setLastPlay] = useState(() => localStorage.getItem('akari_lastPlay') || '');
  const [hints, setHints] = useState(() => parseInt(localStorage.getItem('akari_hints') || '3'));
  const [tutorialDone, setTutorialDone] = useState(() => localStorage.getItem('akari_tutorialDone') === 'true');
  const [showTutorial, setShowTutorial] = useState(false);
  const [pendingGame, setPendingGame] = useState(null);

  // Check streak on mount
  useEffect(() => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yStr = yesterday.toISOString().split('T')[0];
    if (lastPlay !== TODAY && lastPlay !== yStr && lastPlay !== '') {
      setStreak(0);
      localStorage.setItem('akari_streak', '0');
    }
  }, [lastPlay]);

  const startGame = (mode, diff) => {
    if (!tutorialDone) {
      setPendingGame({ mode, diff });
      setShowTutorial(true);
      return;
    }
    setGameMode(mode);
    setGameDiff(diff);
    setScreen('game');
  };

  const closeTutorial = () => {
    setShowTutorial(false);
    setTutorialDone(true);
    localStorage.setItem('akari_tutorialDone', 'true');
    if (pendingGame) {
      setGameMode(pendingGame.mode);
      setGameDiff(pendingGame.diff);
      setScreen('game');
      setPendingGame(null);
    }
  };

  const goHome = () => {
    setScreen('home');
  };

  const useHint = () => {
    if (hints > 0) {
      const newHints = hints - 1;
      setHints(newHints);
      localStorage.setItem('akari_hints', String(newHints));
    }
  };

  const handleWin = (isDaily) => {
    if (isDaily && lastPlay !== TODAY) {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yStr = yesterday.toISOString().split('T')[0];
      let newStreak;
      if (lastPlay === yStr || streak === 0) {
        newStreak = streak + 1;
      } else {
        newStreak = 1;
      }
      setStreak(newStreak);
      setLastPlay(TODAY);
      localStorage.setItem('akari_streak', String(newStreak));
      localStorage.setItem('akari_lastPlay', TODAY);
    }
  };

  return (
    <div className="App">
      {screen === 'home' && (
        <HomeScreen
          onStartGame={startGame}
          streak={streak}
        />
      )}
      {screen === 'game' && (
        <GameScreen
          mode={gameMode}
          diff={gameDiff}
          streak={streak}
          hints={hints}
          onGoHome={goHome}
          onUseHint={useHint}
          onWin={handleWin}
        />
      )}
      <AnimatePresence>
        {showTutorial && <Tutorial onClose={closeTutorial} />}
      </AnimatePresence>
    </div>
  );
}

export default App;
