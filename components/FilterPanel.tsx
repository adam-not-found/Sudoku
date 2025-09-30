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
  eliminatedNotes: Set<number>;
}

interface CellProps {
  data: CellData;
  isSelected: boolean;
  isPeer: boolean;
  isHighlighted: boolean;
  isCorrect: boolean;
  onClick: () => void;
  isDarkMode: boolean;
  isNotesMode: boolean;
  isAutoNotesEnabled: boolean;
  highlightedNumber: number | null;
  isHintTarget?: boolean;
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

const Cell: React.FC<CellProps> = ({ data, isSelected, isPeer, isHighlighted, isCorrect, onClick, isDarkMode, isNotesMode, isAutoNotesEnabled, highlightedNumber, isHintTarget, className = '' }) => {
  const { value, isInitial, isWrong, userNotes, autoNotes, eliminatedNotes } = data;

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
  }, [value, isWrong, isCorrect, isInitial, prevValue]);
  
  const handleAnimationEnd = () => {
    setIsAnimating(false);
    setIsPopAnimating(false);
  };

  const getCellClasses = () => {
    const classParts: string[] = [
      'aspect-square flex items-center justify-center text-xl sm:text-2xl font-sans transition-all duration-200',
      'cursor-pointer',
    ];

    let backgroundClass = '';
    let textClass = '';
    let fontClass = '';
    let hoverClass = '';

    const determineTextColor = () => {
      if (isInitial) {
        fontClass = 'font-bold';
        return isDarkMode ? 'text-slate-100' : 'text-slate-800';
      }
      if (isWrong) {
        return isDarkMode ? 'text-red-400' : 'text-red-500';
      }
      if (isCorrect) {
        fontClass = 'font-bold';
      }
      return isDarkMode ? 'text-sky-400' : 'text-sky-600';
    };

    textClass = determineTextColor();
    
    // Determine BACKGROUND color and hover effects. Selection has the highest priority.
    if (isSelected) {
      backgroundClass = isDarkMode ? 'bg-sky-800 z-10' : 'bg-sky-200 z-10';
      hoverClass = ''; // No hover effect when selected
    } else { // Not selected
      if (isDarkMode) {
        hoverClass = isInitial ? 'hover:bg-slate-700/80' : 'hover:bg-sky-900/50';
        if (isHintTarget) backgroundClass = 'bg-amber-500/50';
        else if (isHighlighted && value !== 0) backgroundClass = 'bg-blue-800/60';
        else if (isPeer) backgroundClass = 'bg-slate-700';
        else backgroundClass = 'bg-slate-800';
      } else { // Light Mode
        hoverClass = isInitial ? 'hover:bg-slate-200/80' : 'hover:bg-sky-100';
        if (isHintTarget) backgroundClass = 'bg-amber-300/80';
        else if (isHighlighted && value !== 0) backgroundClass = 'bg-blue-100';
        else if (isPeer) backgroundClass = 'bg-slate-100';
        else backgroundClass = 'bg-white';
      }
    }
    
    classParts.push(backgroundClass, textClass, fontClass, hoverClass);
    return classParts.filter(Boolean).join(' ');
  };

  const shakeAnimationClass = isAnimating ? 'animate-shake' : '';
  const cellClasses = `${getCellClasses()} ${shakeAnimationClass} ${className}`;
  const popAnimationClass = isPopAnimating ? 'animate-pop inline-block' : '';
  
  const hasUserOrAutoNotes = userNotes.size > 0 || autoNotes.size > 0;
  const hasEliminationNotes = eliminatedNotes.size > 0;
  const shouldShowNotesGrid = value === 0 && (hasUserOrAutoNotes || hasEliminationNotes);
  const shouldDimValue = isNotesMode && !isInitial && !isCorrect;

  return (
    <div className={cellClasses} onClick={onClick} onAnimationEnd={handleAnimationEnd}>
      {value !== 0 ? (
        <span className={`${popAnimationClass} transition-opacity duration-300 ${shouldDimValue ? 'opacity-70' : ''}`}>{value}</span>
      ) : shouldShowNotesGrid ? (
        <div className={`grid grid-cols-3 grid-rows-3 w-full h-full p-px text-[10px] sm:text-xs leading-none text-transparent`}>
          {Array.from({ length: 9 }).map((_, i) => {
            const num = i + 1;
            const isUserNote = userNotes.has(num);
            const isAutoNote = autoNotes.has(num);
            const isEliminationNote = eliminatedNotes.has(num);

            const isNoteVisible = isUserNote || isAutoNote || isEliminationNote;
            if (!isNoteVisible) return <div key={i} />;
            
            const isTheHighlightedNote = isHighlighted && highlightedNumber === num;
            
            let noteClass = '';
            let fontWeightClass = '';
            let textShadowClass = '';

            if (isEliminationNote) {
              // Red for incorrect notes highlighted by a hint (highest priority).
              noteClass = isDarkMode ? 'text-red-400' : 'text-red-500';
              fontWeightClass = 'font-semibold';
            } else if (isTheHighlightedNote) {
              // Distinct style for the highlighted note number (second priority).
              noteClass = isDarkMode 
                ? 'bg-sky-500/60 text-white rounded-sm' 
                : 'bg-sky-200 text-sky-800 rounded-sm';
              fontWeightClass = 'font-bold';
            } else {
              // Normal note styling based on game state.
              if (!isAutoNotesEnabled) {
                // Auto Notes: OFF
                if (isNotesMode) {
                  // Notes Toggle: ON -> A less intense blue, but bold.
                  noteClass = isDarkMode ? 'text-sky-500' : 'text-sky-500';
                  fontWeightClass = 'font-bold';
                  textShadowClass = 'text-shadow-blue-glow';
                } else {
                  // Notes Toggle: OFF -> Gray
                  noteClass = isDarkMode ? 'text-slate-300' : 'text-slate-500';
                  fontWeightClass = 'font-medium';
                }
              } else {
                // Auto Notes: ON
                if (isNotesMode) {
                  // Notes Toggle: ON -> Bold, but with adjusted colors to be less intense.
                  fontWeightClass = 'font-bold';
                  if (isUserNote) {
                    // User notes -> A less intense blue.
                    noteClass = isDarkMode ? 'text-sky-500' : 'text-sky-500';
                    textShadowClass = 'text-shadow-blue-glow';
                  } else { // isAutoNote
                    // Auto notes -> A less intense gray.
                    noteClass = isDarkMode ? 'text-slate-400' : 'text-slate-400';
                  }
                } else {
                  // Notes Toggle: OFF
                  if (isUserNote) {
                    // User notes -> Standard blue.
                    noteClass = isDarkMode ? 'text-sky-400' : 'text-sky-600';
                    fontWeightClass = 'font-medium';
                  } else { // isAutoNote
                    // Auto notes -> Subtle Gray.
                    noteClass = isDarkMode ? 'text-slate-400' : 'text-gray-400';
                  }
                }
              }
            }
            
            return (
              <div key={i} className={`flex items-center justify-center transition-all duration-200 ${noteClass} ${fontWeightClass} ${textShadowClass}`}>
                {num}
              </div>
            );
          })}
        </div>
      ) : (
        ''
      )}
    </div>
  );
};

export default Cell;