import React, { useState, useEffect, useRef } from 'react';

function usePrevious(value) {
  const ref = useRef(undefined);
  useEffect(() => {
    ref.current = value;
  });
  return ref.current;
}

export default function Cell({ data, isSelected, isPeer, isHighlighted, isCorrect, onClick, isDarkMode, isNotesMode, isAutoNotesEnabled, highlightedNumber, isHintPrimary, isHintSecondary, hintEffect, rowIndex, colIndex, className = '' }) {
  const { value, isInitial, isWrong, userNotes, autoNotes, eliminatedNotes } = data;
  const [isAnimating, setIsAnimating] = useState(false);
  const [isPopAnimating, setIsPopAnimating] = useState(false);
  const prevValue = usePrevious(value);

  useEffect(() => {
    if (isWrong && value !== 0 && value !== prevValue) setIsAnimating(true);
    if (isCorrect && !isInitial && value !== 0 && value !== prevValue) setIsPopAnimating(true);
  }, [value, isWrong, isCorrect, isInitial, prevValue]);
  
  const handleAnimationEnd = () => { setIsAnimating(false); setIsPopAnimating(false); };

  const getCellClasses = () => {
    let backgroundClass, textClass, fontClass = '', hoverClass;
    if (isInitial) {
        fontClass = 'font-semibold';
        textClass = isDarkMode ? 'text-slate-100' : 'text-slate-800';
    } else if (isWrong) textClass = isDarkMode ? 'text-red-400' : 'text-red-500';
    else {
      if (isCorrect) fontClass = 'font-semibold';
      textClass = isDarkMode ? 'text-sky-400' : 'text-sky-600';
    }
    
    if (isSelected) {
      backgroundClass = isDarkMode ? 'bg-sky-800 z-10' : 'bg-sky-200 z-10';
    } else {
      if (isDarkMode) {
        hoverClass = isInitial ? 'hover:bg-slate-700/80' : 'hover:bg-sky-900/50';
        if (isHintPrimary) backgroundClass = 'bg-amber-400/60';
        else if (isHintSecondary) backgroundClass = 'bg-amber-400/30';
        else if (isHighlighted && value !== 0) backgroundClass = 'bg-blue-800/60';
        else if (isPeer) backgroundClass = 'bg-slate-700';
        else backgroundClass = 'bg-slate-800';
      } else {
        hoverClass = isInitial ? 'hover:bg-slate-200/80' : 'hover:bg-sky-100';
        if (isHintPrimary) backgroundClass = 'bg-amber-300/80';
        else if (isHintSecondary) backgroundClass = 'bg-amber-300/50';
        else if (isHighlighted && value !== 0) backgroundClass = 'bg-blue-100';
        else if (isPeer) backgroundClass = 'bg-slate-100';
        else backgroundClass = 'bg-white';
      }
    }
    return ['aspect-square flex items-center justify-center text-2xl sm:text-3xl font-sans transition-all duration-200 cursor-pointer', backgroundClass, textClass, fontClass, hoverClass].filter(Boolean).join(' ');
  };

  const isHintGlowTarget = hintEffect?.type === 'cell-glow' && hintEffect.cell.row === rowIndex && hintEffect.cell.col === colIndex;
  const cellClasses = `${getCellClasses()} ${isAnimating ? 'animate-shake' : ''} ${isHintGlowTarget ? 'animate-hint-cell' : ''} ${className}`;
  const shouldShowNotesGrid = value === 0 && (userNotes.size > 0 || autoNotes.size > 0 || eliminatedNotes.size > 0);
  
  return (
    <div className={cellClasses} onClick={onClick} onAnimationEnd={handleAnimationEnd}>
      {value !== 0 ? (
        <span className={`${isPopAnimating ? 'animate-pop inline-block' : ''} transition-opacity duration-300 ${isNotesMode && !isInitial && !isCorrect ? 'opacity-70' : ''}`}>{value}</span>
      ) : shouldShowNotesGrid ? (
        <div className="grid grid-cols-3 grid-rows-3 w-full h-full p-px text-[10px] sm:text-xs leading-none text-transparent">
          {Array.from({ length: 9 }).map((_, i) => {
            const num = i + 1;
            const isUserNote = userNotes.has(num), isAutoNote = autoNotes.has(num), isEliminationNote = eliminatedNotes.has(num);
            if (!isUserNote && !isAutoNote && !isEliminationNote) return <div key={i} />;
            
            const isNewlyEliminated = hintEffect?.type === 'note-pop' && hintEffect.eliminations.some(e => e.row === rowIndex && e.col === colIndex && e.num === num);
            let noteClass = '', fontWeightClass = '', textShadowClass = '';

            if (isEliminationNote) {
              noteClass = isDarkMode ? 'text-red-400' : 'text-red-500';
              fontWeightClass = 'font-semibold';
            } else if (isHighlighted && highlightedNumber === num) {
              noteClass = isDarkMode ? 'bg-sky-500/60 text-white rounded-sm' : 'bg-sky-200 text-sky-800 rounded-sm';
              fontWeightClass = 'font-bold';
            } else {
              if (isDarkMode && (isHintPrimary || isHintSecondary)) noteClass = 'text-slate-100';
              else if (isAutoNotesEnabled) noteClass = isUserNote ? (isDarkMode ? 'text-sky-300' : 'text-sky-500') : 'text-slate-400';
              else noteClass = isDarkMode ? 'text-slate-400' : 'text-slate-500';

              if (isNotesMode) {
                fontWeightClass = 'font-bold';
              } else if (isUserNote || !isAutoNotesEnabled) fontWeightClass = 'font-medium';
            }
            
            return <div key={i} className={`flex items-center justify-center transition-all duration-200 ${noteClass} ${fontWeightClass} ${textShadowClass} ${isNewlyEliminated ? 'animate-pop':''}`}>{num}</div>;
          })}
        </div>
      ) : null}
    </div>
  );
}