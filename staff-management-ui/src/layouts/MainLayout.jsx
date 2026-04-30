import React from 'react';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocation } from 'react-router-dom';

const MainLayout = ({ children }) => {
  const location = useLocation();

  return (
    <div className="min-h-screen bg-[#0f111a] text-slate-200 overflow-x-hidden selection:bg-indigo-500/30">
      {/* 1. Enhanced Ambient Background Glows */}
      <div className="fixed top-0 left-0 w-full h-full -z-10 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-indigo-600/10 blur-[140px] animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-cyan-600/10 blur-[120px]" />
        {/* Subtle noise texture for a film-grain premium feel */}
        {/* <div className="absolute inset-0 opacity-[0.02] bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" /> */}
      </div>

      <Sidebar />
      <Navbar />

      {/* 2. Optimized Main Content Section */}
      <main className="transition-all duration-500 pt-32 pb-32 px-6 lg:pt-36 lg:pl-48 lg:pr-12 max-w-[1920px] mx-auto">
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 15, filter: 'blur(10px)' }}
            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            exit={{ opacity: 0, y: -15, filter: 'blur(10px)' }}
            transition={{ 
              duration: 0.4, 
              ease: [0.22, 1, 0.36, 1] // Custom "Apple-style" cubic-bezier
            }}
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* 3. Global Decorative Grid (Optional but looks very 'SaaS') */}
      <div className="fixed inset-0 -z-20 opacity-[0.03] pointer-events-none" 
           style={{ backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)', backgroundSize: '60px 60px' }} 
      />
    </div>
  );
};

export default MainLayout;