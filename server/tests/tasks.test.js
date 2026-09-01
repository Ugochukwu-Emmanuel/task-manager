const request = require('supertest');
const app = require('../src/app');
const db = require('../src/config/db');

const testEmail = `jest-tasks-${Date.now()}@example.com`;
const testPassword = 'testpassword123';

// An agent (unlike plain `request(app)`) remembers cookies between calls,
// just like a real browser session — so once we log in once, every
// subsequent request through `agent` is automatically authenticated.
const agent = request.agent(app);

describe('Tasks API', () => {
  let createdTaskId;

  beforeAll(async () => {
    await agent
      .post('/api/auth/register')
      .send({ name: 'Jest Tasks', email: testEmail, password: testPassword });
  });

  afterAll(async () => {
    await db.query('DELETE FROM users WHERE email = ?', [testEmail]);
    await db.end();
  });

  it('rejects task creation with no auth cookie', async () => {
    const res = await request(app).post('/api/tasks').send({ title: 'No auth' });
    expect(res.status).toBe(401);
  });

  it('rejects task creation with an invalid priority', async () => {
    const res = await agent
      .post('/api/tasks')
      .send({ title: 'Bad priority task', priority: 'urgent-ish' });

    expect(res.status).toBe(400);
  });

  it('rejects task creation with no title', async () => {
    const res = await agent.post('/api/tasks').send({ priority: 'high' });
    expect(res.status).toBe(400);
  });

  it('creates a task successfully', async () => {
    const res = await agent
      .post('/api/tasks')
      .send({ title: 'Jest test task', priority: 'high', category: 'Testing' });

    expect(res.status).toBe(201);
    expect(res.body.title).toBe('Jest test task');
    expect(res.body.status).toBe('pending'); // default status
    createdTaskId = res.body.id;
  });

  it('lists tasks including the one just created', async () => {
    const res = await agent.get('/api/tasks');
    expect(res.status).toBe(200);
    expect(res.body.some((t) => t.id === createdTaskId)).toBe(true);
  });

  it('updates the task status', async () => {
    const res = await agent
      .put(`/api/tasks/${createdTaskId}`)
      .send({ status: 'completed' });

    expect(res.status).toBe(200);
    expect(res.body.status).toBe('completed');
    expect(res.body.completed_at).not.toBeNull(); // Stage 10's completed_at logic
  });

  it('deletes the task', async () => {
    const res = await agent.delete(`/api/tasks/${createdTaskId}`);
    expect(res.status).toBe(204);
  });

  it('confirms the deleted task is really gone', async () => {
    const res = await agent.get(`/api/tasks/${createdTaskId}`);
    expect(res.status).toBe(404);
  });
});