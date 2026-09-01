import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import './Settings.css';

export default function Settings() {
  const { user, updateProfile } = useAuth();

  const [name, setName] = useState(user?.name || '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const wantsPasswordChange = newPassword.length > 0 || confirmPassword.length > 0;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (wantsPasswordChange) {
      if (newPassword.length < 8) {
        setError('New password must be at least 8 characters.');
        return;
      }
      if (newPassword !== confirmPassword) {
        setError("New password and confirmation don't match.");
        return;
      }
      if (!currentPassword) {
        setError('Enter your current password to set a new one.');
        return;
      }
    }

    setSubmitting(true);
    try {
      await updateProfile({
        name,
        currentPassword: wantsPasswordChange ? currentPassword : undefined,
        newPassword: wantsPasswordChange ? newPassword : undefined,
      });
      setSuccess('Profile updated.');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="settings-page">
      <div className="settings-card">
        <h1>Settings</h1>
        <p className="settings-subtitle">Update your name or change your password.</p>

        {error && <div className="settings-error">{error}</div>}
        {success && <div className="settings-success">{success}</div>}

        <form onSubmit={handleSubmit}>
          <section className="settings-section">
            <h2>Profile</h2>
            <label>
              Name
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </label>
            <label>
              Email
              <input type="email" value={user?.email || ''} disabled />
              <span className="settings-hint">Email can't be changed.</span>
            </label>
          </section>

          <section className="settings-section">
            <h2>Change password</h2>
            <p className="settings-hint">Leave these blank to keep your current password.</p>
            <label>
              Current password
              <input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                autoComplete="current-password"
              />
            </label>
            <label>
              New password
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                autoComplete="new-password"
              />
            </label>
            <label>
              Confirm new password
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                autoComplete="new-password"
              />
            </label>
          </section>

          <button type="submit" disabled={submitting}>
            {submitting ? 'Saving…' : 'Save changes'}
          </button>
        </form>
      </div>
    </div>
  );
}
