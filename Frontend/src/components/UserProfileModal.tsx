import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Activity, Save, RefreshCw, AlertCircle } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../services/api';

interface Props {
    isOpen: boolean;
    onClose: () => void;
}

// --- VISUAL: INK GRAPH  ---
const InkGraph = ({ data }: { data: number[] }) => {
    if (!data || data.length === 0) return null;
    
    // Normalisasi data untuk SVG (0-100)
    const points = data.map((val, i) => {
        const x = (i / (data.length - 1)) * 100;
        const y = 100 - val; 
        return `${x},${y}`;
    }).join(' ');

    return (
        <div className="w-full h-32 relative mt-4 bg-[#f2eadd] border border-[#5c4033] p-2 overflow-hidden rounded-sm">
            <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/rice-paper.png')]"></div>
            {/* Grid Lines */}
            <div className="absolute inset-0 flex flex-col justify-between p-2 opacity-20">
                <div className="w-full h-px bg-[#333]"></div>
                <div className="w-full h-px bg-[#333]"></div>
                <div className="w-full h-px bg-[#333]"></div>
            </div>
            
            <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="w-full h-full relative z-10">
                {/* Area Fill */}
                <path d={`M 0 100 L ${points} L 100 100 Z`} fill="rgba(205, 63, 62, 0.2)" />
                {/* Stroke Line (Kuas) */}
                <path d={`M ${points}`} fill="none" stroke="#cd3f3e" strokeWidth="2" vectorEffect="non-scaling-stroke" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            
            <div className="absolute top-1 right-2 text-[8px] text-[#8a1c1c] font-serif uppercase tracking-widest">Memory Flow</div>
        </div>
    );
};

