import { useState } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { User, Lock, ArrowRight, Loader2 } from 'lucide-react';
import api from '../services/api';

// --- ASSETS: BACKGROUND ---
const LoginBackground = () => (
    <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden bg-[#050505]">
        <div 
            className="absolute inset-0 bg-cover bg-center opacity-60"
            style={{ 
                backgroundImage: "url('/images/beginning.jpg')", // Set bg
                filter: "grayscale(100%) contrast(1.2) brightness(0.4)" 
            }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-transparent to-[#050505]"></div>
        <div className="dust-overlay"></div>
    </div>
);

const Login = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({ username: '', password: '' });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        
        try {
            const res = await api.post('/login', formData);
            localStorage.setItem('token', res.data.token);
            localStorage.setItem('username', res.data.username);
            navigate('/dashboard');
        } catch (err: any) {
            setError(err.response?.data?.error || 'Gagal masuk ke Dojo.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center relative font-sans overflow-hidden p-6">
            <LoginBackground />

            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="relative z-10 w-full max-w-md bg-[#e6e2d3] border-y-8 border-[#3e2b22] shadow-[0_30px_60px_rgba(0,0,0,0.9)] overflow-hidden"
            >
                {/* Paper Texture */}
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/rice-paper.png')] opacity-50 pointer-events-none"></div>
                
                {/* Decorative Side Wood */}
                <div className="absolute left-0 top-0 bottom-0 w-2 bg-[#2c1e18] border-r border-[#5c4033]"></div>
                <div className="absolute right-0 top-0 bottom-0 w-2 bg-[#2c1e18] border-l border-[#5c4033]"></div>

                <div className="p-10 relative z-20">
                    
                    {/* Header */}
                    <div className="text-center mb-10">
                        <div className="w-16 h-16 mx-auto border-4 border-[#1a1a1a] rounded-full flex items-center justify-center mb-4 opacity-80">
                            <span className="font-calligraphy text-3xl text-[#1a1a1a]">界</span>
                        </div>
                        <h1 className="text-5xl font-black font-calligraphy text-[#1a1a1a] mb-1">道場入り</h1>
                        <p className="text-xs text-[#8a1c1c] uppercase tracking-[0.4em] font-bold">Enter The Dojo</p>
                    </div>

                    {/* Error Message */}
                    {error && (
                        <motion.div 
                            initial={{ opacity: 0, height: 0 }} 
                            animate={{ opacity: 1, height: 'auto' }}
                            className="mb-6 bg-[#b71c1c]/10 border-l-4 border-[#b71c1c] p-3 text-[#b71c1c] text-xs font-bold tracking-wide"
                        >
                            {error}
                        </motion.div>
                    )}

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="space-y-8">
                        <div className="relative group">
                            <User className="absolute left-0 top-3 text-[#5c4033] w-5 h-5" />
                            <input 
                                type="text" 
                                name="username"
                                placeholder="お名前またはメールアドレス"
                                value={formData.username}
                                onChange={handleChange}
                                className="w-full bg-transparent border-b-2 border-[#8d6e63] py-3 pl-8 text-[#1a1a1a] font-serif placeholder:text-[#8d6e63]/60 focus:outline-none focus:border-[#8a1c1c] transition-colors"
                                required
                            />
                        </div>

                        <div className="relative group">
                            <Lock className="absolute left-0 top-3 text-[#5c4033] w-5 h-5" />
                            <input 
                                type="password" 
                                name="password"
                                placeholder="あなたの秘密を入力してください"
                                value={formData.password}
                                onChange={handleChange}
                                className="w-full bg-transparent border-b-2 border-[#8d6e63] py-3 pl-8 text-[#1a1a1a] font-serif placeholder:text-[#8d6e63]/60 focus:outline-none focus:border-[#8a1c1c] transition-colors"
                                required
                            />
                        </div>

                        <button 
                            type="submit" 
                            disabled={loading}
                            className="w-full py-4 bg-[#8a1c1c] text-[#f2eadd] font-bold text-sm uppercase tracking-[0.2em] hover:bg-[#b71c1c] transition-all shadow-lg flex items-center justify-center gap-2 border border-[#5c1010] mt-8 group"
                        >
                            {loading ? <Loader2 className="animate-spin" /> : <>Masuk <ArrowRight className="group-hover:translate-x-1 transition-transform" size={16} /></>}
                        </button>
                    </form>

                    {/* Footer */}
                    <div className="mt-8 text-center border-t border-[#8d6e63]/30 pt-6">
                        <p className="text-[#5d4037] text-xs font-serif">
                            Belum terdaftar di gulungan? <br/>
                            <Link to="/register" className="text-[#8a1c1c] font-bold underline decoration-1 underline-offset-4 hover:text-[#b71c1c] uppercase tracking-wider mt-2 inline-block">
                                Ajukan Nama
                            </Link>
                        </p>
                    </div>
                </div>
            </motion.div>
            
            {/* Watermark Vertical */}
            <div className="fixed left-8 top-1/2 -translate-y-1/2 hidden lg:block opacity-50 pointer-events-none">
                <p className="writing-vertical-rl text-[#e6e2d3] font-calligraphy text-8xl drop-shadow-lg">会話リフト</p>
            </div>
        </div>
    );
};

export default Login;

