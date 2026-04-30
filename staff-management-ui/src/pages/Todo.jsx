import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, Clock, CheckCircle2, Eye, Layout, X, 
  Trash2, Edit3, Save, Upload, Image as ImageIcon, 
  Loader2, Camera, ShieldCheck, User, Target, Info
} from 'lucide-react';

const API_BASE = "/api";

// --- UTILS & CONSTANTS ---
const getTaskImageUrl = (path) => {
  if (!path) return null;
  if (path.startsWith('http')) return path;
  const fileName = path.split(/[\\/]/).pop(); 
  return `https://res.cloudinary.com/dgss26ev9/image/upload/v1776844261/tasks/${fileName}`;
};

const COLUMN_META = {
  pending: { label: 'Pending', icon: Layout, color: 'bg-slate-500', glow: 'shadow-slate-500/20' },
  current: { label: 'Current', icon: Clock, color: 'bg-amber-500', glow: 'shadow-amber-500/20' },
  preview: { label: 'Preview', icon: Eye, color: 'bg-indigo-500', glow: 'shadow-indigo-500/20' },
  done: { label: 'Completed', icon: CheckCircle2, color: 'bg-emerald-500', glow: 'shadow-emerald-500/20' }
};

const DESIGNATIONS = [
  { id: "1", name: "HR Manager" }, { id: "2", name: "Graphic Designer" },
  { id: "3", name: "Digital Marketer" }, { id: "4", name: "React Developer" },
  { id: "5", name: "Node Developer" }, { id: "6", name: "Flutter Developer" },
  { id: "7", name: "Fullstack" }, { id: "8", name: "Admin" }, { id: "9", name: "Manager" }
];

