import React, { useState, useEffect } from 'react';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import { motion, AnimatePresence } from 'framer-motion';

interface LayoutProps {
    children: React.ReactNode;
}

const MOBILE_BREAKPOINT = 1024; 

const Layout = ({ children }: LayoutProps) => {
    // State Sidebar
    const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth > MOBILE_BREAKPOINT);
    const [isMobile, setIsMobile] = useState(window.innerWidth <= MOBILE_BREAKPOINT);

    // Handle Resize Window
    useEffect(() => {
        const handleResize = () => {
            const currentIsMobile = window.innerWidth <= MOBILE_BREAKPOINT;
            setIsMobile(currentIsMobile);
            if (!currentIsMobile) {
                setIsSidebarOpen(true);
            } else {
                setIsSidebarOpen(false);
            }
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

    return (
        <div className="flex h-screen w-full bg-[#0c0c0c] text-[#e6e2d3] font-sans overflow-hidden relative">
            
            {/* --- SIDEBAR SECTION --- */}
            <AnimatePresence mode="wait">
                {isSidebarOpen && (
                    <>
                        {isMobile && (
                            <motion.div 
                                initial={{ opacity: 0 }} 
                                animate={{ opacity: 1 }} 
                                exit={{ opacity: 0 }}
                                onClick={() => setIsSidebarOpen(false)}
                                className="fixed inset-0 bg-black/80 z-40 backdrop-blur-sm"
                            />
                        )}
                        
                        <motion.div
                            initial={{ x: -300, opacity: 0 }} 
                            animate={{ x: 0, opacity: 1 }} 
                            exit={{ x: -300, opacity: 0 }}
                            transition={{ type: "spring", stiffness: 300, damping: 30 }}
                            className={`fixed lg:static inset-y-0 left-0 z-50 h-full flex-shrink-0 shadow-[10px_0_50px_rgba(0,0,0,0.9)]`}
                        >
                            <Sidebar isMobile={isMobile} onClose={() => setIsSidebarOpen(false)} />
                        </motion.div>
                    </>
                )}
            </AnimatePresence>

            {/* --- MAIN CONTENT AREA --- */}
            <div className="flex-1 flex flex-col min-w-0 bg-[#0c0c0c] relative h-full">
                
                <Topbar onToggleSidebar={toggleSidebar} isSidebarOpen={isSidebarOpen} /> 
                
                <main className="flex-1 overflow-y-auto relative scrollbar-hide bg-[#0c0c0c]">
                    {children}
                </main>
            </div>

        </div>
    );
};

export default Layout;