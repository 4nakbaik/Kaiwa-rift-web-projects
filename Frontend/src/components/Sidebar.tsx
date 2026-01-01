import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';

interface SidebarProps {
    isMobile: boolean;
    onClose: () => void;
}

const Sidebar = ({ isMobile, onClose }: SidebarProps) => {
    const location = useLocation();
    
    const isActive = (path: string) => location.pathname === path;

    const ScrollMenuItem = ({ to, label, sub, active }: { to: string, label: string, sub: string, active: boolean }) => (
        <Link to={to} className="group block relative pl-6 pr-8 py-3 mb-2" onClick={isMobile ? onClose : undefined}>
            {active && (
                <motion.div 
                    layoutId="brushStroke"
                    className="absolute left-0 top-0 bottom-0 w-1.5 bg-[#cd3f3e]"
                    style={{ borderRadius: '2px 0 0 2px' }}
                />
            )}

            <div className="flex flex-col relative z-10 transition-transform duration-300 group-hover:translate-x-1">
                <div className="flex items-baseline gap-3">

                    <span className={`text-lg font-bold ${active ? 'text-[#cd3f3e]' : 'text-[#8c8c8c] group-hover:text-[#555]'}`}>
                        —
                    </span>
                    
                    <span className={`text-2xl font-calligraphy leading-none ${active ? 'text-black drop-shadow-sm' : 'text-[#333] group-hover:text-black'}`}>
                        {label}
                    </span>
                </div>
                
                <span className={`text-[9px] uppercase tracking-[0.2em] ml-7 font-serif ${active ? 'text-[#8a1c1c]' : 'text-[#888] group-hover:text-[#666]'}`}>
                    {sub}
                </span>
            </div>

            <div className="absolute inset-0 bg-[#cd3f3e] opacity-0 group-hover:opacity-[0.03] transition-opacity duration-500 rounded-r-lg"></div>
        </Link>
    );

    return (
        <div className="h-full w-72 bg-[#e6e2d3] flex flex-col relative overflow-hidden shadow-2xl border-r-4 border-[#5c4033]">
    
            <div className="absolute inset-0 pointer-events-none opacity-40 mix-blend-multiply" 
                 style={{ backgroundImage: "url('https://www.transparenttextures.com/patterns/natural-paper.png')" }}></div>
            <div className="absolute inset-0 pointer-events-none opacity-20 mix-blend-overlay" 
                 style={{ backgroundImage: "url('https://www.transparenttextures.com/patterns/dust.png')" }}></div>
            <div className="h-4 w-full bg-gradient-to-b from-[#3e2b22] to-[#5c4033] shadow-md z-20 relative"></div>

            {/* HEADER */}
            <div className="pt-10 pb-6 px-8 relative z-10 text-center">
                <div className="inline-block border-2 border-black p-3 mb-2 opacity-80">
                    <span className="font-calligraphy text-4xl text-black">目録</span> 
                    {/* Mokuroku (Daftar Isi) */}
                </div>
                <p className="text-[10px] text-[#555] tracking-[0.4em] uppercase font-serif mt-2 border-b border-[#aaa] pb-4">
                    KAIWA RIFT 
                </p>
            </div>

            {/* MENU NAVIGATION */}
            <nav className="flex-1 px-2 py-4 overflow-y-auto relative z-10 space-y-6">
                
                {/* Section 1: MAIN */}
                <div>
                    <p className="px-6 text-[10px] font-bold text-[#888] uppercase tracking-widest mb-2 font-sans writing-vertical-rl">MAIN</p>
                    <ScrollMenuItem to="/dashboard" label="本陣" sub="Honjin (Base)" active={isActive('/dashboard')} />
                </div>

                {/* Section 2: TRAINING */}
                <div>
                    <p className="px-6 text-[10px] font-bold text-[#888] uppercase tracking-widest mb-2 font-sans">TRAINING</p>
                    <ScrollMenuItem to="/flashcards" label="暗記" sub="Anki (Memory)" active={isActive('/flashcards')} />
                    <ScrollMenuItem to="/exam" label="試練" sub="Shiren (Trial)" active={isActive('/exam')} />
                    <ScrollMenuItem to="/exam-kaiwa" label="勇気試し" sub="Tameshi (Challenge)" active={isActive('/exam-kaiwa')} />
                </div>

                {/* Section 3: MENTOR (AI Chatbot) */}
                <div>
                    <p className="px-6 text-[10px] font-bold text-[#888] uppercase tracking-widest mb-2 font-sans">MENTOR</p>
                    <ScrollMenuItem to="/kaiwa" label="翔馬先生" sub="Sensei (AI)" active={isActive('/kaiwa')} />
                </div>

            </nav>

            {/* FOOTER DECOR*/}
            <div className="p-6 relative z-10 text-center opacity-60">
                <div className="w-12 h-12 border border-black rounded-full flex items-center justify-center mx-auto mb-2 opacity-50">
                    <span className="font-calligraphy text-xl text-black">界</span>
                </div>
                <p className="text-[8px] text-[#444] font-mono tracking-widest">© 2026 Kaiwa Rift Projects</p>
            </div>

            <div className="h-6 w-full bg-gradient-to-t from-[#3e2b22] to-[#5c4033] shadow-inner z-20 relative"></div>
        </div>
    );
};

export default Sidebar;