/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React from 'react';
import { UndoIcon, RedoIcon, EraseIcon, NotesIcon, HintIconFull, HintIconTwoThirds, HintIconOneThird, HintIconEmptyCracked } from './icons';

interface ControlsProps {
  isNotesMode: boolean;
  onToggleNotesMode: () => void;
  onUndo: () => void;
  canUndo: boolean;
  onRedo: () => void;
  canRedo: boolean;
  onHint: () => void;
  hintsRemaining: number;
  isCellMutable: boolean;
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
  hintsRemaining, 
  isCellMutable,
  onDelete,
  isDarkMode
}) => {

  const getHintIcon = () => {
    switch (hintsRemaining) {
      case 3: return <HintIconFull />;
      case 2: return <HintIconTwoThirds />;
      case 1: return <HintIconOneThird />;
      default: return <HintIconEmptyCracked />;
    }
  };

  const baseButtonClasses = "w-12 h-12 flex items-center justify-center rounded-full transition-all duration-300 transform focus:outline-none active:scale-90 disabled:opacity-30 disabled:cursor-not-allowed disabled:bg-transparent";

  // Simplified theme-based classes for correctness and readability
  const containerClasses = isDarkMode ? 'bg-slate-700' : 'bg-slate-800';
  const iconButtonClasses = isDarkMode ? 'text-slate-300 hover:bg-slate-600/80' : 'text-slate-300 hover:bg-slate-700/80';
  const hintIconClasses = isDarkMode ? 'text-amber-400' : 'text-amber-300';
  
  const notesButtonDynamicClasses = isNotesMode 
    ? 'bg-blue-500 text-white shadow-[0_0_15px_rgba(59,130,246,0.7)]' 
    : iconButtonClasses;

  const hintButtonDisabled = hintsRemaining <= 0 || !isCellMutable;
  const deleteButtonDisabled = !isCellMutable;

  const hintHoverClass = hintButtonDisabled ? '' : (isDarkMode ? 'hover:bg-slate-600/80' : 'hover:bg-slate-700/80');

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
        disabled={deleteButtonDisabled}
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
        onClick={onHint}
        disabled={hintButtonDisabled}
        className={`${baseButtonClasses} ${hintIconClasses} ${hintHoverClass}`}
        aria-label={`Get a hint, ${hintsRemaining} remaining`}
      >
        {getHintIcon()}
      </button>
    </div>
  );
};

export default Controls;