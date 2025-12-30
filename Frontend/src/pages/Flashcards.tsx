import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQueryClient, useMutation } from '@tanstack/react-query';
import { 
    CheckCircle, HelpCircle, XCircle, ChevronLeft, Play, Stamp, 
    Layers, BookOpen, Scroll 
} from 'lucide-react';
import api from '../services/api';
import { kanaCharts, kanjiList } from '../data/referenceData';

// --- TYPES ---
interface CardData {
    id: number;
    kanji: string;
    kana: string;
    romaji: string;
    meaning: string;
    example_sentence?: string;
}

interface KanjiData {
    char: string;
    on: string;
    kun: string;
    arti: string;
    level: number;
}

// --- ASSETS CONFIG ---
const TOTAL_COVERS = 20; // set cover kartu depan(cover0-cover ke n)

// --- COMPONENT: BACKGROUND ---
const SengokuBackground = () => (
    <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden bg-[#0a0806]">
        <div 
            className="absolute inset-0 bg-cover bg-center transition-all duration-1000"
            style={{ 
                backgroundImage: "url('/images/training.jpg')", //Set bg
                filter: "sepia(0.8) contrast(1.2) brightness(0.3) blur(4px)" 
            }}
        />
        <div className="absolute inset-0 opacity-40 bg-[url('https://www.transparenttextures.com/patterns/rice-paper-3.png')] mix-blend-overlay"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,#000000_100%)] opacity-80"></div>
        <div className="dust-overlay"></div>
    </div>
);

// --- COMPONENTS: PAPER CARD---
const OfudaCard = ({ children, isBack = false }: { children: React.ReactNode, isBack?: boolean }) => {
    return (
        <div 
            className={`absolute w-full h-full backface-hidden flex flex-col overflow-hidden shadow-2xl transition-colors duration-500
            ${isBack 
                ? 'bg-[#d8c8b0]' 
                : 'bg-[#f4ebd9]' 
            }`}
            style={{
                transform: isBack ? "rotateY(180deg)" : "rotateY(0deg)",
                backfaceVisibility: 'hidden',
                WebkitBackfaceVisibility: 'hidden',
                clipPath: "polygon(2% 0, 98% 1%, 100% 98%, 1% 100%)",
            }}
        >
            {/* Textures */}
            <div className="absolute inset-0 opacity-40 pointer-events-none" style={{ backgroundImage: "url('https://www.transparenttextures.com/patterns/noise.png')" }}></div>
            <div className="absolute inset-0 opacity-30 pointer-events-none mix-blend-multiply" style={{ backgroundImage: "url('https://www.transparenttextures.com/patterns/rice-paper-2.png')" }}></div>
            <div className="absolute inset-0 shadow-[inset_0_0_80px_rgba(62,39,35,0.4)] pointer-events-none z-10"></div>

            {/* Content Layer */}
            <div className="relative z-20 h-full flex flex-col">
                <div className="absolute inset-3 border-2 border-[#5c4033] opacity-60 rounded-sm pointer-events-none" style={{ borderRadius: '2px 4px 2px 5px' }}></div>
                {children}
            </div>
        </div>
    );
};

// --- COMPONENT: HANKO BUTTON ---
const HankoButton = ({ onClick, label, sub, color }: { onClick: (e: React.MouseEvent) => void, label: string, sub: string, color: 'red' | 'yellow' | 'green' }) => {
    const colors = {
        red: "border-[#b71c1c] text-[#b71c1c] bg-[#b71c1c]/10 hover:bg-[#b71c1c] hover:text-[#fff8e1]",
        yellow: "border-[#f57f17] text-[#f57f17] bg-[#f57f17]/10 hover:bg-[#f57f17] hover:text-black",
        green: "border-[#1b5e20] text-[#1b5e20] bg-[#1b5e20]/10 hover:bg-[#1b5e20] hover:text-[#fff8e1]",
    };

    return (
        <button 
            onClick={onClick}
            aria-label={`${sub} (${label})`} 
            className={`w-24 h-24 rounded-full border-[3px] flex flex-col items-center justify-center transition-all duration-200 active:scale-95 shadow-xl backdrop-blur-sm group relative overflow-hidden ${colors[color]}`}
        >
            <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/rice-paper.png')]"></div>
            <span className="font-calligraphy text-3xl font-black leading-none mb-1 group-hover:scale-110 transition-transform relative z-10">{label}</span>
            <span className="text-[9px] font-serif uppercase tracking-widest font-bold opacity-80 relative z-10">{sub}</span>
        </button>
    );
};

// --- KANA SCROLL COMPONENT ---
const KanaChart = ({ onBack }: { onBack: () => void }) => {
    const RenderGrid = ({ data, romajiData, title, color }: { data: string[][], romajiData: string[][], title: string, color: string }) => (
        <div className={`bg-[#e6e2d3] text-[#1a1a1a] p-6 shadow-[0_10px_30px_rgba(0,0,0,0.5)] relative overflow-hidden border-t-4 border-b-4 ${color} mb-8`}>
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/rice-paper.png')] opacity-40 pointer-events-none"></div>
            <h3 className={`text-center font-calligraphy text-2xl mb-6 border-b border-[#333] pb-2 inline-block w-full text-[#333]`}>{title}</h3>
            <div className="grid grid-cols-5 gap-2 relative z-10">
                {data.flat().map((char, i) => {
                    const romaji = romajiData.flat()[i];
                    return (
                        <div key={i} className={`aspect-square flex flex-col items-center justify-center border border-[#333]/10 ${char ? 'hover:bg-[#1a1a1a] hover:text-[#e6e2d3] transition-colors cursor-default' : 'invisible'}`}>
                            <span className="text-xl md:text-2xl font-serif font-bold">{char}</span>
                            <span className="text-[9px] font-mono opacity-60 uppercase tracking-widest">{romaji}</span>
                        </div>
                    )
                })}
            </div>
        </div>
    );

    return (
        <div className="relative z-10 w-full max-w-6xl mx-auto h-[85vh] flex flex-col font-serif">
            <div className="flex items-center gap-4 mb-6 bg-[#1a1a1a] p-4 border-b-2 border-[#cd3f3e] shadow-lg sticky top-0 z-20">
                <button onClick={onBack} aria-label="Back to Menu" className="text-[#e6e2d3] hover:text-[#cd3f3e] transition-colors"><ChevronLeft size={28}/></button>
                <h2 className="text-3xl font-calligraphy text-[#e6e2d3] tracking-widest">仮名 (Kana Scroll)</h2>
            </div>
            
            <div className="flex-1 overflow-y-auto pr-2 grid grid-cols-1 lg:grid-cols-2 gap-8 pb-10 scrollbar-hide">
                <div className="space-y-8">
                    <RenderGrid data={kanaCharts.hiragana_seion} romajiData={kanaCharts.romaji_seion} title="平仮名 (Hiragana)" color="border-[#3e2723]" />
                    <RenderGrid data={kanaCharts.hiragana_dakuon} romajiData={kanaCharts.romaji_dakuon} title="濁音 (Dakuon)" color="border-[#3e2723]" />
                    <RenderGrid data={kanaCharts.hiragana_yoon} romajiData={kanaCharts.romaji_yoon} title="拗音 (Yoon)" color="border-[#3e2723]" />
                </div>
                <div className="space-y-8">
                    <RenderGrid data={kanaCharts.katakana_seion} romajiData={kanaCharts.romaji_seion} title="片仮名 (Katakana)" color="border-[#1a237e]" />
                    <RenderGrid data={kanaCharts.katakana_dakuon} romajiData={kanaCharts.romaji_dakuon} title="濁音 (Dakuon)" color="border-[#1a237e]" />
                    <RenderGrid data={kanaCharts.katakana_yoon} romajiData={kanaCharts.romaji_yoon} title="拗音 (Yoon)" color="border-[#1a237e]" />
                </div>
            </div>
        </div>
    );
};

// --- KANJI ARCHIVE COMPONENT ---
const KanjiChart = ({ onBack }: { onBack: () => void }) => {
    const [level, setLevel] = useState(5);
    const filteredKanji = (kanjiList as KanjiData[]).filter(k => k.level === level);

    return (
        <div className="relative z-10 w-full max-w-7xl mx-auto h-[90vh] flex flex-col font-serif">
            <div className="flex flex-col md:flex-row items-center justify-between mb-6 bg-[#1a1a1a] p-4 border-b-2 border-[#cd3f3e] shadow-lg sticky top-0 z-20">
                <div className="flex items-center gap-4 mb-4 md:mb-0">
                    <button onClick={onBack} aria-label="Back to Menu" className="text-[#e6e2d3] hover:text-[#cd3f3e] transition-colors"><ChevronLeft size={28}/></button>
                    <h2 className="text-3xl font-calligraphy text-[#e6e2d3] tracking-widest">漢字 (Kanji Archive)</h2>
                </div>
                <div className="flex gap-4">
                    <button onClick={() => setLevel(5)} className={`px-4 py-1 font-bold border-2 ${level === 5 ? 'bg-[#cd3f3e] text-black border-[#cd3f3e]' : 'text-[#cd3f3e] border-[#cd3f3e] hover:bg-[#cd3f3e] hover:text-black'} transition-all uppercase tracking-widest`}>N5</button>
                    <button onClick={() => setLevel(4)} className={`px-4 py-1 font-bold border-2 ${level === 4 ? 'bg-[#cd3f3e] text-black border-[#cd3f3e]' : 'text-[#cd3f3e] border-[#cd3f3e] hover:bg-[#cd3f3e] hover:text-black'} transition-all uppercase tracking-widest`}>N4</button>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto pr-2 pb-20 scrollbar-hide">
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                    {filteredKanji.map((k, i) => (
                        <div key={i} className="bg-[#e6e2d3] text-[#1a1a1a] relative overflow-hidden group hover:-translate-y-1 transition-transform duration-300 flex flex-col border border-[#333] shadow-md hover:shadow-xl">
                            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/rice-paper.png')] opacity-50 pointer-events-none"></div>
                            
                            <div className="aspect-square flex items-center justify-center border-b border-[#333] relative bg-[#f2eadd]">
                                <span className="text-6xl font-calligraphy z-10 group-hover:scale-110 transition-transform duration-300 text-black">{k.char}</span>
                            </div>
                            
                            <div className="p-3 flex-1 flex flex-col justify-between bg-[#e6e2d3]">
                                <div className="space-y-1 mb-2">
                                    <div className="flex gap-2 text-xs border-b border-[#ccc] pb-1"><span className="font-bold text-[#1a237e] w-8">ON</span><span className="font-medium truncate">{k.on}</span></div>
                                    <div className="flex gap-2 text-xs"><span className="font-bold text-[#1b5e20] w-8">KUN</span><span className="font-medium truncate">{k.kun}</span></div>
                                </div>
                                <div className="pt-2 border-t border-[#ccc] text-center">
                                    <p className="text-sm font-bold text-[#b71c1c] uppercase tracking-wide leading-tight">{k.arti}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

// --- FLASHCARD GAME LOGIC ---
const FlashcardGame = ({ onBack }: { onBack: () => void }) => {
    const [view, setView] = useState<'setup' | 'game' | 'result'>('setup');
    const [cards, setCards] = useState<CardData[]>([]);
    const [targetCount, setTargetCount] = useState<string>('10');
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isFlipped, setIsFlipped] = useState(false);
    const [loading, setLoading] = useState(false);
    
    const queryClient = useQueryClient();
    const audioRef = useRef(new Audio('/sounds/flip.mp3'));

    const startSession = async () => {
        setLoading(true);
        try {
            const res = await api.get('/api/flashcards');
            if (Array.isArray(res.data.data)) {
                const limit = parseInt(targetCount) || 10;
                setCards(res.data.data.slice(0, limit));
                setCurrentIndex(0);
                setIsFlipped(false);
                setView('game');
            }
        } catch (err) { console.error(err); } 
        finally { setLoading(false); }
    };

    const handleFlip = () => {
        try { audioRef.current.play().catch(() => {}); } catch (e) {}
        setIsFlipped(!isFlipped);
    };

    const reviewMutation = useMutation({
        mutationFn: (data: { vocab_id: number; result: number }) => api.post('/api/review', data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['dashboardStats'] });
        }
    });

    const handleReview = (result: number) => {
        const currentCard = cards[currentIndex];
        reviewMutation.mutate({ vocab_id: currentCard.id, result });

        if (currentIndex < cards.length - 1) {
            setIsFlipped(false);
            setTimeout(() => setCurrentIndex((prev: number) => prev + 1), 200);
        } else {
            setView('result');
        }
    };

    // SETUP
    if (view === 'setup') return (
        <div className="relative z-10 w-full max-w-md bg-[#e6e2d3] p-10 border-4 border-[#3e2b22] text-center shadow-[0_25px_50px_rgba(0,0,0,0.8)] font-serif relative">
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/rice-paper.png')] opacity-30 pointer-events-none"></div>
            <h2 className="text-5xl font-calligraphy text-[#1a1a1a] mb-2 relative z-10">修練開始</h2>
            <p className="text-[#5d4037] mb-10 text-xs tracking-[0.3em] uppercase font-bold relative z-10">Begin Training</p>
            
            <div className="flex items-center justify-center gap-4 mb-12 relative z-10">
                <input 
                    type="number" min="1" max="100" value={targetCount}
                    onChange={(e) => setTargetCount(e.target.value)}
                    aria-label="Jumlah Kartu"
                    className="w-32 bg-[#f2eadd] border-b-4 border-[#8a1c1c] text-[#1a1a1a] text-6xl font-calligraphy text-center p-2 focus:outline-none focus:border-[#b71c1c]"
                />
                <span className="text-xl font-calligraphy text-[#3e2b22] mt-4">枚</span>
            </div>

            <div className="flex gap-4 relative z-10">
                <button onClick={onBack} className="flex-1 py-4 font-bold text-[#5d4037] hover:bg-[#d7ccc8] uppercase tracking-widest border-2 border-[#5d4037] transition-colors">Batal</button>
                <button 
                    onClick={startSession} 
                    disabled={loading || parseInt(targetCount) < 1}
                    className="flex-[2] py-4 font-bold bg-[#8a1c1c] text-[#f2eadd] hover:bg-[#a62222] uppercase tracking-widest flex items-center justify-center gap-2 border-2 border-[#5c1010] shadow-lg transition-colors"
                >
                    {loading ? '...' : <>Start <Play size={16} fill="currentColor"/></>}
                </button>
            </div>
        </div>
    );

    // RESULT
    if (view === 'result') return (
        <div className="flex flex-col items-center justify-center p-12 bg-[#e6e2d3] border-8 border-[#3e2b22] max-w-md relative z-10 shadow-2xl">
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/rice-paper.png')] opacity-30 pointer-events-none"></div>
            <motion.div initial={{ scale: 2, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="mb-6 p-6 border-4 border-[#8a1c1c] rounded-full relative bg-[#8a1c1c]/10">
                <Stamp className="w-24 h-24 text-[#8a1c1c]" />
            </motion.div>
            <h2 className="font-calligraphy text-4xl mb-2 text-[#3e2723]">修練終了</h2>
            <p className="text-[#5d4037] mb-8 text-xs tracking-[0.3em] uppercase">Session Complete</p>
            <button onClick={onBack} className="bg-[#1a1a1a] text-[#e6e2d3] px-12 py-4 font-bold hover:bg-[#333] border-2 border-[#d4af37] relative z-10 uppercase tracking-widest transition-all">Return</button>
        </div>
    );

    // GAME LOOP
    const card = cards[currentIndex];
    const imageIndex = card ? (card.id % TOTAL_COVERS) : 0;
    const currentCover = `/images/cover${imageIndex}.jpg`;

    return (
        <div className="w-full flex flex-col items-center justify-center relative z-10 h-[85vh]">
            
            {/* Header: Counter */}
            <div className="w-full max-w-[360px] flex justify-between items-center mb-8 px-4">
                <button onClick={() => setView('setup')} aria-label="Back" className="text-[#e6e2d3] hover:text-[#cd3f3e] transition-colors"><ChevronLeft size={32}/></button>
                <div className="text-[#e6e2d3] font-calligraphy text-2xl tracking-[0.2em] bg-black/50 backdrop-blur-sm px-6 py-2 border-b-2 border-[#cd3f3e]">
                    {currentIndex + 1} <span className="text-sm text-[#888]">/</span> {cards.length}
                </div>
            </div>

            {/* CARD 3D CONTAINER */}
            <div className="relative w-full max-w-[360px] aspect-[3/4.8] perspective-1000">
                <motion.div
                    className="w-full h-full relative preserve-3d cursor-pointer"
                    style={{ transformStyle: "preserve-3d" }}
                    animate={{ rotateY: isFlipped ? 180 : 0 }}
                    transition={{ duration: 0.6, type: "spring", stiffness: 260, damping: 20 }}
                    onClick={handleFlip}
                >
                    {/* --- DEPAN (0 deg) --- */}
                    <OfudaCard>
                        <div className="h-[55%] w-full relative overflow-hidden border-b-4 border-[#8a1c1c] bg-[#0c0c0c]">
                            <img 
                                src={currentCover} 
                                className="w-full h-full object-cover opacity-90 sepia-[0.3] hover:sepia-0 transition-all duration-700 hover:scale-110"
                                onError={(e) => { (e.currentTarget as HTMLImageElement).src = `https://picsum.photos/seed/${imageIndex}/600/400?grayscale`; }}
                                alt="Subject"
                            />
                            <div className="absolute top-3 right-3 bg-[#8a1c1c] text-[#f2eadd] text-xs font-black px-2 py-1 writing-vertical-rl border border-[#3e2b22] shadow-md tracking-widest opacity-90">
                                五級
                            </div>
                        </div>
                        <div className="flex-1 flex flex-col items-center justify-center p-4 relative">
                            <div className="absolute opacity-5 font-calligraphy text-9xl text-[#3e2723] select-none pointer-events-none top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">界</div>
                            <h1 className="font-calligraphy text-8xl text-[#1a1a1a] mb-2 leading-none drop-shadow-[2px_2px_0px_rgba(0,0,0,0.1)] relative z-10 mix-blend-multiply">
                                {card?.kanji || "?"}
                            </h1>
                            <div className="w-16 h-1 bg-[#8a1c1c] rounded-full mt-2 opacity-80"></div>
                        </div>
                    </OfudaCard>

                    {/* --- BELAKANG (180 deg) --- */}
                    <OfudaCard isBack={true}>
                        <div className="flex-1 flex flex-col items-center p-8 text-center h-full relative border-[6px] border-double border-[#5c4033] m-2 bg-[#dccbba]">
                            <div className="absolute top-0 -translate-y-1/2 bg-[#1a237e] text-[#f2eadd] px-4 py-1 text-[10px] font-bold tracking-[0.2em] uppercase border border-[#888] shadow-sm">
                                Answer
                            </div>
                            <div className="mt-8 mb-6 w-full">
                                <h2 className="font-calligraphy text-6xl text-[#1a237e] mb-2 mix-blend-multiply leading-tight">{card?.kana}</h2>
                                <p className="font-mono text-sm text-[#5d4037] opacity-60 tracking-widest uppercase">/ {card?.romaji} /</p>
                            </div>
                            <div className="w-12 h-px bg-[#5c4033] mb-6 opacity-50"></div>
                            <div className="flex-1 flex items-center justify-center w-full">
                                <p className="font-serif text-3xl font-black text-[#3e2723] leading-tight capitalize drop-shadow-sm">
                                    {card?.meaning}
                                </p>
                            </div>
                            {card?.example_sentence && (
                                <div className="mt-auto w-full pt-4 border-t border-[#8d6e63]/30 text-left">
                                    <span className="text-[9px] text-[#8a1c1c] font-bold uppercase tracking-wider block mb-1">Example:</span>
                                    <p className="text-xs text-[#5d4037] font-serif italic leading-relaxed opacity-90">"{card?.example_sentence}"</p>
                                </div>
                            )}
                        </div>
                    </OfudaCard>
                </motion.div>
            </div>

            {/* STAMPS */}
            <AnimatePresence>
                {isFlipped && (
                    <motion.div 
                        initial={{ opacity: 0, y: 30 }} 
                        animate={{ opacity: 1, y: 0 }} 
                        exit={{ opacity: 0, y: 10 }}
                        className="flex gap-6 mt-10 z-20"
                    >
                        <HankoButton onClick={(e) => { e.stopPropagation(); handleReview(0); }} label="忘" sub="Lupa" color="red" />
                        <HankoButton onClick={(e) => { e.stopPropagation(); handleReview(1); }} label="疑" sub="Ragu" color="yellow" />
                        <HankoButton onClick={(e) => { e.stopPropagation(); handleReview(2); }} label="覚" sub="Ingat" color="green" />
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

// --- MAIN PAGE WRAPPER ---
const Flashcards = () => {
    const [mode, setMode] = useState<'menu' | 'play' | 'chart_kana' | 'chart_kanji'>('menu'); 

    return (
        <div className="w-full min-h-screen bg-[#0c0c0c] flex flex-col items-center justify-center relative overflow-hidden font-sans">
            <SengokuBackground />

            <AnimatePresence mode='wait'>
                {mode === 'menu' && (
                    <motion.div 
                        key="menu"
                        initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
                        className="relative z-10 text-center w-full max-w-5xl px-4"
                    >
                        <div className="mb-16 relative inline-block">
                            <h1 className="text-7xl md:text-9xl font-black text-[#e6e2d3] font-calligraphy tracking-tight mb-2 drop-shadow-[0_10px_30px_rgba(0,0,0,1)]">暗記道場</h1>
                            <div className="h-1 w-32 bg-[#8a1c1c] mx-auto opacity-80"></div>
                            <p className="text-[#888] font-serif tracking-[0.5em] text-sm uppercase mt-4">"Orang yang ingin terlihat pintar telah kehilangan kepintarannya lebih dulu" -ショウマ先生</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
                            <button onClick={() => setMode('play')} aria-label="Practice" className="group relative h-72 bg-[#141414] border border-[#333] hover:border-[#8a1c1c] transition-all shadow-2xl hover:-translate-y-1 flex flex-col overflow-hidden">
                                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/rice-paper.png')] opacity-10"></div>
                                <div className="flex-1 flex flex-col items-center justify-center p-6 group-hover:bg-[#8a1c1c]/10 transition-colors">
                                    <div className="mb-4 text-[#8a1c1c] group-hover:scale-110 transition-transform"><Layers size={48} strokeWidth={1} /></div>
                                    <h3 className="text-3xl font-calligraphy text-[#e6e2d3] mb-1">練習</h3>
                                    <p className="text-[#555] text-[10px] uppercase tracking-widest font-serif group-hover:text-[#8a1c1c]">Practice</p>
                                </div>
                            </button>

                            <button onClick={() => setMode('chart_kana')} aria-label="Kana Chart" className="group relative h-72 bg-[#141414] border border-[#333] hover:border-[#1a237e] transition-all shadow-2xl hover:-translate-y-1 flex flex-col overflow-hidden">
                                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/rice-paper.png')] opacity-10"></div>
                                <div className="flex-1 flex flex-col items-center justify-center p-6 group-hover:bg-[#1a237e]/10 transition-colors">
                                    <div className="mb-4 text-[#1a237e] font-serif font-black text-5xl group-hover:scale-110 transition-transform">あ</div>
                                    <h3 className="text-3xl font-calligraphy text-[#e6e2d3] mb-1">仮名</h3>
                                    <p className="text-[#555] text-[10px] uppercase tracking-widest font-serif group-hover:text-[#1a237e]">Kana Chart</p>
                                </div>
                            </button>

                            <button onClick={() => setMode('chart_kanji')} aria-label="Kanji List" className="group relative h-72 bg-[#141414] border border-[#333] hover:border-[#f57f17] transition-all shadow-2xl hover:-translate-y-1 flex flex-col overflow-hidden">
                                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/rice-paper.png')] opacity-10"></div>
                                <div className="flex-1 flex flex-col items-center justify-center p-6 group-hover:bg-[#f57f17]/10 transition-colors">
                                    <div className="mb-4 text-[#f57f17] font-serif font-black text-5xl group-hover:scale-110 transition-transform">漢</div>
                                    <h3 className="text-3xl font-calligraphy text-[#e6e2d3] mb-1">漢字</h3>
                                    <p className="text-[#555] text-[10px] uppercase tracking-widest font-serif group-hover:text-[#f57f17]">Kanji List</p>
                                </div>
                            </button>
                        </div>
                    </motion.div>
                )}

                {mode === 'play' && <motion.div key="play" className="w-full h-full flex items-center justify-center"><FlashcardGame onBack={() => setMode('menu')} /></motion.div>}
                {mode === 'chart_kana' && <motion.div key="kana" className="w-full h-full pt-4 px-4"><KanaChart onBack={() => setMode('menu')} /></motion.div>}
                {mode === 'chart_kanji' && <motion.div key="kanji" className="w-full h-full pt-4 px-4"><KanjiChart onBack={() => setMode('menu')} /></motion.div>}
            </AnimatePresence>
        </div>
    );
};

export default Flashcards;