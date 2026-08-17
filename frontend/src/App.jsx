import { useEffect, useMemo, useState } from "react";

const API_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000/api";

const blankTask = {
  title: "",
  description: "",
  status: "todo",
  priority: "medium",
  due_date: "",
};

const statuses = {
  todo: "To do",
  in_progress: "In progress",
  done: "Done",
};

const priorities = {
  low: "Low",
  medium: "Medium",
  high: "High",
};

function App() {
  const [token, setToken] = useState(() => localStorage.getItem("taskAccessToken") || "");
  const [authMode, setAuthMode] = useState("login");
  const [authForm, setAuthForm] = useState({ username: "", email: "", password: "" });
  const [tasks, setTasks] = useState([]);
  const [taskForm, setTaskForm] = useState(blankTask);
  const [editingId, setEditingId] = useState(null);
  const [filters, setFilters] = useState({ search: "", status: "all", priority: "all" });
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const stats = useMemo(() => {
    const done = tasks.filter((task) => task.status === "done").length;
    const active = tasks.filter((task) => task.status === "in_progress").length;
    return {
      total: tasks.length,
      active,
      done,
      completion: tasks.length ? Math.round((done / tasks.length) * 100) : 0,
    };
  }, [tasks]);

  useEffect(() => {
    if (token) {
      loadTasks();
    }
  }, [token, filters.status, filters.priority]);

  async function api(path, options = {}) {
    const response = await fetch(`${API_URL}${path}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...options.headers,
      },
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.detail || error.username?.[0] || "Something went wrong");
    }

    if (response.status === 204) return null;
    return response.json();
  }

  async function submitAuth(event) {
    event.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      if (authMode === "register") {
        await api("/auth/register/", {
          method: "POST",
          body: JSON.stringify(authForm),
        });
      }

      const data = await api("/auth/login/", {
        method: "POST",
        body: JSON.stringify({
          username: authForm.username,
          password: authForm.password,
        }),
      });

      localStorage.setItem("taskAccessToken", data.access);
      setToken(data.access);
      setMessage("");
    } catch (error) {
      setMessage(error.message);
    } finally {
      setLoading(false);
    }
  }

  async function loadTasks() {
    const params = new URLSearchParams();
    if (filters.status !== "all") params.set("status", filters.status);
    if (filters.priority !== "all") params.set("priority", filters.priority);

    try {
      const data = await api(`/tasks/?${params.toString()}`);
      setTasks(data);
    } catch (error) {
      setMessage(error.message);
    }
  }

  async function saveTask(event) {
    event.preventDefault();
    setLoading(true);
    setMessage("");

    const payload = {
      ...taskForm,
      due_date: taskForm.due_date || null,
    };

    try {
      await api(editingId ? `/tasks/${editingId}/` : "/tasks/", {
        method: editingId ? "PUT" : "POST",
        body: JSON.stringify(payload),
      });
      setTaskForm(blankTask);
      setEditingId(null);
      await loadTasks();
    } catch (error) {
      setMessage(error.message);
    } finally {
      setLoading(false);
    }
  }

  async function removeTask(id) {
    await api(`/tasks/${id}/`, { method: "DELETE" });
    setTasks((current) => current.filter((task) => task.id !== id));
  }

  function startEdit(task) {
    setEditingId(task.id);
    setTaskForm({
      title: task.title,
      description: task.description,
      status: task.status,
      priority: task.priority,
      due_date: task.due_date || "",
    });
  }

  function signOut() {
    localStorage.removeItem("taskAccessToken");
    setToken("");
    setTasks([]);
  }

  const visibleTasks = tasks.filter((task) => {
    const search = filters.search.trim().toLowerCase();
    if (!search) return true;
    return `${task.title} ${task.description}`.toLowerCase().includes(search);
  });

  if (!token) {
    return (
      <main className="auth-page">
        <section className="auth-copy">
          <p className="eyebrow">Responsive Task Manager</p>
          <h1>Manage daily work with clear priorities and fast filtering.</h1>
          <p>Secure task CRUD, JWT authentication, PostgreSQL-ready storage, and a dashboard that adapts cleanly across screen sizes.</p>
        </section>

        <form className="panel auth-form" onSubmit={submitAuth}>
          <div className="tabs">
            <button type="button" className={authMode === "login" ? "active" : ""} onClick={() => setAuthMode("login")}>Login</button>
            <button type="button" className={authMode === "register" ? "active" : ""} onClick={() => setAuthMode("register")}>Register</button>
          </div>
          <label>
            Username
            <input required value={authForm.username} onChange={(event) => setAuthForm({ ...authForm, username: event.target.value })} />
          </label>
          {authMode === "register" && (
            <label>
              Email
              <input type="email" required value={authForm.email} onChange={(event) => setAuthForm({ ...authForm, email: event.target.value })} />
            </label>
          )}
          <label>
            Password
            <input type="password" required minLength="8" value={authForm.password} onChange={(event) => setAuthForm({ ...authForm, password: event.target.value })} />
          </label>
          <button className="primary" disabled={loading}>{loading ? "Please wait..." : authMode === "login" ? "Login" : "Create account"}</button>
          {message && <p className="message">{message}</p>}
        </form>
      </main>
    );
  }

  return (
    <main className="app">
      <header className="header">
        <div>
          <p className="eyebrow">Task Dashboard</p>
          <h1>Responsive Task Manager</h1>
        </div>
        <button className="secondary" onClick={signOut}>Logout</button>
      </header>

      <section className="stats">
        <div className="panel"><strong>{stats.total}</strong><span>Total tasks</span></div>
        <div className="panel"><strong>{stats.active}</strong><span>In progress</span></div>
        <div className="panel"><strong>{stats.completion}%</strong><span>Completed</span></div>
      </section>

      <section className="layout">
        <form className="panel task-form" onSubmit={saveTask}>
          <h2>{editingId ? "Edit task" : "New task"}</h2>
          <label>
            Title
            <input required value={taskForm.title} onChange={(event) => setTaskForm({ ...taskForm, title: event.target.value })} />
          </label>
          <label>
            Description
            <textarea rows="4" value={taskForm.description} onChange={(event) => setTaskForm({ ...taskForm, description: event.target.value })} />
          </label>
          <div className="row">
            <label>
              Status
              <select value={taskForm.status} onChange={(event) => setTaskForm({ ...taskForm, status: event.target.value })}>
                {Object.entries(statuses).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
              </select>
            </label>
            <label>
              Priority
              <select value={taskForm.priority} onChange={(event) => setTaskForm({ ...taskForm, priority: event.target.value })}>
                {Object.entries(priorities).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
              </select>
            </label>
          </div>
          <label>
            Due date
            <input type="date" value={taskForm.due_date} onChange={(event) => setTaskForm({ ...taskForm, due_date: event.target.value })} />
          </label>
          <button className="primary" disabled={loading}>{editingId ? "Save task" : "Add task"}</button>
          {editingId && <button type="button" className="secondary" onClick={() => { setEditingId(null); setTaskForm(blankTask); }}>Cancel</button>}
          {message && <p className="message">{message}</p>}
        </form>

        <section className="board">
          <div className="filters">
            <input placeholder="Search tasks" value={filters.search} onChange={(event) => setFilters({ ...filters, search: event.target.value })} />
            <select value={filters.status} onChange={(event) => setFilters({ ...filters, status: event.target.value })}>
              <option value="all">All statuses</option>
              {Object.entries(statuses).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
            </select>
            <select value={filters.priority} onChange={(event) => setFilters({ ...filters, priority: event.target.value })}>
              <option value="all">All priorities</option>
              {Object.entries(priorities).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
            </select>
          </div>

          <div className="cards">
            {visibleTasks.map((task) => (
              <article className={`task-card ${task.priority}`} key={task.id}>
                <div className="task-meta">
                  <span>{statuses[task.status]}</span>
                  <b>{priorities[task.priority]}</b>
                </div>
                <h3>{task.title}</h3>
                <p>{task.description || "No description added."}</p>
                <small>{task.due_date ? `Due ${task.due_date}` : "No due date"}</small>
                <div className="actions">
                  <button onClick={() => startEdit(task)}>Edit</button>
                  <button className="danger" onClick={() => removeTask(task.id)}>Delete</button>
                </div>
              </article>
            ))}
          </div>
          {!visibleTasks.length && <p className="empty">No tasks found for the selected filters.</p>}
        </section>
      </section>
    </main>
  );
}

export default App;
