/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React, { useState, useEffect, useRef } from 'react';

export interface CellData {
  value: number; // 0 for empty
  isInitial: boolean;
  isWrong: boolean;
  notes: Set<number>;
}

interface CellProps {
  data: CellData;
  isSelected: boolean;
  isPeer: boolean;
  isCorrect: boolean;
  onClick: () => void;
  isDarkMode: boolean;
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

const Cell: React.FC<CellProps> = ({ data, isSelected, isPeer, isCorrect, onClick, isDarkMode, className = '' }) => {
  const { value, isInitial, isWrong, notes } = data;

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

  // Rewritten styling logic for clarity and correctness
  const getCellClasses = () => {
    const classParts: string[] = [
      'aspect-square flex items-center justify-center text-xl sm:text-2xl font-sans transition-all duration-200',
    ];

    let backgroundClass = '';
    let textClass = '';
    let cursorClass = '';
    let fontClass = '';
    let hoverClass = '';

    if (isDarkMode) {
      // 1. Determine background color by priority
      if (isSelected) {
        backgroundClass = 'bg-sky-800 z-10';
      } else if (isPeer) {
        backgroundClass = 'bg-slate-700'; // Uniform peer highlight
      } else {
        backgroundClass = 'bg-slate-800'; // Default dark background
      }

      // 2. Determine base text color, font weight, and cursor
      if (isInitial) {
        textClass = 'text-slate-100';
        fontClass = 'font-bold';
      } else {
        textClass = 'text-sky-400';
        cursorClass = 'cursor-pointer';
        hoverClass = 'hover:bg-sky-900/50';
      }

      // 3. Apply overrides for special states (for non-initial cells only)
      if (!isInitial) {
        if (isWrong) {
          textClass = 'text-red-400';
        } else if (isSelected) {
          textClass = 'text-white';
          hoverClass = ''; // No hover on selected cell
        } else if (isCorrect) {
          fontClass = 'font-bold';
        }
      }
    } else { // Light Mode
      // 1. Determine background color by priority
      if (isSelected) {
        backgroundClass = 'bg-sky-200 z-10';
      } else if (isPeer) {
        backgroundClass = 'bg-slate-100';
      } else {
        backgroundClass = 'bg-white';
      }

      // 2. Determine base text color, font weight, and cursor
      if (isInitial) {
        textClass = 'text-slate-800';
        fontClass = 'font-bold';
      } else {
        textClass = 'text-sky-600';
        cursorClass = 'cursor-pointer';
        hoverClass = 'hover:bg-sky-100';
      }

      // 3. Apply overrides for special states (for non-initial cells only)
      if (!isInitial) {
        if (isWrong) {
          textClass = 'text-red-500';
        } else if (isCorrect) {
          fontClass = 'font-bold';
        }
        if (isSelected) {
          hoverClass = ''; // No hover on selected cell
        }
      }
    }
    
    classParts.push(backgroundClass, textClass, cursorClass, fontClass, hoverClass);
    return classParts.filter(Boolean).join(' ');
  };

  const shakeAnimationClass = isAnimating ? 'animate-shake' : '';
  const cellClasses = `${getCellClasses()} ${shakeAnimationClass} ${className}`;
  const popAnimationClass = isPopAnimating ? 'animate-pop inline-block' : '';
  
  const notesGrid = (
    <div className={`grid grid-cols-3 grid-rows-3 w-full h-full p-px text-[10px] sm:text-xs leading-none ${isDarkMode ? 'text-slate-400' : 'text-gray-500'}`}>
      {Array.from({ length: 9 }).map((_, i) => (
        <div key={i} className="flex items-center justify-center">
          {notes.has(i + 1) ? i + 1 : ''}
        </div>
      ))}
    </div>
  );

  return (
    <div className={cellClasses} onClick={!isInitial ? onClick : undefined} onAnimationEnd={handleAnimationEnd}>
      {value !== 0 ? (
        <span className={popAnimationClass}>{value}</span>
      ) : notes.size > 0 ? (
        notesGrid
      ) : (
        ''
      )}
    </div>
  );
};

export default Cell;