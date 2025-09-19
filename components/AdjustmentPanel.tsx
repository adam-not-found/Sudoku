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
  let containerClasses = 'transition-colors duration-300';
  let buttonClasses = 'transition-all duration-200';

  if (isDarkMode) {
     containerClasses += isNotesMode ? ' bg-slate-600' : ' bg-slate-700';
     buttonClasses += isNotesMode 
       ? ' text-slate-300 hover:bg-slate-500/80 focus:bg-slate-500' 
       : ' text-slate-200 hover:bg-slate-600/80 focus:bg-slate-600';
  } else {
    containerClasses += isNotesMode ? ' bg-slate-300' : ' bg-slate-800';
    buttonClasses += isNotesMode 
      ? ' text-slate-700 hover:bg-slate-400/80 focus:bg-slate-400' 
      : ' text-slate-200 hover:bg-slate-700/80 focus:bg-slate-700';
  }


  return (
    <div className={`rounded-full p-2 flex justify-center items-center gap-1 shadow-lg w-full ${containerClasses}`}>
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
              transform active:scale-90
              ${buttonClasses}
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