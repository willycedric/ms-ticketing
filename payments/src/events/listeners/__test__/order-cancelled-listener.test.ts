import {
  OrderCancelledEvent,
  OrderStatus,
} from '@invasivemushrooms/ticketing-common';
import { natsWrapper } from '../../../nats-wrapper';
import { OrderCancelledListener as Listener } from '../order-cancelled-listener';
import { Order } from '../../../models/order';
import mongoose from 'mongoose';

const setup = async () => {
  const listener = new Listener(natsWrapper.client);
  const order = Order.build({
    id: mongoose.Types.ObjectId().toHexString(),
    userId: mongoose.Types.ObjectId().toHexString(),
    price: 10,
    version: 0,
    status: OrderStatus.Created,
  });
  await order.save();
  const data: OrderCancelledEvent['data'] = {
    id: order.id,
    version: 1,
    ticket: {
      id: mongoose.Types.ObjectId().toHexString(),
    },
  };
  //@ts-ignore
  const msg: Message = {
    ack: jest.fn(),
  };
  return { listener, data, msg, order };
};

it('updates the status pf the order', async () => {
  const { listener, data, msg, order } = await setup();
  await listener.onMessage(data, msg);
  const orderUpdated = await Order.findById(order.id);

  expect(orderUpdated!.status).toEqual(OrderStatus.Cancelled);
});

it('acks the message', async () => {
  const { listener, data, msg, order } = await setup();
  await listener.onMessage(data, msg);
  expect(msg.ack).toHaveBeenCalled();
});
