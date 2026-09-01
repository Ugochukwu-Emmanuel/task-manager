import React, { useState } from 'react';
import { areRemindersEnabled, setRemindersEnabled } from '../hooks/useDueTodayNotifications';
import './NotificationToggle.css';

function NotificationToggle() {
  const supported = typeof window !== 'undefined' && 'Notification' in window;
  const [permission, setPermission] = useState(supported ? Notification.permission : 'unsupported');
  const [enabled, setEnabled] = useState(supported ? areRemindersEnabled() : false);

  if (!supported) return null;

  const handleClick = async () => {
    if (permission === 'default') {
      const result = await Notification.requestPermission();
      setPermission(result);
      if (result === 'granted') {
        setRemindersEnabled(true);
        setEnabled(true);
      }
      return;
    }

    if (permission === 'granted') {
      const next = !enabled;
      setRemindersEnabled(next);
      setEnabled(next);
    }
    // permission === 'denied': nothing we can do from JS, button stays disabled
  };

  const label =
    permission === 'denied'
      ? 'Reminders blocked'
      : permission === 'granted'
      ? enabled
        ? 'Reminders on'
        : 'Reminders off'
      : 'Enable reminders';

  return (
    <button
      className="notif-toggle"
      onClick={handleClick}
      disabled={permission === 'denied'}
      data-state={permission === 'granted' ? (enabled ? 'granted' : 'paused') : permission}
      aria-label={label}
      title={
        permission === 'denied'
          ? 'Blocked in your browser settings — click the lock icon in the address bar to change it'
          : permission === 'granted'
          ? 'Click to pause or resume due-today reminders'
          : 'Get a reminder when a task is due today'
      }
    >
      <span className="notif-toggle__icon" aria-hidden="true">
        🔔
      </span>
      <span className="notif-toggle__label">{label}</span>
    </button>
  );
}

export default NotificationToggle;