import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// Store ini otomatis menyimpan data ke LocalStorage browser
const useAppStore = create(
  persist(
    (set) => ({
      // --- AUDIO STATE ---
      isMuted: false,
      toggleMute: () => set((state) => ({ isMuted: !state.isMuted })),
      
      // --- USER PREFERENCES ---
      themeMode: 'cyber', // 'cyber' or 'traditional'
      dailyTarget: 10,
      setDailyTarget: (count) => set({ dailyTarget: count }),

      // --- USER PROGRESS (Simple Cache) ---
      userLevel: 'N5',
      setUserLevel: (level) => set({ userLevel: level }),
    }),
    {
      name: 'kotoba-app-storage', // Nama key di LocalStorage
    }
  )
);

export default useAppStore;