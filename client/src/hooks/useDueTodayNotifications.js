import { useEffect, useRef } from 'react';

const ENABLED_KEY = 'reminders-enabled';
const PERMISSION_EVENT = 'reminders-permission-changed';

export function areRemindersEnabled() {
  return localStorage.getItem(ENABLED_KEY) !== 'false';
}

export function setRemindersEnabled(enabled) {
  localStorage.setItem(ENABLED_KEY, String(enabled));
  // Tells any active useDueTodayNotifications hook to re-check immediately,
  // instead of waiting for the next unrelated task-list change.
  window.dispatchEvent(new Event(PERMISSION_EVENT));
}

export function useDueTodayNotifications(tasks) {
  // Keep a live reference to the latest tasks so the event listener below
  // (set up once, on mount) always sees current data, not a stale snapshot.
  const tasksRef = useRef(tasks);
  useEffect(() => {
    tasksRef.current = tasks;
  }, [tasks]);

  const checkNow = () => {
    if (!('Notification' in window)) return;
    if (Notification.permission !== 'granted') return;
    if (!areRemindersEnabled()) return;

    const currentTasks = tasksRef.current;
    if (!currentTasks || currentTasks.length === 0) return;

    const today = new Date().toISOString().slice(0, 10);
    const storageKey = `notified-${today}`;
    const alreadyNotified = JSON.parse(localStorage.getItem(storageKey) || '[]');

    const dueToday = currentTasks.filter(
      (t) => t.due_date === today && t.status !== 'completed' && !alreadyNotified.includes(t.id)
    );

    if (dueToday.length === 0) return;

    dueToday.forEach((task) => {
      new Notification('Task due today', {
        body: task.title,
        tag: `task-${task.id}`,
      });
    });

    localStorage.setItem(
      storageKey,
      JSON.stringify([...alreadyNotified, ...dueToday.map((t) => t.id)])
    );
  };

  useEffect(() => {
    checkNow();
  }, [tasks]);

  useEffect(() => {
    window.addEventListener(PERMISSION_EVENT, checkNow);
    return () => window.removeEventListener(PERMISSION_EVENT, checkNow);
  }, []);
}