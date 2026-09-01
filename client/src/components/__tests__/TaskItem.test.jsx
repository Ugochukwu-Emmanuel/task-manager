import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import TaskItem from '../TaskItem';
import { useTasks } from '../../context/TaskContext';

// Replaces the entire TaskContext module with a fake version for this test
// file only. TaskItem's real import of useTasks will receive this fake
// implementation instead of the real one — no real API, MySQL, or
// TaskProvider involved.
jest.mock('../../context/TaskContext', () => ({
  useTasks: jest.fn(),
}));

const cycleStatus = jest.fn();
const updateTask = jest.fn();
const deleteTask = jest.fn();

const sampleTask = {
  id: 1,
  title: 'Write unit tests',
  description: 'Cover the core components',
  status: 'pending',
  priority: 'high',
  category: 'Work',
  due_date: null,
};

describe('TaskItem', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useTasks.mockReturnValue({ cycleStatus, updateTask, deleteTask });
  });

  it('renders the task title, priority, and category', () => {
    render(<TaskItem task={sampleTask} />);
    expect(screen.getByText('Write unit tests')).toBeInTheDocument();
    expect(screen.getByText('high')).toBeInTheDocument();
    expect(screen.getByText('Work')).toBeInTheDocument();
  });

  it('calls cycleStatus with the task id when the status button is clicked', () => {
    render(<TaskItem task={sampleTask} />);
    fireEvent.click(screen.getByLabelText(/mark status/i));
    expect(cycleStatus).toHaveBeenCalledWith(1);
  });

  it('calls deleteTask with the task id when Delete is clicked', () => {
    render(<TaskItem task={sampleTask} />);
    fireEvent.click(screen.getByLabelText('Delete task'));
    expect(deleteTask).toHaveBeenCalledWith(1);
  });

  it('switches into edit mode when Edit is clicked', () => {
    render(<TaskItem task={sampleTask} />);
    fireEvent.click(screen.getByLabelText('Edit task'));
    expect(screen.getByDisplayValue('Write unit tests')).toBeInTheDocument();
  });
});