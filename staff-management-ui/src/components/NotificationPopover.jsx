import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, BellRing, Clock, Trash2 } from 'lucide-react';

const notifications = [
  { id: 1, title: 'New Attendance Log', desc: 'Sarah J. punched in at 09:45 AM', time: '2 mins ago', unread: true },
  { id: 2, title: 'Task Completed', desc: 'The "Auth Flow" task is now finished.', time: '1 hour ago', unread: true },
  { id: 3, title: 'System Update', desc: 'v4.2 deployment successful.', time: '5 hours ago', unread: false },
];

const NotificationPopover = ({ isOpen, onClose }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Invisible Click-away Backdrop */}
          <div className="fixed inset-0 z-40" onClick={onClose} />
          
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className="absolute top-20 right-4 md:right-32 w-[350px] bg-slate-900/90 backdrop-blur-3xl border border-white/10 rounded-[2rem] shadow-[0_20px_50px_rgba(0,0,0,0.5)] z-50 overflow-hidden"
          >
            {/* Header */}
            <div className="p-5 border-b border-white/5 flex items-center justify-between bg-white/5">
              <div className="flex items-center gap-2">
                <BellRing size={16} className="text-indigo-400" />
                <h3 className="text-sm font-black text-white uppercase tracking-widest">Alerts</h3>
              </div>
              <button className="text-[10px] font-bold text-slate-500 hover:text-rose-400 transition-colors flex items-center gap-1">
                <Trash2 size={12} /> Clear All
              </button>
            </div>

            {/* List */}
            <div className="max-h-[400px] overflow-y-auto custom-scrollbar">
              {notifications.map((n) => (
                <div 
                  key={n.id} 
                  className={`p-4 border-b border-white/5 hover:bg-white/5 transition-all cursor-pointer relative group`}
                >
                  {n.unread && (
                    <div className="absolute left-2 top-1/2 -translate-y-1/2 w-1 h-8 bg-indigo-500 rounded-full shadow-[0_0_10px_#6366f1]" />
                  )}
                  <div className="flex justify-between items-start mb-1">
                    <h4 className={`text-xs font-bold ${n.unread ? 'text-white' : 'text-slate-400'}`}>{n.title}</h4>
                    <span className="text-[9px] font-medium text-slate-500 flex items-center gap-1">
                      <Clock size={10} /> {n.time}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 leading-relaxed line-clamp-2 group-hover:text-slate-300 transition-colors">
                    {n.desc}
                  </p>
                </div>
              ))}
            </div>

            {/* View All Button */}
            <button className="w-full py-4 text-center text-[10px] font-black text-indigo-400 uppercase tracking-[0.2em] hover:bg-indigo-500/10 transition-all border-t border-white/5">
              Archive History
            </button>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default NotificationPopover;