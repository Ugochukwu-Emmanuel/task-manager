import React, { useState } from 'react';
import { useTasks } from '../context/TaskContext';
import { CATEGORIES, PRIORITIES } from '../data/sampleTasks';
import './TaskForm.css';

const emptyForm = { title: '', description: '', priority: 'medium', category: 'Work', due_date: '' };

function TaskForm() {
  const { addTask } = useTasks();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState('');

  const handleChange = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.title.trim()) {
      setError('Give the task a title before adding it.');
      return;
    }
    addTask(form);
    setForm(emptyForm);
    setError('');
    setOpen(false);
  };

  if (!open) {
    return (
      <button className="task-form__trigger" onClick={() => setOpen(true)}>
        + Add a task
      </button>
    );
  }

  return (
    <form className="task-form" onSubmit={handleSubmit}>
      <input
        className="task-form__title"
        type="text"
        placeholder="What needs doing?"
        value={form.title}
        onChange={handleChange('title')}
        autoFocus
      />
      <textarea
        className="task-form__description"
        placeholder="Add a description (optional)"
        rows={2}
        value={form.description}
        onChange={handleChange('description')}
      />

      <div className="task-form__row">
        <label className="task-form__field">
          <span>Priority</span>
          <select value={form.priority} onChange={handleChange('priority')}>
            {PRIORITIES.map((p) => (
              <option key={p} value={p}>
                {p[0].toUpperCase() + p.slice(1)}
              </option>
            ))}
          </select>
        </label>

        <label className="task-form__field">
          <span>Category</span>
          <select value={form.category} onChange={handleChange('category')}>
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </label>

        <label className="task-form__field">
          <span>Due date</span>
          <input type="date" value={form.due_date} onChange={handleChange('due_date')} />
        </label>
      </div>

      {error && <p className="task-form__error">{error}</p>}

      <div className="task-form__actions">
        <button type="button" className="task-form__cancel" onClick={() => { setOpen(false); setForm(emptyForm); setError(''); }}>
          Cancel
        </button>
        <button type="submit" className="task-form__submit">
          Add task
        </button>
      </div>
    </form>
  );
}

export default TaskForm;
