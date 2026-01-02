import axios from 'axios';

// Buat instance axios
const api = axios.create({
    baseURL: 'http://localhost:8080', 
    headers: {
        'Content-Type': 'application/json',
    },
});

// --- REQUEST INTERCEPTOR ---
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token'); 
        if (token) {
            config.headers.Authorization = `Bearer ${token}`; 
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// --- RESPONSE INTERCEPTOR ---
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response && error.response.status === 401) {
            console.error("Sesi habis, harap login kembali.");
            localStorage.removeItem('token'); 
            localStorage.removeItem('username');
            window.location.href = '/login'; 
        }
        return Promise.reject(error);
    }
);

export default api;