import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { ChevronLeft, Check, X, Lock, Feather, AlertCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import confetti from 'canvas-confetti';

// --- TYPES ---
interface Question {
    id: number;
    question: string; 
    answer: string;   
    hint?: string;    
}

// --- ASSETS ---
const SengokuBackground = () => (
    <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden bg-[#0c0c0c]">
        <div 
            className="absolute inset-0 bg-cover bg-center transition-all duration-1000"
            style={{ 
                backgroundImage: "url('/images/duel.jpg')", 
                filter: "sepia(0.8) contrast(1.2) brightness(0.3) blur(4px)" 
            }}
        />
        <div className="absolute inset-0 opacity-40 bg-[url('https://www.transparenttextures.com/patterns/rice-paper-3.png')] mix-blend-overlay"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,#000000_100%)] opacity-80"></div>
        <div className="dust-overlay"></div>
    </div>
);

// --- COMPONENT: LOCKED SCREEN ---
const LockedScreen = ({ current, required }: { current: number, required: number }) => (
    <div className="relative z-10 w-full max-w-lg bg-[#e6e2d3] p-12 border-8 border-[#3e2b22] text-center shadow-[0_20px_50px_rgba(0,0,0,0.9)] font-serif relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/rice-paper.png')] opacity-30 pointer-events-none"></div>
        <div className="mb-6 flex justify-center text-[#5d4037] opacity-80"><Lock size={64} strokeWidth={1} /></div>
        <h2 className="text-5xl font-calligraphy text-[#1a1a1a] mb-2 relative z-10">試練封印</h2>
        <p className="text-[#8a1c1c] text-xs tracking-[0.4em] uppercase font-bold relative z-10 mb-8 border-b border-[#8a1c1c] inline-block pb-1">Access Denied</p>
        <p className="text-[#3e2723] mb-8 leading-loose font-medium">
            Gerbang ujian tertutup. <br/>
            Kau baru menguasai <span className="font-bold text-[#b71c1c] text-xl">{current}</span> kata. <br/>
            Minimal <span className="font-bold text-[#b71c1c] text-xl">{required}</span> kata diperlukan.
        </p>
        <div className="w-full bg-[#d7ccc8] h-3 rounded-full mb-8 overflow-hidden border border-[#5d4037] relative z-10">
            <motion.div initial={{ width: 0 }} animate={{ width: `${(current/required)*100}%` }} transition={{ duration: 1 }} className="h-full bg-[#8a1c1c]" />
        </div>
        <Link to="/flashcards" className="inline-block px-10 py-3 bg-[#1a1a1a] text-[#e6e2d3] font-bold hover:bg-[#333] border-2 border-[#d4af37] uppercase tracking-widest relative z-10 transition-all">Kembali Berlatih</Link>
    </div>
);

// --- COMPONENT: RESULT STAMP ---
const ResultStamp = ({ score, total }: { score: number, total: number }) => {
    const percentage = total > 0 ? (score / total) * 100 : 0;
    const isPassed = percentage >= 70;
    
    return (
        <motion.div 
            initial={{ scale: 2, opacity: 0, rotate: 10 }}
            animate={{ scale: 1, opacity: 1, rotate: -5 }}
            transition={{ type: "spring", stiffness: 300, damping: 15 }}
            className={`w-40 h-40 border-8 rounded-full flex flex-col items-center justify-center relative mix-blend-multiply ${isPassed ? 'border-[#b71c1c] text-[#b71c1c]' : 'border-[#333] text-[#333]'}`}
            style={{ maskImage: "url('https://www.transparenttextures.com/patterns/rice-paper.png')" }}
        >
            <div className={`absolute inset-0 border-2 rounded-full m-1 ${isPassed ? 'border-[#b71c1c]' : 'border-[#333]'} opacity-50`}></div>
            <span className="font-calligraphy text-6xl font-black">{isPassed ? '合格' : '不合格'}</span>
            <span className="font-serif text-xs font-bold uppercase tracking-[0.3em] mt-2">{isPassed ? 'PASSED' : 'FAILED'}</span>
            <span className="font-mono text-lg font-bold mt-1">{score}/{total}</span>
        </motion.div>
    );
};

// --- MAIN EXAM COMPONENT ---
const Exam = () => {
    const [gameState, setGameState] = useState<'loading' | 'locked' | 'intro' | 'playing' | 'result' | 'error'>('loading');
    const [questions, setQuestions] = useState<Question[]>([]);
    const [meta, setMeta] = useState({ current: 0, required: 0 });
    const [currentQIndex, setCurrentQIndex] = useState(0);
    const [score, setScore] = useState(0);
    const [input, setInput] = useState('');
    const [timeLeft, setTimeLeft] = useState(100);
    const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);
    
    const queryClient = useQueryClient();
    const inputRef = useRef<HTMLInputElement>(null);

    // 1. Fetch & Transform Data dari API
    const { refetch } = useQuery({
        queryKey: ['examData'],
        queryFn: async () => {
            try {
                const res = await api.get('/api/exam-questions');
                
                if (res.data && Array.isArray(res.data.data) && res.data.data.length > 0) {
                    
                    // --- MAPPING DATA BACKEND KE FORMAT SOAL ---
                    const formattedQuestions: Question[] = res.data.data.map((item: any) => ({
                        id: item.id,
                        question: item.kanji || item.kana, 
                        answer: item.romaji, 
                        hint: item.meaning 
                    }));

                    console.log("Soal Siap:", formattedQuestions); 
                    setQuestions(formattedQuestions);
                    setGameState('intro');
                } else {
                    console.error("Data kosong");
                    setGameState('error');
                }
                return res.data;
            } catch (err: any) {
                console.error("API Error:", err);
                if (err.response && err.response.status === 403) {
                    setMeta({ 
                        current: err.response.data.current, 
                        required: err.response.data.required 
                    });
                    setGameState('locked');
                } else {
                    setGameState('error');
                }
                return null;
            }
        },
        retry: false,
        refetchOnWindowFocus: false,
    });

    // 2. Timer
    useEffect(() => {
        if (gameState === 'playing' && !feedback) {
            const timer = setInterval(() => {
                setTimeLeft((prev) => {
                    if (prev <= 0) {
                        handleSubmit(true);
                        return 0;
                    }
                    return prev - 0.2; 
                });
            }, 100);
            return () => clearInterval(timer);
        }
    }, [gameState, feedback]);

    // 3. Auto Focus
    useEffect(() => {
        if (gameState === 'playing' && !feedback) {
            setTimeout(() => inputRef.current?.focus(), 100);
        }
    }, [currentQIndex, gameState, feedback]);

    // 4. Submit Logic
    const handleSubmit = (isTimeout = false) => {
        if (!questions || questions.length === 0) return;
        
        const currentQ = questions[currentQIndex];
        const userAnswer = input.trim().toLowerCase();
        const correctAnswer = currentQ.answer ? currentQ.answer.trim().toLowerCase() : "";
        const isCorrect = !isTimeout && userAnswer === correctAnswer;

        if (isCorrect) {
            setScore(s => s + 1);
            setFeedback('correct');
            confetti({ particleCount: 40, spread: 60, colors: ['#cd3f3e', '#1a1a1a'], origin: { y: 0.7 } });
        } else {
            setFeedback('wrong');
        }

        setTimeout(() => {
            setFeedback(null);
            setInput('');
            setTimeLeft(100);
            
            if (currentQIndex < questions.length - 1) {
                setCurrentQIndex(prev => prev + 1);
            } else {
                setGameState('result');
                queryClient.invalidateQueries({ queryKey: ['dashboardStats'] });
            }
        }, 2000);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !feedback) handleSubmit();
    };

    // --- RENDER STATES ---
    if (gameState === 'loading') return (
        <div className="min-h-screen bg-[#0c0c0c] flex items-center justify-center font-sans">
             <SengokuBackground />
             <p className="text-[#e6e2d3] font-calligraphy text-3xl animate-pulse z-10">読み込み中...</p>
        </div>
    );

    if (gameState === 'locked') return (
        <div className="min-h-screen bg-[#0c0c0c] flex items-center justify-center relative overflow-hidden font-sans">
            <SengokuBackground />
            <LockedScreen current={meta.current} required={meta.required} />
        </div>
    );

    if (gameState === 'error') return (
        <div className="min-h-screen bg-[#0c0c0c] flex items-center justify-center relative overflow-hidden font-sans text-center">
            <SengokuBackground />
            <div className="relative z-10 bg-[#e6e2d3] p-10 border-4 border-[#8a1c1c] text-[#8a1c1c]">
                <AlertCircle size={48} className="mx-auto mb-4" />
                <h2 className="text-2xl font-bold uppercase tracking-widest mb-2">Data Error</h2>
                <p className="text-[#3e2723] mb-6">Tidak ada soal yang tersedia.<br/>Pastikan kau sudah menghafal minimal 25 kotoba.</p>
                <Link to="/dashboard" className="px-6 py-2 bg-[#1a1a1a] text-[#e6e2d3] font-bold uppercase text-xs tracking-widest">Kembali</Link>
            </div>
        </div>
    );

    if (gameState === 'intro') return (
        <div className="min-h-screen bg-[#0c0c0c] flex items-center justify-center relative overflow-hidden font-sans">
            <SengokuBackground />
            <div className="relative z-10 w-full max-w-2xl px-6 text-center">
                <div className="bg-[#e6e2d3] p-12 border-t-8 border-b-8 border-[#3e2b22] shadow-[0_30px_80px_rgba(0,0,0,1)] relative">
                    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/rice-paper.png')] opacity-40 pointer-events-none"></div>
                    <div className="relative z-10">
                        <Feather className="w-12 h-12 text-[#8a1c1c] mx-auto mb-4" />
                        <h1 className="text-7xl font-black text-[#1a1a1a] font-calligraphy mb-4 drop-shadow-sm">筆記試練</h1>
                        <p className="text-[#5d4037] text-xs font-bold uppercase tracking-[0.4em] mb-8 border-b border-[#8a1c1c] inline-block pb-2">The Imperial Examination</p>
                        
                        <div className="grid grid-cols-2 gap-4 mb-10 text-left max-w-md mx-auto">
                            <div className="bg-[#f2eadd] p-4 border border-[#d7ccc8] rounded-sm">
                                <p className="text-[10px] text-[#8a1c1c] font-bold uppercase tracking-wider mb-1">Total Questions</p>
                                <p className="text-3xl font-calligraphy text-[#3e2b22]">{questions.length} <span className="text-sm font-sans">Soal</span></p>
                            </div>
                            <div className="bg-[#f2eadd] p-4 border border-[#d7ccc8] rounded-sm">
                                <p className="text-[10px] text-[#8a1c1c] font-bold uppercase tracking-wider mb-1">Time Limit</p>
                                <p className="text-xl font-serif text-[#3e2b22] pt-1">Burning Incense</p>
                            </div>
                        </div>

                        <div className="flex justify-center gap-6">
                            <Link to="/dashboard" className="px-8 py-4 border-2 border-[#5d4037] text-[#5d4037] font-bold hover:bg-[#d7ccc8] transition-colors uppercase tracking-widest text-xs">
                                Batal
                            </Link>
                            <button onClick={() => setGameState('playing')} className="px-12 py-4 bg-[#8a1c1c] text-[#f2eadd] font-bold hover:bg-[#b71c1c] border-2 border-[#5c1010] uppercase tracking-widest text-xs flex items-center gap-2 shadow-lg transition-transform hover:-translate-y-1">
                                Mulai Ujian <Check size={16} />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );

    if (gameState === 'result') return (
        <div className="min-h-screen bg-[#0c0c0c] flex items-center justify-center relative overflow-hidden font-sans">
            <SengokuBackground />
            <div className="relative z-10 bg-[#e6e2d3] p-16 text-center border-8 border-[#3e2b22] shadow-2xl max-w-lg w-full">
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/rice-paper.png')] opacity-40 pointer-events-none"></div>
                <div className="relative z-10 flex flex-col items-center">
                    <ResultStamp score={score} total={questions.length} />
                    <h3 className="font-calligraphy text-3xl text-[#3e2b22] mb-8">
                        {score >= (questions.length * 0.7) ? "Luar Biasa!" : "Teruslah Berlatih."}
                    </h3>
                    <div className="flex gap-4 w-full">
                        <Link to="/dashboard" className="flex-1 py-4 border-2 border-[#333] text-[#333] font-bold hover:bg-[#d7ccc8] uppercase tracking-widest text-xs transition-colors flex items-center justify-center">
                            Dojo
                        </Link>
                        <button 
                            onClick={() => { setGameState('loading'); refetch(); }}
                            className="flex-1 py-4 bg-[#1a1a1a] text-[#e6e2d3] font-bold hover:bg-[#333] uppercase tracking-widest text-xs border-2 border-transparent transition-colors"
                        >
                            Ulangi
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );

    // --- PLAYING STATE ---
    const currentQ = questions[currentQIndex];

    if (!currentQ) return <div className="text-white text-center mt-20">Memuat soal...</div>;

    return (
        <div className="min-h-screen bg-[#0c0c0c] flex flex-col items-center justify-center relative overflow-hidden font-sans">
            <SengokuBackground />

            {/* Topbar Info */}
            <div className="absolute top-0 left-0 w-full p-8 flex justify-between items-start z-20">
                <button onClick={() => setGameState('intro')} className="text-[#e6e2d3] hover:text-[#cd3f3e] transition-colors bg-black/40 p-2 rounded-full backdrop-blur-sm border border-white/10">
                    <ChevronLeft size={24} />
                </button>
                <div className="text-right">
                    <p className="text-[#e6e2d3] font-calligraphy text-3xl drop-shadow-md">{currentQIndex + 1} <span className="text-lg opacity-60">/</span> {questions.length}</p>
                </div>
            </div>

            {/* Game Container */}
            <div className="relative z-10 w-full max-w-3xl px-6">
                
                {/* 1. Timer Bar */}
                <div className="w-full h-3 bg-[#333] mb-12 rounded-full overflow-hidden border-2 border-[#1a1a1a] shadow-lg relative">
                    <motion.div 
                        className="h-full bg-gradient-to-r from-[#8a1c1c] via-[#cd3f3e] to-[#ff5252]"
                        style={{ width: `${timeLeft}%` }}
                        animate={{ opacity: timeLeft < 20 ? [1, 0.5, 1] : 1 }} 
                    />
                    <motion.div className="absolute top-0 h-full w-2 bg-white blur-sm" style={{ left: `${timeLeft}%` }} animate={{ opacity: [0, 0.5, 0] }} transition={{ duration: 1, repeat: Infinity }} />
                </div>

                {/* 2. Question Scroll */}
                <div className="bg-[#e6e2d3] p-12 md:p-16 relative shadow-[0_50px_100px_rgba(0,0,0,1)] border-t-[12px] border-b-[12px] border-[#3e2b22] flex flex-col items-center min-h-[400px]">
                    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/rice-paper.png')] opacity-30 pointer-events-none"></div>
                    
                    <div className="relative z-10 text-center w-full flex-1 flex flex-col justify-center">
                        <p className="text-[#8a1c1c] font-serif text-xs tracking-[0.4em] uppercase mb-8 font-bold border-b border-[#d7ccc8] pb-2 inline-block">Translate to Romaji</p>
                        
                        {/* SOAL */}
                        <AnimatePresence mode='wait'>
                            <motion.h1 
                                key={currentQ.id}
                                initial={{ opacity: 0, y: 10, filter: 'blur(5px)' }}
                                animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                                exit={{ opacity: 0, y: -10, filter: 'blur(5px)' }}
                                className="text-8xl md:text-9xl font-black text-[#1a1a1a] font-calligraphy mb-12 drop-shadow-sm select-none leading-normal py-4"
                            >
                                {currentQ.question}
                            </motion.h1>
                        </AnimatePresence>

                        {/* Input Field */}
                        <div className="relative max-w-md mx-auto w-full">
                            <input 
                                ref={inputRef}
                                type="text" 
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyDown={handleKeyDown}
                                disabled={feedback !== null}
                                autoFocus
                                placeholder="Jawab..."
                                className={`w-full bg-transparent border-b-4 text-center text-4xl font-serif p-2 focus:outline-none transition-all placeholder:text-[#a1887f]/50 text-[#3e2723]
                                ${feedback === 'correct' ? 'border-green-600' : feedback === 'wrong' ? 'border-red-600' : 'border-[#5d4037] focus:border-[#8a1c1c]'}`}
                            />
                            
                            {/* Feedback Overlay */}
                            <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-16">
                                {feedback === 'correct' && (
                                    <motion.div initial={{scale:0, rotate: -45}} animate={{scale:1, rotate: 0}}>
                                        <Check size={48} className="text-green-600 drop-shadow-md" strokeWidth={5}/>
                                    </motion.div>
                                )}
                                {feedback === 'wrong' && (
                                    <motion.div initial={{scale:0, rotate: 45}} animate={{scale:1, rotate: 0}}>
                                        <X size={48} className="text-red-600 drop-shadow-md" strokeWidth={5}/>
                                    </motion.div>
                                )}
                            </div>
                        </div>

                        {/* Correct Answer Display */}
                        <AnimatePresence>
                            {feedback === 'wrong' && (
                                <motion.div 
                                    initial={{opacity:0, y: 10}} animate={{opacity:1, y: 0}} exit={{opacity:0}}
                                    className="mt-8 p-4 bg-[#b71c1c]/5 border-2 border-[#b71c1c]/20 text-[#b71c1c] rounded-lg inline-block min-w-[200px]"
                                >
                                    <p className="text-[10px] font-bold uppercase tracking-widest mb-1 opacity-70">Jawaban Benar</p>
                                    <p className="text-3xl font-black font-serif">{currentQ.answer}</p>
                                    {currentQ.hint && <p className="text-sm italic opacity-80 mt-2 border-t border-[#b71c1c]/20 pt-1">{currentQ.hint}</p>}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
                
                <div className="text-center mt-8 opacity-40">
                    <p className="text-[#e6e2d3] text-xs font-mono tracking-[0.3em]">PRESS [ENTER] TO SUBMIT</p>
                </div>

            </div>
        </div>
    );
};

export default Exam;