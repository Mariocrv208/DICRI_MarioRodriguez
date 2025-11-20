// tests/expediente.test.js
const request = require('supertest');
const app = require('../src/app');

let token;

beforeAll(async () => {
  const res = await request(app)
    .post('/api/auth/login')
    .send({ correo: 'tecnico@demo.com', password: 'password123' });
  token = res.body.token;
});

describe('Expediente API', () => {
  it('Crear expediente válido', async () => {
    const res = await request(app)
      .post('/api/expedientes')
      .set('Authorization', `Bearer ${token}`)
      .send({ codigo_unico: 'TEST123', descripcion: 'Expediente de prueba' });

    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty('expediente_id');
  });
});

it('Listar expedientes con usuario', async () => {
  const res = await request(app)
    .get('/api/expedientes')
    .set('Authorization', `Bearer ${token}`);

  expect(res.statusCode).toBe(200);
  expect(res.body).toHaveProperty('expedientes');
  expect(Array.isArray(res.body.expedientes)).toBe(true);
});

