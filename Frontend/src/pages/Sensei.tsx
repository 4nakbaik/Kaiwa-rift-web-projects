import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Sparkles, Scroll } from 'lucide-react';
import api from '../services/api';

// --- TYPES ---
interface Message {
    id: number;
    sender: 'user' | 'sensei';
    text: string;
    timestamp: Date;
}

// --- ASSETS & COMPONENTS ---

// 1. Background 
const EpicBackground = () => (
    <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden bg-[#050505]">
        <div 
            className="absolute inset-0 bg-cover bg-center"
            style={{ 
                backgroundImage: "url('/images/sensei_bg.jpg')", 
                filter: "sepia(0.5) contrast(1.3) brightness(0.2) blur(3px)" 
            }}
        />
        {/* Texture & Vignette */}
        <div className="absolute inset-0 opacity-30 bg-[url('https://www.transparenttextures.com/patterns/rice-paper-3.png')] mix-blend-overlay"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-transparent to-transparent opacity-80"></div>
        <div className="dust-overlay opacity-50"></div>
    </div>
);

// 2. Avatar Sensei
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

// 3. Chat Bubble 
const ChatBubble = ({ msg }: { msg: Message }) => {
    const isUser = msg.sender === 'user';
    
    return (
        <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className={`flex w-full mb-6 ${isUser ? 'justify-end' : 'justify-start'}`}
        >
            {/* Avatar Sensei*/}
            {!isUser && (
                <div className="mr-4 mt-1 hidden md:block flex-shrink-0 self-start">
                    <div className="w-10 h-10 rounded-full border border-[#3e2b22] bg-[#1a1a1a] overflow-hidden shadow-lg opacity-80">
                         <div className="w-full h-full bg-[url('/images/sensei.jpg')] bg-cover bg-center"></div>
                    </div>
                </div>
            )}

            {/* Bubble Container */}
            <div className={`relative max-w-[90%] md:max-w-[75%] lg:max-w-[60%] group perspective-1000`}>
                <div className={`relative p-5 md:p-6 shadow-xl backdrop-blur-md overflow-hidden transition-all duration-300
                    ${isUser 
                        ? 'bg-[#1a1a1a]/80 text-[#e6e2d3] rounded-2xl rounded-tr-sm border border-[#5c1010]/50' 
                        : 'bg-[#e6e2d3]/90 text-[#1a1a1a] rounded-2xl rounded-tl-sm border border-[#3e2b22]/50'
                    }
                `}>
                    {/* Texture */}
                    <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/rice-paper.png')] pointer-events-none mix-blend-multiply"></div>
                    
                    <div className="relative z-10">
                        <p className={`text-[9px] font-bold uppercase tracking-[0.2em] mb-1 opacity-70
                            ${isUser ? 'text-[#8a1c1c] text-right' : 'text-[#3e2b22]'}`}>
                            {isUser ? '浪人' : '翔馬先生'}
                        </p>
                       
                        <p className={`font-serif text-base md:text-lg leading-relaxed whitespace-pre-wrap tracking-wide
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
            setMessages(prev => [...prev, { id: Date.now()+2, sender: 'sensei', text: "Maaf, koneksi terputus. Coba lagi nanti.", timestamp: new Date() }]);
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
                initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
                className="absolute top-0 left-0 right-0 z-30 h-24 flex items-center justify-between px-6 lg:px-12 bg-gradient-to-b from-[#0a0a0a] to-transparent pointer-events-none"
            >
                {/* Content Header */}
                <div className="flex items-center gap-4 pointer-events-auto">
                    <SenseiAvatar isThinking={isTyping} />
                    <div>
                        <h1 className="text-2xl font-black font-calligraphy text-[#e6e2d3] tracking-wide drop-shadow-md">翔馬先生</h1>
                        <p className="text-[9px] font-serif text-[#888] uppercase tracking-[0.2em] flex items-center gap-2">
                            The Wise Samurai 
                            {isTyping && <span className="animate-pulse text-yellow-500">• 書く...</span>}
                        </p>
                    </div>
                </div>
            </motion.div>

            {/* CHAT SCROLL AREA */}
            <div className="flex-1 relative z-20 w-full h-full flex flex-col">
                <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 md:px-20 lg:px-32 py-24 scrollbar-hide">

                    {messages.map((msg) => <ChatBubble key={msg.id} msg={msg} />)}
                    
                    <AnimatePresence>
                        {isTyping && (
                            <motion.div 
                                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                                className="flex justify-start mb-4 ml-12"
                            >
                                <div className="bg-[#e6e2d3]/10 backdrop-blur-sm px-4 py-2 rounded-full text-[#e6e2d3] text-xs font-serif italic border border-[#e6e2d3]/10 flex items-center gap-2">
                                    <Sparkles className="animate-spin text-yellow-600" size={12} /> 
                                    <span className="opacity-70">黙考している...</span>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
                
                {/* Gradient Fade di Bawah */}
                <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#0a0a0a] via-[#0a0a0a]/80 to-transparent z-20 pointer-events-none"></div>
            </div>

            {/* INPUT AREA (Floating Bottom) */}
            <div className="absolute bottom-0 left-0 right-0 z-40 p-4 md:p-8 flex justify-center pointer-events-none">
                <motion.div 
                    initial={{ y: 50, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
                    className="w-full max-w-4xl pointer-events-auto"
                >
                    <div className="bg-[#1a1a1a]/90 backdrop-blur-md border border-[#333] p-1.5 rounded-[2rem] flex items-end shadow-2xl relative transition-all duration-300 focus-within:border-[#5c4033] focus-within:bg-black">
                        
                        <textarea 
                            ref={inputRef}
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder="Tulis pesan..." 
                            className="flex-1 bg-transparent text-[#e6e2d3] font-serif placeholder-[#555] px-6 py-3 focus:outline-none text-lg resize-none max-h-32 min-h-[50px] scrollbar-hide leading-relaxed"
                            disabled={isTyping}
                            rows={1}
                        />

                        <button 
                            onClick={handleSend}
                            disabled={isTyping || !input.trim()}
                            className={`m-1 p-3 rounded-full transition-all duration-200 border relative overflow-hidden
                                ${isTyping || !input.trim() 
                                    ? 'bg-[#222] border-[#333] text-[#444] cursor-not-allowed' 
                                    : 'bg-[#8a1c1c] border-[#5c1010] text-[#e6e2d3] hover:bg-[#b71c1c] shadow-lg'
                                }`}
                        >
                            <Send size={20} className={isTyping ? 'animate-pulse' : ''} fill={input.trim() ? "currentColor" : "none"} />
                        </button>
                    </div>
                    <p className="text-center text-[8px] text-[#444] mt-2 font-mono uppercase tracking-widest opacity-40">AI Sensei Mentor // by 4nakbaik</p>
                </motion.div>
            </div>
        </div>
    );
};

export default Sensei;