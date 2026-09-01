require('dotenv').config();
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const helmet = require('helmet');

const app = express();

// Security headers — sets a range of HTTP headers (like disabling
// X-Powered-By, forcing certain content-type sniffing protections, etc.)
// that reduce common attack surface with almost no setup.
app.use(helmet());

// Core middleware
app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    origin: process.env.CLIENT_ORIGIN || 'http://localhost:3000',
    credentials: true, // required so the browser sends/receives the httpOnly auth cookie
  })
);

// Health check — confirms the server is up before we wire up real routes
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Task Manager API is running' });
});

// Routes
app.use('/api/auth', require('./routes/auth.routes'));
app.use('/api/tasks', require('./routes/tasks.routes'));
app.use('/api/analytics', require('./routes/analytics.routes'));

module.exports = app;