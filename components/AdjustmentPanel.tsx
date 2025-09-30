/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React from 'react';

interface NumberPadProps {
  onNumberClick: (num: number) => void;
  isNotesMode: boolean;
  isDarkMode: boolean;
}

const NumberPad: React.FC<NumberPadProps> = ({ onNumberClick, isNotesMode, isDarkMode }) => {
  // When notes mode is on, the background becomes a slightly lighter shade.
  const containerBgClass = isNotesMode
    ? (isDarkMode ? 'bg-slate-600' : 'bg-slate-700')
    : (isDarkMode ? 'bg-slate-700' : 'bg-slate-800');
  
  // Button styles are now consistent
  const buttonHoverFocusClass = isDarkMode
    ? 'hover:bg-slate-600/80 focus:bg-slate-600'
    : 'hover:bg-slate-700/80 focus:bg-slate-700';

  const baseButtonClasses = `
    transition-all duration-200 transform active:scale-90
    text-slate-200 ${buttonHoverFocusClass}
  `;

  return (
    <div className={`rounded-full p-2 flex justify-center items-center gap-1 w-full transition-all duration-300 shadow-lg ${containerBgClass}`}>
      {Array.from({ length: 9 }).map((_, i) => {
        const num = i + 1;
        
        return (
          <button
            key={num}
            onClick={() => onNumberClick(num)}
            className={`
              w-10 h-10 sm:w-12 sm:h-12 
              flex items-center justify-center
              font-semibold text-3xl 
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

export default NumberPad;