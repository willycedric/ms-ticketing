import request from 'supertest';
import { app } from '../../app';
import mongoose from 'mongoose';
import { Order, OrderStatus } from '../../models/order';
import { stripe } from '../../stripe';
import { Payment } from '../../models/payment';
// jest.mock('../../stripe');

it('returns a 404 when purchassing an order that does not exist', async () => {
  await request(app)
    .post('/api/payments')
    .set('Cookie', global.getAuthCookie())
    .send({
      token: 'sdsds',
      orderId: mongoose.Types.ObjectId().toHexString(),
    })
    .expect(404);
});

it('return a 401 when purchassing an order thant doesnt belong to the user', async () => {
  const order = Order.build({
    id: mongoose.Types.ObjectId().toHexString(),
    userId: mongoose.Types.ObjectId().toHexString(),
    version: 0,
    price: 20,
    status: OrderStatus.Created,
  });
  await order.save();
  await request(app)
    .post('/api/payments')
    .set('Cookie', global.getAuthCookie())
    .send({
      token: 'sdsds',
      orderId: order.id,
    })
    .expect(401);
});

it('returns a 400 when purchassing a cancelled order', async () => {
  const userId = mongoose.Types.ObjectId().toHexString();
  const order = Order.build({
    id: mongoose.Types.ObjectId().toHexString(),
    userId,
    version: 0,
    price: 20,
    status: OrderStatus.Cancelled,
  });
  await order.save();
  await request(app)
    .post('/api/payments')
    .set('Cookie', global.getAuthCookie(userId))
    .send({
      token: 'sdsds',
      orderId: order.id,
    })
    .expect(400);
});

it('returns a 201 with valid inputs', async () => {
  const userId = mongoose.Types.ObjectId().toHexString();
  const price = Math.floor(Math.random() * 100000);
  const order = Order.build({
    id: mongoose.Types.ObjectId().toHexString(),
    userId,
    version: 0,
    price,
    status: OrderStatus.Created,
  });
  await order.save();
  await request(app)
    .post('/api/payments')
    .set('Cookie', global.getAuthCookie(userId))
    .send({
      token: 'tok_visa',
      orderId: order.id,
    })
    .expect(201);

  const response = await stripe.charges.list({
    limit: 50,
  });
  const stripeCharge = response.data.find(
    (charge) => charge.amount === price * 100
  );
  expect(stripeCharge).toBeDefined();
  expect(stripeCharge!.currency).toEqual('usd');

  const payment = await Payment.findOne({
    orderId: order.id,
    stripeId: stripeCharge!.id,
  });

  expect(payment).not.toBeNull();
});
