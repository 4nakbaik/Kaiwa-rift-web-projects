import { motion } from 'framer-motion';

const Logo = ({ className = "w-10 h-10" }: { className?: string }) => {
    const jaggedPath = "M0 50 Q 5 48, 10 50 T 20 51 T 30 49 T 40 50 T 50 52 T 60 49 T 70 51 T 80 50 T 90 48 T 100 50";

    return (
        <div className={`relative flex items-center justify-center ${className} group select-none`}>
            <div className="absolute inset-0 bg-gradient-to-tr from-cyan-900/80 to-purple-900/80 rounded-xl blur-[6px] opacity-0 group-hover:opacity-70 transition-opacity duration-500"></div>
            
            <motion.div 
                className="w-full h-full bg-[#0a0a0c] rounded-xl border border-gray-800/80 flex items-center justify-center relative overflow-hidden z-10 group-hover:border-cyan-500/30 transition-colors"
                whileHover={{ scale: 1.05 }}
            >
                <span 
                    className="text-white/95 font-black font-jp-calligraphy leading-none relative z-0 drop-shadow-[0_2px_2px_rgba(0,0,0,1)]" 
                    style={{ fontSize: '150%', filter: 'contrast(1.1)' }}
                >
                    界
                </span>

                <div className="absolute inset-0 z-20 flex items-center justify-center pointer-events-none mix-blend-screen">
                    <svg viewBox="0 0 100 100" className="w-[120%] h-full" preserveAspectRatio="none">
                        <defs>
                            <linearGradient id="riftEnergy" x1="0%" y1="0%" x2="100%" y2="0%">
                                <stop offset="0%" stopColor="transparent" />
                                <stop offset="20%" stopColor="#22d3ee" /> 
                                <stop offset="50%" stopColor="#e879f9" /> 
                                <stop offset="80%" stopColor="#22d3ee" /> 
                                <stop offset="100%" stopColor="transparent" />
                            </linearGradient>
                        </defs>

                        <motion.path
                            d={jaggedPath}
                            fill="none"
                            stroke="url(#riftEnergy)"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                            vectorEffect="non-scaling-stroke"
                            animate={{ pathOffset: [0, 0.02, -0.02, 0] }}
                            transition={{ duration: 0.2, repeat: Infinity, repeatType: "mirror" }}
                            className="drop-shadow-[0_0_4px_#22d3ee] opacity-80 group-hover:opacity-100"
                        />
                        
                        <path
                            d={jaggedPath}
                            fill="none"
                            stroke="#a855f7" 
                            transform="translate(0, 0.5)"
                            className="opacity-50"
                        />
                    </svg>
                </div>

                <div className="absolute top-1/2 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-cyan-300/70 to-transparent z-30 mix-blend-overlay"></div>

            </motion.div>
        </div>
    );
};

export default Logo;