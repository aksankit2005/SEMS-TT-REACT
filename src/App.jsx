import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ToastProvider } from './context/ToastContext';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { Home } from './pages/Home';
import { Register } from './pages/Register';
import { Admin } from './pages/Admin';
import { Live } from './pages/Live';

function App() {
  return (
    <ToastProvider>
      <Router>
        <div className="flex flex-col min-h-screen bg-[#f8fafc] text-[#0f172a] dark:bg-[#090d16] dark:text-[#f8fafc] transition-colors duration-300">
          <Navbar />
          {/* Main Content Area */}
          <main className="flex-grow pt-20 pb-12">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/register" element={<Register />} />
              <Route path="/live" element={<Live />} />
              <Route path="/admin" element={<Admin />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </Router>
    </ToastProvider>
  );
}

export default App;
