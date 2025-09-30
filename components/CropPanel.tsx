/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React, { useState, useEffect, useRef } from 'react';
import { UndoIcon, RedoIcon, EraseIcon, NotesIcon, HintIconFull, HintIconEmpty } from './icons';

interface ControlsProps {
  isNotesMode: boolean;
  onToggleNotesMode: () => void;
  onUndo: () => void;
  canUndo: boolean;
  onRedo: () => void;
  canRedo: boolean;
  onHint: () => void;
  isHintOnCooldown: boolean;
  onDelete: () => void;
  isDarkMode: boolean;
}

const Controls: React.FC<ControlsProps> = ({ 
  isNotesMode, 
  onToggleNotesMode, 
  onUndo, 
  canUndo,
  onRedo,
  canRedo, 
  onHint, 
  isHintOnCooldown,
  onDelete,
  isDarkMode
}) => {
  const [animation, setAnimation] = useState<'pop' | 'refill' | null>(null);
  const prevCooldown = useRef(isHintOnCooldown);
  const animationKey = useRef(0);

  useEffect(() => {
    // When the cooldown finishes, trigger the 'refill' animation.
    if (prevCooldown.current && !isHintOnCooldown) {
      setAnimation('refill');
    }
    prevCooldown.current = isHintOnCooldown;
  }, [isHintOnCooldown]);
  
  const handleHintClick = () => {
    if (isHintOnCooldown) return;
    animationKey.current += 1;
    setAnimation('pop');
    onHint();
  };

  const baseButtonClasses = "w-12 h-12 flex items-center justify-center rounded-full transition-all duration-300 transform focus:outline-none active:scale-90 disabled:opacity-30 disabled:cursor-not-allowed disabled:bg-transparent";

  // Simplified theme-based classes for correctness and readability
  const containerClasses = isDarkMode ? 'bg-slate-700' : 'bg-slate-800';
  const iconButtonClasses = isDarkMode ? 'text-slate-300 hover:bg-slate-600/80' : 'text-slate-300 hover:bg-slate-700/80';
  const hintIconClasses = isDarkMode ? 'text-amber-400' : 'text-amber-300';
  
  const notesButtonDynamicClasses = isNotesMode 
    ? 'bg-blue-500 text-white shadow-[0_0_15px_rgba(59,130,246,0.7)]' 
    : iconButtonClasses;

  const hintHoverClass = isHintOnCooldown ? '' : (isDarkMode ? 'hover:bg-slate-600/80' : 'hover:bg-slate-700/80');

  const animationClass = animation === 'pop' ? 'animate-hint-pop' : animation === 'refill' ? 'animate-hint-refill' : '';

  return (
    <div className={`rounded-full p-2 flex justify-center items-center gap-2 shadow-lg transition-colors duration-300 ${containerClasses}`}>
      <button 
        onClick={onUndo}
        disabled={!canUndo}
        className={`${baseButtonClasses} ${iconButtonClasses}`}
        aria-label="Undo last move"
      >
        <UndoIcon />
      </button>
      <div className={`transition-all duration-300 grid place-items-center ${canRedo ? 'w-12 opacity-100' : 'w-0 opacity-0 -mr-2'}`}>
        <button 
            onClick={onRedo}
            disabled={!canRedo}
            className={`${baseButtonClasses} ${iconButtonClasses}`}
            aria-label="Redo last undone move"
          >
            <RedoIcon />
        </button>
      </div>
      <button 
        onClick={onDelete}
        className={`${baseButtonClasses} ${iconButtonClasses}`}
        aria-label="Delete number or notes"
      >
        <EraseIcon />
      </button>
      <button 
        onClick={onToggleNotesMode}
        className={`${baseButtonClasses} ${notesButtonDynamicClasses}`}
        aria-label={`Toggle notes mode, currently ${isNotesMode ? 'on' : 'off'}`}
      >
        <NotesIcon />
      </button>
      <button 
        onClick={handleHintClick}
        disabled={isHintOnCooldown}
        className={`${baseButtonClasses} ${hintIconClasses} ${hintHoverClass} ${animationClass}`}
        onAnimationEnd={() => setAnimation(null)}
        aria-label={isHintOnCooldown ? "Hint is on cooldown" : "Get a hint"}
      >
        <div className="relative w-full h-full flex items-center justify-center">
          {isHintOnCooldown ? (
            <>
              <HintIconEmpty />
              <div
                key={animationKey.current}
                className="absolute w-full h-full animate-fill-up flex items-center justify-center"
              >
                <HintIconFull />
              </div>
            </>
          ) : (
            <HintIconFull />
          )}
        </div>
      </button>
    </div>
  );
};

export default Controls;