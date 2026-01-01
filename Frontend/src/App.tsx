import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { Toaster } from 'react-hot-toast'; 
import Layout from './components/Layout';

// Auth Pages
import Register from './pages/Register';
import Login from './pages/Login';
import ForgotPassword from './pages/ForgotPassword';

// Protected Pages
import Dashboard from './pages/Dashboard';
import Flashcards from './pages/Flashcards';
import Exam from './pages/Exam';
import ExamKaiwa from './pages/ExamKaiwa'; // Latihan Percakapan
import Reference from './pages/Reference';
import Sensei from './pages/Sensei'; // AI Chatbot (Rename dari Kaiwa.tsx)

// --- COMPONENT: AUTH GUARD ---
const ProtectedRoute = () => {
  const token = localStorage.getItem('token');
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  return (
    <Layout>
      <Outlet />
    </Layout>
  );
};

function App() {
  return (
    <BrowserRouter>
      {/* --- GLOBAL NOTIFICATION CONFIG (Theme: Dark/Cyber) --- */}
      <Toaster
        position="top-center"
        reverseOrder={false}
        toastOptions={{
          style: {
            background: '#1e293b', 
            color: '#fff',
            border: '1px solid #334155',
            padding: '16px',
            borderRadius: '12px',
            fontSize: '14px',
            fontWeight: 'bold',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
          },
          success: {
            iconTheme: {
              primary: '#4ade80', 
              secondary: '#1e293b',
            },
          },
          error: {
            iconTheme: {
              primary: '#ef4444', 
              secondary: '#1e293b',
            },
          },
          loading: {
            iconTheme: {
              primary: '#38bdf8', 
              secondary: '#1e293b',
            },
          },
        }}
      />

      <Routes>
        {/* --- PUBLIC ROUTES --- */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        
        {/* Redirect root ke dashboard */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />

        {/* --- PROTECTED ROUTES--- */}
        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/flashcards" element={<Flashcards />} />
          <Route path="/reference" element={<Reference />} />
          <Route path="/exam" element={<Exam />} />
          
          {/* Menu "Taiwa" (Latihan Percakapan) */}
          <Route path="/exam-kaiwa" element={<ExamKaiwa />} />
          
          {/* Menu "Shouma-sensei" (AI Chatbot) */}
          <Route path="/kaiwa" element={<Sensei />} />
        </Route>

        {/* --- 404 CATCH ALL --- */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;