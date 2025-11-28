import { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Plus, Trash2, MoreHorizontal, LogOut,
  LayoutGrid, BarChart3, Calendar as CalIcon, Settings, User, 
  Lock, Mail, ArrowRight, Loader2
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

function App() {
  // --- STATES ---
  const [user, setUser] = useState(null); // L'utilisateur connecté
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [view, setView] = useState('board'); // 'board', 'calendar', 'stats', 'profile'
  
  // States Auth Form
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [authEmail, setAuthEmail] = useState('');
  const [authPass, setAuthPass] = useState('');
  const [authName, setAuthName] = useState('');
  const [authError, setAuthError] = useState('');

  // States Data
  const [tasks, setTasks] = useState([]);
  const [title, setTitle] = useState('');
  const [priority, setPriority] = useState('NO_PRIORITY');

  const API_URL = 'http://localhost:5000/api';

  // --- EFFETS ---
  useEffect(() => {
    if (token) {
      fetchTasks();
      // On pourrait refetcher le user ici via le token si besoin
      const storedUser = localStorage.getItem('user');
      if (storedUser) setUser(JSON.parse(storedUser));
    }
  }, [token]);

  // --- ACTIONS AUTH ---
  const handleAuth = async (e) => {
    e.preventDefault();
    setAuthError('');
    try {
      const endpoint = isLoginMode ? '/login' : '/register';
      const payload = isLoginMode 
        ? { email: authEmail, password: authPass }
        : { email: authEmail, password: authPass, username: authName };
      
      const res = await axios.post(`${API_URL}${endpoint}`, payload);
      
      if (isLoginMode) {
        setToken(res.data.token);
        setUser(res.data.user);
        localStorage.setItem('token', res.data.token);
        localStorage.setItem('user', JSON.stringify(res.data.user));
      } else {
        setIsLoginMode(true); // Après inscription, on passe au login
        setAuthError('Compte créé ! Connectez-vous.');
      }
    } catch (err) {
      setAuthError(err.response?.data?.error || 'Une erreur est survenue');
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.clear();
  };

  // --- ACTIONS TASKS ---
  const fetchTasks = async () => {
    try {
      const res = await axios.get(`${API_URL}/tasks`);
      setTasks(res.data);
    } catch(e) { console.error(e); }
  };

  const addTask = async (e) => {
    e.preventDefault();
    if (!title) return;
    const res = await axios.post(`${API_URL}/tasks`, { title, priority, status: 'TODO' });
    setTasks([res.data, ...tasks]);
    setTitle('');
  };

  const updateStatus = async (id, newStatus) => {
    const updatedTasks = tasks.map(t => t._id === id ? { ...t, status: newStatus } : t);
    setTasks(updatedTasks);
    await axios.put(`${API_URL}/tasks/${id}/status`, { status: newStatus });
  };

  const deleteTask = async (id) => {
    await axios.delete(`${API_URL}/tasks/${id}`);
    setTasks(tasks.filter(t => t._id !== id));
  };

  const updateUserProfile = async (e) => {
    e.preventDefault();
    const res = await axios.put(`${API_URL}/users/${user.id}`, { username: user.username, role: user.role });
    setUser(res.data);
    localStorage.setItem('user', JSON.stringify(res.data));
    alert('Profil mis à jour !');
  };

  // --- VUES (COMPOSANTS) ---

  // 1. LOGIN SCREEN
  if (!token) {
    return (
      <div className="min-h-screen bg-[#0E0E11] flex items-center justify-center p-4">
        <div className="bg-[#1C1C21] p-8 rounded-2xl shadow-2xl w-full max-w-md border border-[#2F3039]">
          <div className="text-center mb-8">
            <div className="w-12 h-12 bg-indigo-600 rounded-xl flex items-center justify-center text-white font-bold mx-auto mb-4 shadow-lg shadow-indigo-500/30">TM</div>
            <h1 className="text-2xl font-bold text-white">{isLoginMode ? 'Welcome Back' : 'Create Account'}</h1>
            <p className="text-slate-500 text-sm mt-2">Enter your credentials to access your workspace.</p>
          </div>

          <form onSubmit={handleAuth} className="space-y-4">
            {!isLoginMode && (
              <div className="bg-[#141417] flex items-center px-4 py-3 rounded-lg border border-[#2F3039] focus-within:border-indigo-500 transition-colors">
                <User size={18} className="text-slate-500 mr-3" />
                <input type="text" placeholder="Username" className="bg-transparent outline-none text-white text-sm w-full" value={authName} onChange={e=>setAuthName(e.target.value)} required />
              </div>
            )}
            <div className="bg-[#141417] flex items-center px-4 py-3 rounded-lg border border-[#2F3039] focus-within:border-indigo-500 transition-colors">
              <Mail size={18} className="text-slate-500 mr-3" />
              <input type="email" placeholder="Email address" className="bg-transparent outline-none text-white text-sm w-full" value={authEmail} onChange={e=>setAuthEmail(e.target.value)} required />
            </div>
            <div className="bg-[#141417] flex items-center px-4 py-3 rounded-lg border border-[#2F3039] focus-within:border-indigo-500 transition-colors">
              <Lock size={18} className="text-slate-500 mr-3" />
              <input type="password" placeholder="Password" className="bg-transparent outline-none text-white text-sm w-full" value={authPass} onChange={e=>setAuthPass(e.target.value)} required />
            </div>

            {authError && <p className="text-red-400 text-xs text-center">{authError}</p>}

            <button className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-medium py-3 rounded-lg transition-colors flex items-center justify-center gap-2">
              {isLoginMode ? 'Sign In' : 'Sign Up'} <ArrowRight size={16} />
            </button>
          </form>

          <p className="text-center text-slate-500 text-xs mt-6 cursor-pointer hover:text-white transition-colors" onClick={() => setIsLoginMode(!isLoginMode)}>
            {isLoginMode ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
          </p>
        </div>
      </div>
    );
  }

  // 2. MAIN APP
  const COLUMNS = [
    { id: 'BACKLOG', label: 'Backlog', color: 'bg-slate-500' },
    { id: 'TODO', label: 'To Do', color: 'bg-blue-500' },
    { id: 'IN_PROGRESS', label: 'In Progress', color: 'bg-orange-500' },
    { id: 'DONE', label: 'Done', color: 'bg-emerald-500' }
  ];

  return (
    <div className="flex h-screen bg-[#1E1F25] text-slate-300 font-sans overflow-hidden">
      
      {/* SIDEBAR NAVIGATION */}
      <div className="w-20 border-r border-[#2F3039] flex flex-col items-center py-6 gap-8 bg-[#1E1F25] shrink-0">
        <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white font-bold shadow-lg cursor-pointer" onClick={() => setView('board')}>TM</div>
        
        <div className="flex flex-col gap-6 w-full items-center">
          <NavIcon icon={LayoutGrid} active={view === 'board'} onClick={() => setView('board')} />
          <NavIcon icon={BarChart3} active={view === 'stats'} onClick={() => setView('stats')} />
          <NavIcon icon={CalIcon} active={view === 'calendar'} onClick={() => setView('calendar')} />
          <NavIcon icon={Settings} active={view === 'profile'} onClick={() => setView('profile')} />
        </div>

        <div className="mt-auto mb-4">
          <NavIcon icon={LogOut} onClick={logout} color="text-red-400 hover:bg-red-500/10" />
        </div>
      </div>

      {/* MAIN CONTENT AREA */}
      <div className="flex-1 flex flex-col min-w-0">
        
        {/* HEADER */}
        <div className="h-16 border-b border-[#2F3039] flex items-center justify-between px-8 bg-[#1E1F25] shrink-0">
          <div>
            <h1 className="text-xl font-bold text-white tracking-tight">
              {view === 'board' ? 'Task Board' : view === 'stats' ? 'Analytics' : view === 'calendar' ? 'Calendar' : 'User Settings'}
            </h1>
          </div>
          <div className="flex items-center gap-4">
             <div className="text-right hidden md:block">
                <p className="text-sm text-white font-medium">{user?.username}</p>
                <p className="text-xs text-indigo-400">{user?.role || 'Developer'}</p>
             </div>
             <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center text-white font-bold border border-[#343541]">
               {user?.username?.charAt(0).toUpperCase()}
             </div>
          </div>
        </div>

        {/* CONTENT SWITCHER */}
        <div className="flex-1 overflow-hidden p-6 relative">
          
          {/* VUE 1: BOARD (KANBAN) */}
          {view === 'board' && (
            <div className="flex h-full gap-6 overflow-x-auto pb-4">
              {COLUMNS.map(col => (
                <div key={col.id} className="w-[300px] flex flex-col shrink-0 bg-[#161618] rounded-xl border border-[#2F3039]">
                  <div className="p-4 border-b border-[#2F3039] flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${col.color}`}></div>
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">{col.label}</h3>
                    <span className="ml-auto text-xs bg-[#2A2B36] px-2 py-0.5 rounded text-slate-500">{tasks.filter(t => t.status === col.id).length}</span>
                  </div>
                  
                  <div className="flex-1 overflow-y-auto p-3 custom-scrollbar">
                    {tasks.filter(t => t.status === col.id).map(task => (
                      <div key={task._id} className="bg-[#2A2B36] p-4 rounded-lg mb-3 border border-[#343541] hover:border-indigo-500/50 transition-all group shadow-sm">
                        <div className="flex justify-between items-start mb-2">
                           <span className={`text-[10px] px-2 py-0.5 rounded font-bold ${task.priority === 'HIGH' ? 'bg-red-500/20 text-red-400' : 'bg-slate-700 text-slate-400'}`}>{task.priority}</span>
                           <button onClick={() => deleteTask(task._id)} className="opacity-0 group-hover:opacity-100 text-slate-600 hover:text-red-400"><Trash2 size={14} /></button>
                        </div>
                        <p className="text-sm text-slate-200 mb-3">{task.title}</p>
                        {col.id !== 'DONE' && (
                           <button onClick={() => updateStatus(task._id, getNextStatus(task.status))} className="w-full py-1 text-xs bg-[#343541] hover:bg-indigo-600 hover:text-white rounded transition-colors">Move Next</button>
                        )}
                      </div>
                    ))}
                    {col.id === 'TODO' && (
                      <div className="mt-2">
                         <form onSubmit={addTask} className="flex gap-2">
                           <input type="text" value={title} onChange={e=>setTitle(e.target.value)} placeholder="+ Add task" className="bg-transparent border border-dashed border-slate-700 text-xs p-2 rounded w-full outline-none focus:border-indigo-500" />
                         </form>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* VUE 2: STATS (GRAPHIQUES) */}
          {view === 'stats' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 h-full overflow-y-auto">
              <div className="bg-[#1C1C21] p-6 rounded-xl border border-[#2F3039]">
                <h3 className="text-white font-bold mb-6">Task Distribution</h3>
                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={COLUMNS.map(col => ({ name: col.label, count: tasks.filter(t => t.status === col.id).length }))}>
                      <XAxis dataKey="name" stroke="#64748b" fontSize={12} />
                      <YAxis stroke="#64748b" fontSize={12} />
                      <Tooltip contentStyle={{ backgroundColor: '#1C1C21', borderColor: '#2F3039', color: '#fff' }} />
                      <Bar dataKey="count" fill="#6366f1" radius={[4, 4, 0, 0]}>
                        {COLUMNS.map((entry, index) => (
                           <Cell key={`cell-${index}`} fill={['#64748b', '#3b82f6', '#f97316', '#10b981'][index]} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
              <div className="bg-[#1C1C21] p-6 rounded-xl border border-[#2F3039] flex flex-col justify-center items-center">
                 <div className="text-6xl font-bold text-indigo-500 mb-2">{tasks.filter(t => t.status === 'DONE').length}</div>
                 <p className="text-slate-400 uppercase tracking-widest text-sm">Completed Tasks</p>
              </div>
            </div>
          )}

          {/* VUE 3: CALENDAR (PLACEHOLDER) */}
          {view === 'calendar' && (
             <div className="h-full bg-[#1C1C21] rounded-xl border border-[#2F3039] flex flex-col items-center justify-center text-slate-500">
                <CalIcon size={48} className="mb-4 opacity-50" />
                <h3 className="text-lg font-medium text-white">Calendar View</h3>
                <p>Coming soon in v2.0</p>
             </div>
          )}

          {/* VUE 4: PROFILE SETTINGS */}
          {view === 'profile' && (
            <div className="max-w-xl mx-auto mt-10">
               <div className="bg-[#1C1C21] p-8 rounded-xl border border-[#2F3039]">
                  <h2 className="text-xl font-bold text-white mb-6 border-b border-[#2F3039] pb-4">Edit Profile</h2>
                  <form onSubmit={updateUserProfile} className="space-y-6">
                     <div>
                        <label className="block text-xs text-slate-500 uppercase tracking-wide mb-2">Username</label>
                        <input type="text" value={user?.username} onChange={e=>setUser({...user, username: e.target.value})} className="w-full bg-[#141417] border border-[#2F3039] p-3 rounded-lg text-white focus:border-indigo-500 outline-none" />
                     </div>
                     <div>
                        <label className="block text-xs text-slate-500 uppercase tracking-wide mb-2">Role / Job Title</label>
                        <input type="text" value={user?.role} onChange={e=>setUser({...user, role: e.target.value})} className="w-full bg-[#141417] border border-[#2F3039] p-3 rounded-lg text-white focus:border-indigo-500 outline-none" />
                     </div>
                     <div>
                        <label className="block text-xs text-slate-500 uppercase tracking-wide mb-2">Email (Read Only)</label>
                        <input type="text" value={user?.email} disabled className="w-full bg-[#141417] border border-[#2F3039] p-3 rounded-lg text-slate-500 cursor-not-allowed" />
                     </div>
                     <button className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3 rounded-lg transition-colors">Save Changes</button>
                  </form>
               </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}

// Composant Bouton Sidebar
const NavIcon = ({ icon: Icon, active, onClick, color }) => (
  <div 
    onClick={onClick}
    className={`p-3 rounded-xl cursor-pointer transition-all duration-200 group relative ${active ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20' : color || 'text-slate-500 hover:bg-[#2A2B36] hover:text-slate-200'}`}
  >
    <Icon size={20} />
    {active && <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1 w-1 h-8 bg-indigo-400 rounded-l-full blur-[2px] opacity-50"></div>}
  </div>
);

const getNextStatus = (current) => {
  const flow = ['BACKLOG', 'TODO', 'IN_PROGRESS', 'DONE'];
  return flow[Math.min(flow.indexOf(current) + 1, flow.length - 1)];
};

export default App;