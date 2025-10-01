/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React from 'react';

export const NumberPad = ({ onNumberClick, isNotesMode, isDarkMode }) => {
  const containerBgClass = isNotesMode
    ? (isDarkMode ? 'bg-slate-600' : 'bg-slate-700')
    : (isDarkMode ? 'bg-slate-700' : 'bg-slate-800');
  const buttonHoverFocusClass = isDarkMode
    ? 'hover:bg-slate-600/80 focus:bg-slate-600'
    : 'hover:bg-slate-700/80 focus:bg-slate-700';
  const baseButtonClasses = `
    transition-all duration-200 transform active:scale-90
    text-slate-200 ${buttonHoverFocusClass}
  `;

  return (
    <div className={`rounded-full p-1 flex justify-around items-center w-full transition-all duration-300 shadow-lg ${containerBgClass}`}>
      {Array.from({ length: 9 }).map((_, i) => {
        const num = i + 1;
        return (
          <button
            key={num}
            onClick={() => onNumberClick(num)}
            className={`
              w-12 h-12 sm:w-16 sm:h-16 
              flex items-center justify-center
              font-semibold text-3xl sm:text-4xl
              rounded-full 
              focus:outline-none 
              ${baseButtonClasses}
            `}
            aria-label={`Enter number ${num}`}
          >
            {num}
          </button>
        );
      })}
    </div>
  );
};