import React from 'react';

// Using simple SVG icons to avoid external heavy dependencies, styled to match Material Symbols

export const SpaIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M12 2C7.5 2 4 6.5 4 11C4 16.5 8 21 12 21C16 21 20 16.5 20 11C20 6.5 16.5 2 12 2ZM12 19C9.5 19 7 15.5 7 12C7 9.5 9 7 12 7C15 7 17 9.5 17 12C17 15.5 14.5 19 12 19Z"/>
  </svg>
);

export const GfaLogo = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 120" className={className} fill="currentColor">
    {/* Stem */}
    <path d="M47 70 L47 110" stroke="currentColor" strokeWidth="6" strokeLinecap="round" />
    
    {/* Leaves */}
    <path d="M47 100 Q25 100 20 85 Q35 85 47 95" fill="currentColor" />
    <path d="M47 100 Q69 100 74 85 Q59 85 47 95" fill="currentColor" />

    {/* Center */}
    <circle cx="47" cy="47" r="9" fill="currentColor" />

    {/* Petals (Heart Shapes) - Adjusted for better symmetry */}
    {/* Top */}
    <path d="M47 38 C 35 15, 15 35, 40 45 C 43 46, 51 46, 54 45 C 79 35, 59 15, 47 38" fill="none" stroke="currentColor" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
    
    {/* Top Right */}
    <path d="M56 40 C 75 25, 90 50, 65 60 C 62 61, 58 55, 56 50" fill="none" stroke="currentColor" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
    
    {/* Bottom Right */}
    <path d="M56 54 C 80 65, 60 90, 50 65" fill="none" stroke="currentColor" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />

    {/* Bottom Left */}
    <path d="M38 54 C 14 65, 34 90, 44 65" fill="none" stroke="currentColor" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />

    {/* Top Left */}
    <path d="M38 40 C 19 25, 4 50, 29 60 C 32 61, 36 55, 38 50" fill="none" stroke="currentColor" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export const PuzzleIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M19.439 15.435L17 13l-2.439 2.435a2.5 2.5 0 1 1-3.535-3.536L13.46 9.5 11 7.036a2.5 2.5 0 0 0-3.535 3.535L9.9 13l-2.435 2.439a2.5 2.5 0 1 1-3.536-3.535L6.464 9.5 4 7.036a2.5 2.5 0 1 1 3.535-3.535L10 6l2.435-2.439a2.5 2.5 0 1 1 3.536 3.535L13.536 9.5 16 11.964a2.5 2.5 0 0 1 3.535-3.535L22 10.9l-2.561 4.535a2.5 2.5 0 0 1-3.535-3.535z" />
  </svg>
);

export const UsersIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
);

export const DoorIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M13 4h3a2 2 0 0 1 2 2v14" />
    <path d="M2 20h3" />
    <path d="M13 20h9" />
    <path d="M10 12v.01" />
    <path d="M13 4.562v16.157a1 1 0 0 1-1.242.97L5 20V5.562a2 2 0 0 1 1.515-1.94l4-1A2 2 0 0 1 13 4.561Z" />
  </svg>
);

export const MapPinIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
    <circle cx="12" cy="10" r="3" />
  </svg>
);

export const ChevronLeftIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="m15 18-6-6 6-6" />
  </svg>
);

export const SettingsIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.09a2 2 0 0 1-1-1.74v-.47a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.35a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

export const SparklesIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
     <path d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 0 0-2.456 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 0 0-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 0 0 1.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 0 0 1.423 1.423l1.183.394-1.183.394a2.25 2.25 0 0 0-1.423 1.423z" />
  </svg>
);

export const CheckCircleIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path fillRule="evenodd" d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12zm13.36-1.814a.75.75 0 10-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 00-1.06 1.06l2.25 2.25a.75.75 0 001.14-.094l3.75-5.25z" clipRule="evenodd" />
  </svg>
);

export const DragIndicatorIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
    <circle cx="9" cy="5" r="1.5" />
    <circle cx="15" cy="5" r="1.5" />
    <circle cx="9" cy="12" r="1.5" />
    <circle cx="15" cy="12" r="1.5" />
    <circle cx="9" cy="19" r="1.5" />
    <circle cx="15" cy="19" r="1.5" />
  </svg>
);

export const EditIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
  </svg>
);

export const TrashIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
  </svg>
);

export const PlusIcon = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
    </svg>
);

export const MoreDotsIcon = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
        <path fillRule="evenodd" d="M4.5 12a1.5 1.5 0 1 1 3 0 1.5 1.5 0 0 1-3 0Zm6 0a1.5 1.5 0 1 1 3 0 1.5 1.5 0 0 1-3 0Zm6 0a1.5 1.5 0 1 1 3 0 1.5 1.5 0 0 1-3 0Z" clipRule="evenodd" />
    </svg>
);

export const CheckIcon = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" className={className}>
        <path d="M20 6 9 17l-5-5" />
    </svg>
);

export const HomeIcon = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
        <polyline points="9 22 9 12 15 12 15 22" />
    </svg>
);

export const BookIcon = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20" />
    </svg>
);

export const MicrophoneIcon = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
        <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
        <line x1="12" x2="12" y1="19" y2="22" />
    </svg>
);

