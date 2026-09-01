import React from 'react';
import { useTasks } from '../context/TaskContext';
import './UndoToast.css';

function UndoToast() {
  const { pendingDelete, undoDelete } = useTasks();

  if (!pendingDelete) return null;

  return (
    <div className="undo-toast" role="status">
      <span>
        Deleted <strong>{pendingDelete.task.title}</strong>
      </span>
      <button onClick={undoDelete}>Undo</button>
    </div>
  );
}

export default UndoToast;