// tests/auth.test.js
const request = require('supertest');
const app = require('../src/app');

describe('Auth API', () => {
  it('Login exitoso con credenciales correctas', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ correo: 'tecnico@demo.com', password: 'password123' });

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('token');
    expect(res.body).toHaveProperty('user');
  });
});
