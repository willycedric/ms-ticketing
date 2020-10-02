import {
  Listener,
  OrderCreatedEvent as Event,
  Subjects,
} from '@invasivemushrooms/ticketing-common';
import { queueGroupName } from './queue-group-name';
import { Message } from 'node-nats-streaming';
import { Order } from '../../models/order';
export class OrderCreatedListener extends Listener<Event> {
  queueGroupName = queueGroupName;
  readonly subject = Subjects.OrderCreated;
  async onMessage(data: Event['data'], msg: Message) {
    const order = Order.build({
      id: data.id,
      price: data.ticket.price,
      status: data.status,
      userId: data.userId,
      version: data.version,
    });
    await order.save();
    msg.ack();
  }
}
