import React, {
  useState,
  useEffect,
  createContext,
  useContext,
  ReactNode,
  useMemo,
  useCallback,
} from "react";

/* ─────────────────────────────────────────────────────────────
   TYPES
───────────────────────────────────────────────────────────── */
type Role = "admin" | "employee";
type Priority = "Low" | "Medium" | "High";
type Status = "Pending" | "In Progress" | "Completed";

interface User {
  id: string;
  name: string;
  email: string;
  hash: string;
  role: Role;
  avatar: string;
  dept: string;
}

interface Task {
  id: string;
  title: string;
  desc: string;
  priority: Priority;
  status: Status;
  deadline: string;
  assignedTo: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

/* ─────────────────────────────────────────────────────────────
   HELPERS
───────────────────────────────────────────────────────────── */
const hp = (p: string) => btoa(p + "__tf__");
const vp = (p: string, h: string) => hp(p) === h;
const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2);
const fmt = (d: string) => {
  try {
    return new Date(d).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  } catch {
    return d;
  }
};
const overdue = (deadline: string, status: Status) =>
  status !== "Completed" && new Date(deadline) < new Date();

const UK = "tf2_users";
const TK = "tf2_tasks";
const AK = "tf2_auth";

const SEED_USERS: User[] = [
  { id: "u1", name: "Dyutishmaan Das", email: "admin@worktrackerpro.com", hash: hp("admin123"), role: "admin", avatar: "DD", dept: "Management" },
  { id: "u2", name: "Shiv Mishra", email: "shiv@worktrackerpro.com", hash: hp("emp123"), role: "employee", avatar: "SM", dept: "Engineering" },
  { id: "u3", name: "Kush Bansal", email: "kush@worktrackerpro.com", hash: hp("emp123"), role: "employee", avatar: "KB", dept: "Design" },
  { id: "u4", name: "Lakshya Kumar", email: "lakshya@worktrackerpro.com", hash: hp("emp123"), role: "employee", avatar: "LK", dept: "Marketing" },
  { id: "u5", name: "Roshni Kumari", email: "roshni@worktrackerpro.com", hash: hp("emp123"), role: "employee", avatar: "RK", dept: "Engineering" },
];

const SEED_TASKS: Task[] = [
  { id: "t1", title: "Design new landing page", desc: "Create a modern and responsive landing page for the product relaunch. Include hero section, features, testimonials, and CTA.", priority: "High", status: "In Progress", deadline: "2025-08-15", assignedTo: "u3", createdBy: "u1", createdAt: "2025-01-10T09:00:00Z", updatedAt: "2025-01-12T14:30:00Z" },
  { id: "t2", title: "Implement authentication API", desc: "Build secure JWT-based authentication endpoints including login, logout, refresh tokens, and password reset functionality.", priority: "High", status: "Completed", deadline: "2025-07-31", assignedTo: "u2", createdBy: "u1", createdAt: "2025-01-08T10:00:00Z", updatedAt: "2025-01-28T16:00:00Z" },
  { id: "t3", title: "Create Q1 marketing campaign", desc: "Develop and execute a comprehensive marketing campaign for Q1. Includes social media strategy, email sequences, and ad creatives.", priority: "Medium", status: "Pending", deadline: "2025-09-01", assignedTo: "u4", createdBy: "u1", createdAt: "2025-01-15T11:00:00Z", updatedAt: "2025-01-15T11:00:00Z" },
  { id: "t4", title: "Database optimization", desc: "Analyze and optimize slow database queries. Add necessary indexes, refactor N+1 queries, and implement caching strategies.", priority: "Medium", status: "In Progress", deadline: "2025-08-20", assignedTo: "u2", createdBy: "u1", createdAt: "2025-01-14T08:00:00Z", updatedAt: "2025-01-18T12:00:00Z" },
  { id: "t5", title: "Mobile app UI revamp", desc: "Redesign the mobile app UI following new brand guidelines. Focus on improved UX, accessibility, and modern visual design.", priority: "High", status: "Pending", deadline: "2025-09-10", assignedTo: "u3", createdBy: "u1", createdAt: "2025-01-16T09:00:00Z", updatedAt: "2025-01-16T09:00:00Z" },
  { id: "t6", title: "Write technical documentation", desc: "Create comprehensive API documentation, developer guides, and onboarding materials for the engineering team.", priority: "Low", status: "Pending", deadline: "2025-08-28", assignedTo: "u5", createdBy: "u1", createdAt: "2025-01-17T10:00:00Z", updatedAt: "2025-01-17T10:00:00Z" },
  { id: "t7", title: "Setup CI/CD pipeline", desc: "Configure automated testing and deployment pipeline using GitHub Actions. Include unit tests, integration tests, and staging deployments.", priority: "Medium", status: "Completed", deadline: "2025-07-25", assignedTo: "u5", createdBy: "u1", createdAt: "2025-01-10T11:00:00Z", updatedAt: "2025-01-24T17:00:00Z" },
  { id: "t8", title: "Conduct user research interviews", desc: "Schedule and conduct 15 user interviews to gather feedback on current product features and identify pain points.", priority: "Low", status: "In Progress", deadline: "2025-08-10", assignedTo: "u4", createdBy: "u1", createdAt: "2025-01-12T10:00:00Z", updatedAt: "2025-01-20T09:00:00Z" },
];

const VK = "wtp_version";
const APP_VERSION = "3";

function init() {
  if (localStorage.getItem(VK) !== APP_VERSION) {
    localStorage.removeItem(UK);
    localStorage.removeItem(TK);
    localStorage.removeItem(AK);
    localStorage.setItem(VK, APP_VERSION);
  }
  if (!localStorage.getItem(UK)) localStorage.setItem(UK, JSON.stringify(SEED_USERS));
  if (!localStorage.getItem(TK)) localStorage.setItem(TK, JSON.stringify(SEED_TASKS));
}
function loadUsers(): User[] { try { return JSON.parse(localStorage.getItem(UK) || "[]"); } catch { return []; } }
function loadTasks(): Task[] { try { return JSON.parse(localStorage.getItem(TK) || "[]"); } catch { return []; } }
function saveTasks(t: Task[]) { localStorage.setItem(TK, JSON.stringify(t)); }
function loadAuth(): User | null { try { const d = localStorage.getItem(AK); return d ? JSON.parse(d) : null; } catch { return null; } }
function saveAuth(u: User | null) { u ? localStorage.setItem(AK, JSON.stringify(u)) : localStorage.removeItem(AK); }

