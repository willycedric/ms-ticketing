import request from 'supertest';
import { app } from '../../app';
import mongoose from 'mongoose';
import { natsWrapper } from '../../nats-wrapper';
it('returns a 404 if the provided id does not exist', async () => {
  const id = new mongoose.Types.ObjectId().toHexString();
  await request(app)
    .put(`/api/tickets/${id}`)
    .set('Cookie', global.getAuthCookie('user@user.com'))
    .send({
      title: 'title',
      price: 20,
    })
    .expect(404);
});

it('returns a 401 if the user is not authenticated', async () => {
  const id = new mongoose.Types.ObjectId().toHexString();
  await request(app)
    .put(`/api/tickets/${id}`)
    .send({
      title: 'title',
      price: 20,
    })
    .expect(401);
});

it('returns a 401 if the user does not own a ticket', async () => {
  const response = await request(app)
    .post('/api/tickets')
    .set('Cookie', global.getAuthCookie('test@user.com'))
    .send({
      title: 'title',
      price: 20,
    });
  await request(app)
    .put(`/api/tickets/${response.body.id}`)
    .set('Cookie', global.getAuthCookie('test2@user.com'))
    .send({
      title: 'title',
      price: 100,
    })
    .expect(401);
});

it('returns a 400 if the user provides an invalid title or price', async () => {
  const cookiee = global.getAuthCookie('test@user.com');
  const response = await request(app)
    .post('/api/tickets')
    .set('Cookie', cookiee)
    .send({
      title: 'title',
      price: 20,
    });
  await request(app)
    .put(`/api/tickets/${response.body.id}`)
    .set('Cookie', cookiee)
    .send({
      title: '',
      price: 100,
    })
    .expect(400);

  await request(app)
    .put(`/api/tickets/${response.body.id}`)
    .set('Cookie', cookiee)
    .send({
      title: 'tile',
      price: -100,
    })
    .expect(400);
  await request(app)
    .put(`/api/tickets/${response.body.id}`)
    .set('Cookie', cookiee)
    .send({
      title: '',
      price: '',
    })
    .expect(400);
});

it('updates the ticket provided valid inputs', async () => {
  const ticket = {
    title: 'title',
    price: 20,
  };
  const cookiee = global.getAuthCookie('test@user.com');
  const response = await request(app)
    .post('/api/tickets')
    .set('Cookie', cookiee)
    .send(ticket);
  await request(app)
    .put(`/api/tickets/${response.body.id}`)
    .set('Cookie', cookiee)
    .send({
      title: 'new title',
      price: 30,
    })
    .expect(200);
  const ticketResponse = await request(app)
    .get(`/api/tickets/${response.body.id}`)
    .send();
  expect(ticketResponse.body.title).not.toEqual(ticket.title);
  expect(ticketResponse.body.price).not.toEqual(ticket.price);
});

it('publishes an event ', async () => {
  const ticket = {
    title: 'title',
    price: 20,
  };
  const cookiee = global.getAuthCookie('test@user.com');
  const response = await request(app)
    .post('/api/tickets')
    .set('Cookie', cookiee)
    .send(ticket);
  await request(app)
    .put(`/api/tickets/${response.body.id}`)
    .set('Cookie', cookiee)
    .send({
      title: 'new title',
      price: 30,
    })
    .expect(200);
  expect(natsWrapper.client.publish).toHaveBeenCalled();
});
