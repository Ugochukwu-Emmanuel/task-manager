import React from 'react';
import { useTasks } from '../context/TaskContext';
import { CATEGORIES } from '../data/sampleTasks';
import './Sidebar.css';

const STATUS_ITEMS = [
  { key: 'all', label: 'All tasks' },
  { key: 'pending', label: 'Pending' },
  { key: 'in-progress', label: 'In progress' },
  { key: 'completed', label: 'Completed' },
];

function Sidebar() {
  const { statusFilter, setStatusFilter, categoryFilter, setCategoryFilter, tasks } = useTasks();

  const countFor = (statusKey) =>
    statusKey === 'all' ? tasks.length : tasks.filter((t) => t.status === statusKey).length;

  return (
    <nav className="sidebar" aria-label="Task filters">
      <div className="sidebar__section">
        <p className="sidebar__label">Status</p>
        <ul className="sidebar__list">
          {STATUS_ITEMS.map((item) => (
            <li key={item.key}>
              <button
                className={`sidebar__item ${statusFilter === item.key ? 'is-active' : ''}`}
                onClick={() => setStatusFilter(item.key)}
                aria-pressed={statusFilter === item.key}
              >
                <span>{item.label}</span>
                <span className="sidebar__count">{countFor(item.key)}</span>
              </button>
            </li>
          ))}
        </ul>
      </div>

      <div className="sidebar__section">
        <p className="sidebar__label">Category</p>
        <ul className="sidebar__list">
          <li>
            <button
              className={`sidebar__item ${categoryFilter === 'all' ? 'is-active' : ''}`}
              onClick={() => setCategoryFilter('all')}
              aria-pressed={categoryFilter === 'all'}
            >
              <span>All categories</span>
            </button>
          </li>
          {CATEGORIES.map((cat) => (
            <li key={cat}>
              <button
                className={`sidebar__item ${categoryFilter === cat ? 'is-active' : ''}`}
                onClick={() => setCategoryFilter(cat)}
                aria-pressed={categoryFilter === cat}
              >
                <span>{cat}</span>
              </button>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
}

export default Sidebar;