/* ─────────────────────────────────────────────────────────────
   CONTEXTS
───────────────────────────────────────────────────────────── */
interface AuthCtx { user: User | null; users: User[]; login: (e: string, p: string) => { ok: boolean; err?: string }; logout: () => void; }
const AuthCtx = createContext<AuthCtx | null>(null);
const useAuth = () => { const c = useContext(AuthCtx); if (!c) throw new Error(""); return c; };

interface TaskCtx { tasks: Task[]; add: (d: Omit<Task, "id" | "createdAt" | "updatedAt">) => void; update: (id: string, p: Partial<Task>) => void; del: (id: string) => void; }
const TaskCtx = createContext<TaskCtx | null>(null);
const useTasks = () => { const c = useContext(TaskCtx); if (!c) throw new Error(""); return c; };

/* ─────────────────────────────────────────────────────────────
   STYLE HELPERS
───────────────────────────────────────────────────────────── */
const PC: Record<Priority, string> = { High: "bg-red-100 text-red-700 border-red-200", Medium: "bg-amber-100 text-amber-700 border-amber-200", Low: "bg-green-100 text-green-700 border-green-200" };
const SC: Record<Status, string> = { Completed: "bg-emerald-100 text-emerald-700 border-emerald-200", "In Progress": "bg-blue-100 text-blue-700 border-blue-200", Pending: "bg-slate-100 text-slate-600 border-slate-200" };
const SD: Record<Status, string> = { Completed: "bg-emerald-500", "In Progress": "bg-blue-500", Pending: "bg-slate-400" };
const AV_COLORS = ["bg-violet-500", "bg-blue-500", "bg-emerald-500", "bg-amber-500", "bg-rose-500", "bg-indigo-500"];
const avColor = (s: string) => AV_COLORS[s.charCodeAt(0) % AV_COLORS.length];

/* ─────────────────────────────────────────────────────────────
   SMALL COMPONENTS
───────────────────────────────────────────────────────────── */
function Av({ i, size = "md" }: { i: string; size?: "sm" | "md" | "lg" | "xl" }) {
  const s = { sm: "w-8 h-8 text-xs", md: "w-9 h-9 text-sm", lg: "w-11 h-11 text-base", xl: "w-14 h-14 text-lg" }[size];
  return <div className={`${s} ${avColor(i)} rounded-full flex items-center justify-center font-semibold text-white flex-shrink-0`}>{i}</div>;
}

function PBadge({ p }: { p: Priority }) {
  const icon = p === "High" ? "↑" : p === "Medium" ? "→" : "↓";
  return <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium border ${PC[p]}`}>{icon} {p}</span>;
}

function SBadge({ s }: { s: Status }) {
  return <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border ${SC[s]}`}><span className={`w-1.5 h-1.5 rounded-full ${SD[s]}`} />{s}</span>;
}

/* ─────────────────────────────────────────────────────────────
   MODAL
───────────────────────────────────────────────────────────── */
function Modal({ open, onClose, title, children, size = "md" }: { open: boolean; onClose: () => void; title: string; children: ReactNode; size?: "sm" | "md" | "lg" }) {
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);
  if (!open) return null;
  const w = { sm: "max-w-sm", md: "max-w-lg", lg: "max-w-2xl" }[size];
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className={`relative w-full ${w} bg-white rounded-2xl shadow-2xl max-h-[90vh] flex flex-col`}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 flex-shrink-0">
          <h2 className="text-lg font-semibold text-slate-900">{title}</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors text-lg leading-none">✕</button>
        </div>
        <div className="p-6 overflow-y-auto">{children}</div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   TASK FORM
