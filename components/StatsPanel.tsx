import React, { useState, useEffect } from 'react';

function StatCard({ label, value }) {
    return (
      <div className={`flex flex-col items-center justify-center p-3 rounded-lg bg-[var(--color-ui-bg-secondary)]`}>
        <span className={`text-3xl font-bold text-[var(--color-text-primary)]`}>{value}</span>
        <span className={`text-xs font-medium uppercase tracking-wider text-[var(--color-text-secondary)]`}>{label}</span>
      </div>
    );
}

export default function StatsPanel({ isOpen, onClose, stats }) {
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
      <div onClick={(e) => e.stopPropagation()} className={`w-full max-w-md m-4 p-6 rounded-2xl shadow-2xl border flex flex-col gap-6 transform transition-all duration-300 ease-in-out ${isOpen ? 'opacity-100 scale-100' : 'opacity-0 scale-95'} bg-[var(--color-ui-bg-translucent)] border-[var(--color-ui-border)] backdrop-blur-sm text-[var(--color-text-primary)]`}>
        <h2 className="text-2xl font-bold text-center">Statistics</h2>
        <div className="grid grid-cols-3 gap-3">
            <StatCard label="Played" value={stats.gamesPlayed} />
            <StatCard label="Wins" value={stats.gamesWon} />
            <StatCard label="High Score" value={(stats.highScore || 0).toLocaleString()} />
            <StatCard label="Win %" value={`${winPercent}%`} />
            <StatCard label="Avg. Moves" value={stats.gamesWon > 0 ? (stats.totalMoves / stats.gamesWon).toFixed(1) : '0'} />
            <StatCard label="Avg. Mistakes" value={stats.gamesWon > 0 ? (stats.totalMistakes / stats.gamesWon).toFixed(1) : '0'} />
        </div>
        {playedDifficulties.length > 0 && currentStats && (
          <div className="flex flex-col gap-3">
            <h3 className="text-lg font-semibold text-center mt-2">By Difficulty</h3>
            <div className="flex justify-center gap-2">
                {playedDifficulties.map(({ id, l }) => 
                    <button key={id} onClick={() => setActiveTab(id)} className={`text-center font-semibold py-2 px-4 rounded-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] focus:ring-offset-2 ring-offset-[var(--color-ui-bg)] text-sm ${activeTab === id ? 'bg-[var(--color-accent)] text-[var(--color-accent-text)] shadow-md' : 'bg-[var(--color-btn-secondary-bg)] hover:bg-[var(--color-btn-secondary-bg-hover)]'}`} aria-pressed={activeTab === id}>{l}</button>
                )}
            </div>
            <div className="grid grid-cols-3 gap-3">
                <StatCard label="Wins" value={currentStats.wins} />
                <StatCard label="Best Time" value={formatTime(currentStats.bestTime)} />
                <StatCard label="Avg. Time" value={formatTime(currentStats.wins > 0 ? currentStats.totalTime / currentStats.wins : 0)} />
            </div>
          </div>
        )}
        <div className="flex justify-center mt-2">
            <button onClick={onClose} className={`font-bold py-2 px-6 rounded-lg shadow-md transition-colors bg-[var(--color-accent)] hover:bg-[var(--color-accent-hover)] text-[var(--color-accent-text)]`}>Done</button>
        </div>
      </div>
    </div>
  );
}