import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Data dianggap segar selama 5 menit (tidak fetch ulang otomatis)
      staleTime: 1000 * 60 * 5, 
      
      // Data disimpan di cache selama 10 menit sebelum dihapus
      gcTime: 1000 * 60 * 10, 
      
      // Jika error, jangan retry otomatis terlalu banyak (cukup 1 kali)
      retry: 1, 
      
      // Jangan fetch ulang otomatis saat user pindah tab (opsional, agar tidak spam request)
      refetchOnWindowFocus: false, 
    },
  },
});