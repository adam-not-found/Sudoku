/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

// Fix: Corrected typo in import statement to properly import React hooks.
import React, { useState, useEffect, useRef } from 'react';

function usePrevious(value) {
  const ref = useRef(undefined);
  useEffect(() => {
    ref.current = value;
  });
  return ref.current;
}

// Fix: Define a props interface for the Cell component.
type CellProps = {
  data: {
    value: number;
    isInitial: boolean;
    isWrong: boolean;
    userNotes: Set<number>;
    autoNotes: Set<number>;
    eliminatedNotes: Set<number>;
  };
  isSelected: boolean;
  isPeer: boolean;
  isHighlighted: boolean;
  isCorrect: boolean;
  onClick: () => void;
  isDarkMode: boolean;
  isNotesMode: boolean;
  isAutoNotesEnabled: boolean;
  highlightedNumber: number | null;
  isHintTarget: boolean;
  hintEffect: { type: string; cell: { row: number; col: number }; notes?: number[] } | null;
  rowIndex: number;
  colIndex: number;
  className?: string;
};

// Fix: Explicitly type the component with React.FC<CellProps> to ensure TypeScript recognizes it as a React component that can accept special props like 'key'.
export const Cell: React.FC<CellProps> = ({ data, isSelected, isPeer, isHighlighted, isCorrect, onClick, isDarkMode, isNotesMode, isAutoNotesEnabled, highlightedNumber, isHintTarget, hintEffect, rowIndex, colIndex, className = '' }) => {
  const { value, isInitial, isWrong, userNotes, autoNotes, eliminatedNotes } = data;

  const [isAnimating, setIsAnimating] = useState(false);
  const [isPopAnimating, setIsPopAnimating] = useState(false);
  const prevValue = usePrevious(value);

  useEffect(() => {
    if (isWrong && value !== 0 && value !== prevValue) {
      setIsAnimating(true);
    }
    if (isCorrect && !isInitial && value !== 0 && value !== prevValue) {
      setIsPopAnimating(true);
    }
  }, [value, isWrong, isCorrect, isInitial, prevValue]);
  
  const handleAnimationEnd = () => {
    setIsAnimating(false);
    setIsPopAnimating(false);
  };

  const getCellClasses = () => {
    const classParts = [
      'aspect-square flex items-center justify-center text-2xl sm:text-3xl font-sans transition-all duration-200',
      'cursor-pointer',
    ];

    let backgroundClass = '';
    let textClass = '';
    let fontClass = '';
    let hoverClass = '';

    const determineTextColor = () => {
      if (isInitial) {
        fontClass = 'font-semibold';
        return isDarkMode ? 'text-slate-100' : 'text-slate-800';
      }
      if (isWrong) {
        return isDarkMode ? 'text-red-400' : 'text-red-500';
      }
      if (isCorrect) {
        fontClass = 'font-semibold';
      }
      return isDarkMode ? 'text-sky-400' : 'text-sky-600';
    };

    textClass = determineTextColor();
    
    if (isSelected) {
      backgroundClass = isDarkMode ? 'bg-sky-800 z-10' : 'bg-sky-200 z-10';
      hoverClass = '';
    } else {
      if (isDarkMode) {
        hoverClass = isInitial ? 'hover:bg-slate-700/80' : 'hover:bg-sky-900/50';
        if (isHintTarget) backgroundClass = 'bg-amber-500/50';
        else if (isHighlighted && value !== 0) backgroundClass = 'bg-blue-800/60';
        else if (isPeer) backgroundClass = 'bg-slate-700';
        else backgroundClass = 'bg-slate-800';
      } else {
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

  const isHintGlowTarget = hintEffect?.type === 'cell-glow' && hintEffect.cell.row === rowIndex && hintEffect.cell.col === colIndex;
  const shakeAnimationClass = isAnimating ? 'animate-shake' : '';
  const hintAnimationClass = isHintGlowTarget ? 'animate-hint-cell' : '';
  const cellClasses = `${getCellClasses()} ${shakeAnimationClass} ${hintAnimationClass} ${className}`;
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
            const isNewlyEliminated = hintEffect?.type === 'note-pop' &&
                                    hintEffect.cell.row === rowIndex &&
                                    hintEffect.cell.col === colIndex &&
                                    hintEffect.notes.includes(num);

            const isNoteVisible = isUserNote || isAutoNote || isEliminationNote;
            if (!isNoteVisible) return <div key={i} />;
            
            const isTheHighlightedNote = isHighlighted && highlightedNumber === num;
            
            let noteClass = '';
            let fontWeightClass = '';
            let textShadowClass = '';
            let noteAnimationClass = '';

            if (isEliminationNote) {
              noteClass = isDarkMode ? 'text-red-400' : 'text-red-500';
              fontWeightClass = 'font-semibold';
              if (isNewlyEliminated) {
                noteAnimationClass = 'animate-pop';
              }
            } else if (isTheHighlightedNote) {
              noteClass = isDarkMode 
                ? 'bg-sky-500/60 text-white rounded-sm' 
                : 'bg-sky-200 text-sky-800 rounded-sm';
              fontWeightClass = 'font-bold';
            } else {
              if (isAutoNotesEnabled) {
                if (isUserNote) {
                  noteClass = isDarkMode ? 'text-sky-500' : 'text-sky-500';
                } else {
                  noteClass = isDarkMode ? 'text-slate-500' : 'text-slate-400';
                }
              } else {
                noteClass = isDarkMode ? 'text-slate-400' : 'text-slate-500';
              }

              if (isNotesMode) {
                fontWeightClass = 'font-bold';
                if (isAutoNotesEnabled && isUserNote) {
                  textShadowClass = 'text-shadow-blue-glow';
                }
              } else {
                if (isUserNote || !isAutoNotesEnabled) {
                  fontWeightClass = 'font-medium';
                }
              }
            }
            
            return (
              <div key={i} className={`flex items-center justify-center transition-all duration-200 ${noteClass} ${fontWeightClass} ${textShadowClass} ${noteAnimationClass}`}>
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