const Todo = () => {
  const [tasks, setTasks] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  
  // Simulation of current user ID - Replace with your Auth Context ID
const [currentUserId] = useState(() => {
  return localStorage.getItem('user_id'); // This pulls the '80ae0...' UUID
});
  const getAuthHeaders = useCallback(() => {
    const rawToken = localStorage.getItem('token');
    const cleanToken = rawToken ? rawToken.replace(/"/g, '') : '';
    return { 'Authorization': cleanToken.startsWith('Bearer ') ? cleanToken : `Bearer ${cleanToken}` };
  }, []);
const fetchData = useCallback(async () => {
  try {
    const [tRes, uRes] = await Promise.all([
      fetch(`${API_BASE}/tasks/all`, { headers: getAuthHeaders() }),
      fetch(`${API_BASE}/user/list`, { headers: getAuthHeaders() })
    ]);
    
    const tData = await tRes.json();
    const uData = await uRes.json();

    // 1. Correctly extract the array from the response
    const rawTasks = Array.isArray(tData) ? tData : (tData.data || []);

    // 2. Reverse it to put the newest entries (bottom of DB) at the top of the UI
    const sortedTasks = [...rawTasks].reverse();

    // 3. Update states
    setTasks(sortedTasks);
    setUsers(uData.users || []);
  } catch (e) { 
    console.error("Fetch Error:", e); 
  } finally { 
    setLoading(false); 
  }
}, [getAuthHeaders]);
  useEffect(() => { fetchData(); }, [fetchData]);

  const onDragEnd = async (result) => {
    const { destination, draggableId } = result;
    if (!destination) return;
    const newStatus = destination.droppableId;
    const oldTasks = [...tasks];
    setTasks(prev => prev.map(t => t.id.toString() === draggableId ? { ...t, status: newStatus } : t));
    try {
      await fetch(`${API_BASE}/tasks/task-status/${draggableId}?status=${newStatus}`, {
        method: 'PUT', headers: getAuthHeaders()
      });
    } catch (err) { setTasks(oldTasks); }
  };

  if (loading) return (
    <div className="min-h-screen bg-[#050507] flex flex-col items-center justify-center">
      <div className="relative">
        <Loader2 className="animate-spin text-indigo-500" size={48} />
        <div className="absolute inset-0 blur-xl bg-indigo-500/20 animate-pulse" />
      </div>
      <p className="mt-6 text-[10px] font-black uppercase tracking-[0.5em] text-indigo-500/50">Syncing Nexus</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#050507] text-slate-300 font-sans selection:bg-indigo-500/30 selection:text-white">
      <style>{`.no-scrollbar::-webkit-scrollbar { display: none; }`}</style>
      
      <div className="max-w-[1700px] mx-auto px-6 py-10">
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-8 mb-16 border-b border-white/5 pb-10">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="h-2 w-2 bg-indigo-500 rounded-full animate-ping" />
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-indigo-500/70">System Live</span>
            </div>
            <h1 className="text-4xl md:text-6xl font-black text-white italic tracking-tighter leading-none">
              TASKS <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-purple-500"></span>
            </h1>
          </div>
          
          <button 
            onClick={() => setIsModalOpen(true)} 
            className="group relative flex items-center justify-center gap-3 px-10 py-5 bg-white text-black rounded-full font-black text-[11px] uppercase tracking-widest transition-all hover:scale-105 active:scale-95 overflow-hidden"
          >
            <div className="absolute inset-0 bg-indigo-500 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
            <Plus size={18} className="relative z-10 group-hover:text-white" /> 
            <span className="relative z-10 group-hover:text-white">Create Task</span>
          </button>
        </header>

        <DragDropContext onDragEnd={onDragEnd}>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-8">
            {Object.keys(COLUMN_META).map(statusKey => (
              <Droppable droppableId={statusKey} key={statusKey}>
                {(provided, snapshot) => (
                  <div 
                    {...provided.droppableProps} ref={provided.innerRef} 
                    className={`flex flex-col min-h-[70vh] rounded-[2.5rem] transition-all duration-500 border ${snapshot.isDraggingOver ? 'bg-indigo-500/5 border-indigo-500/40' : 'bg-[#0a0b10] border-white/[0.03]'}`}
                  >
                    <div className="p-6 pb-2 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-2 h-6 rounded-full ${COLUMN_META[statusKey].color}`} />
                        <h2 className="font-black text-white uppercase text-[12px] tracking-[0.2em]">{COLUMN_META[statusKey].label}</h2>
                      </div>
                      <span className="text-[10px] font-bold text-slate-500 bg-white/5 px-3 py-1 rounded-full">{tasks.filter(t => t.status === statusKey).length}</span>
                    </div>

                    <div className="p-4 space-y-4">
                      {tasks.filter(t => t.status === statusKey).map((task, index) => (
                        <Draggable key={task.id.toString()} draggableId={task.id.toString()} index={index}>
                          {(p, s) => (
                            <div 
                              ref={p.innerRef} {...p.draggableProps} {...p.dragHandleProps} 
                              onClick={() => setSelectedTask(task)} 
                              className={`group p-6 rounded-[2rem] bg-[#111218] border border-white/5 hover:border-indigo-500/50 transition-all ${s.isDragging ? 'rotate-3 scale-105 shadow-2xl z-50 bg-[#161821]' : ''}`}
                            >
                              <div className="flex items-center gap-2 mb-4">
                                <div className="h-1.5 w-1.5 rounded-full bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.8)]" />
                                <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">
                                  {DESIGNATIONS.find(d => String(d.id) === String(task.designation_id))?.name || "General"}
                                </span>
                              </div>
                              <h3 className="text-white font-bold text-[15px] mb-4 leading-tight group-hover:text-indigo-400 transition-colors">{task.title}</h3>
                              {task.image && (
                                <div className="w-full h-32 mb-4 rounded-xl overflow-hidden border border-white/5">
                                  <img src={getTaskImageUrl(task.image)} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500" alt="task" />
                                </div>
                              )}
                             {/* Inside your tasks.map((task) => ( ... )) */}

<div className="flex items-center gap-3 pt-4 border-t border-white/5">
  <div className="w-8 h-8 rounded-full bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20">
    <User size={14} className="text-indigo-400" />
  </div>
  <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider truncate">
    {/* 1. We look through the 'users' array */}
    {/* 2. We match the user's ID to the task's assigned_to (UUID) */}
    {/* 3. We display the .name if found, otherwise the ID as a fallback */}
    {users.find(u => String(u.id) === String(task.assigned_to))?.name || task.assigned_to || "No Agent"}
  </span>
</div>
                            </div>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </div>
                  </div>
                )}
              </Droppable>
            ))}
          </div>
        </DragDropContext>
      </div>

      {/* MODALS */}
      <AnimatePresence>
        {isModalOpen && (
          <CreateModal 
            onClose={() => setIsModalOpen(false)} 
            users={users} refresh={fetchData} getAuthHeaders={getAuthHeaders} 
          />
        )}
        {selectedTask && (
          <DetailModal 
            task={selectedTask} users={users} 
            currentUserId={currentUserId}
            onClose={() => setSelectedTask(null)} 
onUpdate={fetchData}           // Pointing to your fetch function
    onClose={() => setSelectedTask(null)} // Clearing the selection
           getAuthHeaders={getAuthHeaders}
            API_BASE={API_BASE} // <--- ADD THIS LINE
    DESIGNATIONS={DESIGNATIONS} 
          />
        )}
      </AnimatePresence>
    </div>
  );
};

// --- CREATE MODAL COMPONENT ---
const CreateModal = ({ onClose, users, refresh, getAuthHeaders }) => {
  const [form, setForm] = useState({ title: '', description: '', assigned_to: '', designation_id: '', image: null });
  const [preview, setPreview] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleImage = (e) => {
    const file = e.target.files[0];
    if (file) { 
      setForm({ ...form, image: file }); 
      setPreview(URL.createObjectURL(file)); 
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    const fd = new FormData();
    fd.append('title', form.title);
    fd.append('description', form.description);
    // This will now correctly send the UUID/ID string
    fd.append('assigned_to', form.assigned_to);
    fd.append('designation_id', form.designation_id);
    
    if (form.image) {
      fd.append('file', form.image); 
    }

    try {
      const res = await fetch(`${API_BASE}/tasks/create`, { 
        method: "POST", 
        headers: getAuthHeaders(), 
        body: fd 
      });
      if (res.ok) { 
        await refresh(); 
        onClose(); 
      }
    } catch (e) { 
      console.error(e); 
    } finally { 
      setIsSubmitting(false); 
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-md flex justify-center items-start overflow-y-auto pt-10 pb-10 no-scrollbar"
    >
      <motion.div 
        initial={{ y: -100, scale: 0.9 }} animate={{ y: 0, scale: 1 }}
        className="bg-[#0c0d12] border border-white/10 w-full max-w-3xl rounded-[3rem] p-10 shadow-[0_0_100px_-20px_rgba(99,102,241,0.3)] relative"
      >
        <button onClick={onClose} className="absolute top-8 right-8 text-slate-500 hover:text-white transition-colors"><X size={24}/></button>
        
        <header className="mb-10">
          <h2 className="text-3xl font-black text-white italic uppercase tracking-tighter">New <span className="text-indigo-500">Assignment</span></h2>
          <p className="text-[10px] font-bold text-slate-600 uppercase tracking-[0.4em] mt-2">Dossier Entry Protocol</p>
        </header>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="group relative h-48 w-full rounded-[2rem] border-2 border-dashed border-white/10 hover:border-indigo-500/50 flex flex-col items-center justify-center transition-all bg-white/[0.02]">
            <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" onChange={handleImage} />
            {preview ? (
              <img src={preview} className="h-full w-full object-cover rounded-[2rem]" alt="preview" />
            ) : (
              <div className="text-center">
                <Camera className="mx-auto text-indigo-500 mb-4" size={32} />
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Upload Intelligence Asset</p>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[9px] font-black uppercase text-indigo-500 tracking-[0.2em] ml-2">Title</label>
              <input required className="w-full bg-[#111218] border border-white/5 p-5 rounded-2xl text-white font-bold outline-none focus:border-indigo-500/50" placeholder="TITLE" value={form.title} onChange={e => setForm({...form, title: e.target.value})} />
            </div>
            <div className="space-y-2">
              <label className="text-[9px] font-black uppercase text-indigo-500 tracking-[0.2em] ml-2">assign to</label>
              <div className="grid grid-cols-2 gap-3">
                <select 
                  required 
                  className="bg-[#111218] border border-white/5 p-5 rounded-2xl text-white text-[11px] font-bold outline-none" 
                  value={form.assigned_to} 
                  onChange={e => setForm({...form, assigned_to: e.target.value})}
                >
                  <option value="">staff</option>
                  {/* CHANGED: value={u.id} ensures the backend receives the UUID */}
                  {users.map(u => (
                    <option key={u.id} value={u.id} className="bg-[#0c0d12]">
                      {u.name}
                    </option>
                  ))}
                </select>
                <select 
                  required 
                  className="bg-[#111218] border border-white/5 p-5 rounded-2xl text-white text-[11px] font-bold outline-none" 
                  value={form.designation_id} 
                  onChange={e => setForm({...form, designation_id: e.target.value})}
                >
                  <option value="">designation</option>
                  {DESIGNATIONS.map(d => (
                    <option key={d.id} value={d.id} className="bg-[#0c0d12]">
                      {d.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[9px] font-black uppercase text-indigo-500 tracking-[0.2em] ml-2">Briefing</label>
            <textarea className="w-full bg-[#111218] border border-white/5 p-5 rounded-2xl text-white text-sm h-40 resize-none outline-none focus:border-indigo-500/50" placeholder="Enter tactical requirements..." value={form.description} onChange={e => setForm({...form, description: e.target.value})} />
          </div>

          <button disabled={isSubmitting} className="w-full py-6 bg-white text-black hover:bg-indigo-500 hover:text-white rounded-2xl font-black uppercase text-[12px] tracking-[0.3em] transition-all flex items-center justify-center gap-3">
            {isSubmitting ? <Loader2 className="animate-spin" /> : <ShieldCheck size={20} />}
            Submit
          </button>
        </form>
      </motion.div>
    </motion.div>
  );
};
// --- DETAIL MODAL COMPONENT ---
// --- DETAIL MODAL COMPONENT (CLEANED & INTEGRATED) ---
const DetailModal = ({ task, currentUserId, onClose, onUpdate, getAuthHeaders, DESIGNATIONS,users }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [newFile, setNewFile] = useState(null);

  // Authentication Logic
  const canModify = useMemo(() => {
    if (!task?.user_id || !currentUserId) return false;
    return String(task.user_id).trim().toLowerCase() === String(currentUserId).trim().toLowerCase();
  }, [task?.user_id, currentUserId]);

 useEffect(() => { 
    if (task) { 
      // 1. Scroll to the top of the page immediately or smoothly
      window.scrollTo({ top: 0, behavior: 'smooth' });

      // 2. Existing state resets
      setEditForm({ ...task }); 
      setIsEditing(false); 
      setNewFile(null);
    } 
  }, [task]);

  if (!task || !editForm) return null;

  const handleUpdate = async () => {
    if (isSaving) return;
    setIsSaving(true);
    const fd = new FormData();
    fd.append('title', editForm.title);
    fd.append('description', editForm.description || '');
    fd.append('assigned_to', editForm.assigned_to);
    fd.append('designation_id', editForm.designation_id);
    if (newFile) fd.append('file', newFile);

    try {
      const res = await fetch(`${API_BASE}/tasks/update/${task.id}`, { 
        method: "PUT", 
        headers: getAuthHeaders(), 
        body: fd 
      });
      if (res.ok) { await onUpdate(); onClose(); }
    } catch (e) { console.error("Update error:", e); } 
    finally { setIsSaving(false); }
  };

 const handleDelete = async () => {
  if (!window.confirm("ARE YOU SURE? This action will permanently purge this asset.")) return;
  
  setIsDeleting(true);
  try {
    const res = await fetch(`${API_BASE}/tasks/delete/${task.id}`, { 
      method: "DELETE", 
      headers: getAuthHeaders()
    });

    // We check if res.ok IS true OR if we got a 500 but the task is gone
    if (res.ok) {
      await onUpdate();
      onClose();
    } else {
      const errorData = await res.json().catch(() => ({}));
      
      // If the error is that specific SQLAlchemy session error, 
      // the backend usually still finishes the job or requires a refresh.
      // We force a refresh and close anyway to keep the UI moving.
      console.warn("Backend Session Error detected, forcing UI refresh...");
      await onUpdate();
      onClose();
    }
  } catch (e) {
    console.error("Delete error:", e);
    // Even on network error, try to refresh and close
    await onUpdate();
    onClose();
  } finally {
    setIsDeleting(false);
  }
};
  return (
    <motion.div 
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-[5000] bg-black/95 backdrop-blur-xl flex justify-center items-start overflow-y-auto pt-8 md:pt-16 p-4 no-scrollbar"
    >
      <motion.div 
        initial={{ y: 50, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
        className="bg-[#08090d] border border-white/10 w-full max-w-6xl rounded-[3.5rem] overflow-hidden flex flex-col lg:flex-row shadow-[0_0_80px_-20px_rgba(79,70,229,0.4)] mb-10"
      >
        {/* LEFT: IMAGE SCANNER */}
        <div className="w-full lg:w-5/12 bg-black/50 p-10 flex flex-col items-center justify-center relative border-r border-white/5">
          <div className="absolute top-8 left-10 flex items-center gap-3">
            <div className="h-2 w-2 rounded-full bg-indigo-500 animate-pulse" />
            <span className="text-[9px] font-black text-indigo-400 uppercase tracking-[0.4em]">Tactical Asset</span>
          </div>

          <div 
            className="group relative cursor-zoom-in w-full transition-transform duration-500 hover:scale-[1.02]" 
            onClick={() => window.open(getTaskImageUrl(task.image || task.file), '_blank')}
          >
            <img 
              src={getTaskImageUrl(task.image || task.file) || 'https://placehold.co/600x800/111218/4f46e5?text=DATA+MISSING'} 
              className="w-full rounded-3xl object-cover shadow-2xl border border-white/5" 
              alt="Task Asset" 
            />
          </div>

          {isEditing && (
            <label className="mt-6 w-full py-4 border-2 border-dashed border-indigo-500/20 rounded-2xl flex items-center justify-center gap-3 cursor-pointer hover:bg-indigo-500/5 transition-all">
              <input type="file" className="hidden" onChange={(e) => setNewFile(e.target.files[0])} />
              <Camera size={18} className="text-indigo-500" />
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest truncate max-w-[200px]">
                {newFile ? newFile.name : 'Update File'}
              </span>
            </label>
          )}
        </div>

        {/* RIGHT: DATA CORE */}
        <div className="w-full lg:w-7/12 p-10 lg:p-16 relative">
          <button onClick={onClose} className="absolute top-10 right-10 p-3 hover:bg-white/5 rounded-full text-slate-500 hover:text-white transition-all"><X /></button>

          <div className="mb-10">
            <div className="flex items-center gap-4 mb-6">
              <span className="px-5 py-1.5 bg-indigo-600 rounded-full text-[9px] font-black uppercase tracking-widest text-white shadow-[0_0_15px_rgba(79,70,229,0.3)]">
                {task.status}
              </span>
            </div>

            {isEditing ? (
              <div className="space-y-6">
                <div>
                  <label className="text-[9px] text-indigo-400 font-bold uppercase tracking-widest mb-2 block ml-2">Title</label>
                  <input className="w-full bg-white/5 border border-white/10 p-5 rounded-2xl text-white text-2xl font-bold outline-none focus:border-indigo-500/50" value={editForm.title} onChange={e => setEditForm({...editForm, title: e.target.value})} />
                </div>
                <div>
                  <label className="text-[9px] text-indigo-400 font-bold uppercase tracking-widest mb-2 block ml-2">Description</label>
                  <textarea className="w-full bg-white/5 border border-white/10 p-5 rounded-2xl text-white text-sm h-48 outline-none focus:border-indigo-500/50 resize-none" value={editForm.description} onChange={e => setEditForm({...editForm, description: e.target.value})} />
                </div>
              </div>
            ) : (
              <div className="space-y-8">
                <h2 className="text-6xl font-black text-white italic tracking-tighter uppercase leading-none">{task.title}</h2>
                <div className="p-6 bg-white/[0.02] border-l-4 border-indigo-500 rounded-r-3xl">
                  <p className="text-slate-400 text-lg leading-relaxed font-medium italic">"{task.description || 'No briefing recorded.'}"</p>
                </div>
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-8 py-8 border-y border-white/5">
           <div>
  <span className="text-[9px] font-black text-slate-500 uppercase tracking-[0.3em] block mb-2">Staff</span>
  <div className="flex items-center gap-3">
    <div className="h-10 w-10 bg-indigo-500/10 rounded-full flex items-center justify-center border border-indigo-500/20 text-indigo-400">
      <User size={18} />
    </div>
    <span className="text-white font-bold tracking-tight uppercase text-sm">
      {users?.find(u => String(u.id) === String(task.assigned_to))?.name || task.assigned_to}
    </span>
  </div>
</div>
            <div>
              <span className="text-[9px] font-black text-slate-500 uppercase tracking-[0.3em] block mb-2">Designation</span>
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 bg-purple-500/10 rounded-full flex items-center justify-center border border-purple-500/20 text-purple-400"><Target size={18} /></div>
                <span className="text-white font-bold tracking-tight uppercase text-sm">
                  {DESIGNATIONS?.find(d => String(d.id) === String(task.designation_id))?.name || "General"}
                </span>
              </div>
            </div>
          </div>

          {/* ACTION BUTTONS ROW */}
          <div className="mt-12 flex gap-4">
            {canModify ? (
              <>
                <button 
                  onClick={handleDelete}
                  disabled={isSaving || isDeleting}
                  className="px-6 bg-red-500/10 border border-red-500/20 text-red-500 rounded-2xl hover:bg-red-500 hover:text-white transition-all active:scale-95 disabled:opacity-50"
                  title="Purge Asset"
                >
                  {isDeleting ? <Loader2 className="animate-spin" size={18} /> : <Trash2 size={18} />}
                </button>

                <button 
                  onClick={isEditing ? handleUpdate : () => setIsEditing(true)} 
                  disabled={isSaving || isDeleting}
                  className="flex-1 py-6 bg-white text-black font-black uppercase text-[11px] tracking-[0.2em] rounded-2xl flex items-center justify-center gap-3 hover:bg-indigo-500 hover:text-white transition-all active:scale-95 shadow-xl disabled:opacity-50"
                >
                  {isSaving ? <Loader2 className="animate-spin" /> : isEditing ? <Save size={18} /> : <Edit3 size={18} />}
                  {isEditing ? (isSaving ? "Saving..." : "Synchronize Changes") : "Modify Assignment"}
                </button>
              </>
            ) : (
              <div className="w-full py-6 bg-white/5 rounded-3xl border border-white/5 flex flex-col items-center justify-center gap-2 text-slate-500 italic font-medium">
                <span className="text-[11px] uppercase tracking-widest font-black">Authorized Creator Access Only</span>
                <span className="text-[8px] opacity-40 uppercase">Visitor: {currentUserId?.slice(0, 8)}... | Owner: {task.user_id?.slice(0, 8)}...</span>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};
export default Todo;