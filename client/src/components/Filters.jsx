import React from 'react';
import { useTasks } from '../context/TaskContext';
import { PRIORITIES } from '../data/sampleTasks';
import './Filters.css';

function Filters() {
  const { searchQuery, setSearchQuery, sortBy, setSortBy, priorityFilter, setPriorityFilter } =
    useTasks();

  return (
    <div className="filters">
      <input
        type="search"
        className="filters__search"
        placeholder="Search tasks…"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        aria-label="Search tasks"
      />

      <label className="filters__select">
        <span>Priority</span>
        <select value={priorityFilter} onChange={(e) => setPriorityFilter(e.target.value)}>
          <option value="all">All</option>
          {PRIORITIES.map((p) => (
            <option key={p} value={p}>
              {p[0].toUpperCase() + p.slice(1)}
            </option>
          ))}
        </select>
      </label>

      <label className="filters__select">
        <span>Sort by</span>
        <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
          <option value="due_date">Due date</option>
          <option value="priority">Priority</option>
          <option value="created_at">Newest</option>
        </select>
      </label>
    </div>
  );
}

export default Filters;
