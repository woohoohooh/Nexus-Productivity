/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo, useEffect } from 'react';
import { 
  Plus, 
  CheckCircle2, 
  Circle, 
  Tag, 
  User as UserIcon, 
  MoreHorizontal,
  Search,
  Filter,
  Calendar,
  Bell,
  Moon,
  Sun,
  LayoutGrid,
  List,
  TrendingUp,
  Clock,
  ArrowUpRight,
  Settings,
  LogOut,
  ChevronRight,
  Zap
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell
} from 'recharts';
import { cn } from './lib/utils';
import { ProjectState, Task, User, Priority } from './types';

// --- Initial Data ---
const generateDataset = (): ProjectState => {
  const users: User[] = [
    { id: 'u1', name: 'John Doe', avatar: 'https://picsum.photos/seed/u1/100/100' },
    { id: 'u2', name: 'Jane Smith', avatar: 'https://picsum.photos/seed/u2/100/100' },
    { id: 'u3', name: 'Alex Johnson', avatar: 'https://picsum.photos/seed/u3/100/100' },
  ];

  const tasks: Record<string, Task> = {};
  const taskIds: string[] = [];
  
  for (let i = 1; i <= 15; i++) {
    const id = `t${i}`;
    tasks[id] = {
      id,
      globalId: i,
      title: [
        'Design new landing page',
        'Fix navigation bug',
        'Update documentation',
        'Client meeting preparation',
        'Review pull requests',
        'Refactor state management',
        'Optimize image loading',
        'Implement dark mode',
        'Write unit tests',
        'Deploy to production'
      ][i % 10] + (i > 10 ? ` ${i}` : ''),
      completed: Math.random() > 0.7,
      priority: ['Low', 'Medium', 'High', 'Critical'][Math.floor(Math.random() * 4)] as Priority,
      tags: ['Design', 'Dev', 'Marketing', 'Ops'].slice(0, Math.floor(Math.random() * 3)),
      groupId: 'g1',
      assigneeId: users[Math.floor(Math.random() * users.length)].id,
    };
    taskIds.push(id);
  }

  return {
    id: 'p1',
    title: 'Nexus Dashboard',
    nextGlobalId: 16,
    users,
    groups: [{ id: 'g1', title: 'Main', taskIds }],
    tasks
  };
};

const INITIAL_STATE = generateDataset();

const chartData = [
  { name: 'Mon', tasks: 12 },
  { name: 'Tue', tasks: 19 },
  { name: 'Wed', tasks: 15 },
  { name: 'Thu', tasks: 22 },
  { name: 'Fri', tasks: 30 },
  { name: 'Sat', tasks: 10 },
  { name: 'Sun', tasks: 8 },
];

const priorityData = [
  { name: 'Critical', value: 3, color: '#f43f5e' },
  { name: 'High', value: 8, color: '#f59e0b' },
  { name: 'Medium', value: 12, color: '#3b82f6' },
  { name: 'Low', value: 5, color: '#94a3b8' },
];

// --- Components ---

const BentoCard = ({ 
  children, 
  className, 
  title, 
  icon: Icon, 
  action,
  delay = 0 
}: { 
  children: React.ReactNode; 
  className?: string; 
  title?: string; 
  icon?: any;
  action?: React.ReactNode;
  delay?: number;
}) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5, delay }}
    className={cn("glass-card p-6 flex flex-col", className)}
  >
    {(title || Icon) && (
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          {Icon && (
            <div className="w-10 h-10 rounded-2xl bg-[var(--muted-bg)] flex items-center justify-center text-[var(--accent)]">
              <Icon className="w-5 h-5" />
            </div>
          )}
          {title && <h3 className="font-display font-semibold text-lg tracking-tight">{title}</h3>}
        </div>
        {action}
      </div>
    )}
    <div className="flex-1">
      {children}
    </div>
  </motion.div>
);

