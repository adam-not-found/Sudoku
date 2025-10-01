/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React from 'react';
import { Cell } from './Cell.tsx';

export const SudokuBoard = ({ board, solution, selectedCell, onCellClick, isNotesMode, isDarkMode, forceDarkMode, isAutoNotesEnabled, isHighlightNotesEnabled, highlightedNumber, hintTargetCell, hintEffect }) => {
  const isDark = isDarkMode || forceDarkMode;
  const borderColor = isDark ? 'border-slate-600' : 'border-slate-300';
  const thickInnerBorderColor = isDark ? 'bg-slate-500' : 'bg-slate-400';
  const thinInnerBorderColor = isDark ? 'bg-slate-700/65' : 'bg-slate-200';

  return (
    <div className={`transition-all duration-300 ease-in-out aspect-square w-full ${isNotesMode ? 'scale-[1.03]' : ''}`}>
      <div className={`rounded-2xl overflow-hidden h-full w-full border-[6px] ${borderColor}`}>
        <div className={`grid grid-cols-3 grid-rows-3 gap-0.5 h-full w-full ${thickInnerBorderColor} rounded-lg overflow-hidden`}>
          {Array.from({ length: 9 }).map((_, boxIndex) => {
            const boxRowStart = Math.floor(boxIndex / 3) * 3;
            const boxColStart = (boxIndex % 3) * 3;
            
            let boxCornerClass = '';
            if (boxIndex === 0) boxCornerClass = 'rounded-tl-lg';
            if (boxIndex === 2) boxCornerClass = 'rounded-tr-lg';
            if (boxIndex === 6) boxCornerClass = 'rounded-bl-lg';
            if (boxIndex === 8) boxCornerClass = 'rounded-br-lg';

            return (
              <div key={boxIndex} className={`grid grid-cols-3 grid-rows-3 gap-0.5 ${thinInnerBorderColor} ${boxCornerClass}`}>
                {Array.from({ length: 9 }).map((_, cellInBoxIndex) => {
                  const cellRow = Math.floor(cellInBoxIndex / 3);
                  const cellCol = cellInBoxIndex % 3;
                  const rowIndex = boxRowStart + cellRow;
                  const colIndex = boxColStart + cellCol;
                  const cellData = board[rowIndex][colIndex];
                  const isSelected = selectedCell?.row === rowIndex && selectedCell?.col === colIndex;
                  const isPeer = selectedCell ? 
                    (selectedCell.row === rowIndex || selectedCell.col === colIndex || 
                    (Math.floor(selectedCell.row / 3) === Math.floor(rowIndex / 3) && Math.floor(selectedCell.col / 3) === Math.floor(colIndex / 3)))
                    : false;
                  const isCorrect = !cellData.isInitial && cellData.value !== 0 && cellData.value === solution[rowIndex][colIndex];
                  
                  let isHighlighted = false;
                  if (highlightedNumber !== null && !isSelected) {
                    const isHighlightedByValue = cellData.value === highlightedNumber;
                    const isHighlightedByNote =
                      isHighlightNotesEnabled &&
                      cellData.value === 0 &&
                      (cellData.userNotes.has(highlightedNumber) || cellData.autoNotes.has(highlightedNumber));
                    isHighlighted = isHighlightedByValue || isHighlightedByNote;
                  }

                  const isHintTarget = hintTargetCell?.row === rowIndex && hintTargetCell?.col === colIndex;
                  
                  let cellCornerClass = '';
                  if (rowIndex === 0 && colIndex === 0) cellCornerClass = 'rounded-tl-sm';
                  if (rowIndex === 0 && colIndex === 8) cellCornerClass = 'rounded-tr-sm';
                  if (rowIndex === 8 && colIndex === 0) cellCornerClass = 'rounded-bl-sm';
                  if (rowIndex === 8 && colIndex === 8) cellCornerClass = 'rounded-br-sm';

                  return (
                    <Cell 
                      key={`${rowIndex}-${colIndex}`}
                      data={cellData}
                      isSelected={isSelected}
                      isPeer={isPeer && !isSelected}
                      isHighlighted={isHighlighted}
                      isCorrect={isCorrect}
                      onClick={() => onCellClick(rowIndex, colIndex)}
                      isDarkMode={isDark}
                      isNotesMode={isNotesMode}
                      className={cellCornerClass}
                      isAutoNotesEnabled={isAutoNotesEnabled}
                      highlightedNumber={highlightedNumber}
                      isHintTarget={isHintTarget}
                      hintEffect={hintEffect}
                      rowIndex={rowIndex}
                      colIndex={colIndex}
                    />
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};