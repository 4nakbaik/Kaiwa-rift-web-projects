import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Volume2, VolumeX, Terminal, Play, AlertTriangle, Ghost, ChevronRight } from 'lucide-react';
import { kaiwaQuestions } from '../data/kaiwa.ts';

// --- TYPES ---
interface Option {
    text: string;
    correct: boolean;
}

interface Question {
    id: number;
    question: string;
    options: Option[];
}

interface AudioContextType {
    playBGM: () => void;
    stopBGM: () => void;
    playSFX: (type: 'msg' | 'timeout' | 'pass' | 'fail') => void;
    toggleMute: () => void;
    isMuted: boolean;
}

// --- UTILS ---
const shuffleArray = <T,>(arr: T[]): T[] => [...arr].sort(() => Math.random() - 0.5);

// --- AUDIO MANAGER ---
const useP5Audio = (): AudioContextType => {
    const bgmRef = useRef<HTMLAudioElement>(new Audio('/sounds/bgm.mp3'));
    const sfxRefs = useRef<{ [key: string]: HTMLAudioElement }>({
        msg: new Audio('/sounds/msg.mp3'),
        timeout: new Audio('/sounds/timeout.mp3'),
        pass: new Audio('/sounds/pass.mp3'),
        fail: new Audio('/sounds/fail.mp3'),
    });
    const [isMuted, setIsMuted] = useState(false);

    useEffect(() => {
        bgmRef.current.loop = true;
        bgmRef.current.volume = 0.3;
        return () => { bgmRef.current.pause(); };
    }, []);

    const playBGM = () => {
        if (!isMuted) bgmRef.current.play().catch(()=>{});
    };

    const stopBGM = () => {
        bgmRef.current.pause();
        bgmRef.current.currentTime = 0;
    };

    const playSFX = (type: 'msg' | 'timeout' | 'pass' | 'fail') => {
        if (!isMuted && sfxRefs.current[type]) {
            const sound = sfxRefs.current[type];
            sound.currentTime = 0;
            sound.play().catch(()=>{});
        }
    };

    const toggleMute = () => {
        if (isMuted) bgmRef.current.play().catch(()=>{}); 
        else bgmRef.current.pause();
        setIsMuted(!isMuted);
    };

    return { playBGM, stopBGM, playSFX, toggleMute, isMuted };
};

// --- COMPONENT: HACKER INTRO (Type Safe) ---
interface HackerIntroProps {
    onComplete: () => void;
    audio: AudioContextType;
}