const TaskItem = ({ task, onToggle }: { task: Task; onToggle: (id: string) => void; key?: React.Key }) => (
  <div 
    className="group flex items-center gap-4 p-3 rounded-2xl hover:bg-[var(--muted-bg)] transition-all cursor-pointer border border-transparent hover:border-[var(--card-border)]"
    onClick={() => onToggle(task.id)}
  >
    <button className={cn(
      "shrink-0 transition-colors",
      task.completed ? "text-emerald-500" : "text-[var(--muted)] hover:text-[var(--accent)]"
    )}>
      {task.completed ? <CheckCircle2 className="w-6 h-6" /> : <Circle className="w-6 h-6" />}
    </button>
    <div className="flex-1 min-w-0">
      <p className={cn(
        "text-sm font-medium truncate transition-all",
        task.completed && "text-[var(--muted)] line-through"
      )}>
        {task.title}
      </p>
      <div className="flex items-center gap-2 mt-1">
        <span className={cn(
          "text-[10px] font-bold uppercase tracking-wider",
          task.priority === 'Critical' ? "text-rose-500" : 
          task.priority === 'High' ? "text-orange-500" : 
          task.priority === 'Medium' ? "text-blue-500" : "text-slate-400"
        )}>
          {task.priority}
        </span>
        <span className="text-[10px] text-[var(--muted)]">•</span>
        <span className="text-[10px] text-[var(--muted)]">#{task.globalId}</span>
      </div>
    </div>
    <div className="opacity-0 group-hover:opacity-100 transition-opacity">
      <MoreHorizontal className="w-4 h-4 text-[var(--muted)]" />
    </div>
  </div>
);

