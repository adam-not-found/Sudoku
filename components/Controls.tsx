import React, { useState, useEffect, useRef } from 'react';
import { UndoIcon, RedoIcon, EraseIcon, NotesIcon, HintIconFull, HintIconEmpty } from './icons';

export default function Controls({ isNotesMode, onToggleNotesMode, onUndo, canUndo, onRedo, canRedo, onHint, isHintOnCooldown, cooldownDuration, onDelete, hintButtonEffect }) {
  const [popAnimation, setPopAnimation] = useState(false);
  const prevCooldown = useRef(isHintOnCooldown);
  const animationKey = useRef(0);

  useEffect(() => {
    if (prevCooldown.current && !isHintOnCooldown) setPopAnimation(true);
    prevCooldown.current = isHintOnCooldown;
  }, [isHintOnCooldown]);
  
  const handleHintClick = () => { if (!isHintOnCooldown) { animationKey.current += 1; onHint(); } };
  
  const baseClasses = "w-12 h-12 flex items-center justify-center rounded-full transition-all duration-300 transform focus:outline-none active:scale-90 disabled:opacity-30 disabled:cursor-not-allowed disabled:bg-transparent";
  const iconBtnClasses = 'text-[var(--color-controls-text)] hover:bg-[var(--color-controls-hover-bg)]';
  
  return (
    <div className="flex justify-center items-center text-[var(--color-controls-text)]">
      <button onClick={onUndo} disabled={!canUndo} className={`${baseClasses} ${iconBtnClasses} ${canRedo ? 'mr-1' : 'mr-2'}`} aria-label="Undo"><UndoIcon /></button>
      <div className={`transition-all duration-300 ease-in-out flex items-center justify-center ${canRedo ? 'w-12 opacity-100' : 'w-0 opacity-0'}`} style={{transitionProperty: 'width, opacity'}}>
        <button onClick={onRedo} disabled={!canRedo} className={`${baseClasses} ${iconBtnClasses}`} aria-label="Redo"><RedoIcon /></button>
      </div>
      <button onClick={onDelete} className={`${baseClasses} ${iconBtnClasses} ml-1`} aria-label="Delete"><EraseIcon /></button>
      <button onClick={onToggleNotesMode} className={`${baseClasses} ${isNotesMode ? 'bg-[var(--color-accent)] text-[var(--color-accent-text)] shadow-[0_0_15px_var(--color-accent-glow)]' : iconBtnClasses} ml-2`} aria-label="Notes Mode"><NotesIcon /></button>
      <button onClick={handleHintClick} disabled={isHintOnCooldown} className={`${baseClasses} text-[var(--color-hint-icon)] ${isHintOnCooldown ? '' : 'hover:bg-[var(--color-controls-hover-bg)]'} ${hintButtonEffect === 'shake' ? 'animate-shake' : ''} ${popAnimation ? 'animate-pop' : ''} ml-2`} onAnimationEnd={() => setPopAnimation(false)} aria-label="Hint">
        <div className="relative w-full h-full flex items-center justify-center">
          {isHintOnCooldown ? (<><HintIconEmpty /><div key={animationKey.current} className="absolute w-full h-full flex items-center justify-center animate-fill-up" style={{ animationDuration: `${cooldownDuration}s` }}><HintIconFull /></div></>) : <HintIconFull />}
        </div>
      </button>
    </div>
  );
}