───────────────────────────────────────────────────────────── */
function TaskForm({ initial, onSubmit, onCancel, users }: {
  initial?: Task;
  onSubmit: (d: { title: string; desc: string; priority: Priority; status: Status; deadline: string; assignedTo: string }) => void;
  onCancel: () => void;
  users: User[];
}) {
  const emps = users.filter(u => u.role === "employee");
  const [title, setTitle] = useState(initial?.title || "");
  const [desc, setDesc] = useState(initial?.desc || "");
  const [priority, setPriority] = useState<Priority>(initial?.priority || "Medium");
  const [status, setStatus] = useState<Status>(initial?.status || "Pending");
  const [deadline, setDeadline] = useState(initial?.deadline || "");
  const [assignedTo, setAssignedTo] = useState(initial?.assignedTo || "");
  const [errs, setErrs] = useState<Record<string, string>>({});

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const e2: Record<string, string> = {};
    if (!title.trim()) e2.title = "Title is required";
    if (!desc.trim()) e2.desc = "Description is required";
    if (!deadline) e2.deadline = "Deadline is required";
    if (!assignedTo) e2.assignedTo = "Please assign to an employee";
    if (Object.keys(e2).length) { setErrs(e2); return; }
    onSubmit({ title, desc, priority, status, deadline, assignedTo });
  };

  const inp = (k: string) => `w-full px-3.5 py-2.5 text-sm border rounded-xl transition-colors focus:outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-400 ${errs[k] ? "border-red-300 bg-red-50" : "border-slate-200 bg-white"}`;
  const sel = "w-full px-3.5 py-2.5 text-sm border border-slate-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-400";

  return (
    <form onSubmit={submit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1.5">Task Title *</label>
        <input value={title} onChange={e => { setTitle(e.target.value); setErrs(p => ({ ...p, title: "" })); }} className={inp("title")} placeholder="Enter task title..." />
        {errs.title && <p className="mt-1 text-xs text-red-500">{errs.title}</p>}
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1.5">Description *</label>
        <textarea value={desc} onChange={e => { setDesc(e.target.value); setErrs(p => ({ ...p, desc: "" })); }} rows={3} className={inp("desc")} placeholder="Describe the task..." />
        {errs.desc && <p className="mt-1 text-xs text-red-500">{errs.desc}</p>}
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">Priority</label>
          <select value={priority} onChange={e => setPriority(e.target.value as Priority)} className={sel}>
            <option value="Low">Low</option><option value="Medium">Medium</option><option value="High">High</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">Status</label>
          <select value={status} onChange={e => setStatus(e.target.value as Status)} className={sel}>
            <option value="Pending">Pending</option><option value="In Progress">In Progress</option><option value="Completed">Completed</option>
          </select>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">Deadline *</label>
          <input type="date" value={deadline} onChange={e => { setDeadline(e.target.value); setErrs(p => ({ ...p, deadline: "" })); }} className={inp("deadline")} />
          {errs.deadline && <p className="mt-1 text-xs text-red-500">{errs.deadline}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">Assign To *</label>
          <select value={assignedTo} onChange={e => { setAssignedTo(e.target.value); setErrs(p => ({ ...p, assignedTo: "" })); }} className={`${sel} ${errs.assignedTo ? "border-red-300" : ""}`}>
            <option value="">Select employee...</option>
            {emps.map(u => <option key={u.id} value={u.id}>{u.name} — {u.dept}</option>)}
          </select>
          {errs.assignedTo && <p className="mt-1 text-xs text-red-500">{errs.assignedTo}</p>}
        </div>
      </div>
      <div className="flex gap-3 pt-2">
        <button type="button" onClick={onCancel} className="flex-1 px-4 py-2.5 text-sm font-medium text-slate-600 bg-slate-100 rounded-xl hover:bg-slate-200 transition-colors">Cancel</button>
        <button type="submit" className="flex-1 px-4 py-2.5 text-sm font-medium text-white bg-violet-600 rounded-xl hover:bg-violet-700 transition-colors">{initial ? "Update Task" : "Create Task"}</button>
      </div>
    </form>
  );
}

/* ─────────────────────────────────────────────────────────────
   TASK DETAIL MODAL
───────────────────────────────────────────────────────────── */
function TaskDetail({ task, open, onClose, onStatus, isAdmin, users }: { task: Task | null; open: boolean; onClose: () => void; onStatus?: (s: Status) => void; isAdmin?: boolean; users: User[] }) {
  if (!task) return null;
  const assignee = users.find(u => u.id === task.assignedTo);
  const creator = users.find(u => u.id === task.createdBy);
  const statuses: Status[] = ["Pending", "In Progress", "Completed"];
  return (
    <Modal open={open} onClose={onClose} title="Task Details" size="lg">
      <div className="space-y-5">
        <div>
          <h2 className="text-xl font-bold text-slate-900 mb-3">{task.title}</h2>
          <div className="flex gap-2 flex-wrap">
            <PBadge p={task.priority} />
            <SBadge s={task.status} />
            {overdue(task.deadline, task.status) && <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-600 border border-red-200">⚠ Overdue</span>}
          </div>
        </div>
        <div className="bg-slate-50 rounded-xl p-4">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Description</p>
          <p className="text-sm text-slate-700 leading-relaxed">{task.desc}</p>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-slate-50 rounded-xl p-3.5">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Deadline</p>
            <p className="text-sm font-medium text-slate-800">{fmt(task.deadline)}</p>
          </div>
          <div className="bg-slate-50 rounded-xl p-3.5">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Created</p>
            <p className="text-sm font-medium text-slate-800">{fmt(task.createdAt)}</p>
          </div>
          {assignee && <div className="bg-slate-50 rounded-xl p-3.5">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Assigned To</p>
            <div className="flex items-center gap-2"><Av i={assignee.avatar} size="sm" /><div><p className="text-sm font-medium text-slate-800">{assignee.name}</p><p className="text-xs text-slate-400">{assignee.dept}</p></div></div>
          </div>}
          {creator && <div className="bg-slate-50 rounded-xl p-3.5">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Created By</p>
            <div className="flex items-center gap-2"><Av i={creator.avatar} size="sm" /><div><p className="text-sm font-medium text-slate-800">{creator.name}</p><p className="text-xs text-slate-400">{creator.dept}</p></div></div>
          </div>}
        </div>
        {!isAdmin && onStatus && (
          <div>
            <p className="text-sm font-semibold text-slate-700 mb-2">Update Status</p>
            <div className="flex gap-2">
              {statuses.map(s => (
                <button key={s} onClick={() => { onStatus(s); onClose(); }} className={`flex-1 py-2 text-sm rounded-xl font-medium transition-all border ${task.status === s ? "bg-violet-600 text-white border-violet-600" : "bg-white text-slate-600 border-slate-200 hover:border-violet-300 hover:text-violet-600"}`}>{s}</button>
              ))}
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}

/* ─────────────────────────────────────────────────────────────
   TASK CARD
───────────────────────────────────────────────────────────── */
function TaskCard({ task, onEdit, onDelete, onView, onStatus, showAssignee = true, isAdmin = false, users }: {
  task: Task; onEdit?: () => void; onDelete?: () => void; onView?: () => void;
  onStatus?: (s: Status) => void; showAssignee?: boolean; isAdmin?: boolean; users: User[];
}) {
  const assignee = users.find(u => u.id === task.assignedTo);
  const od = overdue(task.deadline, task.status);
  const statuses: Status[] = ["Pending", "In Progress", "Completed"];
  return (
    <div className={`bg-white rounded-2xl border shadow-sm p-5 hover:shadow-md hover:-translate-y-0.5 transition-all ${od ? "border-red-200" : "border-slate-100"}`}>
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-slate-900 text-sm leading-snug mb-1 line-clamp-2">{task.title}</h3>
          <p className="text-xs text-slate-400 line-clamp-2">{task.desc}</p>
        </div>
        <div className="flex items-center gap-1 flex-shrink-0">
          {onView && <button onClick={onView} title="View" className="p-1.5 rounded-lg text-slate-400 hover:text-violet-600 hover:bg-violet-50 transition-colors text-sm">👁</button>}
          {isAdmin && onEdit && <button onClick={onEdit} title="Edit" className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors text-sm">✏️</button>}
          {isAdmin && onDelete && <button onClick={onDelete} title="Delete" className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors text-sm">🗑️</button>}
        </div>
      </div>
      <div className="flex items-center gap-2 mb-3 flex-wrap">
        <PBadge p={task.priority} />
        <SBadge s={task.status} />
        {od && <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-600 border border-red-200">Overdue</span>}
      </div>
      <div className="flex items-center justify-between">
        <span className={`text-xs flex items-center gap-1 ${od ? "text-red-500" : "text-slate-400"}`}>📅 {fmt(task.deadline)}</span>
        {showAssignee && assignee && (
          <div className="flex items-center gap-1.5">
            <Av i={assignee.avatar} size="sm" />
            <span className="text-xs text-slate-500 hidden sm:block">{assignee.name.split(" ")[0]}</span>
          </div>
        )}
      </div>
      {!isAdmin && onStatus && (
        <div className="mt-3 pt-3 border-t border-slate-100">
          <p className="text-xs text-slate-400 mb-1.5 font-medium">Update Status</p>
          <div className="flex gap-1.5">
            {statuses.map(s => (
              <button key={s} onClick={() => onStatus(s)} className={`flex-1 py-1.5 text-xs rounded-lg font-medium transition-all border ${task.status === s ? "bg-violet-600 text-white border-violet-600" : "bg-slate-50 text-slate-500 border-slate-200 hover:border-violet-300 hover:text-violet-600"}`}>
                {s === "In Progress" ? "Active" : s}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   SIDEBAR
───────────────────────────────────────────────────────────── */
type Page = "dashboard" | "tasks" | "users";

function Sidebar({ page, setPage, open, onClose }: { page: Page; setPage: (p: Page) => void; open: boolean; onClose: () => void }) {
  const { user, logout } = useAuth();
  const isAdmin = user?.role === "admin";
  const links = [
    { id: "dashboard" as Page, label: "Dashboard", icon: "📊" },
    { id: "tasks" as Page, label: isAdmin ? "All Tasks" : "My Tasks", icon: "✅" },
    ...(isAdmin ? [{ id: "users" as Page, label: "Users", icon: "👥" }] : []),
  ];
  return (
    <>
      {open && <div className="fixed inset-0 bg-black/40 z-30 lg:hidden" onClick={onClose} />}
      <aside className={`fixed top-0 left-0 h-full w-64 bg-slate-900 flex flex-col z-40 transition-transform duration-300 lg:translate-x-0 lg:static lg:z-auto ${open ? "translate-x-0" : "-translate-x-full"}`}>
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-700/50">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-violet-500 rounded-lg flex items-center justify-center text-white font-bold text-sm">✓</div>
            <span className="text-white font-bold text-lg">WorkTracker Pro</span>
          </div>
          <button onClick={onClose} className="lg:hidden text-slate-400 hover:text-white transition-colors text-lg">✕</button>
        </div>
        <div className="px-6 py-3">
          <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${isAdmin ? "bg-violet-500/20 text-violet-300" : "bg-blue-500/20 text-blue-300"}`}>
            {isAdmin ? "⚡ Admin" : "👤 Employee"}
          </span>
        </div>
        <nav className="flex-1 px-4 py-2 space-y-1">
          {links.map(l => (
            <button key={l.id} onClick={() => { setPage(l.id); onClose(); }} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all text-left ${page === l.id ? "bg-violet-600 text-white" : "text-slate-400 hover:text-white hover:bg-slate-800"}`}>
              <span>{l.icon}</span>{l.label}
            </button>
          ))}
        </nav>
        <div className="px-4 py-4 border-t border-slate-700/50">
          <div className="flex items-center gap-3 px-3 py-2 mb-2">
            <Av i={user?.avatar || "U"} size="sm" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">{user?.name}</p>
              <p className="text-xs text-slate-400 truncate">{user?.dept}</p>
            </div>
          </div>
          <button onClick={logout} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-colors">
            🚪 Logout
          </button>
        </div>
      </aside>
    </>
  );
}

/* ─────────────────────────────────────────────────────────────
   HEADER
───────────────────────────────────────────────────────────── */
function Header({ title, onMenu }: { title: string; onMenu: () => void }) {
  const { user } = useAuth();
  return (
    <header className="sticky top-0 z-20 bg-white/90 backdrop-blur-md border-b border-slate-100 px-4 lg:px-6 py-4 flex items-center justify-between">
      <div className="flex items-center gap-4">
        <button onClick={onMenu} className="lg:hidden p-2 rounded-xl text-slate-500 hover:text-slate-700 hover:bg-slate-100 transition-colors text-lg">☰</button>
        <h1 className="text-lg font-semibold text-slate-900">{title}</h1>
      </div>
      <div className="flex items-center gap-3">
        <Av i={user?.avatar || "U"} size="sm" />
        <div className="hidden sm:block">
          <p className="text-sm font-medium text-slate-800 leading-tight">{user?.name}</p>
          <p className="text-xs text-slate-400">{user?.email}</p>
        </div>
      </div>
    </header>
  );
}

/* ─────────────────────────────────────────────────────────────
   ADMIN DASHBOARD
───────────────────────────────────────────────────────────── */
function AdminDash() {
  const { tasks } = useTasks();
  const { users } = useAuth();
  const emps = users.filter(u => u.role === "employee");

  const total = tasks.length;
  const completed = tasks.filter(t => t.status === "Completed").length;
  const pending = tasks.filter(t => t.status === "Pending").length;
  const inProg = tasks.filter(t => t.status === "In Progress").length;
  const od = tasks.filter(t => overdue(t.deadline, t.status)).length;
  const highP = tasks.filter(t => t.priority === "High" && t.status !== "Completed").length;
  const rate = total > 0 ? Math.round((completed / total) * 100) : 0;
  const recent = [...tasks].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 5);
  const empStats = emps.map(e => { const et = tasks.filter(t => t.assignedTo === e.id); return { ...e, total: et.length, done: et.filter(t => t.status === "Completed").length }; });

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total Tasks", val: total, icon: "📋", bg: "bg-violet-500", sub: "All assigned" },
          { label: "Completed", val: completed, icon: "✅", bg: "bg-emerald-500", sub: `${rate}% rate` },
          { label: "Pending", val: pending, icon: "⏳", bg: "bg-amber-500", sub: `${inProg} in progress` },
          { label: "Total Users", val: emps.length, icon: "👥", bg: "bg-blue-500", sub: "Active employees" },
        ].map(c => (
          <div key={c.label} className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between">
              <div><p className="text-sm text-slate-500 font-medium mb-1">{c.label}</p><p className="text-3xl font-bold text-slate-900">{c.val}</p><p className="text-xs text-slate-400 mt-1">{c.sub}</p></div>
              <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${c.bg} text-xl`}>{c.icon}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-100 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-slate-900">Task Overview</h3>
            <span className="text-sm text-emerald-600 font-medium">📈 {rate}% done</span>
          </div>
          {[
            { label: "Completed", count: completed, color: "bg-emerald-500" },
            { label: "In Progress", count: inProg, color: "bg-blue-500" },
            { label: "Pending", count: pending, color: "bg-amber-400" },
          ].map(({ label, count, color }) => (
            <div key={label} className="mb-3">
              <div className="flex justify-between text-sm mb-1.5"><span className="text-slate-600 font-medium">{label}</span><span className="text-slate-400">{count} / {total}</span></div>
              <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden"><div className={`h-full rounded-full ${color}`} style={{ width: total > 0 ? `${(count / total) * 100}%` : "0%" }} /></div>
            </div>
          ))}
        </div>
        <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm">
          <h3 className="font-semibold text-slate-900 mb-4">⚠️ Alerts</h3>
          <div className="space-y-3">
            <div className={`flex items-center gap-3 p-3 rounded-xl ${od > 0 ? "bg-red-50 border border-red-100" : "bg-slate-50"}`}>
              <div className={`p-2 rounded-lg ${od > 0 ? "bg-red-100" : "bg-slate-100"}`}><span>{od > 0 ? "🔴" : "🟢"}</span></div>
              <div><p className="text-sm font-semibold text-slate-800">{od} Overdue</p><p className="text-xs text-slate-400">Tasks past deadline</p></div>
            </div>
            <div className={`flex items-center gap-3 p-3 rounded-xl ${highP > 0 ? "bg-orange-50 border border-orange-100" : "bg-slate-50"}`}>
              <div className={`p-2 rounded-lg ${highP > 0 ? "bg-orange-100" : "bg-slate-100"}`}><span>{highP > 0 ? "🟠" : "🟢"}</span></div>
              <div><p className="text-sm font-semibold text-slate-800">{highP} High Priority</p><p className="text-xs text-slate-400">Urgent incomplete</p></div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100"><h3 className="font-semibold text-slate-900">Recent Tasks</h3></div>
          <div className="divide-y divide-slate-50">
            {recent.map(t => {
              const a = users.find(u => u.id === t.assignedTo);
              return (
                <div key={t.id} className="px-5 py-3.5 flex items-center gap-3 hover:bg-slate-50">
                  <div className="flex-1 min-w-0"><p className="text-sm font-medium text-slate-800 truncate">{t.title}</p><div className="flex items-center gap-2 mt-1"><PBadge p={t.priority} /><span className="text-xs text-slate-400">{fmt(t.deadline)}</span></div></div>
                  <div className="flex items-center gap-2 flex-shrink-0"><SBadge s={t.status} />{a && <Av i={a.avatar} size="sm" />}</div>
                </div>
              );
            })}
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100"><h3 className="font-semibold text-slate-900">Employee Performance</h3></div>
          <div className="divide-y divide-slate-50">
            {empStats.map(e => (
              <div key={e.id} className="px-5 py-3.5 hover:bg-slate-50">
                <div className="flex items-center gap-3">
                  <Av i={e.avatar} size="sm" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1"><p className="text-sm font-medium text-slate-800">{e.name}</p><p className="text-xs text-slate-400">{e.done}/{e.total}</p></div>
                    <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden"><div className="h-full bg-emerald-500 rounded-full" style={{ width: e.total > 0 ? `${(e.done / e.total) * 100}%` : "0%" }} /></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   ADMIN TASKS PAGE
───────────────────────────────────────────────────────────── */
function AdminTasks() {
  const { tasks, add, update, del } = useTasks();
  const { user, users } = useAuth();
  const [search, setSearch] = useState("");
  const [fSt, setFSt] = useState<Status | "All">("All");
  const [fPr, setFPr] = useState<Priority | "All">("All");
  const [fUs, setFUs] = useState("All");
  const [view, setView] = useState<"grid" | "list">("grid");
  const [createOpen, setCreateOpen] = useState(false);
  const [editTask, setEditTask] = useState<Task | null>(null);
  const [viewTask, setViewTask] = useState<Task | null>(null);
  const [delTask, setDelTask] = useState<Task | null>(null);
  const emps = users.filter(u => u.role === "employee");
  const filtered = useMemo(() => tasks.filter(t => {
    const ms = t.title.toLowerCase().includes(search.toLowerCase()) || t.desc.toLowerCase().includes(search.toLowerCase());
    return ms && (fPr === "All" || t.priority === fPr) && (fSt === "All" || t.status === fSt) && (fUs === "All" || t.assignedTo === fUs);
  }), [tasks, search, fPr, fSt, fUs]);

  const sel = "px-3 py-2 text-sm border border-slate-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-violet-500/30";

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">🔍</span>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search tasks..." className="w-full pl-10 pr-4 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500/30 bg-white" />
        </div>
        <div className="flex gap-2 flex-wrap items-center">
          <select value={fSt} onChange={e => setFSt(e.target.value as Status | "All")} className={sel}>
            <option value="All">All Status</option><option value="Pending">Pending</option><option value="In Progress">In Progress</option><option value="Completed">Completed</option>
          </select>
          <select value={fPr} onChange={e => setFPr(e.target.value as Priority | "All")} className={sel}>
            <option value="All">All Priority</option><option value="High">High</option><option value="Medium">Medium</option><option value="Low">Low</option>
          </select>
          <select value={fUs} onChange={e => setFUs(e.target.value)} className={sel}>
            <option value="All">All Users</option>{emps.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
          </select>
          <div className="flex border border-slate-200 rounded-xl overflow-hidden">
            <button onClick={() => setView("grid")} className={`px-3 py-2 transition-colors ${view === "grid" ? "bg-violet-600 text-white" : "bg-white text-slate-400 hover:text-slate-600"}`}>⊞</button>
            <button onClick={() => setView("list")} className={`px-3 py-2 transition-colors ${view === "list" ? "bg-violet-600 text-white" : "bg-white text-slate-400 hover:text-slate-600"}`}>☰</button>
          </div>
          <button onClick={() => setCreateOpen(true)} className="flex items-center gap-2 px-4 py-2.5 bg-violet-600 hover:bg-violet-700 text-white text-sm font-medium rounded-xl transition-colors">+ New Task</button>
        </div>
      </div>
      <p className="text-sm text-slate-500">Showing <span className="font-semibold text-slate-700">{filtered.length}</span> of {tasks.length} tasks</p>

      {view === "grid" ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map(t => <TaskCard key={t.id} task={t} users={users} isAdmin showAssignee onView={() => setViewTask(t)} onEdit={() => setEditTask(t)} onDelete={() => setDelTask(t)} />)}
          {filtered.length === 0 && <div className="col-span-full text-center py-16 text-slate-400"><div className="text-5xl mb-4">🔍</div><p className="font-medium">No tasks found</p><p className="text-sm mt-1">Try adjusting filters</p></div>}
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="hidden sm:grid grid-cols-12 px-5 py-3 bg-slate-50 border-b border-slate-100 text-xs font-semibold text-slate-500 uppercase tracking-wider">
            <div className="col-span-4">Task</div><div className="col-span-2">Priority</div><div className="col-span-2">Status</div><div className="col-span-2">Assignee</div><div className="col-span-1">Deadline</div><div className="col-span-1 text-right">Actions</div>
          </div>
          <div className="divide-y divide-slate-50">
            {filtered.map(t => {
              const a = users.find(u => u.id === t.assignedTo);
              return (
                <div key={t.id} className="grid grid-cols-1 sm:grid-cols-12 items-center px-5 py-3.5 hover:bg-slate-50 gap-2 sm:gap-0">
                  <div className="sm:col-span-4"><p className="text-sm font-medium text-slate-800 truncate">{t.title}</p></div>
                  <div className="sm:col-span-2"><PBadge p={t.priority} /></div>
                  <div className="sm:col-span-2"><SBadge s={t.status} /></div>
                  <div className="sm:col-span-2 flex items-center gap-2">{a && <><Av i={a.avatar} size="sm" /><span className="text-xs text-slate-600 hidden lg:block">{a.name.split(" ")[0]}</span></>}</div>
                  <div className="sm:col-span-1 text-xs text-slate-400">{fmt(t.deadline)}</div>
                  <div className="sm:col-span-1 flex items-center justify-end gap-1">
                    <button onClick={() => setViewTask(t)} className="px-2 py-1 text-xs text-slate-400 hover:text-violet-600 hover:bg-violet-50 rounded-lg">View</button>
                    <button onClick={() => setEditTask(t)} className="px-2 py-1 text-xs text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg">Edit</button>
                    <button onClick={() => setDelTask(t)} className="px-2 py-1 text-xs text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg">Del</button>
                  </div>
                </div>
              );
            })}
            {filtered.length === 0 && <div className="text-center py-12 text-slate-400"><p className="font-medium">No tasks found</p></div>}
          </div>
        </div>
      )}

      <Modal open={createOpen} onClose={() => setCreateOpen(false)} title="Create New Task" size="lg">
        <TaskForm users={users} onSubmit={d => { add({ title: d.title, desc: d.desc, priority: d.priority, status: d.status, deadline: d.deadline, assignedTo: d.assignedTo, createdBy: user?.id || "u1" }); setCreateOpen(false); }} onCancel={() => setCreateOpen(false)} />
      </Modal>
      <Modal open={!!editTask} onClose={() => setEditTask(null)} title="Edit Task" size="lg">
        {editTask && <TaskForm initial={editTask} users={users} onSubmit={d => { update(editTask.id, { title: d.title, desc: d.desc, priority: d.priority, status: d.status, deadline: d.deadline, assignedTo: d.assignedTo }); setEditTask(null); }} onCancel={() => setEditTask(null)} />}
      </Modal>
      <TaskDetail task={viewTask} open={!!viewTask} onClose={() => setViewTask(null)} isAdmin users={users} />
      <Modal open={!!delTask} onClose={() => setDelTask(null)} title="Delete Task" size="sm">
        <div className="text-center">
          <div className="text-5xl mb-4">🗑️</div>
          <p className="text-slate-700 mb-1 font-medium">Delete "{delTask?.title}"?</p>
          <p className="text-sm text-slate-400 mb-6">This action cannot be undone.</p>
          <div className="flex gap-3">
            <button onClick={() => setDelTask(null)} className="flex-1 py-2.5 text-sm font-medium text-slate-600 bg-slate-100 rounded-xl hover:bg-slate-200">Cancel</button>
            <button onClick={() => { if (delTask) { del(delTask.id); setDelTask(null); } }} className="flex-1 py-2.5 text-sm font-medium text-white bg-red-600 rounded-xl hover:bg-red-700">Delete</button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   ADMIN USERS PAGE
───────────────────────────────────────────────────────────── */
function AdminUsers() {
  const { users } = useAuth();
  const { tasks } = useTasks();
  const emps = users.filter(u => u.role === "employee");
  const data = useMemo(() => emps.map(e => {
    const et = tasks.filter(t => t.assignedTo === e.id);
    const done = et.filter(t => t.status === "Completed").length;
    const prog = et.filter(t => t.status === "In Progress").length;
    return { ...e, total: et.length, done, prog, rate: et.length > 0 ? Math.round((done / et.length) * 100) : 0, recent: et.slice(0, 3) };
  }), [emps, tasks]);
  const avg = data.length > 0 ? Math.round(data.reduce((s, e) => s + e.rate, 0) / data.length) : 0;

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[{ label: "Total Employees", val: emps.length, icon: "👥" }, { label: "Tasks Assigned", val: tasks.length, icon: "📋" }, { label: "Avg. Completion", val: `${avg}%`, icon: "📈" }].map(c => (
          <div key={c.label} className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm">
            <div className="flex items-center justify-between"><div><p className="text-sm text-slate-500 font-medium mb-1">{c.label}</p><p className="text-3xl font-bold text-slate-900">{c.val}</p></div><span className="text-3xl">{c.icon}</span></div>
          </div>
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {data.map(e => (
          <div key={e.id} className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden hover:shadow-md transition-shadow">
            <div className="p-5 flex items-start gap-4">
              <Av i={e.avatar} size="lg" />
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-slate-900">{e.name}</h3>
                <p className="text-xs text-slate-500 mt-0.5">🏢 {e.dept}</p>
                <p className="text-xs text-slate-400 mt-0.5">✉️ {e.email}</p>
              </div>
              <div className="text-right flex-shrink-0"><div className="text-2xl font-bold text-slate-900">{e.rate}%</div><div className="text-xs text-slate-400">completion</div></div>
            </div>
            <div className="px-5 pb-3"><div className="h-2 bg-slate-100 rounded-full overflow-hidden"><div className="h-full bg-gradient-to-r from-violet-500 to-emerald-500 rounded-full" style={{ width: `${e.rate}%` }} /></div></div>
            <div className="grid grid-cols-3 divide-x divide-slate-100 border-t border-slate-100">
              {[{ l: "Total", v: e.total, c: "text-slate-900" }, { l: "Active", v: e.prog, c: "text-blue-600" }, { l: "Done", v: e.done, c: "text-emerald-600" }].map(s => (
                <div key={s.l} className="p-3 text-center"><p className="text-xs text-slate-400 mb-1">{s.l}</p><p className={`text-lg font-bold ${s.c}`}>{s.v}</p></div>
              ))}
            </div>
            {e.recent.length > 0 && (
              <div className="px-5 py-3 border-t border-slate-100 bg-slate-50/50">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Recent Tasks</p>
                <div className="space-y-1.5">
                  {e.recent.map(t => <div key={t.id} className="flex items-center justify-between"><p className="text-xs text-slate-600 truncate flex-1 mr-2">{t.title}</p><SBadge s={t.status} /></div>)}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   EMPLOYEE DASHBOARD
───────────────────────────────────────────────────────────── */
function EmpDash() {
  const { user, users } = useAuth();
  const { tasks, update } = useTasks();
  const [viewTask, setViewTask] = useState<Task | null>(null);
  const mine = useMemo(() => tasks.filter(t => t.assignedTo === user?.id), [tasks, user]);
  const total = mine.length;
  const done = mine.filter(t => t.status === "Completed").length;
  const pending = mine.filter(t => t.status === "Pending").length;
  const prog = mine.filter(t => t.status === "In Progress").length;
  const od = mine.filter(t => overdue(t.deadline, t.status)).length;
  const rate = total > 0 ? Math.round((done / total) * 100) : 0;
  const urgent = mine.filter(t => t.status !== "Completed" && (t.priority === "High" || overdue(t.deadline, t.status))).slice(0, 3);
  const recent = [...mine].sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()).slice(0, 4);

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-violet-600 to-violet-700 rounded-2xl p-6 text-white">
        <p className="text-violet-200 text-sm mb-1">Welcome back 👋</p>
        <h2 className="text-2xl font-bold">{user?.name}</h2>
        <p className="text-violet-200 text-sm mt-1">{user?.dept} Department</p>
        <div className="mt-4 flex items-center gap-3">
          <div className="flex-1 bg-white/20 rounded-full h-2.5"><div className="h-2.5 bg-white rounded-full" style={{ width: `${rate}%` }} /></div>
          <span className="text-sm font-semibold">{rate}% complete</span>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "My Tasks", val: total, icon: "📋", bg: "bg-violet-500" },
          { label: "Completed", val: done, icon: "✅", bg: "bg-emerald-500" },
          { label: "In Progress", val: prog, icon: "🔄", bg: "bg-blue-500" },
          { label: "Pending", val: pending, icon: "⏳", bg: "bg-amber-500" },
        ].map(c => (
          <div key={c.label} className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between">
              <div><p className="text-sm text-slate-500 font-medium mb-1">{c.label}</p><p className="text-3xl font-bold text-slate-900">{c.val}</p></div>
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${c.bg} text-xl`}>{c.icon}</div>
            </div>
          </div>
        ))}
      </div>

      {od > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-4 flex items-center gap-3">
          <span className="text-2xl">⚠️</span>
          <div><p className="text-sm font-semibold text-red-800">You have {od} overdue task{od > 1 ? "s" : ""}</p><p className="text-xs text-red-500">Please update these as soon as possible.</p></div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
            <h3 className="font-semibold text-slate-900">Needs Attention</h3>
            <span className="text-xs text-slate-400">{urgent.length} tasks</span>
          </div>
          <div className="p-4 space-y-3">
            {urgent.length === 0 ? (
              <div className="text-center py-8"><div className="text-4xl mb-2">✅</div><p className="text-sm text-slate-500 font-medium">All caught up!</p><p className="text-xs text-slate-400">No urgent tasks</p></div>
            ) : urgent.map(t => <TaskCard key={t.id} task={t} users={users} showAssignee={false} onView={() => setViewTask(t)} onStatus={s => update(t.id, { status: s })} />)}
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100"><h3 className="font-semibold text-slate-900">Recent Activity</h3></div>
          <div className="divide-y divide-slate-50">
            {recent.length === 0 ? <div className="text-center py-8 text-slate-400"><p className="text-sm">No tasks yet</p></div> : recent.map(t => (
              <div key={t.id} onClick={() => setViewTask(t)} className="px-5 py-3.5 hover:bg-slate-50 cursor-pointer">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex-1 min-w-0"><p className="text-sm font-medium text-slate-800 truncate">{t.title}</p><div className="flex items-center gap-2 mt-1"><PBadge p={t.priority} /><span className="text-xs text-slate-400">Due {fmt(t.deadline)}</span></div></div>
                  <SBadge s={t.status} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <TaskDetail task={viewTask} open={!!viewTask} onClose={() => setViewTask(null)} users={users} onStatus={s => { if (viewTask) update(viewTask.id, { status: s }); setViewTask(null); }} />
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   EMPLOYEE TASKS PAGE
───────────────────────────────────────────────────────────── */
function EmpTasks() {
  const { user, users } = useAuth();
  const { tasks, update } = useTasks();
  const [search, setSearch] = useState("");
  const [fSt, setFSt] = useState<Status | "All">("All");
  const [fPr, setFPr] = useState<Priority | "All">("All");
  const [viewTask, setViewTask] = useState<Task | null>(null);
  const mine = useMemo(() => tasks.filter(t => t.assignedTo === user?.id), [tasks, user]);
  const filtered = useMemo(() => mine.filter(t => {
    const ms = t.title.toLowerCase().includes(search.toLowerCase()) || t.desc.toLowerCase().includes(search.toLowerCase());
    return ms && (fSt === "All" || t.status === fSt) && (fPr === "All" || t.priority === fPr);
  }), [mine, search, fSt, fPr]);

  const handleStatus = (id: string, s: Status) => { update(id, { status: s }); setViewTask(p => p?.id === id ? { ...p, status: s } : p); };
  const sel = "px-3 py-2 text-sm border border-slate-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-violet-500/30";
  const groups: { label: Status; color: string }[] = [
    { label: "Pending", color: "border-amber-300 bg-amber-50 text-amber-700" },
    { label: "In Progress", color: "border-blue-300 bg-blue-50 text-blue-700" },
    { label: "Completed", color: "border-emerald-300 bg-emerald-50 text-emerald-700" },
  ];

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">🔍</span>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search your tasks..." className="w-full pl-10 pr-4 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500/30 bg-white" />
        </div>
        <div className="flex gap-2">
          <select value={fSt} onChange={e => setFSt(e.target.value as Status | "All")} className={sel}><option value="All">All Status</option><option value="Pending">Pending</option><option value="In Progress">In Progress</option><option value="Completed">Completed</option></select>
          <select value={fPr} onChange={e => setFPr(e.target.value as Priority | "All")} className={sel}><option value="All">All Priority</option><option value="High">High</option><option value="Medium">Medium</option><option value="Low">Low</option></select>
        </div>
      </div>
      <p className="text-sm text-slate-500">Showing <span className="font-semibold text-slate-700">{filtered.length}</span> of {mine.length} tasks</p>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {groups.map(({ label, color }) => {
          const gt = filtered.filter(t => t.status === label);
          return (
            <div key={label} className="space-y-3">
              <div className={`flex items-center justify-between px-3 py-2 rounded-xl border ${color}`}>
                <span className="text-sm font-semibold">{label}</span>
                <span className="text-xs font-bold bg-white/60 px-2 py-0.5 rounded-full">{gt.length}</span>
              </div>
              <div className="space-y-3">
                {gt.map(t => <TaskCard key={t.id} task={t} users={users} showAssignee={false} onView={() => setViewTask(t)} onStatus={s => handleStatus(t.id, s)} />)}
                {gt.length === 0 && <div className="bg-white rounded-2xl border border-dashed border-slate-200 p-6 text-center"><p className="text-xs text-slate-400">No tasks</p></div>}
              </div>
            </div>
          );
        })}
      </div>

      <TaskDetail task={viewTask} open={!!viewTask} onClose={() => setViewTask(null)} users={users} onStatus={s => { if (viewTask) handleStatus(viewTask.id, s); }} />
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   LOGIN PAGE
───────────────────────────────────────────────────────────── */
function Login({ doLogin }: { doLogin: (e: string, p: string) => { ok: boolean; err?: string } }) {
  const [email, setEmail] = useState("");
  const [pwd, setPwd] = useState("");
  const [show, setShow] = useState(false);
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr("");
    if (!email.trim() || !pwd.trim()) { setErr("Please enter both email and password."); return; }
    setLoading(true);
    await new Promise(r => setTimeout(r, 400));
    const res = doLogin(email, pwd);
    setLoading(false);
    if (!res.ok) setErr(res.err || "Login failed.");
  };

  // demo fill removed

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-violet-950 to-slate-900 flex items-center justify-center p-4">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-violet-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />
      </div>
      <div className="relative w-full max-w-md">
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
          <div className="bg-gradient-to-r from-violet-600 to-violet-700 px-8 py-8 text-center">
            <div className="inline-flex w-16 h-16 rounded-2xl bg-white/20 items-center justify-center mb-4 text-3xl font-bold text-white">✓</div>
            <h1 className="text-3xl font-bold text-white">WorkTracker Pro</h1>
            <p className="text-violet-200 text-sm mt-1">Task Management System</p>
          </div>
          <div className="px-8 py-8">
            <h2 className="text-xl font-semibold text-slate-900 mb-1">Welcome back</h2>
            <p className="text-slate-400 text-sm mb-6">Sign in to your account to continue</p>
            {err && <div className="mb-5 p-3.5 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600 flex items-center gap-2"><span>⚠️</span>{err}</div>}
            <form onSubmit={submit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Email Address</label>
                <input type="email" value={email} onChange={e => setEmail(e.target.value)} autoComplete="email"
                  className="w-full px-4 py-3 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-400"
                  placeholder="you@example.com" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Password</label>
                <div className="relative">
                  <input type={show ? "text" : "password"} value={pwd} onChange={e => setPwd(e.target.value)} autoComplete="current-password"
                    className="w-full px-4 py-3 pr-12 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-400"
                    placeholder="Enter your password" />
                  <button type="button" onClick={() => setShow(!show)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-lg">{show ? "🙈" : "👁"}</button>
                </div>
              </div>
              <button type="submit" disabled={loading}
                className="w-full py-3 bg-violet-600 hover:bg-violet-700 text-white font-semibold rounded-xl transition-colors flex items-center justify-center gap-2 disabled:opacity-70 mt-2">
                {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full" style={{ animation: "spin 1s linear infinite" }} /> : <>Sign In</>}
              </button>
            </form>
            <div className="mt-2"></div>
          </div>
        </div>
        <p className="text-center text-slate-500 text-xs mt-4">WorkTracker Pro © 2025 — Secure Task Management</p>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   DASHBOARD WRAPPER
───────────────────────────────────────────────────────────── */
function Dashboard() {
  const { user } = useAuth();
  const [page, setPage] = useState<Page>("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const isAdmin = user?.role === "admin";
  const titles: Record<Page, string> = { dashboard: isAdmin ? "Dashboard Overview" : "My Dashboard", tasks: isAdmin ? "Task Management" : "My Tasks", users: "User Management" };
  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      <Sidebar page={page} setPage={setPage} open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Header title={titles[page]} onMenu={() => setSidebarOpen(true)} />
        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          {page === "dashboard" && (isAdmin ? <AdminDash /> : <EmpDash />)}
          {page === "tasks" && (isAdmin ? <AdminTasks /> : <EmpTasks />)}
          {page === "users" && isAdmin && <AdminUsers />}
        </main>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   ROOT APP
───────────────────────────────────────────────────────────── */
export function App() {
  const [users, setUsers] = useState<User[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [authUser, setAuthUser] = useState<User | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    init();
    const u = loadUsers();
    const t = loadTasks();
    setUsers(u);
    setTasks(t);
    const saved = loadAuth();
    if (saved) {
      const fresh = u.find(x => x.id === saved.id);
      if (fresh) setAuthUser(fresh);
    }
    setReady(true);
  }, []);

  const login = useCallback((email: string, password: string) => {
    const found = users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (!found) return { ok: false, err: "No account found with this email." };
    if (!vp(password, found.hash)) return { ok: false, err: "Incorrect password. Please try again." };
    setAuthUser(found);
    saveAuth(found);
    return { ok: true };
  }, [users]);

  const logout = useCallback(() => { setAuthUser(null); saveAuth(null); }, []);

  const add = useCallback((data: Omit<Task, "id" | "createdAt" | "updatedAt">) => {
    const now = new Date().toISOString();
    const t: Task = { id: uid(), ...data, createdAt: now, updatedAt: now };
    setTasks(prev => { const u = [...prev, t]; saveTasks(u); return u; });
  }, []);

  const update = useCallback((id: string, patch: Partial<Task>) => {
    setTasks(prev => { const u = prev.map(t => t.id === id ? { ...t, ...patch, updatedAt: new Date().toISOString() } : t); saveTasks(u); return u; });
  }, []);

  const del = useCallback((id: string) => {
    setTasks(prev => { const u = prev.filter(t => t.id !== id); saveTasks(u); return u; });
  }, []);

  if (!ready) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-violet-200 border-t-violet-600 rounded-full" style={{ animation: "spin 1s linear infinite" }} />
          <p className="text-sm text-slate-500 font-medium">Loading WorkTracker Pro...</p>
        </div>
      </div>
    );
  }

  const authCtx: AuthCtx = { user: authUser, users, login, logout };
  const taskCtx: TaskCtx = { tasks, add, update, del };

  return (
    <AuthCtx.Provider value={authCtx}>
      <TaskCtx.Provider value={taskCtx}>
        <style>{`
          @keyframes spin { to { transform: rotate(360deg); } }
          * { font-family: 'Inter', system-ui, sans-serif; }
          ::-webkit-scrollbar { width: 6px; height: 6px; }
          ::-webkit-scrollbar-track { background: #f1f5f9; }
          ::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 3px; }
        `}</style>
        {authUser ? <Dashboard /> : <Login doLogin={login} />}
      </TaskCtx.Provider>
    </AuthCtx.Provider>
  );
}
