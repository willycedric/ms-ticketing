import { Order, OrderStatus } from '../../models/order';
import request from 'supertest';
import { app } from '../../app';
import { Ticket } from '../../models/ticket';
import { natsWrapper } from '../../nats-wrapper';
import mongoose from 'mongoose';
it('marks an order as cancelled', async () => {
  //create a ticket with Ticket model order
  const ticket = await Ticket.build({
    title: 'new concert',
    price: 17,
    id: mongoose.Types.ObjectId().toHexString(),
  });
  ticket.save();

  const user = global.getAuthCookie();
  //make a request to crete an orders
  const { body: order } = await request(app)
    .post('/api/orders')
    .set('Cookie', user)
    .send({ ticketId: ticket.id })
    .expect(201);

  //make a request to cancel the orders
  await request(app)
    .delete(`/api/orders/${order.id}`)
    .set('Cookie', user)
    .send()
    .expect(204);
  //expectation to make the order is cancelled
  const updatedOrder = await Order.findById(order.id);
  expect(updatedOrder!.status).toEqual(OrderStatus.Cancelled);
});

it('emits a order cancelled event', async () => {
  //create a ticket with Ticket model order
  const ticket = await Ticket.build({
    title: 'new concert',
    price: 17,
    id: mongoose.Types.ObjectId().toHexString(),
  });
  ticket.save();

  const user = global.getAuthCookie();
  //make a request to crete an orders
  const { body: order } = await request(app)
    .post('/api/orders')
    .set('Cookie', user)
    .send({ ticketId: ticket.id })
    .expect(201);

  //make a request to cancel the orders
  await request(app)
    .delete(`/api/orders/${order.id}`)
    .set('Cookie', user)
    .send()
    .expect(204);

  expect(natsWrapper.client.publish).toHaveBeenCalled();
});
