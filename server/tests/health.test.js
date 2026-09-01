const request = require('supertest');
const app = require('../src/app');

describe('GET /api/health', () => {
  it('returns 200 and a status message', async () => {
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
  });
});