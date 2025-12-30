import { useState } from 'react';
import { motion } from 'framer-motion';
import { Book, Type, Languages, LucideIcon } from 'lucide-react';
import { kanaCharts, kanjiList } from '../data/referenceData';

// --- INTERFACES ---
interface TabButtonProps {
    active: boolean;
    onClick: () => void;
    icon: LucideIcon;
    label: string;
}

interface KanjiData {
    char: string;
    on: string;
    kun: string;
    arti: string;
    level: number;
}

interface KanaGridProps {
    data: string[][];
    title: string;
}

// --- COMPONENTS ---

const TabButton = ({ active, onClick, icon: Icon, label }: TabButtonProps) => (
    <button 
        onClick={onClick}
        className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all ${
            active 
            ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30' 
            : 'bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-white'
        }`}
    >
        <Icon size={18} />
        {label}
    </button>
);

const KanaGrid = ({ data, title }: KanaGridProps) => (
    <div className="mb-8">
        <h3 className="text-xl font-bold text-gray-300 mb-4 border-l-4 border-blue-500 pl-3">{title}</h3>
        <div className="grid grid-cols-5 gap-2 md:gap-4 max-w-2xl">
            {data.flat().map((char, idx) => (
                <div key={idx} className={`aspect-square flex items-center justify-center rounded-xl text-xl md:text-2xl font-bold border border-gray-700 ${char ? 'bg-gray-800 text-white hover:bg-gray-700 hover:border-blue-500 transition-all cursor-default' : 'bg-transparent border-none'}`}>
                    {char}
                </div>
            ))}
        </div>
    </div>
);

const KanjiCard = ({ kanji }: { kanji: KanjiData }) => (
    <div className="bg-gray-800 border border-gray-700 p-4 rounded-xl hover:border-blue-500 transition-all group">
        <div className="flex justify-between items-start mb-2">
            <h2 className="text-4xl font-black text-white group-hover:text-blue-400 transition-colors">{kanji.char}</h2>
            <div className="text-right">
                <span className="text-[10px] font-bold bg-gray-700 px-2 py-1 rounded text-gray-300 block mb-1">N{kanji.level}</span>
            </div>
        </div>
        <div className="space-y-1 text-sm">
            <div className="flex gap-2">
                <span className="text-blue-400 font-bold w-8">ON</span>
                <span className="text-gray-300 truncate">{kanji.on}</span>
            </div>
            <div className="flex gap-2">
                <span className="text-green-400 font-bold w-8">KUN</span>
                <span className="text-gray-300 truncate">{kanji.kun}</span>
            </div>
            <div className="mt-2 pt-2 border-t border-gray-600 text-xs font-bold text-white uppercase tracking-wider">
                {kanji.arti}
            </div>
        </div>
    </div>
);

const Reference = () => {
    const [activeTab, setActiveTab] = useState<'hiragana' | 'katakana' | 'n5' | 'n4'>('hiragana');

    return (
        <div className="w-full min-h-screen bg-[#0f172a] text-white font-sans p-4 md:p-8">
            <header className="mb-8">
                <h1 className="text-3xl font-black italic tracking-tighter mb-2 flex items-center gap-3">
                    <Book className="text-blue-500" size={32} />
                    KOTOBA DICTIONARY
                </h1>
                <p className="text-gray-400">Referensi lengkap Hiragana, Katakana, dan Kanji N5-N4.</p>
            </header>

            {/* TAB MENU */}
            <div className="flex flex-wrap gap-4 mb-8 overflow-x-auto pb-2 scrollbar-hide">
                <TabButton active={activeTab === 'hiragana'} onClick={() => setActiveTab('hiragana')} icon={Type} label="Hiragana" />
                <TabButton active={activeTab === 'katakana'} onClick={() => setActiveTab('katakana')} icon={Type} label="Katakana" />
                <TabButton active={activeTab === 'n5'} onClick={() => setActiveTab('n5')} icon={Languages} label="Kanji N5" />
                <TabButton active={activeTab === 'n4'} onClick={() => setActiveTab('n4')} icon={Languages} label="Kanji N4" />
            </div>

            {/* CONTENT AREA */}
            <div className="bg-[#1e293b]/50 border border-white/5 rounded-3xl p-6 md:p-8 min-h-[60vh]">
                <motion.div
                    key={activeTab}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                >
                    {activeTab === 'hiragana' && (
                        <div className="space-y-12">
                            <KanaGrid data={kanaCharts.hiragana_seion} title="Seion (Dasar)" />
                            <KanaGrid data={kanaCharts.hiragana_dakuon} title="Dakuon (Ga, Za, Da...)" />
                            <KanaGrid data={kanaCharts.hiragana_yoon} title="Yoon (Kya, Sha, Cha...)" />
                        </div>
                    )}

                    {activeTab === 'katakana' && (
                        <div className="space-y-12">
                            <KanaGrid data={kanaCharts.katakana_seion} title="Seion (Dasar)" />
                            <KanaGrid data={kanaCharts.katakana_dakuon} title="Dakuon (Ga, Za, Da...)" />
                            <KanaGrid data={kanaCharts.katakana_yoon} title="Yoon (Kya, Sha, Cha...)" />
                        </div>
                    )}

                    {activeTab === 'n5' && (
                        <div>
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-xl font-bold text-blue-400">Level N5 (Dasar)</h3>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                                {kanjiList.filter(k => k.level === 5).map((k, i) => <KanjiCard key={i} kanji={k} />)}
                            </div>
                        </div>
                    )}

                    {activeTab === 'n4' && (
                        <div>
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-xl font-bold text-purple-400">Level N4 (Lanjutan)</h3>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                                {kanjiList.filter(k => k.level === 4).map((k, i) => <KanjiCard key={i} kanji={k} />)}
                            </div>
                        </div>
                    )}
                </motion.div>
            </div>
        </div>
    );
};

export default Reference;