const UserProfileModal = ({ isOpen, onClose }: Props) => {
    const queryClient = useQueryClient();
    const [activeTab, setActiveTab] = useState<'identity' | 'stats'>('identity');
    
    // Form State
    const [username, setUsername] = useState(localStorage.getItem('username') || '');
    const [avatarSeed, setAvatarSeed] = useState(localStorage.getItem('avatar_seed') || username);
    const [msg, setMsg] = useState<{ text: string, type: 'success' | 'error' } | null>(null);

    // Fetch Stats untuk Grafik
    const { data: stats } = useQuery({
        queryKey: ['dashboardStats'],
        queryFn: async () => { const res = await api.get('/api/stats'); return res.data; },
        enabled: isOpen, 
    });

    // Mutation Update Profile
    const updateMutation = useMutation({
        mutationFn: (data: any) => api.put('/api/profile', data),
        onSuccess: (data) => {
            setMsg({ text: "Identitas Berhasil Diubah", type: 'success' });
            localStorage.setItem('username', data.data.username);
            localStorage.setItem('avatar_seed', data.data.avatar);
            
            // Refresh data di aplikasi
            queryClient.invalidateQueries({ queryKey: ['dashboardStats'] });
            
            // Delay tutup
            setTimeout(() => {
                setMsg(null);
            }, 1000);
        },
        onError: (err: any) => {
            setMsg({ text: err.response?.data?.error || "Gagal Update", type: 'error' });
        }
    });

    const handleSave = () => {
        updateMutation.mutate({ username, avatar: avatarSeed });
    };

    const randomizeAvatar = () => {
        setAvatarSeed(Math.random().toString(36).substring(7));
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">

                <motion.div 
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    onClick={onClose}
                    className="absolute inset-0 bg-black/80 backdrop-blur-sm"
                />

                <motion.div 
                    initial={{ scale: 0.9, opacity: 0, y: 20 }} 
                    animate={{ scale: 1, opacity: 1, y: 0 }} 
                    exit={{ scale: 0.9, opacity: 0, y: 20 }}
                    className="relative w-full max-w-lg bg-[#e6e2d3] border-y-8 border-[#3e2b22] shadow-[0_20px_50px_rgba(0,0,0,0.9)] overflow-hidden"
                >
                    {/* Texture Kertas */}
                    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/rice-paper.png')] opacity-50 pointer-events-none"></div>
                    
                    {/* Header */}
                    <div className="relative z-10 flex justify-between items-center p-6 border-b border-[#5c4033]/30">
                        <h2 className="text-3xl font-calligraphy text-[#1a1a1a]">浪人の記録 <span className="text-sm font-serif text-[#555] block">Ronin Records</span></h2>
                        <button type="button" onClick={onClose} aria-label="Close modal" className="p-2 hover:bg-[#d7ccc8] rounded-full text-[#3e2723] transition-colors"><X size={24} /></button>
                    </div>

                    {/* Tabs */}
                    <div className="relative z-10 flex border-b border-[#5c4033]/30 bg-[#f2eadd]">
                        <button 
                            onClick={() => setActiveTab('identity')}
                            className={`flex-1 py-3 text-sm font-bold uppercase tracking-widest transition-colors ${activeTab === 'identity' ? 'bg-[#e6e2d3] text-[#8a1c1c] border-b-2 border-[#8a1c1c]' : 'text-[#888] hover:text-[#555]'}`}
                        >
                            身分 (Identity)
                        </button>
                        <button 
                            onClick={() => setActiveTab('stats')}
                            className={`flex-1 py-3 text-sm font-bold uppercase tracking-widest transition-colors ${activeTab === 'stats' ? 'bg-[#e6e2d3] text-[#8a1c1c] border-b-2 border-[#8a1c1c]' : 'text-[#888] hover:text-[#555]'}`}
                        >
                            戦歴 (Stats)
                        </button>
                    </div>

                    {/* Content */}
                    <div className="relative z-10 p-8 min-h-[300px]">
                        
                        {/* --- TAB 1: IDENTITY --- */}
                        {activeTab === 'identity' && (
                            <div className="space-y-6">
                                {/* Avatar */}
                                <div className="flex flex-col items-center gap-4">
                                    <div className="w-24 h-24 rounded-full border-4 border-[#3e2b22] overflow-hidden shadow-lg bg-[#1a1a1a] relative group">
                                        <img 
                                            src={`https://api.dicebear.com/7.x/notionists/svg?seed=${avatarSeed}&backgroundColor=e6e2d3`} 
                                            alt="Avatar" 
                                            className="w-full h-full object-cover"
                                        />
                                        <button type="button" onClick={randomizeAvatar} aria-label="Randomize avatar" className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-white">
                                            <RefreshCw size={24} />
                                        </button>
                                    </div>
                                    <p className="text-xs text-[#555] font-serif italic">Klik gambar untuk ganti foto profile</p>
                                </div>

                                {/* Form */}
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-xs font-bold text-[#8a1c1c] uppercase tracking-widest mb-1">username</label>
                                        <input 
                                            value={username}
                                            onChange={(e) => setUsername(e.target.value)}
                                            placeholder="Masukkan username yang baru"
                                            className="w-full bg-[#f2eadd] border-b-2 border-[#5c4033] p-2 text-xl font-calligraphy text-[#1a1a1a] focus:outline-none focus:border-[#8a1c1c]"
                                        />
                                    </div>
                                </div>

                                {/* Feedback Msg */}
                                {msg && (
                                    <div className={`p-3 text-xs font-bold uppercase tracking-widest flex items-center gap-2 ${msg.type === 'success' ? 'text-green-700 bg-green-100' : 'text-red-700 bg-red-100'} border border-current`}>
                                        <AlertCircle size={14} /> {msg.text}
                                    </div>
                                )}

                                {/* Save Button */}
                                <button 
                                    onClick={handleSave}
                                    disabled={updateMutation.isPending}
                                    className="w-full py-4 bg-[#1a1a1a] text-[#e6e2d3] font-bold uppercase tracking-[0.2em] border-2 border-[#3e2b22] hover:bg-[#333] transition-all flex items-center justify-center gap-2"
                                >
                                    {updateMutation.isPending ? 'Menulis...' : <><Save size={16} /> Simpan Perubahan</>}
                                </button>
                            </div>
                        )}

                        {/* --- TAB 2: STATS --- */}
                        {activeTab === 'stats' && stats && (
                            <div className="space-y-6">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="bg-[#f2eadd] p-4 border border-[#d7ccc8] text-center">
                                        <p className="text-[10px] text-[#8a1c1c] uppercase tracking-widest font-bold">Total Words</p>
                                        <p className="text-3xl font-calligraphy text-[#1a1a1a]">{stats.total_learned}</p>
                                    </div>
                                    <div className="bg-[#f2eadd] p-4 border border-[#d7ccc8] text-center">
                                        <p className="text-[10px] text-[#8a1c1c] uppercase tracking-widest font-bold">Mastery</p>
                                        <p className="text-3xl font-calligraphy text-[#1a1a1a]">{stats.n5_mastery.toFixed(0)}%</p>
                                    </div>
                                </div>

                                <div>
                                    <p className="text-xs text-[#555] font-bold uppercase tracking-widest mb-2 flex items-center gap-2">
                                        <Activity size={14} /> Memory Retention Graph
                                    </p>
                                    {/* Grafik ML */}
                                    <InkGraph data={stats.graph_data} />
                                    <p className="text-[10px] text-[#888] mt-2 italic text-center">
                                        Prediksi penurunan ingatan 7 hari ke depan.
                                    </p>
                                </div>

                                <div className="pt-4 border-t border-[#d7ccc8]">
                                    <div className="flex justify-between items-center text-sm font-serif text-[#3e2723]">
                                        <span>Status Akun:</span>
                                        <span className="font-bold bg-[#3e2723] text-[#e6e2d3] px-2 py-0.5 text-xs uppercase">プレミアム武士</span>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};

export default UserProfileModal;