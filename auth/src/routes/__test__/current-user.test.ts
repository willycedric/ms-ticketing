import request from 'supertest';
import { app } from '../../app';

it('responds with details about the current user', async () => {
  const email = 'user@example.com';
  const password = 'test';
  const cookie = await global.getAuthCookie(email, password);

  const response = await request(app)
    .get('/api/users/currentuser')
    .set('Cookie', cookie)
    .send()
    .expect(200);

  expect(response.body.currentUser.email).toEqual(email);
});

it('respons with null if not authenticated', async () => {
  const response = await request(app)
    .get('/api/users/currentuser')
    .send()
    .expect(200);
  expect(response.body.currentUser).toEqual(null);
});
