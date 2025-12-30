import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import api from '../services/api';

// --- TYPES ---
interface UserStats {
    total_learned: number;
    ingat_count: number;
    ragu_count: number;
    lupa_count: number;
    n5_mastery: number;
    is_unlocked_n4: boolean;
}

// --- SENSEI LOGIC ---
const getSenseiAdvice = (stats: UserStats) => {
    const retention = stats.total_learned > 0 ? (stats.ingat_count / stats.total_learned) * 100 : 0;
    
    // Pesan Full Jepang (Sesuai Request)
    if (retention > 85) return { 
        status: "免許皆伝", 
        msg: "心技体、極まれり。次の段階へ進む準備は整った。" // Pikiran, teknik, tubuh telah dikuasai. Siap lanjut.
    };
    if (retention > 50) return { 
        status: "修行中", 
        msg: "迷いが見える。刀を研ぐように、基本を繰り返せ。" // Keraguan terlihat. Asah kembali dasar-dasarnya seperti pedang.
    };
    if (stats.total_learned > 0) return { 
        status: "危機", 
        msg: "記憶が砂のように零れている。直ちに復習せよ。" // Ingatan tumpah seperti pasir. Segera review.
    };
    return { 
        status: "未熟", 
        msg: "千里の道も一歩から。まずは刀を握れ。" // Perjalanan ribuan mil dimulai dari satu langkah. Pegang pedangmu dulu.
    };
};

// --- VISUAL: INK LEAK EFFECT  ---
const InkLeakOverlay = () => (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <svg viewBox="0 0 200 200" className="absolute top-0 left-0 w-64 h-64 text-[#0a0a0a] opacity-80 -translate-x-10 -translate-y-10">
            <path fill="currentColor" d="M0 0 L100 0 Q 120 50, 80 100 T 0 200 Z" style={{ filter: 'blur(2px)' }} />
            <circle cx="120" cy="60" r="5" fill="currentColor" />
            <circle cx="100" cy="120" r="3" fill="currentColor" />
        </svg>
        <svg viewBox="0 0 200 200" className="absolute bottom-0 right-0 w-96 h-96 text-[#0a0a0a] opacity-90 translate-x-20 translate-y-20 rotate-180">
            <path fill="currentColor" d="M0 0 L150 0 Q 180 80, 100 150 T 0 200 Z" style={{ filter: 'blur(3px)' }} />
        </svg>
    </div>
);

