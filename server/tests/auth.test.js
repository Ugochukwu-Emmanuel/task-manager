const request = require('supertest');
const app = require('../src/app');
const db = require('../src/config/db');

// A unique email per test run avoids colliding with a previous run's leftover
// data if cleanup ever fails partway through.
const testEmail = `jest-test-${Date.now()}@example.com`;
const testPassword = 'testpassword123';

describe('Auth API', () => {
  afterAll(async () => {
    // Clean up whatever this test created, and close the DB pool so Jest
    // can exit cleanly instead of hanging on an open connection.
    await db.query('DELETE FROM users WHERE email = ?', [testEmail]);
    await db.end();
  });

  it('rejects registration with an invalid email', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ name: 'Jest Test', email: 'not-an-email', password: testPassword });

    expect(res.status).toBe(400);
    expect(res.body.errors[0].field).toBe('email');
  });

  it('rejects registration with a short password', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ name: 'Jest Test', email: testEmail, password: '123' });

    expect(res.status).toBe(400);
  });

  it('registers a new user successfully', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ name: 'Jest Test', email: testEmail, password: testPassword });

    expect(res.status).toBe(201);
    expect(res.body.email).toBe(testEmail);
    expect(res.body.password).toBeUndefined(); // password must never be returned
  });

  it('rejects a duplicate registration with the same email', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ name: 'Jest Test 2', email: testEmail, password: testPassword });

    expect(res.status).toBe(409);
  });

  it('rejects login with the wrong password', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: testEmail, password: 'wrongpassword' });

    expect(res.status).toBe(401);
  });

  it('logs in successfully with correct credentials', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: testEmail, password: testPassword });

    expect(res.status).toBe(200);
    expect(res.headers['set-cookie']).toBeDefined(); // auth cookie must be set
  });
});