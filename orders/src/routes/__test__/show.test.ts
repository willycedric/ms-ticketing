import request from 'supertest';
import { app } from '../../app';
import mongoose from 'mongoose';

it('returns a 404 if the tickets is not found', async () => {
  const id = new mongoose.Types.ObjectId().toHexString();
  await request(app).get(`/api/tickets/${id}`).send({}).expect(404);
});

it('returns the ticket if the ticket is found', async () => {
  const ticket = { title: 'ticket', price: 20 };
  const response = await request(app)
    .post('/api/tickets')
    .set('Cookie', global.getAuthCookie('user@user.com'))
    .send(ticket)
    .expect(201);
  const ticketResponse = await request(app)
    .get(`/api/tickets/${response.body.id}`)
    .send()
    .expect(200);
  expect(ticketResponse.body.title).toEqual(ticket.title);
  expect(ticketResponse.body.price).toEqual(ticket.price);
});
