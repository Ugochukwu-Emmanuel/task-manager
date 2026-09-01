import React, { useState } from 'react';
import { useTasks } from '../context/TaskContext';
import { CATEGORIES, PRIORITIES } from '../data/sampleTasks';
import './TaskItem.css';

const STATUS_LABEL = { pending: 'Pending', 'in-progress': 'In progress', completed: 'Completed' };

function formatDate(d) {
  if (!d) return null;
  return new Date(d + 'T00:00:00').toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

function isOverdue(dueDate, status) {
  if (!dueDate || status === 'completed') return false;
  return dueDate < new Date().toISOString().slice(0, 10);
}

function TaskItem({ task }) {
  const { cycleStatus, updateTask, deleteTask } = useTasks();
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(task);

  const overdue = isOverdue(task.due_date, task.status);

  const saveEdit = (e) => {
    e.preventDefault();
    if (!draft.title.trim()) return;
    updateTask(task.id, draft);
    setEditing(false);
  };

  if (editing) {
    return (
      <form className="task-card task-card--editing" onSubmit={saveEdit}>
        <input
          className="task-card__edit-title"
          value={draft.title}
          onChange={(e) => setDraft((d) => ({ ...d, title: e.target.value }))}
          autoFocus
        />
        <textarea
          className="task-card__edit-desc"
          rows={2}
          value={draft.description}
          onChange={(e) => setDraft((d) => ({ ...d, description: e.target.value }))}
        />
        <div className="task-card__edit-row">
          <select
            value={draft.priority}
            onChange={(e) => setDraft((d) => ({ ...d, priority: e.target.value }))}
          >
            {PRIORITIES.map((p) => (
              <option key={p} value={p}>
                {p[0].toUpperCase() + p.slice(1)}
              </option>
            ))}
          </select>
          <select
            value={draft.category}
            onChange={(e) => setDraft((d) => ({ ...d, category: e.target.value }))}
          >
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
          <input
            type="date"
            value={draft.due_date || ''}
            onChange={(e) => setDraft((d) => ({ ...d, due_date: e.target.value }))}
          />
        </div>
        <div className="task-card__edit-actions">
          <button type="button" onClick={() => { setDraft(task); setEditing(false); }}>
            Cancel
          </button>
          <button type="submit" className="task-card__save">
            Save
          </button>
        </div>
      </form>
    );
  }

  return (
    <div className={`task-card task-card--${task.priority} ${task.status === 'completed' ? 'is-done' : ''}`}>
      <button
        className="task-card__status"
        onClick={() => cycleStatus(task.id)}
        title={`Status: ${STATUS_LABEL[task.status]} (click to advance)`}
        aria-label={`Mark status, currently ${STATUS_LABEL[task.status]}`}
      >
        {task.status === 'completed' ? '✓' : ''}
      </button>

      <div className="task-card__body">
        <div className="task-card__top">
          <h3 className="task-card__title">{task.title}</h3>
          <span className={`task-card__stamp task-card__stamp--${task.priority}`}>
            {task.priority}
          </span>
        </div>

        {task.description && <p className="task-card__desc">{task.description}</p>}

        <div className="task-card__meta">
          <span className="task-card__category">{task.category}</span>
          {task.due_date && (
            <span className={`task-card__due ${overdue ? 'is-overdue' : ''}`}>
              {overdue ? 'Overdue · ' : 'Due '}
              {formatDate(task.due_date)}
            </span>
          )}
          <span className="task-card__status-label">{STATUS_LABEL[task.status]}</span>
        </div>
      </div>

      <div className="task-card__actions">
        <button onClick={() => setEditing(true)} aria-label="Edit task">
          Edit
        </button>
        <button onClick={() => deleteTask(task.id)} aria-label="Delete task" className="task-card__delete">
          Delete
        </button>
      </div>
    </div>
  );
}

export default TaskItem;
