import React from "react";

export const MainBackground = () => (
    <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        {/* Base gradient inspired by provided artwork */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#84add3] via-[#5f8fc2] to-[#f2d8c3]"></div>

        {/* Light bloom top-right */}
        <div className="absolute top-[-35%] right-[-25%] w-[120%] h-[120%] bg-gradient-radial from-white/70 via-white/15 to-transparent blur-3xl mix-blend-screen"></div>

        {/* Subtle rays */}
        <div className="absolute top-[-10%] right-[-10%] w-[130%] h-[130%] opacity-35 bg-[conic-gradient(at_top_right,_rgba(255,255,255,0.8)_0deg,_transparent_12deg,_rgba(255,255,255,0.45)_28deg,_transparent_48deg,_rgba(255,255,255,0.6)_70deg,_transparent_90deg)] blur-2xl"></div>

        {/* Sparkles */}
        <div className="absolute inset-0 opacity-25" style={{ backgroundImage: 'radial-gradient(white 1.5px, transparent 1.5px)', backgroundSize: '70px 70px' }}></div>

        {/* Bottom waves */}
        <div className="absolute bottom-0 left-0 right-0 h-[45%] z-0 pointer-events-none">
            <svg viewBox="0 0 1440 320" className="absolute bottom-2 w-full h-full text-white/25" preserveAspectRatio="none">
                <path fill="currentColor" d="M0,160L60,170.7C120,181,240,203,360,202.7C480,203,600,181,720,176C840,171,960,181,1080,186.7C1200,192,1320,192,1380,192L1440,192L1440,320L1380,320C1320,320,1200,320,1080,320C960,320,840,320,720,320C600,320,480,320,360,320C240,320,120,320,60,320L0,320Z"></path>
            </svg>
            <svg viewBox="0 0 1440 320" className="absolute bottom-[-10px] w-full h-full text-white/40" preserveAspectRatio="none">
                <path fill="currentColor" d="M0,224L48,213.3C96,203,192,181,288,181.3C384,181,480,203,576,218.7C672,235,768,245,864,229.3C960,213,1056,171,1152,165.3C1248,160,1344,192,1392,208L1440,224L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path>
            </svg>
            <svg viewBox="0 0 1440 320" className="absolute bottom-0 w-full h-full" preserveAspectRatio="none">
                <defs>
                    <linearGradient id="wave-grad-new" x1="0" x2="0" y1="0" y2="1">
                        <stop offset="0%" stopColor="rgba(255, 250, 240, 0.1)" />
                        <stop offset="100%" stopColor="rgba(247, 215, 193, 0.7)" />
                    </linearGradient>
                </defs>
                <path fill="url(#wave-grad-new)" d="M0,256L60,245.3C120,235,240,213,360,213.3C480,213,600,235,720,245.3C840,256,960,256,1080,245.3C1200,235,1320,213,1380,202.7L1440,192L1440,320L0,320Z"></path>
            </svg>
        </div>
    </div>
);
