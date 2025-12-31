import { useState } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { User, Mail, Lock, Feather, Loader2 } from 'lucide-react';
import api from '../services/api';

// --- ASSETS ---
const RegisterBackground = () => (
    <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden bg-[#0c0c0c]">
        <div 
            className="absolute inset-0 bg-cover bg-center opacity-50"
            style={{ 
                backgroundImage: "url('/images/beginning.jpg')", 
                filter: "grayscale(100%) contrast(1.1) brightness(0.3) blur(2px)" 
            }}
        />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,#000000_100%)] opacity-80"></div>
        <div className="dust-overlay"></div>
    </div>
);

const Register = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({ username: '', email: '', password: '' });
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
            await api.post('/register', formData);
            // Auto redirect to login after success
            navigate('/login');
        } catch (err: any) {
            setError(err.response?.data?.error || 'Gagal mendaftarkan nama.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center relative font-sans overflow-hidden p-6">
            <RegisterBackground />

            <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="relative z-10 w-full max-w-md bg-[#e6e2d3] p-1 shadow-[0_40px_80px_rgba(0,0,0,1)] rotate-1"
            >
                {/* Frame Garis Ganda */}
                <div className="border-4 border-[#3e2b22] p-1 h-full">
                    <div className="border border-[#3e2b22] p-8 h-full relative bg-[#f2eadd]">
                        {/* Paper Texture */}
                        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/rice-paper.png')] opacity-40 pointer-events-none"></div>

                        {/* Header */}
                        <div className="text-center mb-10 relative z-10">
                            <Feather className="w-10 h-10 mx-auto text-[#8a1c1c] mb-2" />
                            <h1 className="text-4xl font-black font-calligraphy text-[#1a1a1a] mb-1">名乗り</h1>
                            <p className="text-[10px] text-[#555] uppercase tracking-[0.3em] font-bold">Registration Scroll</p>
                        </div>

                        {/* Error Message */}
                        {error && (
                            <motion.div 
                                initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                                className="mb-6 text-center text-[#b71c1c] text-xs font-bold tracking-wide bg-red-50 p-2 border border-red-200"
                            >
                                ! {error}
                            </motion.div>
                        )}

                        {/* Form */}
                        <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
                            <div className="relative group">
                                <label className="text-[10px] uppercase font-bold text-[#8a1c1c] tracking-widest mb-1 block">Username</label>
                                <div className="flex items-center border-b-2 border-[#8d6e63] pb-2 group-focus-within:border-[#1a1a1a] transition-colors">
                                    <User size={16} className="text-[#5d4037] mr-3" />
                                    <input 
                                        type="text" 
                                        name="username"
                                        value={formData.username}
                                        onChange={handleChange}
                                        className="w-full bg-transparent text-[#1a1a1a] font-serif focus:outline-none placeholder:text-[#a1887f]"
                                        placeholder="愛称"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="relative group">
                                <label className="text-[10px] uppercase font-bold text-[#8a1c1c] tracking-widest mb-1 block">Email</label>
                                <div className="flex items-center border-b-2 border-[#8d6e63] pb-2 group-focus-within:border-[#1a1a1a] transition-colors">
                                    <Mail size={16} className="text-[#5d4037] mr-3" />
                                    <input 
                                        type="email" 
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        className="w-full bg-transparent text-[#1a1a1a] font-serif focus:outline-none placeholder:text-[#a1887f]"
                                        placeholder="電子メールアドレス"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="relative group">
                                <label className="text-[10px] uppercase font-bold text-[#8a1c1c] tracking-widest mb-1 block">Password</label>
                                <div className="flex items-center border-b-2 border-[#8d6e63] pb-2 group-focus-within:border-[#1a1a1a] transition-colors">
                                    <Lock size={16} className="text-[#5d4037] mr-3" />
                                    <input 
                                        type="password" 
                                        name="password"
                                        value={formData.password}
                                        onChange={handleChange}
                                        className="w-full bg-transparent text-[#1a1a1a] font-serif focus:outline-none placeholder:text-[#a1887f]"
                                        placeholder="あなたの秘密は最低6文字です"
                                        required
                                    />
                                </div>
                            </div>

                            <button 
                                type="submit" 
                                disabled={loading}
                                className="w-full py-4 bg-[#1a1a1a] text-[#e6e2d3] font-bold text-xs uppercase tracking-[0.2em] hover:bg-[#333] transition-all shadow-lg flex items-center justify-center gap-2 border-2 border-[#1a1a1a] mt-8"
                            >
                                {loading ? <Loader2 className="animate-spin" /> : "スタンプ (Daftar)"}
                            </button>
                        </form>

                        {/* Footer */}
                        <div className="mt-8 text-center relative z-10">
                            <Link to="/login" className="text-[#5d4037] text-xs font-serif hover:text-[#8a1c1c] transition-colors underline underline-offset-4 decoration-dotted">
                                Sudah punya nama? Masuk di sini.
                            </Link>
                        </div>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default Register;