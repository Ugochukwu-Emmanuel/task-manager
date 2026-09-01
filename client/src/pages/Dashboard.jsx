import React from 'react';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import TaskStats from '../components/TaskStats';
import TaskForm from '../components/TaskForm';
import Filters from '../components/Filters';
import TaskList from '../components/TaskList';
import Footer from '../components/Footer';
import UndoToast from '../components/UndoToast';
import './Dashboard.css';

function Dashboard() {
  return (
    <div className="dashboard">
      <a href="#main-content" className="skip-link">
        Skip to content
      </a>
      <Header />
      <div className="dashboard__body">
        <Sidebar />
        <main className="dashboard__main" id="main-content">
          <div className="dashboard__hero">
            <TaskStats />
          </div>
          <TaskForm />
          <Filters />
          <TaskList />
        </main>
      </div>
      <Footer />
      <UndoToast />
    </div>
  );
}

export default Dashboard;