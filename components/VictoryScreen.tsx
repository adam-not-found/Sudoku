/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React, { useState, useEffect } from 'react';

interface VictoryScreenProps {
  message: string;
  moves: number;
  time: string;
  mistakes: number;
  hintsUsed: number;
}

const StatItem: React.FC<{ label: string; value: string | number }> = ({ label, value }) => (
  <div className="flex flex-col items-center justify-center">
    <span className="text-sm font-medium text-slate-600 uppercase tracking-wider">{label}</span>
    <span className="text-3xl font-bold text-slate-900">{value}</span>
  </div>
);

const VictoryScreen: React.FC<VictoryScreenProps> = ({ message, moves, time, mistakes, hintsUsed }) => {
  const [showContainer, setShowContainer] = useState(false);
  const [showTitle, setShowTitle] = useState(false);
  const [showStats, setShowStats] = useState(false);

  useEffect(() => {
    const containerTimer = setTimeout(() => setShowContainer(true), 100);
    const titleTimer = setTimeout(() => setShowTitle(true), 300); // Stagger title
    const statsTimer = setTimeout(() => setShowStats(true), 500); // Stagger stats

    return () => {
      clearTimeout(containerTimer);
      clearTimeout(titleTimer);
      clearTimeout(statsTimer);
    };
  }, []);

  const getTitleSizeClass = () => {
    // For very long messages
    if (message.length > 35) {
      return 'text-xl sm:text-2xl';
    }
    // For medium messages
    if (message.length > 20) {
      return 'text-2xl sm:text-3xl';
    }
    // For short messages
    return 'text-3xl';
  };

  return (
    <div className="absolute inset-0 z-[100] pointer-events-none">
      {/* Centering container */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div
          className={`
            w-auto min-w-[320px] max-w-sm flex flex-col items-center justify-center gap-6
            bg-sky-200/65 backdrop-blur p-8 rounded-2xl shadow-2xl
            transition-all duration-500 ease-in-out
            ${showContainer ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 -translate-y-4 scale-95'}
          `}
        >
          <h2
            className={`text-center font-bold text-slate-800 transition-all duration-500 ease-in-out ${getTitleSizeClass()} ${
              showTitle ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'
            }`}
          >
            {message}
          </h2>

          <div className={`
            grid grid-cols-2 gap-x-16 gap-y-8
            transition-all duration-500 ease-in-out
            ${showStats ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}
          `}>
            <StatItem label="Time" value={time} />
            <StatItem label="Moves" value={moves} />
            <StatItem label="Mistakes" value={mistakes} />
            <StatItem label="Hints" value={hintsUsed} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default VictoryScreen;