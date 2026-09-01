const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../config/db');

const SALT_ROUNDS = 10;

function signToken(userId) {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
}

function setAuthCookie(res, token) {
  res.cookie('token', token, {
    httpOnly: true, // JS in the browser can't read this cookie — blocks XSS token theft
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production', // HTTPS-only in production
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days, in milliseconds
  });
}

// POST /api/auth/register

async function register(req, res) {
  try {
    const { name, email, password } = req.body;

    const [existing] = await db.query('SELECT id FROM users WHERE email = ?', [email]);
    if (existing.length > 0) {
      return res.status(409).json({ message: 'An account with that email already exists' });
    }

    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

    const [result] = await db.query(
      'INSERT INTO users (name, email, password_hash) VALUES (?, ?, ?)',
      [name, email, passwordHash]
    );

    const token = signToken(result.insertId);
    setAuthCookie(res, token);

    res.status(201).json({ id: result.insertId, name, email });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to register' });
  }
}

// POST /api/auth/login

async function login(req, res) {
  try {
    const { email, password } = req.body;

    const [rows] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
    if (rows.length === 0) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const user = rows[0];
    const passwordMatches = await bcrypt.compare(password, user.password_hash);
    if (!passwordMatches) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const token = signToken(user.id);
    setAuthCookie(res, token);

    res.json({ id: user.id, name: user.name, email: user.email });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to log in' });
  }
}

// POST /api/auth/logout
function logout(req, res) {
  res.clearCookie('token');
  res.status(204).send();
}

// GET /api/auth/me
async function me(req, res) {
  try {
    const [rows] = await db.query('SELECT id, name, email FROM users WHERE id = ?', [
      req.userId,
    ]);
    if (rows.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to fetch user' });
  }
}

module.exports = { register, login, logout, me, updateMe };

// PUT /api/auth/me
async function updateMe(req, res) {
  try {
    const { name, currentPassword, newPassword } = req.body;

    const [rows] = await db.query('SELECT * FROM users WHERE id = ?', [req.userId]);
    if (rows.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }
    const user = rows[0];

    let passwordHash = user.password_hash;

    // Changing the password requires proving you know the current one —
    // even though you're already logged in, this stops someone who's
    // grabbed a live session (e.g. an unattended browser tab) from
    // silently locking the real owner out by changing the password.
    if (newPassword) {
      const matches = await bcrypt.compare(currentPassword || '', user.password_hash);
      if (!matches) {
        return res.status(401).json({ message: 'Current password is incorrect' });
      }
      passwordHash = await bcrypt.hash(newPassword, SALT_ROUNDS);
    }

    const newName = name?.trim() || user.name;

    await db.query('UPDATE users SET name = ?, password_hash = ? WHERE id = ?', [
      newName,
      passwordHash,
      req.userId,
    ]);

    res.json({ id: user.id, name: newName, email: user.email });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to update profile' });
  }
}