// New: Lego / brick style icon (simple stacked bricks)
export const LegoIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
    {/* Bottom brick */}
    <rect x="2.5" y="9.5" width="19" height="8" rx="1.2" stroke="currentColor" fill="currentColor" fillOpacity="0.06" />
    {/* Top brick */}
    <rect x="4.5" y="4.5" width="15" height="6" rx="1" stroke="currentColor" fill="currentColor" fillOpacity="0.06" />
    {/* Studs */}
    <rect x="6" y="3.2" width="2" height="1.6" rx="0.4" fill="currentColor" />
    <rect x="10" y="3.2" width="2" height="1.6" rx="0.4" fill="currentColor" />
    <rect x="14" y="3.2" width="2" height="1.6" rx="0.4" fill="currentColor" />
  </svg>
);

// New: alternative Puzzle piece icon (single puzzle piece silhouette)
export const Puzzle2Icon = ({ className }: { className?: string }) => (
  // Two-piece puzzle outline (stroke-only) — clearer distinct pieces
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
    {/* Left puzzle piece */}
    <path d="M2.5 6.5h5.5c0.55 0 1 .45 1 1v1.2c0 .66.54 1.2 1.2 1.2.66 0 1.2.54 1.2 1.2s-.54 1.2-1.2 1.2H6.2a1 1 0 0 0-1 1v4.4c0 .55-.45 1-1 1H3" />
    {/* Right puzzle piece */}
    <path d="M21.5 11.5h-5.5c-0.55 0-1 .45-1 1v1.2c0 .66-.54 1.2-1.2 1.2-.66 0-1.2.54-1.2 1.2s.54 1.2 1.2 1.2h4.0c1.1 0 2-.9 2-2v-4.4c0-.55.45-1 1-1h1.5" />
    {/* Interlock indicators (tabs) */}
    <path d="M9.8 8.7c.4-.35.95-.55 1.5-.55.83 0 1.5.67 1.5 1.5S12.13 11.2 11.3 11.2c-.55 0-1.05-.2-1.4-.55" />
    <path d="M14.2 14.8c.4-.35.95-.55 1.5-.55.83 0 1.5.67 1.5 1.5s-.67 1.5-1.5 1.5c-.55 0-1.05-.2-1.4-.55" />
  </svg>
);

// Single puzzle piece (diagonal-style, outline)
export const PuzzlePieceIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
    {/* main body */}
    <path d="M3.5 7.5c0-1 0.8-1.8 1.8-1.8h8.4c.9 0 1.7.7 1.7 1.6v1.6h1.2a1.1 1.1 0 110 2.2H16v3.8c0 .9-.7 1.6-1.6 1.6H6.3a1.6 1.6 0 01-1.6-1.6V7.5z" />
    {/* stud */}
    <circle cx="8.2" cy="5.9" r="0.9" />
  </svg>
);

// Cluster of three puzzle pieces (outline)
export const PuzzleClusterIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
    {/* left-bottom piece */}
    <rect x="2.6" y="12.6" width="6" height="6" rx="1" />
    <circle cx="4.6" cy="11.4" r="0.7" />
    {/* top-middle piece */}
    <rect x="8.4" y="4.4" width="5" height="5" rx="1" />
    <circle cx="10.4" cy="3.2" r="0.6" />
    {/* right piece */}
    <rect x="15.2" y="8.8" width="6" height="6" rx="1" />
    <circle cx="17.2" cy="7.6" r="0.7" />
  </svg>
);

// 2x2 puzzle grid (four pieces forming a square) — outline only
export const PuzzleGridIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
    {/* top-left */}
    <path d="M3.5 3.5h7c.6 0 1 .4 1 1v1.2a1.2 1.2 0 001.2 1.2c.7 0 1.2.6 1.2 1.2s-.5 1.2-1.2 1.2H9.5v6.6c0 .6-.4 1-1 1h-4c-.6 0-1-.4-1-1v-10z" />
    {/* top-right */}
    <path d="M13.5 3.5h7v7c0 .6-.4 1-1 1h-1.2a1.2 1.2 0 00-1.2 1.2c0 .7-.6 1.2-1.2 1.2s-1.2-.5-1.2-1.2V9.5h-1.2c-.6 0-1-.4-1-1v-4c0-.6.4-1 1-1z" />
    {/* bottom-left */}
    <path d="M3.5 13.5h4c.6 0 1 .4 1 1v1.2c0 .7.6 1.2 1.2 1.2.7 0 1.2.6 1.2 1.2s-.5 1.2-1.2 1.2H3.5v-7z" />
    {/* bottom-right */}
    <path d="M13.5 13.5h7v7c0 .6-.4 1-1 1h-7c-.6 0-1-.4-1-1v-6c0-.6.4-1 1-1z" />
  </svg>
);

// Overlapping two-piece puzzle icon inspired by the provided image (stroke-only)
export const PuzzleOverlapIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
    {/* top-left piece (rotated) */}
    <rect x="2.6" y="2.6" width="9.2" height="9.2" rx="1.6" transform="rotate(-28 7.2 7.2)" />
    {/* bottom-right piece */}
    <rect x="10.2" y="10.2" width="9.6" height="9.6" rx="1.6" />
    {/* interlocking tabs (outline circles) */}
    <circle cx="10.4" cy="7.8" r="0.9" />
    <circle cx="12.6" cy="11.6" r="0.9" />
  </svg>
);
