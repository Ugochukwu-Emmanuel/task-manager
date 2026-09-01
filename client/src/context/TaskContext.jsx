  import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';

const API_URL = 'http://localhost:5000/api/tasks';
const TaskContext = createContext(null);

export function TaskProvider({ children }) {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('due_date');

  useEffect(() => {
    fetch(API_URL, { credentials: 'include' })
      .then((res) => {
        if (!res.ok) throw new Error('Failed to load tasks');
        return res.json();
      })
      .then((data) => {
        setTasks(data);
        setError(null);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const addTask = async (taskInput) => {
    const res = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(taskInput),
    });
    if (!res.ok) throw new Error('Failed to create task');
    const newTask = await res.json();
    setTasks((prev) => [newTask, ...prev]);
  };

  const updateTask = async (id, updates) => {
    const res = await fetch(`${API_URL}/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(updates),
    });
    if (!res.ok) throw new Error('Failed to update task');
    const updated = await res.json();
    setTasks((prev) => prev.map((t) => (t.id === id ? updated : t)));
  };

  const [pendingDelete, setPendingDelete] = useState(null);
  const UNDO_WINDOW_MS = 10000;

  const finalizeDelete = async (id) => {
    setPendingDelete(null);
    try {
      const res = await fetch(`${API_URL}/${id}`, { method: 'DELETE', credentials: 'include' });
      if (!res.ok) throw new Error('Failed to delete task');
    } catch (err) {
      console.error(err);
    }
  };

  const deleteTask = (id) => {
    const task = tasks.find((t) => t.id === id);
    if (!task) return;
    setTasks((prev) => prev.filter((t) => t.id !== id));
    const timeoutId = setTimeout(() => finalizeDelete(id), UNDO_WINDOW_MS);
    setPendingDelete({ task, timeoutId });
  };

  const undoDelete = () => {
    if (!pendingDelete) return;
    clearTimeout(pendingDelete.timeoutId);
    setTasks((prev) => [pendingDelete.task, ...prev]);
    setPendingDelete(null);
  };

  useEffect(() => {
    return () => {
      if (pendingDelete) clearTimeout(pendingDelete.timeoutId);
    };
  }, [pendingDelete]);

  const cycleStatus = async (id) => {
    const order = ['pending', 'in-progress', 'completed'];
    const current = tasks.find((t) => t.id === id);
    if (!current) return;
    const next = order[(order.indexOf(current.status) + 1) % order.length];
    await updateTask(id, { status: next });
  };

  const filteredTasks = useMemo(() => {
    let result = [...tasks];

    if (statusFilter !== 'all') {
      result = result.filter((t) => t.status === statusFilter);
    }
    if (categoryFilter !== 'all') {
      result = result.filter((t) => t.category === categoryFilter);
    }
    if (priorityFilter !== 'all') {
      result = result.filter((t) => t.priority === priorityFilter);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      result = result.filter(
        (t) =>
          t.title.toLowerCase().includes(q) || t.description.toLowerCase().includes(q)
      );
    }

    const priorityRank = { high: 0, medium: 1, low: 2 };
    result.sort((a, b) => {
      if (sortBy === 'priority') return priorityRank[a.priority] - priorityRank[b.priority];
      if (sortBy === 'created_at') return new Date(b.created_at) - new Date(a.created_at);
      if (!a.due_date) return 1;
      if (!b.due_date) return -1;
      return new Date(a.due_date) - new Date(b.due_date);
    });

    return result;
  }, [tasks, statusFilter, categoryFilter, priorityFilter, searchQuery, sortBy]);

  const stats = useMemo(() => {
    const today = new Date().toISOString().slice(0, 10);
    return {
      total: tasks.length,
      completed: tasks.filter((t) => t.status === 'completed').length,
      inProgress: tasks.filter((t) => t.status === 'in-progress').length,
      overdue: tasks.filter((t) => t.due_date && t.due_date < today && t.status !== 'completed')
        .length,
    };
  }, [tasks]);

  const value = {
    tasks,
    filteredTasks,
    stats,
    loading,
    error,
    addTask,
    updateTask,
    deleteTask,
    pendingDelete,
    undoDelete,
    cycleStatus,
    statusFilter,
    setStatusFilter,
    categoryFilter,
    setCategoryFilter,
    priorityFilter,
    setPriorityFilter,
    searchQuery,
    setSearchQuery,
    sortBy,
    setSortBy,
  };

  return <TaskContext.Provider value={value}>{children}</TaskContext.Provider>;
}

export function useTasks() {
  const ctx = useContext(TaskContext);
  if (!ctx) throw new Error('useTasks must be used within a TaskProvider');
  return ctx;
}