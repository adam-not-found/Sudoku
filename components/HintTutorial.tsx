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
  
  const noteHighlightClasses = {
    primary: 'text-[var(--color-accent)] font-bold',
    secondary: 'text-[var(--color-text-user)] font-bold',
    elim: 'text-[var(--color-text-wrong)] line-through',
  };

  return (
    <div className={`grid gap-[1px] bg-[var(--color-board-border-thin)] rounded-lg overflow-hidden grid-rows-${data.length}`} style={{ gridTemplateColumns: `repeat(${data[0].length}, minmax(0, 1fr))` }}>
      {data.flat().map((cell, index) => (
        <div key={index} className={`aspect-square flex items-center justify-center text-3xl font-sans bg-[var(--color-cell-bg)] ${cell.highlights?.cell ? highlightClasses[cell.highlights.cell] : ''}`}>
          {cell.value ? (
            <span className="font-bold text-[var(--color-text-primary)]">{cell.value}</span>
          ) : cell.notes ? (
            <div className="grid grid-cols-3 grid-rows-3 w-full h-full p-px text-xs leading-none">
              {Array.from({ length: 9 }).map((_, i) => {
                const num = i + 1;
                if (!cell.notes?.includes(num)) return <div key={i} />;
                
                const noteClass = cell.highlights?.notes?.[num] 
                  ? noteHighlightClasses[cell.highlights.notes[num]] 
                  : 'text-[var(--color-text-note)]';
                return <div key={i} className={`flex items-center justify-center ${noteClass}`}>{num}</div>;
              })}
            </div>
          ) : null}
        </div>
      ))}
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

  if (!hintType) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 transition-opacity duration-300" onClick={onClose} aria-modal="true" role="dialog">
      <div onClick={(e) => e.stopPropagation()} className={`w-full max-w-sm m-4 p-6 rounded-2xl shadow-2xl border flex flex-col gap-4 bg-[var(--color-ui-bg-translucent)] border-[var(--color-ui-border)] backdrop-blur-sm text-[var(--color-text-primary)] transition-all duration-300 ease-in-out ${showContent ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}>
        {tutorial ? (
            <>
                <h2 className="text-xl font-bold text-center">{tutorial.title}</h2>
                <p className="text-sm text-center text-[var(--color-text-secondary)]">{tutorial.description}</p>
                <div className="mx-auto w-full max-w-[200px] p-1 bg-[var(--color-board-border-thick)] rounded-xl">
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