import request from 'supertest';
import { app } from '../../app';
import { Ticket } from '../../models/ticket';
import mongoose from 'mongoose';
it('fetches the order', async () => {
  //Create a ticket
  const ticket = await Ticket.build({
    title: 'new concert',
    price: 37,
    id: mongoose.Types.ObjectId().toHexString(),
  });

  ticket.save();

  const user = global.getAuthCookie();

  //make a request to build an order  with this ticket
  const { body: order } = await request(app)
    .post('/api/orders')
    .set('Cookie', user)
    .send({ ticketId: ticket.id })
    .expect(201);

  //make request to fetch the order
  const { body: fetchedOrder } = await request(app)
    .get(`/api/orders/${order.id}`)
    .set('Cookie', user)
    .send()
    .expect(200);
  expect(fetchedOrder.id).toEqual(order.id);
});

it('return a not found error when ticket not created', async () => {
  const orderId = mongoose.Types.ObjectId();
  await request(app)
    .get(`/api/orders/${orderId}`)
    .set('Cookie', global.getAuthCookie())
    .send()
    .expect(404);
});

it('return a 401 when order exist but user is not authorize', async () => {
  const userOne = global.getAuthCookie();
  const userTwo = global.getAuthCookie();
  //Create a ticket
  const ticket = await Ticket.build({
    title: 'new concert',
    price: 37,
    id: mongoose.Types.ObjectId().toHexString(),
  });

  ticket.save();
  //make a request to build an order  with this ticket
  const { body: order } = await request(app)
    .post('/api/orders')
    .set('Cookie', userOne)
    .send({ ticketId: ticket.id })
    .expect(201);

  //make request to fetch the order
  await request(app)
    .get(`/api/orders/${order.id}`)
    .set('Cookie', userTwo)
    .send()
    .expect(401);
});
