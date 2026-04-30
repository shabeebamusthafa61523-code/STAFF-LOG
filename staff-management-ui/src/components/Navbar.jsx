import React, { useState, useEffect } from 'react';
import { Search, Bell, User, LogOut } from 'lucide-react';
import { motion } from 'framer-motion';
import ProfileDrawer from './ProfileDrawer'; 
import NotificationPopover from './NotificationPopover';

const Navbar = () => {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  
  // State for the logged-in user
  const [currentUser, setCurrentUser] = useState({
    name: 'Guest',
    role: 'User'
  });

  useEffect(() => {
    // Pull user data stored during login
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      try {
        const parsedUser = JSON.parse(savedUser);
        setCurrentUser({
          name: parsedUser.name || 'User',
          // Assuming your role object has a name, otherwise default to "Staff"
          role: parsedUser.role?.name || 'Staff' 
        });
      } catch (err) {
        console.error("Failed to parse user data", err);
      }
    }
  }, []);

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-40 px-4 md:px-8 py-4 pointer-events-none">
        <div className="mx-auto max-w-[1600px] flex items-center justify-between gap-4 pointer-events-auto bg-slate-900/40 backdrop-blur-2xl border border-white/10 p-2 rounded-3xl shadow-2xl">
          
          {/* 1. Search Bar */}
          {/* <div className="hidden md:flex items-center bg-slate-900/40 backdrop-blur-2xl border border-white/10 px-4 py-2.5 rounded-2xl gap-3 focus-within:ring-2 ring-indigo-500/40 transition-all shadow-2xl">
            <Search size={18} className="text-slate-400" />
            <input 
              type="text" 
              placeholder="Search dashboard..." 
              className="bg-transparent border-none focus:outline-none text-sm text-white w-48 lg:w-64 placeholder:text-slate-500"
            />
          </div> */}

          {/* 2. Center Logo */}
          <motion.div 
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="flex items-center gap-3 group cursor-pointer"
          >
            <div className="relative flex items-center justify-center">
              <div className="absolute inset-0 bg-indigo-500/30 blur-xl rounded-full group-hover:bg-indigo-500/50 transition-all duration-500" />
              <img 
                src="/logo.png" 
                alt="StaffHQ Logo"
                className="relative w-32 md:w-40 h-auto object-contain transition-transform group-hover:scale-105" 
              />
            </div>
          </motion.div>

          {/* 3. Right Actions Wrapper */}
          <div className="flex items-center gap-2 bg-slate-900/40 backdrop-blur-2xl border border-white/10 p-1.5 rounded-2xl shadow-2xl">
            
            {/* Notification Logic */}
            {/* <div className="relative">
              <button 
                onClick={() => setIsNotifOpen(!isNotifOpen)}
                className={`relative p-2.5 rounded-xl transition-all ${
                  isNotifOpen ? 'bg-indigo-500/20 text-white' : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <Bell size={20} />
                <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-indigo-500 rounded-full border-2 border-[#1a1c2e] animate-pulse"></span>
              </button>

              <NotificationPopover 
                isOpen={isNotifOpen} 
                onClose={() => setIsNotifOpen(false)} 
              />
            </div> */}

            {/* <div className="h-6 w-[1px] bg-white/10 mx-1"></div> */}

            {/* Profile Trigger - DYNAMIC DATA */}
            <div 
              onClick={() => setIsProfileOpen(true)}
              className="flex items-center gap-3 pl-1 pr-2 py-1 group cursor-pointer"
            >
              <div className="hidden sm:block text-right">
                <p className="text-xs font-bold text-white leading-none">
                  {currentUser.name}
                </p>
                <p className="text-[10px] text-indigo-400 font-medium tracking-widest mt-1 uppercase leading-none">
                  {currentUser.role}
                </p>
              </div>
              <div className="relative w-9 h-9 rounded-xl bg-slate-800 border border-white/10 flex items-center justify-center text-slate-300 group-hover:border-indigo-500/50 group-hover:bg-indigo-500/10 transition-all shadow-lg overflow-hidden">
                {/* Optional: Add profile image logic here if you have image_url in DB */}
                <User size={18} />
              </div>
            </div>
          </div>

        </div>
      </header>

      {/* Profile Sidebar */}
      <ProfileDrawer 
        isOpen={isProfileOpen} 
        onClose={() => setIsProfileOpen(false)} 
        user={currentUser} // Passing dynamic user to drawer
      />
    </>
  );
};

export default Navbar;