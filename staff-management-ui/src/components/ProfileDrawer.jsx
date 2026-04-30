import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, User, LogOut, ChevronRight, Briefcase, MapPin, Shield, Mail, ExternalLink 
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const ProfileDrawer = ({ isOpen, onClose }) => {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  // Load and Validate User Data
  useEffect(() => {
    if (isOpen) {
      const savedUser = localStorage.getItem('user');
      const token = localStorage.getItem('token');
      
      if (savedUser && token) {
        try {
          setUser(JSON.parse(savedUser));
        } catch (e) {
          console.error("Corrupted session data");
          handleLogout();
        }
      } else if (isOpen) {
        // If drawer is open but no user is found, force re-login
        handleLogout();
      }
    }
  }, [isOpen]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop Blur */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-md z-[100] cursor-pointer"
          />

          {/* Side Drawer */}
          <motion.aside
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed top-0 right-0 bottom-0 w-full max-w-[400px] bg-[#0f111a] border-l border-white/10 shadow-2xl z-[110] flex flex-col overflow-hidden"
          >
            {/* Header Area */}
            <div className="p-8 flex items-center justify-between bg-gradient-to-b from-white/5 to-transparent">
              <div>
                <h2 className="text-xl font-black text-white tracking-tighter italic uppercase">
                  Operator <span className="text-indigo-400">Profile</span>
                </h2>
                <div className="flex items-center gap-2 mt-1">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-[9px] font-black text-emerald-500 uppercase tracking-widest">Active Connection</span>
                </div>
              </div>
              <button 
                onClick={onClose} 
                className="p-3 rounded-2xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-all"
              >
                <X size={20} />
              </button>
            </div>

            {/* Profile Content (Scrollable) */}
            <div className="flex-1 overflow-y-auto px-8 custom-scrollbar">
              
              {/* Profile Avatar & Primary Info */}
              <div className="py-8 flex flex-col items-center border-b border-white/5">
                <div className="relative">
                  <div className="absolute inset-0 bg-indigo-500/30 blur-3xl rounded-full" />
                  <div className="w-28 h-28 rounded-[2.5rem] bg-slate-800 border-2 border-indigo-500/20 overflow-hidden relative shadow-2xl">
                    <img 
                      src={user?.profile_image || `https://ui-avatars.com/api/?name=${user?.name || 'User'}&background=6366f1&color=fff&bold=true`} 
                      alt="Profile" 
                      className="w-full h-full object-cover" 
                    />
                  </div>
                  <div className="absolute -bottom-2 -right-2 p-2 bg-indigo-600 rounded-xl border-4 border-[#0f111a] text-white">
                    <Shield size={16} />
                  </div>
                </div>
                
                <h3 className="mt-6 text-2xl font-black text-white tracking-tight">{user?.name || 'Unknown Operator'}</h3>
                <div className="mt-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20">
                  <p className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.2em]">
                    {user?.role_name || 'Field Agent'}
                  </p>
                </div>
              </div>

              {/* Data Grid */}
              <div className="py-8 space-y-4">
                <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mb-4">Identification Data</h4>
                
                <DetailItem 
                  icon={Mail} 
                  label="Network Mail" 
                  value={user?.email || 'N/A'} 
                />
                <DetailItem 
                  icon={Briefcase} 
                  label="Joining Date" 
                  value={user?.joining_date || "Executive Management"} 
                />
                <DetailItem 
                  icon={MapPin} 
                  label="Assigned Sector" 
                  value={user?.address || "Main Terminal HQ"} 
                />
              </div>

              {/* Menu Actions
              <div className="space-y-2 py-4">
                <MenuButton icon={User} label="Security Settings" />
                <MenuButton icon={ExternalLink} label="View Public Badge" />
              </div> */}
            </div>

            {/* Logout Footer */}
            <div className="p-8 bg-gradient-to-t from-black/40 to-transparent">
              <button 
                onClick={handleLogout}
                className="w-full py-5 bg-rose-500/10 hover:bg-rose-600 hover:text-white border border-rose-500/20 rounded-[1.5rem] text-rose-500 font-black text-[10px] uppercase tracking-[0.25em] flex items-center justify-center gap-3 transition-all active:scale-[0.98]"
              >
                <LogOut size={18} /> Disconnect Session
              </button>
              <p className="text-center text-[8px] text-slate-600 mt-6 uppercase font-bold tracking-widest">
                Nexus OS v3.0.4 — Secure End-to-End
              </p>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
};

/* --- Helper Components for Cleanliness --- */

const DetailItem = ({ icon: Icon, label, value }) => (
  <div className="group bg-white/5 border border-white/5 hover:border-white/10 p-4 rounded-2xl flex items-center gap-4 transition-all">
    <div className="p-2.5 rounded-xl bg-slate-800 text-slate-400 group-hover:text-indigo-400 transition-colors">
      <Icon size={18} />
    </div>
    <div className="overflow-hidden">
      <p className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">{label}</p>
      <p className="text-sm font-bold text-white truncate">{value}</p>
    </div>
  </div>
);

const MenuButton = ({ icon: Icon, label }) => (
  <button className="w-full group flex items-center justify-between p-4 rounded-2xl hover:bg-white/5 text-slate-400 hover:text-white transition-all">
    <div className="flex items-center gap-4">
      <div className="p-2 rounded-lg bg-slate-800 group-hover:text-indigo-400 transition-colors">
        <Icon size={18} />
      </div>
      <span className="text-xs font-black uppercase tracking-widest">{label}</span>
    </div>
    <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
  </button>
);

export default ProfileDrawer;