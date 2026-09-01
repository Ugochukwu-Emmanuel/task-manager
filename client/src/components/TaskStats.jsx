import React from 'react';
import { useTasks } from '../context/TaskContext';
import './TaskStats.css';

const STAT_ITEMS = [
  { key: 'total', label: 'Total tasks' },
  { key: 'inProgress', label: 'In progress' },
  { key: 'completed', label: 'Completed' },
  { key: 'overdue', label: 'Overdue' },
];

function TaskStats() {
  const { stats } = useTasks();

  return (
    <section className="task-stats" aria-label="Task statistics">
      {STAT_ITEMS.map((item) => (
        <div key={item.key} className={`task-stats__card task-stats__card--${item.key}`}>
          <span className="task-stats__value">{stats[item.key]}</span>
          <span className="task-stats__label">{item.label}</span>
        </div>
      ))}
    </section>
  );
}

export default TaskStats;