const HackerIntro = ({ onComplete, audio }: HackerIntroProps) => {
    const [lines, setLines] = useState<string[]>([]);
    const [showButton, setShowButton] = useState(false);

    const logs = [
        "root@phantom:~# init_sequence",
        "Loading kernel... [OK]",
        "Bypassing firewall... [OK]",
        "Injecting payload... [OK]",
        "Secure connection... [ESTABLISHED]"
    ];

    useEffect(() => {
        let delay = 0;
        logs.forEach((log) => {
            delay += 500;
            setTimeout(() => {
                setLines(prev => [...prev, log]);
            }, delay);
        });
        setTimeout(() => setShowButton(true), delay + 500);
    }, []);

    const handleBegin = () => {
        audio.playSFX('msg'); 
        audio.playBGM();
        onComplete();
    };

    return (
        <div className="absolute inset-0 z-50 bg-black font-mono p-4 md:p-8 flex flex-col justify-center overflow-hidden">
            <div className="absolute inset-0 bg-[linear-gradient(rgba(0,255,0,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(0,255,0,0.03)_1px,transparent_1px)] bg-[size:20px_20px] pointer-events-none"></div>
            
            <div className="relative z-10 text-green-500 text-sm md:text-xl space-y-2 h-1/2 overflow-hidden">
                {lines.map((line, idx) => (
                    <motion.div key={idx} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
                        <span className="mr-2 text-blue-400">{">"}</span>{line}
                    </motion.div>
                ))}
            </div>

            <AnimatePresence>
                {showButton && (
                    <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="mt-8 text-center">
                        <button 
                            onClick={handleBegin}
                            className="group relative px-8 py-3 md:px-12 md:py-4 bg-transparent border-[3px] border-red-600 text-red-600 font-black text-xl md:text-3xl italic tracking-tighter hover:bg-red-600 hover:text-black transition-all shadow-[0_0_20px_rgba(255,0,0,0.5)]"
                        >
                            <span className="relative z-10 flex items-center gap-2">
                                BEGIN_MISSION <Play fill="currentColor" />
                            </span>
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

// --- COMPONENT: CHAT BUBBLE ---
interface ChatBubbleProps {
    text: string;
    isUser: boolean;
}

const ChatBubble = ({ text, isUser }: ChatBubbleProps) => (
    <motion.div 
        initial={{ opacity: 0, y: 20, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ type: "spring", stiffness: 400, damping: 20 }}
        className={`flex w-full mb-4 ${isUser ? 'justify-end' : 'justify-start'} relative z-10 px-2`}
    >
        {!isUser && (
            <div className="w-8 h-8 md:w-10 md:h-10 bg-white border-[2px] border-black transform -rotate-3 shadow-md flex-shrink-0 z-20 -mr-3 mt-2 flex items-center justify-center overflow-hidden">
                <img 
                    src={`/images/avatars/${(text.length % 5) + 1}.jpg`} 
                    alt="AV"
                    className="w-full h-full object-cover"
                    onError={(e) => { (e.currentTarget as HTMLElement).style.display = 'none'; }} 
                />
            </div>
        )}
        
        <div className={`relative max-w-[85%]`}>
            <div 
                className={`p-3 md:p-4 font-bold text-sm md:text-lg leading-snug relative drop-shadow-[4px_4px_0_rgba(0,0,0,0.8)]
                ${isUser ? 'bg-black text-white' : 'bg-white text-black'}`}
                style={{
                    clipPath: isUser 
                        ? 'polygon(2% 0%, 100% 0%, 100% 100%, 0% 100%, 5% 40%)' 
                        : 'polygon(0% 0%, 100% 2%, 95% 100%, 0% 100%, 0% 20%)',
                    transform: isUser ? 'skewX(-3deg)' : 'skewX(3deg)'
                }}
            >
                <span className={isUser ? 'italic' : ''}>{text}</span>
            </div>
        </div>
    </motion.div>
);

// --- COMPONENT: GAMEPLAY MODE ---
interface DrillModeProps {
    onBack: () => void;
    audio: AudioContextType;
}

const DrillMode = ({ onBack, audio }: DrillModeProps) => {
    const [maxQuestions, setMaxQuestions] = useState(10);
    const [questionQueue, setQuestionQueue] = useState<Question[]>([]);
    const [currentIdx, setCurrentIdx] = useState(0);
    const [score, setScore] = useState(0);
    const [correctCount, setCorrectCount] = useState(0);
    const [gameState, setGameState] = useState<'playing' | 'finished' | 'timeout'>('playing'); 
    const [timeLeft, setTimeLeft] = useState(15);
    const [bgIndex, setBgIndex] = useState(0);

    useEffect(() => {
        setQuestionQueue(shuffleArray(kaiwaQuestions as unknown as Question[]).slice(0, 10));
    }, []);

    useEffect(() => {
        if (gameState !== 'playing') return;
        if (timeLeft <= 0) {
            audio.playSFX('timeout');
            setGameState('timeout');
            return;
        }
        const timer = setInterval(() => setTimeLeft(p => p - 1), 1000);
        return () => clearInterval(timer);
    }, [timeLeft, gameState, audio]);

    const handleAnswer = (isCorrect: boolean) => {
        if (isCorrect) {
            setScore(s => s + 10);
            setCorrectCount(c => c + 1);
        }

        setTimeout(() => {
            if (currentIdx < maxQuestions - 1) {
                if (currentIdx === 9 && correctCount >= 8 && maxQuestions === 10) {
                    setMaxQuestions(15);
                    const newQuestions = shuffleArray(kaiwaQuestions as unknown as Question[]).slice(0, 5);
                    setQuestionQueue(prev => [...prev, ...newQuestions]);
                }
                
                setCurrentIdx(c => c + 1);
                setTimeLeft(15);
                setBgIndex((prev) => (prev + 1) % 5);
            } else {
                finishGame();
            }
        }, 200);
    };

    const finishGame = () => {
        const percentage = (correctCount / maxQuestions) * 100;
        if (percentage >= 80) audio.playSFX('pass');
        else if (percentage <= 60) audio.playSFX('fail');
        setGameState('finished');
    };

    if (gameState === 'finished') {
        const percentage = Math.round((correctCount / maxQuestions) * 100);
        const isPass = percentage >= 80;
        const isFail = percentage <= 60;

        return (
            <div className="h-full flex flex-col items-center justify-center bg-black relative overflow-hidden text-center p-4">
                <div className="absolute inset-0 bg-[repeating-linear-gradient(45deg,#111,#111_20px,#000_20px,#000_40px)]"></div>
                <motion.div initial={{scale:0}} animate={{scale:1}} className="z-10 relative w-full max-w-md">
                    <h2 className={`text-4xl md:text-6xl font-black italic mb-6 drop-shadow-lg ${isPass ? 'text-green-500' : isFail ? 'text-red-600' : 'text-yellow-400'}`}>
                        {isPass ? "MISSION CLEAR" : isFail ? "MISSION FAILED" : "COMPLETED"}
                    </h2>
                    <div className="bg-white text-black p-4 md:p-8 transform -skew-x-12 border-[4px] border-black shadow-lg mb-8">
                        <div className="text-xl font-bold">ACCURACY</div>
                        <div className="text-6xl md:text-8xl font-black tracking-tighter">{percentage}%</div>
                    </div>
                    <button onClick={onBack} className="bg-red-600 text-white px-8 py-3 font-black text-xl border-4 border-white shadow-lg uppercase w-full hover:bg-white hover:text-red-600 transition-colors">
                        RETURN
                    </button>
                </motion.div>
            </div>
        );
    }

    if (gameState === 'timeout') return (
        <div className="h-full flex flex-col items-center justify-center bg-red-900/95 relative overflow-hidden p-4">
            <motion.div initial={{opacity:0, scale:2}} animate={{opacity:1, scale:1}} className="text-center z-10 w-full max-w-md">
                <AlertTriangle size={80} className="text-black mx-auto mb-4 animate-pulse" />
                <h2 className="text-5xl md:text-7xl font-black text-white italic drop-shadow-lg">CONNECTION LOST</h2>
                <p className="text-xl font-bold bg-black text-red-500 px-4 py-2 inline-block mt-4 transform -skew-x-12">TIME LIMIT EXCEEDED</p>
                <div className="mt-10">
                    <button onClick={onBack} className="bg-black text-white px-8 py-3 font-black text-xl border-4 border-white transition-all shadow-lg w-full">
                        REBOOT
                    </button>
                </div>
            </motion.div>
        </div>
    );

    if (!questionQueue[currentIdx]) return <div className="bg-black h-full"></div>;

    const q = questionQueue[currentIdx];
    const parts = q.question.split('\n').map(l => {
        const s = l.indexOf(':');
        return { text: l.substring(s+1), isUser: l.includes('_____') };
    });

    const timerPercent = (timeLeft / 15) * 100;
    const timerColor = timeLeft > 10 ? 'bg-blue-500' : timeLeft > 5 ? 'bg-yellow-400' : 'bg-red-600';

    return (
        <div className="h-full flex flex-col relative bg-gray-900 overflow-hidden">
            {/* Wallpaper */}
            <div className="absolute inset-0 z-0">
                <img src={`/images/kaiwa_bg${bgIndex}.jpg`} className="w-full h-full object-cover opacity-60 grayscale contrast-125 transition-all duration-500" onError={(e) => (e.currentTarget as HTMLElement).style.display='none'}/>
                <div className="absolute inset-0 bg-red-900/20 mix-blend-multiply"></div>
            </div>

            {/* HEADER (Responsive) */}
            <div className="relative z-20 h-16 flex items-center justify-between px-4 md:px-10 border-b-[4px] border-white bg-red-600 shadow-xl transform skew-x-[-2deg] -mx-2 md:-mx-4 w-[105%]">
                <div className="flex items-center gap-2 md:gap-4 transform skew-x-[2deg]">
                    <span className="bg-black text-white px-3 py-1 font-black italic text-sm md:text-xl border-2 border-white shadow-md">
                        DRILL
                    </span>
                    <span className="font-mono font-bold text-lg md:text-2xl text-black">#{currentIdx + 1}</span>
                </div>
                
                {/* Timer Bar Visual */}
                <div className="flex items-center gap-2 md:gap-4 transform skew-x-[2deg] flex-1 justify-center">
                    <div className="w-24 md:w-1/2 h-4 bg-black border-2 border-white rounded-sm overflow-hidden relative shadow-md">
                        <motion.div 
                            initial={{ width: "100%" }}
                            animate={{ width: `${timerPercent}%` }}
                            transition={{ ease: "linear", duration: 1 }}
                            className={`h-full ${timerColor}`}
                        />
                    </div>
                    <span className="font-black text-white text-xl md:text-3xl drop-shadow-md w-8 text-center">{timeLeft}</span>
                </div>

                <div className="transform skew-x-[2deg] w-12 md:w-24 flex justify-end">
                    <button onClick={audio.toggleMute} className="bg-black p-1 md:p-2 rounded border-2 border-white text-white hover:bg-gray-800 transition-colors">
                        {audio.isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
                    </button>
                </div>
            </div>

            {/* BODY */}
            <div className="flex-1 flex flex-col md:flex-row p-4 md:p-8 gap-4 md:gap-8 relative z-10 overflow-hidden">
                
                {/* Chat Display */}
                <div className="flex-1 overflow-y-auto pr-2 md:pr-4 space-y-4 md:space-y-8 scrollbar-hide [&::-webkit-scrollbar]:hidden flex flex-col justify-center h-[60%] md:h-auto">
                    {parts.map((p, i) => (
                        <ChatBubble key={`${currentIdx}-${i}`} text={p.text} isUser={p.isUser} />
                    ))}
                </div>

                {/* Options */}
                <div className="h-[40%] md:h-auto md:w-1/3 flex flex-col justify-center gap-2 md:gap-5 overflow-y-auto pb-4 [&::-webkit-scrollbar]:hidden">
                    {q.options.map((opt, i) => (
                        <motion.button 
                            key={i}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => handleAnswer(opt.correct)}
                            className="relative group w-full bg-white text-black p-3 md:p-5 text-left font-black text-sm md:text-xl border-[3px] md:border-[4px] border-black shadow-md hover:bg-black hover:text-white hover:border-white transition-all transform -skew-x-6"
                        >
                            <span className="relative z-10 italic flex justify-between items-center">
                                {opt.text}
                                <ChevronRight size={16} className="opacity-50 group-hover:opacity-100" />
                            </span>
                        </motion.button>
                    ))}
                </div>
            </div>
        </div>
    );
};

// --- MAIN PAGE ---
const ExamKaiwa = () => {
    const [showIntro, setShowIntro] = useState(true);
    const audio = useP5Audio();

    return (
        <div className="w-full h-[92vh] md:h-[90vh] flex items-center justify-center bg-[#101010] p-2 md:p-4 relative overflow-hidden">
            
            {/* Global Background */}
            <div className="absolute inset-0 bg-red-800 pointer-events-none z-0">
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-40"></div>
                <div className="absolute -bottom-10 -left-10 text-[100px] md:text-[300px] font-black text-black opacity-10 italic transform -rotate-6 leading-none select-none">
                    PHANTOM
                </div>
                <div className="absolute top-0 right-0 w-[40%] h-full bg-black transform -skew-x-12 border-l-[10px] md:border-l-[20px] border-white opacity-90"></div>
            </div>

            {/* --- RESPONSIVE CARD FRAME --- */}
            <motion.div 
                initial={{ rotate: -5, scale: 0.9 }}
                animate={{ rotate: -2, scale: 1 }}
                whileHover={{ rotate: 0, scale: 1.01 }}
                transition={{ type: "spring", stiffness: 200, damping: 20 }}
                className="relative w-full max-w-[380px] md:max-w-[1000px] h-full md:h-[600px] z-20"
            >
                {/* Shadow */}
                <div className="absolute inset-0 bg-black/60 blur-xl transform translate-y-4 translate-x-4 rounded-[10px]"></div>

                {/* THE CARD FRAME (White Border) */}
                <div 
                    className="absolute inset-0 bg-white p-[8px] md:p-[12px] shadow-2xl"
                    style={{ clipPath: "polygon(1% 0%, 99% 1%, 100% 99%, 0% 100%)" }}
                >
                    {/* INNER BLACK SCREEN */}
                    <div 
                        className="w-full h-full bg-black overflow-hidden relative flex flex-col"
                        style={{ clipPath: "polygon(0% 1%, 100% 0%, 99% 100%, 1% 99%)" }}
                    >
                        {/* Speaker Hole */}
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-24 md:w-40 h-2 md:h-3 bg-gray-800 rounded-b-xl z-50 opacity-50"></div>

                        {/* Top Bar */}
                        <div className="h-6 md:h-8 bg-black flex justify-between px-4 items-center z-30 border-b border-gray-800">
                            <span className="text-[10px] md:text-[12px] text-green-500 font-mono font-bold animate-pulse tracking-[0.2em]">SECURE_CHANNEL</span>
                            <button onClick={audio.toggleMute} className="text-gray-500 hover:text-white transition-colors">
                                {audio.isMuted ? <VolumeX size={14}/> : <Volume2 size={14}/>}
                            </button>
                        </div>

                        {/* CONTENT AREA */}
                        <div className="flex-1 bg-gray-900 relative overflow-hidden">
                            <AnimatePresence mode='wait'>
                                {showIntro ? (
                                    <HackerIntro key="intro" onComplete={() => setShowIntro(false)} audio={audio} />
                                ) : (
                                    <DrillMode key="drill" onBack={() => window.location.reload()} audio={audio} />
                                )}
                            </AnimatePresence>
                        </div>
                    </div>
                </div>
            </motion.div>

        </div>
    );
};

export default ExamKaiwa;