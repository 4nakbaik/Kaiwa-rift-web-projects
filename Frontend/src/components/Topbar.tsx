import { Menu, Transition } from '@headlessui/react';
import { Fragment, useState } from 'react';
import { LogOut, User, Settings } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import UserProfileModal from './UserProfileModal'; // Import Component

interface TopbarProps {
    onToggleSidebar: () => void;
    isSidebarOpen: boolean;
}

const Topbar = ({ onToggleSidebar, isSidebarOpen }: TopbarProps) => {
    const navigate = useNavigate();
    const [isProfileOpen, setIsProfileOpen] = useState(false); // State Modal
    
    // Ambil data lokal
    const username = localStorage.getItem('username') || '浪人';
    const avatarSeed = localStorage.getItem('avatar_seed') || username;
    const avatarUrl = `https://api.dicebear.com/7.x/notionists/svg?seed=${avatarSeed}&backgroundColor=e6e2d3`;

    // Tanggal Format Jepang
    const date = new Date();
    const dateJP = `${date.getFullYear()}年 ${date.getMonth() + 1}月 ${date.getDate()}日`;

    return (
        <>
            <div className="h-20 flex items-center justify-between px-6 sticky top-0 z-40 bg-[#0a0a0a]/90 backdrop-blur-md border-b border-[#222]">
                
                {/* KIRI: KAMON TOGGLE */}
                <div className="flex items-center gap-6">
                    <button 
                        onClick={onToggleSidebar}
                        className="group relative w-12 h-12 flex items-center justify-center focus:outline-none transition-transform active:scale-95"
                    >
                        <div className="absolute inset-0 border-2 border-[#d4af37] rounded-full opacity-60 group-hover:opacity-100 group-hover:scale-110 transition-all duration-500"></div>
                        <div className="absolute inset-1 bg-[#8a1c1c] rounded-full flex items-center justify-center shadow-lg group-hover:bg-[#a62222] transition-colors">
                            <span className={`text-[#d4af37] font-calligraphy text-lg font-bold leading-none mt-1 transition-transform duration-500 ${isSidebarOpen ? 'rotate-90' : 'rotate-0'}`}>
                                {isSidebarOpen ? '閉' : '開'} 
                            </span> 
                        </div>
                    </button>

                    <div className="hidden md:block h-8 w-px bg-[#333]"></div>

                    <div className="hidden md:block">
                        <p className="text-[#cd3f3e] font-calligraphy text-xl tracking-widest">{dateJP}</p>
                    </div>
                </div>

                {/* KANAN: USER SEAL (MENU) */}
                <Menu as="div" className="relative">
                    <Menu.Button className="flex items-center gap-3 group focus:outline-none">
                        <div className="text-right hidden md:block">
                            <span className="block text-[#555] text-[9px] uppercase tracking-[0.3em] font-serif group-hover:text-[#777] transition-colors">氏名</span>
                            <span className="text-[#d4af37] font-calligraphy text-lg tracking-widest group-hover:text-white transition-colors">{username} 殿</span>
                        </div>
                        {/* Avatar Image */}
                        <div className="w-10 h-10 border-2 border-[#d4af37] bg-[#1a1a1a] flex items-center justify-center shadow-[0_0_10px_rgba(212,175,55,0.2)] overflow-hidden">
                            <img src={avatarUrl} alt="User" className="w-full h-full object-cover" />
                        </div>
                    </Menu.Button>

                    <Transition
                        as={Fragment}
                        enter="transition ease-out duration-200"
                        enterFrom="transform opacity-0 scale-95 -translate-y-2"
                        enterTo="transform opacity-100 scale-100 translate-y-0"
                        leave="transition ease-in duration-150"
                        leaveFrom="transform opacity-100 scale-100 translate-y-0"
                        leaveTo="transform opacity-0 scale-95 -translate-y-2"
                    >
                        <Menu.Items className="absolute right-0 mt-4 w-56 origin-top-right bg-[#141414] border border-[#333] shadow-2xl focus:outline-none p-1 z-50">
                            <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: "url('https://www.transparenttextures.com/patterns/black-felt.png')" }}></div>
                            
                            {/* ITEM 1: PROFILE / STATS */}
                            <Menu.Item>
                                {({ active }) => (
                                    <button 
                                        onClick={() => setIsProfileOpen(true)}
                                        className={`${active ? 'bg-[#222] text-[#d4af37]' : 'text-gray-400'} relative flex w-full items-center px-4 py-3 text-sm font-serif tracking-widest transition-colors border-b border-[#222]`}
                                    >
                                        <User className="mr-3 h-4 w-4" /> 
                                        <span className="font-calligraphy">身分・戦歴 (Profile)</span>
                                    </button>
                                )}
                            </Menu.Item>

                            {/* ITEM 2: LOGOUT */}
                            <Menu.Item>
                                {({ active }) => (
                                    <button onClick={() => { localStorage.removeItem('token'); navigate('/login'); }} 
                                        className={`${active ? 'bg-[#222] text-[#cd3f3e]' : 'text-gray-400'} relative flex w-full items-center px-4 py-3 text-sm font-serif tracking-widest transition-colors`}
                                    >
                                        <LogOut className="mr-3 h-4 w-4" /> 
                                        <span className="font-calligraphy">退出 (Logout)</span>
                                    </button>
                                )}
                            </Menu.Item>
                        </Menu.Items>
                    </Transition>
                </Menu>
            </div>

            {/* MODAL COMPONENT */}
            <UserProfileModal isOpen={isProfileOpen} onClose={() => setIsProfileOpen(false)} />
        </>
    );
};

export default Topbar;