export default function App() {
  const [state, setState] = useState<ProjectState>(INITIAL_STATE);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  const toggleTask = (id: string) => {
    setState(prev => ({
      ...prev,
      tasks: {
        ...prev.tasks,
        [id]: { ...prev.tasks[id], completed: !prev.tasks[id].completed }
      }
    }));
  };

  const filteredTasks = useMemo<Task[]>(() => {
    return (Object.values(state.tasks) as Task[])
      .filter(t => t.title.toLowerCase().includes(searchQuery.toLowerCase()))
      .sort((a, b) => (a.completed === b.completed ? 0 : a.completed ? 1 : -1));
  }, [state.tasks, searchQuery]);

  const stats = useMemo(() => {
    const all = Object.values(state.tasks) as Task[];
    const completed = all.filter(t => t.completed).length;
    return {
      total: all.length,
      completed,
      pending: all.length - completed,
      percent: Math.round((completed / all.length) * 100)
    };
  }, [state.tasks]);

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      {/* Sidebar */}
      <aside className="w-full md:w-20 lg:w-64 border-r border-[var(--card-border)] bg-[var(--card-bg)] flex flex-col p-4 z-20">
        <div className="flex items-center gap-3 px-2 mb-10">
          <div className="w-10 h-10 rounded-2xl bg-[var(--accent)] flex items-center justify-center text-white shadow-lg shadow-indigo-500/20">
            <Zap className="w-6 h-6 fill-current" />
          </div>
          <span className="font-display font-bold text-xl tracking-tight hidden lg:block">Nexus</span>
        </div>

        <nav className="flex-1 space-y-2">
          {[
            { icon: LayoutGrid, label: 'Dashboard', active: true },
            { icon: List, label: 'Tasks' },
            { icon: Calendar, label: 'Schedule' },
            { icon: TrendingUp, label: 'Analytics' },
            { icon: UserIcon, label: 'Team' },
            { icon: Settings, label: 'Settings' },
          ].map((item, i) => (
            <button
              key={i}
              className={cn(
                "w-full flex items-center gap-3 p-3 rounded-2xl transition-all",
                item.active 
                  ? "bg-[var(--accent)] text-white shadow-md shadow-indigo-500/20" 
                  : "text-[var(--muted)] hover:bg-[var(--muted-bg)] hover:text-[var(--fg)]"
              )}
            >
              <item.icon className="w-5 h-5" />
              <span className="font-medium text-sm hidden lg:block">{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="pt-4 border-t border-[var(--card-border)] space-y-2">
          <button 
            onClick={() => setIsDarkMode(!isDarkMode)}
            className="w-full flex items-center gap-3 p-3 rounded-2xl text-[var(--muted)] hover:bg-[var(--muted-bg)] hover:text-[var(--fg)] transition-all"
          >
            {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            <span className="font-medium text-sm hidden lg:block">{isDarkMode ? 'Light Mode' : 'Dark Mode'}</span>
          </button>
          <button className="w-full flex items-center gap-3 p-3 rounded-2xl text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-all">
            <LogOut className="w-5 h-5" />
            <span className="font-medium text-sm hidden lg:block">Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto custom-scrollbar p-6 lg:p-10">
        {/* Header */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
          <div>
            <h1 className="font-display font-bold text-4xl tracking-tight mb-2">Good morning, John</h1>
            <p className="text-[var(--muted)] font-medium">You have {stats.pending} tasks remaining for today.</p>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-[var(--muted)]" />
              <input 
                type="text" 
                placeholder="Search anything..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-11 pr-6 py-3 bg-[var(--card-bg)] border border-[var(--card-border)] rounded-2xl text-sm w-full md:w-64 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all"
              />
            </div>
            <button className="p-3 bg-[var(--card-bg)] border border-[var(--card-border)] rounded-2xl text-[var(--muted)] hover:text-[var(--fg)] transition-all relative">
              <Bell className="w-5 h-5" />
              <span className="absolute top-3 right-3 w-2 h-2 bg-rose-500 rounded-full border-2 border-[var(--card-bg)]"></span>
            </button>
          </div>
        </header>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 auto-rows-[minmax(180px,auto)]">
          
          {/* Welcome / Hero Card */}
          <BentoCard className="md:col-span-2 lg:col-span-2 bg-indigo-600 text-white border-none relative overflow-hidden group" delay={0.1}>
            <div className="relative z-10 h-full flex flex-col justify-between">
              <div>
                <span className="inline-block px-3 py-1 bg-white/20 rounded-full text-xs font-bold uppercase tracking-wider mb-4">Pro Plan Active</span>
                <h2 className="font-display font-bold text-3xl leading-tight mb-4">Unlock your full potential with Nexus AI</h2>
                <p className="text-indigo-100 max-w-md">Our new predictive engine helps you prioritize tasks based on your work patterns and deadlines.</p>
              </div>
              <button className="mt-8 flex items-center gap-2 bg-white text-indigo-600 px-6 py-3 rounded-2xl font-bold text-sm w-fit hover:scale-105 transition-transform active:scale-95">
                Explore Features
                <ArrowUpRight className="w-4 h-4" />
              </button>
            </div>
            {/* Abstract Background Elements */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-20 -mt-20 blur-3xl group-hover:scale-110 transition-transform duration-700"></div>
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-indigo-400/20 rounded-full -ml-10 -mb-10 blur-2xl"></div>
          </BentoCard>

          {/* Stats Card */}
          <BentoCard title="Productivity" icon={TrendingUp} className="lg:col-span-1" delay={0.2}>
            <div className="flex flex-col items-center justify-center h-full py-4">
              <div className="relative w-32 h-32">
                <svg className="w-full h-full" viewBox="0 0 36 36">
                  <path
                    className="stroke-[var(--muted-bg)] fill-none"
                    strokeWidth="3"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                  <motion.path
                    initial={{ strokeDasharray: "0, 100" }}
                    animate={{ strokeDasharray: `${stats.percent}, 100` }}
                    transition={{ duration: 1.5, ease: "easeOut" }}
                    className="stroke-[var(--accent)] fill-none"
                    strokeWidth="3"
                    strokeLinecap="round"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="font-display font-bold text-3xl">{stats.percent}%</span>
                  <span className="text-[10px] text-[var(--muted)] font-bold uppercase">Done</span>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-8 mt-6 w-full text-center">
                <div>
                  <p className="text-2xl font-bold">{stats.completed}</p>
                  <p className="text-[10px] text-[var(--muted)] font-bold uppercase">Completed</p>
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.pending}</p>
                  <p className="text-[10px] text-[var(--muted)] font-bold uppercase">Pending</p>
                </div>
              </div>
            </div>
          </BentoCard>

          {/* Quick Actions */}
          <BentoCard title="Quick Actions" icon={Zap} className="lg:col-span-1" delay={0.3}>
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: 'New Task', icon: Plus, color: 'bg-indigo-500' },
                { icon: UserIcon, label: 'Add Team' },
                { icon: Calendar, label: 'Event' },
                { icon: Tag, label: 'Label' },
              ].map((action, i) => (
                <button 
                  key={i} 
                  className={cn(
                    "flex flex-col items-center justify-center p-4 rounded-2xl border border-[var(--card-border)] hover:bg-[var(--muted-bg)] transition-all group",
                    action.color && "bg-indigo-500 text-white border-none hover:bg-indigo-600"
                  )}
                >
                  <action.icon className={cn("w-5 h-5 mb-2", !action.color && "text-[var(--accent)]")} />
                  <span className="text-xs font-semibold">{action.label}</span>
                </button>
              ))}
            </div>
          </BentoCard>

          {/* Active Tasks - Large scrollable list */}
          <BentoCard 
            title="Active Tasks" 
            icon={CheckCircle2} 
            className="md:col-span-2 lg:col-span-2 row-span-2" 
            delay={0.4}
            action={
              <button className="text-xs font-bold text-[var(--accent)] hover:underline flex items-center gap-1">
                View All <ChevronRight className="w-3 h-3" />
              </button>
            }
          >
            <div className="space-y-1 max-h-[400px] overflow-y-auto custom-scrollbar pr-2">
              {filteredTasks.map((task) => (
                <TaskItem key={task.id} task={task} onToggle={toggleTask} />
              ))}
              {filteredTasks.length === 0 && (
                <div className="flex flex-col items-center justify-center py-20 text-[var(--muted)]">
                  <Search className="w-10 h-10 mb-4 opacity-20" />
                  <p className="text-sm font-medium">No tasks found matching your search.</p>
                </div>
              )}
            </div>
          </BentoCard>

          {/* Analytics Chart */}
          <BentoCard title="Weekly Activity" icon={TrendingUp} className="md:col-span-2 lg:col-span-2" delay={0.5}>
            <div className="h-[200px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="colorTasks" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--accent)" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="var(--accent)" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--card-border)" />
                  <XAxis 
                    dataKey="name" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: 'var(--muted)', fontSize: 10, fontWeight: 600 }}
                    dy={10}
                  />
                  <YAxis hide />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'var(--card-bg)', 
                      borderColor: 'var(--card-border)',
                      borderRadius: '16px',
                      fontSize: '12px',
                      fontWeight: '600',
                      boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
                    }} 
                  />
                  <Area 
                    type="monotone" 
                    dataKey="tasks" 
                    stroke="var(--accent)" 
                    strokeWidth={3}
                    fillOpacity={1} 
                    fill="url(#colorTasks)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </BentoCard>

          {/* Team Card */}
          <BentoCard title="Team" icon={UserIcon} className="lg:col-span-1" delay={0.6}>
            <div className="space-y-4">
              {state.users.map((user) => (
                <div key={user.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <img 
                      src={user.avatar} 
                      alt={user.name} 
                      className="w-10 h-10 rounded-2xl object-cover border border-[var(--card-border)]"
                      referrerPolicy="no-referrer"
                    />
                    <div>
                      <p className="text-sm font-bold">{user.name}</p>
                      <p className="text-[10px] text-[var(--muted)] font-medium">Active now</p>
                    </div>
                  </div>
                  <div className="w-2 h-2 bg-emerald-500 rounded-full shadow-[0_0_8px_rgba(16,185,129,0.5)]"></div>
                </div>
              ))}
              <button className="w-full py-3 border border-dashed border-[var(--card-border)] rounded-2xl text-[var(--muted)] hover:text-[var(--fg)] hover:bg-[var(--muted-bg)] transition-all text-xs font-bold uppercase tracking-wider">
                Invite Member
              </button>
            </div>
          </BentoCard>

          {/* Priority Distribution */}
          <BentoCard title="Priorities" icon={Filter} className="lg:col-span-1" delay={0.7}>
            <div className="h-[180px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={priorityData} layout="vertical" margin={{ left: -20 }}>
                  <XAxis type="number" hide />
                  <YAxis 
                    dataKey="name" 
                    type="category" 
                    axisLine={false} 
                    tickLine={false}
                    tick={{ fill: 'var(--muted)', fontSize: 10, fontWeight: 600 }}
                  />
                  <Tooltip cursor={{ fill: 'transparent' }} />
                  <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={12}>
                    {priorityData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </BentoCard>

        </div>
      </main>
    </div>
  );
}
