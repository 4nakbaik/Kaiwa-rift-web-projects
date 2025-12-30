import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useAppStore = create(
  persist(
    (set) => ({
      // --- AUDIO STATE ---
      isMuted: false,
      toggleMute: () => set((state) => ({ isMuted: !state.isMuted })),
      
      // --- USER PREFERENCES ---
      themeMode: 'cyber', 
      dailyTarget: 10,
      setDailyTarget: (count) => set({ dailyTarget: count }),

      // --- USER PROGRESS ---
      userLevel: 'N5',
      setUserLevel: (level) => set({ userLevel: level }),
    }),
    {
      name: 'kotoba-app-storage', // Nama key nya di Local
    }
  )
);

export default useAppStore;