import React from 'react';
import { useTasks } from '../context/TaskContext';
import TaskItem from './TaskItem';
import Spinner from './Spinner';
import './TaskList.css';

function TaskList() {
  const { filteredTasks, loading, error } = useTasks();

  if (loading) {
    return <Spinner label="Loading your tasks…" />;
  }

  if (error) {
    return (
      <div className="task-list__empty task-list__empty--error" role="alert">
        <p className="task-list__empty-title">Something went wrong.</p>
        <p className="task-list__empty-hint">{error} — try refreshing the page.</p>
      </div>
    );
  }

  if (filteredTasks.length === 0) {
    return (
      <div className="task-list__empty" role="status">
        <p className="task-list__empty-title">Nothing here.</p>
        <p className="task-list__empty-hint">
          Add a task, or clear your filters to see what's already on the list.
        </p>
      </div>
    );
  }

  return (
    <div className="task-list">
      {filteredTasks.map((task) => (
        <TaskItem key={task.id} task={task} />
      ))}
    </div>
  );
}

export default TaskList;