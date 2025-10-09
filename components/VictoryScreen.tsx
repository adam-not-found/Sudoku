import React, { useState, useEffect } from 'react';

function StatItem({ label, value }) { 
    return (
      <div className="flex flex-col items-center">
        <span className="text-sm font-medium text-[var(--color-victory-stat-label)] uppercase tracking-wider">{label}</span>
        <span className="text-3xl font-bold text-[var(--color-victory-stat-value)]">{value}</span>
      </div>
    );
}

export default function VictoryScreen({ message, moves, time, mistakes, hints }) {
  const [showContainer, setShowContainer] = useState(false);
  const [showTitle, setShowTitle] = useState(false);
  const [showStats, setShowStats] = useState(false);

  useEffect(() => {
    const t1 = setTimeout(() => setShowContainer(true), 100);
    const t2 = setTimeout(() => setShowTitle(true), 300);
    const t3 = setTimeout(() => setShowStats(true), 500);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, []);

  const titleSize = message.length > 35 ? 'text-xl sm:text-2xl' : (message.length > 20 ? 'text-2xl sm:text-3xl' : 'text-3xl');
  
  return (
    <div className="absolute inset-0 z-[100] flex items-center justify-center pointer-events-none">
      <div className={`w-auto min-w-[320px] max-w-sm flex flex-col items-center gap-6 bg-[var(--color-victory-bg)] backdrop-blur p-8 rounded-2xl shadow-2xl transition-all duration-500 ease-in-out ${showContainer ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 -translate-y-4 scale-95'}`}>
        <h2 className={`text-center font-bold text-[var(--color-victory-title)] transition-all duration-500 ease-in-out ${titleSize} ${showTitle ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'}`}>{message}</h2>
        <div className={`flex justify-center gap-x-6 sm:gap-x-8 transition-all duration-500 ease-in-out ${showStats ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
          <StatItem label="Time" value={time} />
          <StatItem label="Moves" value={moves} />
          <StatItem label="Mistakes" value={mistakes} />
          <StatItem label="Hints" value={hints} />
        </div>
      </div>
    </div>
  );
}