// --- COMPONENT: PROGRESS SCROLL (MAKIMONO) ---
const ProgressScroll = ({ stats }: { stats: UserStats }) => {
    return (
        <div className="relative w-full max-w-3xl mx-auto my-12 group">
            <div className="relative bg-[#e6e2d3] text-[#1a1a1a] px-12 py-10 shadow-[0_10px_30px_rgba(0,0,0,0.5)] border-t-8 border-b-8 border-[#3e2b22] mx-4 md:mx-0">
                <div className="absolute inset-0 opacity-20 pointer-events-none" style={{ backgroundImage: "url('https://www.transparenttextures.com/patterns/rice-paper.png')" }}>
                </div>

                <div className="absolute -left-4 top-[-20px] bottom-[-20px] w-8 bg-gradient-to-r from-[#2c1e18] to-[#5c4033] rounded-l-lg shadow-xl flex flex-col justify-center items-center">
                    <div className="w-4 h-full border-r border-[#3e2b22] opacity-50">

                    </div>
                </div>
                <div className="absolute -right-4 top-[-20px] bottom-[-20px] w-8 bg-gradient-to-l from-[#2c1e18] to-[#5c4033] rounded-r-lg shadow-xl">

                </div>
                <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-8 text-center md:text-left">
                    
                    {/* Mastery Level */}
                    <div className="flex-1">
                        <p className="text-[#8a1c1c] font-serif text-xs tracking-[0.4em] uppercase mb-2">Current Proficiency</p>
                        <h2 className="text-6xl font-calligraphy text-black leading-none">
                            習熟度 <span className="text-8xl ml-2">{stats.n5_mastery.toFixed(0)}</span>%
                        </h2>
                    </div>

                    <div className="w-full md:w-px h-px md:h-24 bg-[#333] opacity-30"></div>

                    {/* Detail Stats */}
                    <div className="flex gap-12 text-center">
                        <div>
                            <div className="text-4xl font-calligraphy text-[#1a1a1a]">{stats.ingat_count}</div>
                            <div className="text-xs text-[#555] font-serif uppercase tracking-widest mt-1">覚</div>
                        </div>
                        <div>
                            <div className="text-4xl font-calligraphy text-[#cd3f3e]">{stats.ragu_count + stats.lupa_count}</div>
                            <div className="text-xs text-[#555] font-serif uppercase tracking-widest mt-1">未</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

// --- COMPONENT: TRAINING(MENU) ---
const TrainingPlaque = ({ to, label, sub, locked }: any) => (
    <Link to={locked ? '#' : to} className={`relative block bg-[#111] border border-[#333] p-8 transition-all duration-500 group overflow-hidden ${locked ? 'opacity-40 grayscale cursor-not-allowed' : 'hover:bg-[#1a1a1a] hover:border-[#cd3f3e]'}`}>

        <div className="relative z-10 flex justify-between items-center h-full">
            <div className="flex flex-col justify-center h-32">
                <span className="text-5xl font-calligraphy text-[#e6e2d3] group-hover:text-white transition-colors leading-tight">
                    {label}
                </span>
                <span className="text-[10px] text-[#cd3f3e] uppercase tracking-[0.3em] font-serif mt-4 block group-hover:tracking-[0.5em] transition-all">
                    {sub}
                </span>
            </div>

            {/* Locked Seal */}
            {locked && (
                <div className="border-2 border-[#555] p-2 rotate-12 opacity-80">
                    <span className="text-2xl font-calligraphy text-[#777]">封印</span>
                </div>
            )}
        </div>

        {/* Hover Ink Splash */}
        <div className="absolute -right-10 -bottom-10 w-32 h-32 bg-[#cd3f3e] opacity-0 group-hover:opacity-10 blur-3xl transition-opacity duration-700 rounded-full pointer-events-none"></div>
    </Link>
);

// --- MAIN DASHBOARD ---
const Dashboard = () => {
    const username = localStorage.getItem('username') || '浪人';
    const { data: stats, isLoading } = useQuery<UserStats>({
        queryKey: ['dashboardStats'],
        queryFn: async () => { const res = await api.get('/api/stats'); return res.data; },
    });

    const safeStats = stats || { total_learned: 0, ingat_count: 0, ragu_count: 0, lupa_count: 0, n5_mastery: 0, is_unlocked_n4: false };
    const advice = getSenseiAdvice(safeStats);
    const MIN_REQ = 30;

    if (isLoading) return <div className="h-screen bg-[#0a0a0a] flex items-center justify-center text-[#e6e2d3] font-calligraphy text-3xl animate-pulse">読み込み中...</div>;

    return (
        <div className="min-h-screen relative font-serif text-[#e6e2d3] overflow-hidden">
            
            {/* BACKGROUND LAYER */}
            <div className="fixed inset-0 z-0">
                <div 
                    className="absolute inset-0 bg-cover bg-center bg-no-repeat grayscale contrast-125 brightness-[0.3]"
                    style={{ backgroundImage: "url('/images/ronin.jpg')" }} // Pastikan file ini ada
                ></div>
                <div className="absolute inset-0 bg-[#0a0a0a]/60 mix-blend-multiply"></div>
                <div className="dust-overlay"></div>
            </div>

            {/* INK LEAK DECORATION */}
            <InkLeakOverlay />

            {/* CONTENT */}
            <div className="relative z-10 max-w-5xl mx-auto p-8 md:p-16 flex flex-col gap-16">
                
                {/* 1. HEADER */}
                <header className="flex justify-between items-start border-b border-[#333] pb-8">
                    <div>
                        <p className="text-[#cd3f3e] font-serif text-xs tracking-[0.4em] uppercase mb-2">Dojo Record</p>
                        <h1 className="text-5xl md:text-7xl font-calligraphy text-white">
                            {username} <span className="text-[#555] text-4xl">殿</span>
                        </h1>
                    </div>
                    {/* Family Crest */}
                    <div className="w-16 h-16 border-4 border-[#cd3f3e] rounded-full flex items-center justify-center opacity-80">
                        <span className="font-calligraphy text-3xl text-[#cd3f3e]">界</span>
                    </div>
                </header>

                {/* 2. PROGRESS SCROLL (Status) */}
                <section>
                    <ProgressScroll stats={safeStats} />
                </section>

                {/* 3. AI-SENSEI */}
                <section className="bg-[#111] border-l-4 border-[#cd3f3e] p-8 relative max-w-2xl mx-auto w-full">
                    <div className="absolute -top-3 -left-3 bg-[#cd3f3e] text-black px-3 py-1 text-[10px] font-bold uppercase tracking-widest">
                        翔馬先生 (Shouma-sensei)
                    </div>
                    <div className="flex flex-col gap-2">
                        <h3 className="text-2xl font-calligraphy text-[#e6e2d3] mb-2 border-b border-[#333] pb-2 inline-block w-max">
                            {advice.status}
                        </h3>
                        <p className="text-lg font-serif italic text-[#888] leading-relaxed">
                            "{advice.msg}"
                        </p>
                    </div>
                </section>

                {/* 4. TRAINING MENU  */}
                <section>
                    <div className="flex items-center justify-center gap-4 mb-8 opacity-50">
                        <div className="h-px w-12 bg-[#e6e2d3]"></div>
                        <span className="font-calligraphy text-xl">修練</span>
                        <div className="h-px w-12 bg-[#e6e2d3]"></div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <TrainingPlaque 
                            to="/flashcards" 
                            label="暗記" 
                            sub="Memorize" 
                        />
                        <TrainingPlaque 
                            to="/exam" 
                            label="試練" 
                            sub="Exam" 
                            locked={safeStats.ingat_count < MIN_REQ}
                        />
                        <TrainingPlaque 
                            to="/kaiwa" 
                            label="対話" 
                            sub="Dialogue" 
                        />
                    </div>
                </section>

            </div>
        </div>
    );
};

export default Dashboard;