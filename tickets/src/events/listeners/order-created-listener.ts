import {
  Listener,
  OrderCreatedEvent,
  Subjects,
} from '@invasivemushrooms/ticketing-common';
import { queueGroupName } from './queue-group-name';
import { Message } from 'node-nats-streaming';
import { Ticket } from '../../models/ticket';
import { TicketUpdatedPublisher } from '../publishers/ticket-updated-publisher';

export class OrderCreatedListener extends Listener<OrderCreatedEvent> {
  readonly subject = Subjects.OrderCreated;
  queueGroupName = queueGroupName;

  async onMessage(data: OrderCreatedEvent['data'], msg: Message) {
    // Find the ticket that the order is reserving
    const ticket = await Ticket.findById(data.ticket.id);

    // if no ticket, throw errors
    if (!ticket) {
      throw new Error('Ticket not found');
    }

    //Mark the ticket as being reserved by setting its orderId strictPropertyInitialization
    ticket.set({ orderId: data.id });
    //Save the ticket as
    await ticket.save();
    const { id, title, price, version, userId, orderId } = ticket;
    await new TicketUpdatedPublisher(this.client).publish({
      id,
      title,
      price,
      version,
      userId,
      orderId,
    });
    //ack the message
    msg.ack();
  }
}
