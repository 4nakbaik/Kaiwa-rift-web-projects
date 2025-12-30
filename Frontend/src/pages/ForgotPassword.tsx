import { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, ArrowRight, CheckCircle, ArrowLeft, Lock } from 'lucide-react';
import { Link } from 'react-router-dom';

const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [status, setStatus] = useState<'idle' | 'loading' | 'success'>('idle');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setStatus('loading');
        setTimeout(() => {
            setStatus('success');
        }, 2000);
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#0f172a] relative overflow-hidden font-sans">
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
                <div className="absolute top-[-10%] right-[-5%] w-96 h-96 bg-blue-600/20 rounded-full blur-[100px]"></div>
                <div className="absolute bottom-[-10%] left-[-5%] w-96 h-96 bg-cyan-500/20 rounded-full blur-[100px]"></div>
            </div>

            <motion.div 
                initial={{ opacity: 0, y: 20 }} 
                animate={{ opacity: 1, y: 0 }} 
                className="w-full max-w-md bg-white/5 backdrop-blur-xl border border-white/10 p-8 rounded-3xl shadow-2xl relative z-10"
            >
                {status === 'success' ? (
                    <div className="text-center">
                        <motion.div 
                            initial={{ scale: 0 }} animate={{ scale: 1 }}
                            className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6 border border-green-500/50 shadow-[0_0_30px_rgba(34,197,94,0.3)]"
                        >
                            <CheckCircle size={40} className="text-green-400" />
                        </motion.div>
                        <h2 className="text-2xl font-black text-white mb-2 tracking-tight">EMAIL TERKIRIM!</h2>
                        <p className="text-gray-400 mb-8 text-sm">
                            Silakan cek inbox email <b className="text-white">{email}</b> untuk instruksi reset password.
                        </p>
                        <Link 
                            to="/login" 
                            className="block w-full bg-white/10 hover:bg-white/20 py-3 rounded-xl font-bold text-white transition-all border border-white/10"
                        >
                            Kembali ke Login
                        </Link>
                    </div>
                ) : (
                    <>
                        <Link to="/login" className="flex items-center gap-2 text-gray-400 hover:text-white mb-8 text-sm transition-colors w-fit">
                            <ArrowLeft size={16} /> Kembali
                        </Link>
                        
                        <div className="text-center mb-8">
                            <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-blue-500/30">
                                <Lock className="text-white w-7 h-7" />
                            </div>
                            <h2 className="text-3xl font-black text-white tracking-tight">LUPA PASSWORD?</h2>
                            <p className="text-gray-400 text-sm mt-2">Jangan panik. Masukkan email akunmu dan kami akan mengirimkan link reset.</p>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="space-y-1">
                                <label className="text-xs font-bold text-gray-400 uppercase ml-1">Email Terdaftar</label>
                                <div className="relative">
                                    <Mail className="absolute left-4 top-3.5 text-gray-500 w-5 h-5" />
                                    <input 
                                        type="email" 
                                        required 
                                        value={email} 
                                        onChange={(e) => setEmail(e.target.value)} 
                                        placeholder="nama@email.com" 
                                        className="w-full bg-black/30 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white placeholder-gray-600 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all" 
                                    />
                                </div>
                            </div>

                            <button 
                                type="submit" 
                                disabled={status === 'loading'} 
                                className="w-full bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white font-bold py-4 rounded-xl shadow-lg shadow-blue-900/20 transition-all flex items-center justify-center gap-2 group disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {status === 'loading' ? 'Mengirim...' : 'Kirim Link Reset'} 
                                {!status === 'loading' && <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />}
                            </button>
                        </form>
                    </>
                )}
            </motion.div>
        </div>
    );
};

export default ForgotPassword;