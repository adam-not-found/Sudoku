import React from 'react';
import { getTutorialForHint, TutorialGraphicCell } from '../services/tutorialService';

interface TutorialGridProps {
  data: TutorialGraphicCell[][];
}

function TutorialGrid({ data }: TutorialGridProps) {
  const highlightClasses = {
    primary: 'bg-[var(--color-hint-primary-bg)]',
    secondary: 'bg-[var(--color-hint-secondary-bg)]',
  };

  const rowClassMap: { [key: number]: string } = {
    1: 'grid-rows-1',
    2: 'grid-rows-2',
    3: 'grid-rows-3',
    4: 'grid-rows-4',
    5: 'grid-rows-5',
  };
  const rowClass = rowClassMap[data.length] || 'grid-rows-1';

  return (
    <div className={`grid gap-[1px] bg-[var(--color-board-border-thin)] rounded-lg overflow-hidden ${rowClass}`} style={{ gridTemplateColumns: `repeat(${data[0].length}, minmax(0, 1fr))` }}>
      {data.flat().map((cell, index) => {
        const numCols = data[0].length;
        const rowIndex = Math.floor(index / numCols);
        const colIndex = index % numCols;

        const isCellHighlighted = !!cell.highlights?.cell;
        const cellHighlightClass = isCellHighlighted ? highlightClasses[cell.highlights.cell] : '';

        const borderClasses = [];
        if ((colIndex + 1) % 3 === 0 && colIndex < numCols - 1) {
          borderClasses.push('border-r-[2px]');
        }
        if ((rowIndex + 1) % 3 === 0 && rowIndex < data.length - 1) {
          borderClasses.push('border-b-[2px]');
        }
        if (borderClasses.length > 0) {
          borderClasses.push('border-[var(--color-board-border-thick)]');
        }

        return (
          <div key={index} className={`aspect-square flex items-center justify-center text-3xl font-sans bg-[var(--color-cell-bg)] ${cellHighlightClass} ${borderClasses.join(' ')}`}>
            {cell.value ? (
              <span className="font-bold text-[var(--color-text-primary)]">{cell.value}</span>
            ) : cell.notes ? (
              <div className="grid grid-cols-3 grid-rows-3 w-full h-full p-px text-xs leading-none">
                {Array.from({ length: 9 }).map((_, i) => {
                  const num = i + 1;
                  if (!cell.notes?.includes(num)) return <div key={i} />;

                  const numHighlightType = cell.highlights?.notes?.[num];
                  let noteClass = 'text-[var(--color-text-note)]';

                  if (numHighlightType === 'elim') {
                    noteClass = 'text-[var(--color-text-wrong)] line-through font-bold';
                  } else if (numHighlightType) { // 'primary' or 'secondary'
                    if (isCellHighlighted) {
                      noteClass = 'font-bold text-[var(--color-hint-note-text-on-highlight)]';
                    } else {
                      noteClass = numHighlightType === 'primary'
                        ? 'font-bold text-[var(--color-accent)]'
                        : 'font-bold text-[var(--color-text-user)]';
                    }
                  }

                  return <div key={i} className={`flex items-center justify-center ${noteClass}`}>{num}</div>;
                })}
              </div>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}


export default function HintTutorial({ hintType, onClose }: { hintType: string | null; onClose: () => void; }) {
  const tutorial = getTutorialForHint(hintType || '');
  
  const [showContent, setShowContent] = React.useState(false);

  React.useEffect(() => {
    if (hintType) {
        const timer = setTimeout(() => setShowContent(true), 50); // Short delay for transition
        return () => clearTimeout(timer);
    } else {
        setShowContent(false);
    }
  }, [hintType]);

  if (!hintType || !tutorial) return null;

  const numCols = tutorial.graphic[0].length;
  let modalWidthClass = 'max-w-sm';
  let gridWrapperClass = 'w-full';

  if (numCols <= 4) {
    gridWrapperClass = 'w-72'; // Constrain width for smaller diagrams like 3x3 to make cells smaller
  } else if (numCols > 5) {
    modalWidthClass = 'max-w-2xl'; // Use a wider modal for diagrams with many columns (e.g., a full row)
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 transition-opacity duration-300" onClick={onClose} aria-modal="true" role="dialog">
      <div onClick={(e) => e.stopPropagation()} className={`w-full ${modalWidthClass} m-4 p-6 rounded-2xl shadow-2xl border flex flex-col gap-4 bg-[var(--color-ui-bg-translucent)] border-[var(--color-ui-border)] backdrop-blur-sm text-[var(--color-text-primary)] transition-all duration-300 ease-in-out ${showContent ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}>
        {tutorial ? (
            <>
                <h2 className="text-xl font-bold text-center">{tutorial.title}</h2>
                <p className="text-sm text-center text-[var(--color-text-secondary)]">{tutorial.description}</p>
                <div className={`mx-auto p-1 bg-[var(--color-board-border-thick)] rounded-xl ${gridWrapperClass}`}>
                  <TutorialGrid data={tutorial.graphic} />
                </div>
            </>
        ) : (
            <p className="text-sm text-center text-[var(--color-text-secondary)]">No tutorial available for this hint.</p>
        )}
        <div className="flex justify-center mt-2">
          <button onClick={onClose} className={`font-bold py-2 px-6 rounded-lg shadow-md transition-colors bg-[var(--color-accent)] hover:bg-[var(--color-accent-hover)] text-[var(--color-accent-text)]`}>Got it</button>
        </div>
      </div>
    </div>
  );
}