/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React, { useState, useEffect, useRef } from 'react';

export interface CellData {
  value: number; // 0 for empty
  isInitial: boolean;
  isWrong: boolean;
  userNotes: Set<number>;
  autoNotes: Set<number>;
}

interface CellProps {
  data: CellData;
  isSelected: boolean;
  isPeer: boolean;
  isHighlighted: boolean;
  isCorrect: boolean;
  onClick: () => void;
  isDarkMode: boolean;
  isAutoNotesEnabled: boolean;
  className?: string;
}

// Custom hook to get the previous value of a prop or state.
function usePrevious<T>(value: T): T | undefined {
  const ref = useRef<T | undefined>(undefined);
  useEffect(() => {
    ref.current = value;
  });
  return ref.current;
}

const Cell: React.FC<CellProps> = ({ data, isSelected, isPeer, isHighlighted, isCorrect, onClick, isDarkMode, isAutoNotesEnabled, className = '' }) => {
  const { value, isInitial, isWrong, userNotes, autoNotes } = data;

  const [isAnimating, setIsAnimating] = useState(false);
  const [isPopAnimating, setIsPopAnimating] = useState(false);
  const prevValue = usePrevious(value);

  useEffect(() => {
    // Trigger shake animation if a new incorrect value is entered.
    if (isWrong && value !== 0 && value !== prevValue) {
      setIsAnimating(true);
    }
    // Trigger pop animation if a new correct value is entered.
    if (isCorrect && !isInitial && value !== 0 && value !== prevValue) {
      setIsPopAnimating(true);
    }
  }, [value, isWrong, isCorrect, isInitial]);
  
  const handleAnimationEnd = () => {
    setIsAnimating(false);
    setIsPopAnimating(false);
  };

  const getCellClasses = () => {
    const classParts: string[] = [
      'aspect-square flex items-center justify-center text-xl sm:text-2xl font-sans transition-all duration-200',
      'cursor-pointer', // Make all cells clickable
    ];

    let backgroundClass = '';
    let textClass = '';
    let fontClass = '';
    let hoverClass = '';

    if (isDarkMode) {
      // 1. Base background
      if (isPeer) {
        backgroundClass = 'bg-slate-700';
      } else {
        backgroundClass = 'bg-slate-800';
      }

      // 2. Base text, font, and hover based on whether it's an initial number
      if (isInitial) {
        textClass = 'text-slate-100';
        fontClass = 'font-bold';
        hoverClass = 'hover:bg-slate-700/80';
      } else {
        textClass = 'text-sky-400';
        hoverClass = 'hover:bg-sky-900/50';
        if (isCorrect) fontClass = 'font-bold';
        if (isWrong) textClass = 'text-red-400';
      }

      // 3. Overrides for special states (highest priority)
      if (isHighlighted) {
        backgroundClass = 'bg-blue-800/60';
      }
      if (isSelected) {
        backgroundClass = 'bg-sky-800 z-10';
        textClass = 'text-white';
        hoverClass = '';
      }
    } else { // Light Mode
      // 1. Base background
      if (isPeer) {
        backgroundClass = 'bg-slate-100';
      } else {
        backgroundClass = 'bg-white';
      }

      // 2. Base text, font, and hover
      if (isInitial) {
        textClass = 'text-slate-800';
        fontClass = 'font-bold';
        hoverClass = 'hover:bg-slate-200/80';
      } else {
        textClass = 'text-sky-600';
        hoverClass = 'hover:bg-sky-100';
        if (isCorrect) fontClass = 'font-bold';
        if (isWrong) textClass = 'text-red-500';
      }
      
      // 3. Overrides for special states
      if (isHighlighted) {
        backgroundClass = 'bg-blue-100';
      }
      if (isSelected) {
        backgroundClass = 'bg-sky-200 z-10';
        hoverClass = ''; // No hover when selected
      }
    }
    
    classParts.push(backgroundClass, textClass, fontClass, hoverClass);
    return classParts.filter(Boolean).join(' ');
  };

  const shakeAnimationClass = isAnimating ? 'animate-shake' : '';
  const cellClasses = `${getCellClasses()} ${shakeAnimationClass} ${className}`;
  const popAnimationClass = isPopAnimating ? 'animate-pop inline-block' : '';
  
  const hasNotes = userNotes.size > 0 || autoNotes.size > 0;

  const notesGrid = (
    <div className={`grid grid-cols-3 grid-rows-3 w-full h-full p-px text-[10px] sm:text-xs leading-none`}>
      {Array.from({ length: 9 }).map((_, i) => {
        const num = i + 1;
        const isUserNote = userNotes.has(num);
        const isAutoNote = autoNotes.has(num);
        
        let noteClass = '';
        if (isUserNote) {
          // If auto notes are on, user notes are blue for comparison.
          // Otherwise, they are a standard gray.
          if (isAutoNotesEnabled) {
            noteClass = isDarkMode ? 'text-sky-400 font-medium' : 'text-sky-600 font-medium';
          } else {
            noteClass = isDarkMode ? 'text-slate-400' : 'text-slate-500';
          }
        } else if (isAutoNote) {
          // Auto notes are always a subtle gray.
          noteClass = isDarkMode ? 'text-slate-500' : 'text-gray-400';
        }

        return (
          <div key={i} className={`flex items-center justify-center transition-colors duration-200 ${noteClass}`}>
            {isUserNote || isAutoNote ? num : ''}
          </div>
        );
      })}
    </div>
  );

  return (
    <div className={cellClasses} onClick={onClick} onAnimationEnd={handleAnimationEnd}>
      {value !== 0 ? (
        <span className={popAnimationClass}>{value}</span>
      ) : hasNotes ? (
        notesGrid
      ) : (
        ''
      )}
    </div>
  );
};

export default Cell;