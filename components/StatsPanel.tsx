/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React, { useState, useEffect } from 'react';
import { Difficulty } from '../services/sudokuGenerator';
import { Stats as StatsData } from '../App';

interface StatsPanelProps {
  isOpen: boolean;
  onClose: () => void;
  stats: StatsData;
  isDarkMode: boolean;
}

const difficulties: { id: Difficulty; label: string }[] = [
  { id: 'easy', label: 'Easy' },
  { id: 'medium', label: 'Medium' },
  { id: 'hard', label: 'Hard' },
  { id: 'professional', label: 'Pro' },
];

const StatCard: React.FC<{ label: string; value: string | number, isDarkMode: boolean }> = ({ label, value, isDarkMode }) => (
  <div className={`flex flex-col items-center justify-center p-3 rounded-lg ${isDarkMode ? 'bg-slate-700' : 'bg-slate-100'}`}>
    <span className={`text-3xl font-bold ${isDarkMode ? 'text-slate-100' : 'text-slate-800'}`}>{value}</span>
    <span className={`text-xs font-medium uppercase tracking-wider ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>{label}</span>
  </div>
);

const formatTime = (milliseconds: number | null) => {
    if (milliseconds === null || milliseconds <= 0) return '-:--';
    const totalSeconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
};

const StatsPanel: React.FC<StatsPanelProps> = ({ isOpen, onClose, stats, isDarkMode }) => {
  const playedDifficulties = difficulties.filter(d => stats.byDifficulty[d.id].wins > 0);
  const [activeTab, setActiveTab] = useState<Difficulty | null>(null);

  useEffect(() => {
    const currentlyPlayed = difficulties.filter(d => stats.byDifficulty[d.id].wins > 0);
    if (currentlyPlayed.length > 0) {
      if (!activeTab || !currentlyPlayed.some(d => d.id === activeTab)) {
        setActiveTab(currentlyPlayed[0].id);
      }
    } else {
      setActiveTab(null);
    }
  }, [stats, activeTab]);

  if (!isOpen) return null;
  
  const handleClose = () => {
    onClose();
  };

  const modalBgClass = isDarkMode ? 'bg-slate-800/90 border-slate-600 backdrop-blur-sm' : 'bg-white/90 border-slate-200 backdrop-blur-sm';
  const modalTextClass = isDarkMode ? 'text-slate-100' : 'text-slate-800';
  const doneButtonClass = isDarkMode ? 'bg-sky-600 hover:bg-sky-500 text-white' : 'bg-sky-500 hover:bg-sky-600 text-white';
  
  const tabButtonBase = 'text-center font-semibold py-2 px-4 rounded-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2 text-sm';
  const tabSelectedClasses = isDarkMode 
    ? 'bg-sky-500 text-white shadow-md' 
    : 'bg-sky-600 text-white shadow-md';
  const tabUnselectedClasses = isDarkMode 
    ? 'bg-slate-700 hover:bg-slate-600' 
    : 'bg-slate-200 hover:bg-slate-300';
  
  const winPercentage = stats.gamesPlayed > 0 ? Math.round((stats.gamesWon / stats.gamesPlayed) * 100) : 0;
  const avgMoves = stats.gamesWon > 0 ? (stats.totalMoves / stats.gamesWon).toFixed(1) : '0.0';
  const avgMistakes = stats.gamesWon > 0 ? (stats.totalMistakes / stats.gamesWon).toFixed(1) : '0.0';

  const currentDifficultyStats = activeTab ? stats.byDifficulty[activeTab] : null;
  const averageTime = currentDifficultyStats && currentDifficultyStats.wins > 0 ? currentDifficultyStats.totalTime / currentDifficultyStats.wins : 0;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/30" aria-modal="true" role="dialog" onClick={handleClose}>
      <div 
        className={`
            w-full max-w-md m-4 p-6 rounded-2xl shadow-2xl border
            flex flex-col gap-6
            transform transition-all duration-300 ease-in-out
            ${isOpen ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}
            ${modalBgClass} ${modalTextClass}
        `}
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-2xl font-bold text-center">Statistics</h2>

        <>
            {/* Overall Stats */}
            <div className="grid grid-cols-4 gap-3 text-center">
                <StatCard label="Played" value={stats.gamesPlayed} isDarkMode={isDarkMode}/>
                <StatCard label="Win %" value={`${winPercentage}%`} isDarkMode={isDarkMode}/>
                <StatCard label="Avg. Moves" value={avgMoves} isDarkMode={isDarkMode}/>
                <StatCard label="Avg. Mistakes" value={avgMistakes} isDarkMode={isDarkMode}/>
            </div>

            {/* Difficulty Stats - Only show if at least one difficulty has been won */}
            {playedDifficulties.length > 0 && activeTab && currentDifficultyStats && (
              <div className="flex flex-col gap-3">
                  <div className="flex justify-center gap-2">
                      {playedDifficulties.map(({ id, label }) => (
                          <button 
                              key={id} 
                              onClick={() => setActiveTab(id)}
                              className={`${tabButtonBase} ${activeTab === id ? tabSelectedClasses : tabUnselectedClasses}`}
                              aria-pressed={activeTab === id}
                          >
                              {label}
                          </button>
                      ))}
                  </div>

                  <div className="grid grid-cols-3 gap-3 text-center">
                      <StatCard label="Wins" value={currentDifficultyStats.wins} isDarkMode={isDarkMode} />
                      <StatCard label="Best Time" value={formatTime(currentDifficultyStats.bestTime)} isDarkMode={isDarkMode} />
                      <StatCard label="Avg. Time" value={formatTime(averageTime)} isDarkMode={isDarkMode} />
                  </div>
              </div>
            )}
            
            {/* Actions */}
            <div className="flex justify-center items-center mt-2">
              <button
                onClick={handleClose}
                className={`font-bold py-2 px-6 rounded-lg shadow-md transition-colors ${doneButtonClass}`}
              >
                Done
              </button>
            </div>
        </>
      </div>
    </div>
  );
};

export default StatsPanel;