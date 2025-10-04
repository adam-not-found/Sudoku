import React, { useState, useEffect } from 'react';

function StatCard({ label, value, isDarkMode }) {
    return (
      <div className={`flex flex-col items-center justify-center p-3 rounded-lg ${isDarkMode ? 'bg-slate-700' : 'bg-slate-100'}`}>
        <span className={`text-3xl font-bold ${isDarkMode ? 'text-slate-100' : 'text-slate-800'}`}>{value}</span>
        <span className={`text-xs font-medium uppercase tracking-wider ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>{label}</span>
      </div>
    );
}

export default function StatsPanel({ isOpen, onClose, stats, isDarkMode }) {
  const playedDifficulties = [{id:'easy',l:'Easy'},{id:'medium',l:'Medium'},{id:'hard',l:'Hard'},{id:'professional',l:'Pro'}].filter(d => stats.byDifficulty[d.id].wins > 0);
  const [activeTab, setActiveTab] = useState(null);

  useEffect(() => { 
    if (playedDifficulties.length > 0 && (!activeTab || !playedDifficulties.some(d => d.id === activeTab))) {
        setActiveTab(playedDifficulties[0].id);
    } else if (playedDifficulties.length === 0) {
        setActiveTab(null);
    }
  }, [stats, activeTab, playedDifficulties]);

  if (!isOpen) return null;
  
  const formatTime = (ms) => ms === null || ms <= 0 ? '-:--' : `${Math.floor(ms/60000)}:${(Math.floor(ms/1000)%60).toString().padStart(2,'0')}`;
  
  const winPercent = stats.gamesPlayed > 0 ? Math.round((stats.gamesWon / stats.gamesPlayed) * 100) : 0;
  const currentStats = activeTab ? stats.byDifficulty[activeTab] : null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/30" aria-modal="true" role="dialog" onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()} className={`w-full max-w-md m-4 p-6 rounded-2xl shadow-2xl border flex flex-col gap-6 transform transition-all duration-300 ease-in-out ${isOpen ? 'opacity-100 scale-100' : 'opacity-0 scale-95'} ${isDarkMode ? 'bg-slate-800/90 border-slate-600 backdrop-blur-sm text-slate-100' : 'bg-white/90 border-slate-200 backdrop-blur-sm text-slate-800'}`}>
        <h2 className="text-2xl font-bold text-center">Statistics</h2>
        <div className="grid grid-cols-4 gap-3">
            <StatCard label="Played" value={stats.gamesPlayed} isDarkMode={isDarkMode} />
            <StatCard label="Win %" value={`${winPercent}%`} isDarkMode={isDarkMode} />
            <StatCard label="Avg. Moves" value={stats.gamesWon > 0 ? (stats.totalMoves / stats.gamesWon).toFixed(1) : '0'} isDarkMode={isDarkMode} />
            <StatCard label="Avg. Mistakes" value={stats.gamesWon > 0 ? (stats.totalMistakes / stats.gamesWon).toFixed(1) : '0'} isDarkMode={isDarkMode} />
        </div>
        {playedDifficulties.length > 0 && currentStats && (
          <div className="flex flex-col gap-3">
            <div className="flex justify-center gap-2">
                {playedDifficulties.map(({ id, l }) => 
                    <button key={id} onClick={() => setActiveTab(id)} className={`text-center font-semibold py-2 px-4 rounded-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2 text-sm ${activeTab === id ? (isDarkMode ? 'bg-sky-500 text-white shadow-md' : 'bg-sky-600 text-white shadow-md') : (isDarkMode ? 'bg-slate-700 hover:bg-slate-600' : 'bg-slate-200 hover:bg-slate-300')}`} aria-pressed={activeTab === id}>{l}</button>
                )}
            </div>
            <div className="grid grid-cols-3 gap-3">
                <StatCard label="Wins" value={currentStats.wins} isDarkMode={isDarkMode} />
                <StatCard label="Best Time" value={formatTime(currentStats.bestTime)} isDarkMode={isDarkMode} />
                <StatCard label="Avg. Time" value={formatTime(currentStats.wins > 0 ? currentStats.totalTime / currentStats.wins : 0)} isDarkMode={isDarkMode} />
            </div>
          </div>
        )}
        <div className="flex justify-center mt-2">
            <button onClick={onClose} className={`font-bold py-2 px-6 rounded-lg shadow-md transition-colors ${isDarkMode ? 'bg-sky-600 hover:bg-sky-500 text-white' : 'bg-sky-500 hover:bg-sky-600 text-white'}`}>Done</button>
        </div>
      </div>
    </div>
  );
}
