import {
  Subjects,
  Listener,
  PaymentCreatedEvent as Event,
  OrderStatus,
} from '@invasivemushrooms/ticketing-common';
import { Order } from '../../models/order';
import { queueGroupName } from './queue-group-name';
import { Message } from 'node-nats-streaming';

export class PaymentCreatedListener extends Listener<Event> {
  readonly subject = Subjects.PaymentCreated;

  queueGroupName = queueGroupName;
  async onMessage(data: Event['data'], msg: Message) {
    const order = await Order.findById(data.orderId);
    if (!order) {
      throw new Error('Order not found');
    }
    order.set({ status: OrderStatus.Complete });
    await order.save();
    //idealy will should have an event 'order-update' because every save update the version
    //But in the context of this app as soon the ordr is complete we are done
    msg.ack();
  }
}
