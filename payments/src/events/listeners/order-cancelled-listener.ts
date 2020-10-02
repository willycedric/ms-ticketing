import {
  OrderCancelledEvent as Event,
  Subjects,
  Listener,
  OrderStatus,
} from '@invasivemushrooms/ticketing-common';
import { Message } from 'node-nats-streaming';
import { queueGroupName } from './queue-group-name';
import { Order } from '../../models/order';

export class OrderCancelledListener extends Listener<Event> {
  queueGroupName = queueGroupName;
  readonly subject = Subjects.OrderCancelled;
  async onMessage(data: Event['data'], msg: Message) {
    const order = await Order.findOne({
      _id: data.id,
      version: data.version - 1,
    });
    if (!order) {
      throw new Error('Order not found');
    }
    order.set({ status: OrderStatus.Cancelled });
    await order.save();
    msg.ack();
  }
}
