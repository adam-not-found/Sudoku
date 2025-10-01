/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React, { useState, useEffect } from 'react';

const StatItem = ({ label, value }) => (
  <div className="flex flex-col items-center justify-center">
    <span className="text-sm font-medium text-slate-600 uppercase tracking-wider">{label}</span>
    <span className="text-3xl font-bold text-slate-900">{value}</span>
  </div>
);

export const VictoryScreen = ({ message, moves, time, mistakes }) => {
  const [showContainer, setShowContainer] = useState(false);
  const [showTitle, setShowTitle] = useState(false);
  const [showStats, setShowStats] = useState(false);

  useEffect(() => {
    const containerTimer = setTimeout(() => setShowContainer(true), 100);
    const titleTimer = setTimeout(() => setShowTitle(true), 300);
    const statsTimer = setTimeout(() => setShowStats(true), 500);
    return () => {
      clearTimeout(containerTimer);
      clearTimeout(titleTimer);
      clearTimeout(statsTimer);
    };
  }, []);

  const getTitleSizeClass = () => {
    if (message.length > 35) return 'text-xl sm:text-2xl';
    if (message.length > 20) return 'text-2xl sm:text-3xl';
    return 'text-3xl';
  };

  return (
    <div className="absolute inset-0 z-[100] pointer-events-none">
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
            flex justify-center items-center gap-x-8 sm:gap-x-12
            transition-all duration-500 ease-in-out
            ${showStats ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}
          `}>
            <StatItem label="Time" value={time} />
            <StatItem label="Moves" value={moves} />
            <StatItem label="Mistakes" value={mistakes} />
          </div>
        </div>
      </div>
    </div>
  );
};
