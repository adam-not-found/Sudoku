import React from 'react';

export function UndoIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
      <g transform="translate(2, 2)">
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 15v-3.375A4.125 4.125 0 0010.875 7.5H4.5" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 11.25L4.5 7.5l3.75-3.75" />
      </g>
    </svg>
  );
}

export function RedoIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
      <g transform="translate(2, 2)">
        <path strokeLinecap="round" strokeLinejoin="round" d="M5 15v-3.375A4.125 4.125 0 019.125 7.5H15.5" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M11.75 11.25L15.5 7.5l-3.75-3.75" />
      </g>
    </svg>
  );
}

export function EraseIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
    </svg>
  );
}

export function NotesIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
    </svg>
  );
}

const bulbPath = "M12 2.25c-4.142 0-7.5 3.358-7.5 7.5 0 2.434 1.157 4.583 2.963 5.992v3.008a.75.75 0 00.75.75h7.584a.75.75 0 00.75-.75v-3.008c1.806-1.409 2.963-3.558 2.963-5.992 0-4.142-3.358-7.5-7.5-7.5zM9.75 21a.75.75 0 000 1.5h4.5a.75.75 0 000-1.5H9.75z";

export function HintIconFull() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="currentColor" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={0.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d={bulbPath} />
    </svg>
  );
}

export function HintIconEmpty() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d={bulbPath} />
    </svg>
  );
}

export function SettingsIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  );
}

export function StatsIcon() {
  return (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M7 16V8m4 8V4m4 12V6" />
      </svg>
  );
}

export function ShareIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
    </svg>
  );
}

const themePatterns = {
  default: [
    "M 0,25 C 40,5 60,45 100,25 L 100,50 C 60,70 40,30 0,50 Z",
    "M 0,65 C 40,45 60,85 100,65 L 100,90 C 60,110 40,70 0,90 Z",
    "M 25,0 C 5,40 45,60 25,100 L 50,100 C 70,60 30,40 50,0 Z"
  ],
  minguo: [
    "M 50,50 C 110,0 110,100 50,50 C -10,100 -10,0 50,50 Z",
    "M 50,50 C -10,50 50,-10 50,-10 C 50,-10 110,50 50,50 Z",
    "M 50,50 C -10,50 50,110 50,110 C 50,110 110,50 50,50 Z"
  ],
  forest: [
    "M -10,80 C 40,110 80,-20 110,20 L 110,0 C 70,30 30,90 -10,60 Z",
    "M -10,90 C 20,40 60,120 110,70 L 110,50 C 70,110 30,30 -10,70 Z",
    "M -10,110 C 40,80 80,120 110,90 L 110,110 L -10,110 Z"
  ],
  luxury: [
    "M 0,0 C 100,0 0,100 100,100 L 100,80 C 20,100 100,20 0,0 Z",
    "M 100,0 C 0,0 100,100 0,100 L 20,100 C 100,80 0,20 100,0 Z",
    "M 50,0 C 0,50 100,50 50,100 L 50,80 C 80,50 20,50 50,20 Z"
  ],
  retro: [
    "M -10,50 C 20,20 80,20 110,50 L 110,80 C 80,-10 20,-10 -10,80 Z",
    "M -10,90 C 20,60 80,60 110,90 L 110,120 C 80,30 20,30 -10,120 Z",
    "M -10,10 C 20,-20 80,-20 110,10 L 110,40 C 80,-50 20,-50 -10,40 Z"
  ]
};

export function ThemeIcon({ colors, patternId }) {
  const [p1, p2, p3] = themePatterns[patternId] || themePatterns.default;
  return (
    <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" preserveAspectRatio="none">
      <path d="M 0 0 H 100 V 100 H 0 Z" fill={colors[0]} />
      <path d={p1} fill={colors[1]} />
      <path d={p2} fill={colors[2]} />
      <path d={p3} fill={colors[3]} />
    </svg>
  );
}