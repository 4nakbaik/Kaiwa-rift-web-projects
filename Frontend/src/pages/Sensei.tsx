import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, ChevronLeft, Sparkles, Scroll, Quote } from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../services/api';

// --- TYPES ---
interface Message {
    id: number;
    sender: 'user' | 'sensei';
    text: string;
    timestamp: Date;
}

// --- ASSETS ---
//Background 
const EpicBackground = () => (
    <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden bg-[#050505]">
        <div 
            className="absolute inset-0 bg-cover bg-center"
            style={{ 
                backgroundImage: "url('/images/sensei_bg.jpg')", 
                filter: "sepia(0.5) contrast(1.3) brightness(0.2) blur(3px)" 
            }}
        />
        <div className="absolute inset-0 opacity-30 bg-[url('https://www.transparenttextures.com/patterns/rice-paper-3.png')] mix-blend-overlay"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-[#0a0a0a]/80 to-transparent opacity-90"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_center,rgba(183,28,28,0.15)_0%,transparent_60%)]"></div>
        <div className="dust-overlay opacity-50"></div>
    </div>
);

//Avatar Sensei
const SenseiAvatar = ({ isThinking }: { isThinking: boolean }) => (
    <div className="relative">
        <AnimatePresence>
            {isThinking && (
                <motion.div 
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 0.6, scale: 1.2 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    transition={{ repeat: Infinity, duration: 1.5, repeatType: "reverse" }}
                    className="absolute inset-0 bg-yellow-600/30 rounded-full blur-xl z-0"
                ></motion.div>
            )}
        </AnimatePresence>
        
        <div className={`relative z-10 w-12 h-12 rounded-full border-2 flex items-center justify-center overflow-hidden bg-[#1a1a1a] transition-colors duration-500
            ${isThinking ? 'border-yellow-600/80 shadow-[0_0_15px_rgba(202,138,4,0.3)]' : 'border-[#5c4033]'}`}>
            <div className="absolute inset-0 bg-[url('/images/sensei.jpg')] bg-cover bg-center opacity-90 hover:scale-110 transition-transform duration-700"></div>
            
            <Scroll size={24} className="text-[#e6e2d3] opacity-0 relative z-20 mix-blend-overlay" />
        </div>
    </div>
);

//Chat Bubble 
const ChatBubble = ({ msg }: { msg: Message }) => {
    const isUser = msg.sender === 'user';
    
    return (
        <motion.div 
            initial={{ opacity: 0, x: isUser ? 50 : -50, scale: 0.95 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            transition={{ duration: 0.5, ease: [0.23, 1, 0.32, 1] }} 
            className={`flex w-full mb-8 ${isUser ? 'justify-end' : 'justify-start'}`}
        >
            {!isUser && (
                <div className="mr-4 mt-2 hidden md:block flex-shrink-0">
                    <div className="w-12 h-12 rounded-full border border-[#3e2b22] bg-[#1a1a1a] overflow-hidden shadow-lg">
                         <div className="w-full h-full bg-[url('/images/sensei.jpg')] bg-cover bg-center"></div>
                    </div>
                </div>
            )}

            <div className={`relative max-w-[85%] md:max-w-[70%] group perspective-1000`}>
                <div className={`relative p-6 md:p-8 shadow-2xl backdrop-blur-sm overflow-hidden transition-all duration-300
                    ${isUser 
                        ? 'bg-[#1a1a1a]/90 text-[#e6e2d3] rounded-tl-3xl rounded-bl-3xl rounded-br-md border-r-4 border-[#5c1010]' 
                        : 'bg-[#e6e2d3]/90 text-[#1a1a1a] rounded-tr-3xl rounded-br-3xl rounded-bl-md border-l-4 border-[#3e2b22]'
                    }
                `}>
                    <div className="absolute inset-0 opacity-30 bg-[url('https://www.transparenttextures.com/patterns/rice-paper.png')] pointer-events-none mix-blend-multiply"></div>
                    
                    <div className="relative z-10">
                        <div className="flex items-center justify-between mb-3 opacity-70">
                             <p className={`text-[10px] font-bold uppercase tracking-[0.2em] flex items-center gap-2
                                ${isUser ? 'text-[#8a1c1c] flex-row-reverse' : 'text-[#3e2b22]'}`}>
                                {isUser ? (
                                    <><span>浪人 (You)</span> <Quote size={12} className="rotate-180"/></>
                                ) : (
                                    <> <Quote size={12}/> <span>翔馬先生 (Sensei)</span></>
                                )}
                            </p>
                        </div>
                       
                        <p className={`font-serif text-lg md:text-xl leading-relaxed whitespace-pre-wrap tracking-wide
                            ${isUser ? 'text-[#e6e2d3]' : 'text-[#0c0c0c]'}`}>
                            {msg.text}
                        </p>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

// --- MAIN COMPONENT ---
const Sensei = () => {
    const [input, setInput] = useState("");
    const [messages, setMessages] = useState<Message[]>([
        {
            id: 1,
            sender: 'sensei',
            text: "Ah, Ronin. Pedangmu terlihat tajam hari ini. \nApa yang ingin kau diskusikan di dojo ini?",
            timestamp: new Date()
        }
    ]);
    const [isTyping, setIsTyping] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLTextAreaElement>(null);

    // Auto-scroll
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTo({
                top: scrollRef.current.scrollHeight,
                behavior: 'smooth'
            });
        }
    }, [messages, isTyping]);

    // Auto-focus
    useEffect(() => {
        setTimeout(() => inputRef.current?.focus(), 500);
    }, []);

    const handleSend = async () => {
        if (!input.trim() || isTyping) return;

        const userText = input;
        setInput("");

        setMessages(prev => [...prev, { id: Date.now(), sender: 'user', text: userText, timestamp: new Date() }]);
        setIsTyping(true);

        try {
            const history = messages.slice(-8).map(m => ({
                role: m.sender === 'user' ? 'user' : 'assistant',
                content: m.text
            }));

            const res = await api.post('/api/chat', { message: userText, history });
            
            setMessages(prev => [...prev, {
                id: Date.now() + 1,
                sender: 'sensei',
                text: res.data.reply,
                timestamp: new Date()
            }]);

        } catch (error) {
            console.error("Chat Error", error);
            setMessages(prev => [...prev, { id: Date.now()+2, sender: 'sensei', text: "Hmm... Kabut terlalu tebal, suaramu tak terdengar. (Connection Error)", timestamp: new Date() }]);
        } finally {
            setIsTyping(false);
            setTimeout(() => inputRef.current?.focus(), 100);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    return (
        <div className="relative w-full h-full flex flex-col font-sans overflow-hidden bg-[#0c0c0c]">
            <EpicBackground />
            
            {/* HEADER */}
            <motion.div 
                initial={{ y: -50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.8, delay: 0.2 }}
                className="relative z-30 h-24 flex items-center justify-between px-6 lg:px-12 bg-gradient-to-b from-[#0a0a0a] via-[#0a0a0a]/90 to-transparent shrink-0"
            >
                <div className="flex items-center gap-6">
                    
                    <div className="flex items-center gap-4">
                       <SenseiAvatar isThinking={isTyping} />
                        <div>
                            <h1 className="text-3xl font-black font-calligraphy text-[#e6e2d3] tracking-wide drop-shadow-lg">翔馬先生</h1>
                            <p className="text-[10px] font-serif text-[#888] uppercase tracking-[0.3em] flex items-center gap-2">
                                The Wise Samurai 
                                {isTyping && <span className="flex h-2 w-2 relative"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-yellow-500 opacity-75"></span><span className="relative inline-flex rounded-full h-2 w-2 bg-yellow-600"></span></span>}
                            </p>
                        </div>
                    </div>
                </div>
            </motion.div>

            {/* CHAT SCROLL AREA */}
            <div className="flex-1 relative z-20 overflow-hidden flex flex-col w-full max-w-5xl mx-auto">
                <div className="absolute top-0 left-0 right-0 h-12 bg-gradient-to-b from-[#0a0a0a] to-transparent z-30 pointer-events-none"></div>
                
                <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 md:px-12 md:py-8 scrollbar-hide flex flex-col">
                    <div className="flex-1"></div>
                    
                    {messages.map((msg) => <ChatBubble key={msg.id} msg={msg} />)}
                    
                    <AnimatePresence>
                        {isTyping && (
                            <motion.div 
                                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }}
                                className="flex justify-start mb-8 ml-14"
                            >
                                <div className="bg-[#e6e2d3]/10 backdrop-blur-md px-6 py-4 rounded-full text-[#e6e2d3] text-sm font-serif italic border border-[#e6e2d3]/20 flex items-center gap-3 shadow-lg">
                                    <Sparkles className="animate-spin text-yellow-600" size={18} /> 
                                    <span className="opacity-80">Sensei sedang merenung...</span>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
                 <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-[#0a0a0a] to-transparent z-30 pointer-events-none"></div>
            </div>

            {/* INPUT AREA */}
            <motion.div 
                initial={{ y: 100, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.8, delay: 0.4 }}
                className="p-6 md:px-12 md:pb-8 bg-[#0a0a0a] shrink-0 relative z-30 border-t border-[#1a1a1a]"
            >
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#3e2b22] to-transparent opacity-50"></div>

                <div className="max-w-5xl mx-auto bg-[#1a1a1a] border-2 border-[#333] p-2 rounded-[2rem] flex items-end shadow-[0_10px_30px_rgba(0,0,0,0.5)] relative overflow-hidden group transition-all duration-300 focus-within:border-[#5c4033] focus-within:shadow-[0_10px_40px_rgba(92,16,16,0.2)]">
                    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/rice-paper.png')] opacity-5 pointer-events-none"></div>

                    <textarea 
                        ref={inputRef}
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Tulis pesan untuk Sensei..." 
                        className="flex-1 bg-transparent text-[#e6e2d3] font-serif placeholder-[#555] px-6 py-4 focus:outline-none text-lg resize-none max-h-32 min-h-[60px] scrollbar-hide leading-relaxed"
                        disabled={isTyping}
                        rows={1}
                    />

                    <button 
                        onClick={handleSend}
                        disabled={isTyping || !input.trim()}
                        className={`m-2 p-4 rounded-full transition-all duration-300 border shadow-lg relative overflow-hidden group/btn
                            ${isTyping || !input.trim() 
                                ? 'bg-[#333] border-[#444] text-[#555] cursor-not-allowed scale-95' 
                                : 'bg-[#8a1c1c] border-[#5c1010] text-[#e6e2d3] hover:bg-[#b71c1c] hover:scale-105 hover:shadow-[0_0_20px_rgba(138,28,28,0.5)] active:scale-95'
                            }`}
                    >
                        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/rice-paper.png')] opacity-20 mix-blend-overlay hidden group-hover/btn:block"></div>
                        <Send size={22} className={`relative z-10 ${isTyping ? 'animate-pulse' : ''}`} fill={input.trim() ? "currentColor" : "none"} />
                    </button>
                </div>
                 <p className="text-center text-[9px] text-[#444] mt-4 font-mono uppercase tracking-widest opacity-50">AI SENSEI MENTOR // BY 4NAKBAIK </p>
            </motion.div>
        </div>
    );
};

export default Sensei;