require('dotenv').config();
const request = require('supertest');
const app = require('../src/app');

let token;

beforeAll(async () => {
  const res = await request(app)
    .post('/api/auth/login')
    .send({ correo: 'tecnico@demo.com', password: 'password123' });
  token = res.body.token;
});

describe('Indicios API', () => {
  it('Crear indicio en expediente', async () => {
    const res = await request(app)
      .post('/api/indicios')
      .set('Authorization', `Bearer ${token}`)
      .send({
        expediente_id: 1,
        descripcion: 'Indicio de prueba',
        color: 'Rojo',
        tamano: 'Mediano',
        peso: 0.5,
        ubicacion: 'Oficina'
      });

    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty('indicio_id');
  });

  it('Listar todos los indicios', async () => {
    const res = await request(app)
      .get('/api/indicios')
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });
});
