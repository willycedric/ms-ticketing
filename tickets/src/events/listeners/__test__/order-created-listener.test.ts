import { OrderCreatedListener } from '../order-created-listener';
import { natsWrapper } from '../../../nats-wrapper';
import { Ticket } from '../../../models/ticket';
import mongoose from 'mongoose';
import {
  OrderCreatedEvent,
  OrderStatus,
} from '@invasivemushrooms/ticketing-common';
const setup = async () => {
  //Create an instance of the listener order

  const listener = new OrderCreatedListener(natsWrapper.client);
  //Create and save a ticket listener
  const ticket = Ticket.build({
    title: 'concert',
    price: 99,
    userId: mongoose.Types.ObjectId().toHexString(),
  });

  await ticket.save();
  //Create the fake data event
  const order: OrderCreatedEvent['data'] = {
    id: mongoose.Types.ObjectId().toHexString(),
    version: 0,
    userId: mongoose.Types.ObjectId().toHexString(),
    status: OrderStatus.Created,
    expiresAt: new Date().toISOString(),
    ticket: {
      id: ticket.id,
      price: ticket.price,
    },
  };
  //@ts-ignore
  const msg: Message = {
    ack: jest.fn(),
  };
  return { listener, order, msg, ticket };
};

it('sets the userId of the ticket', async () => {
  const { listener, ticket, order, msg } = await setup();

  await listener.onMessage(order, msg);
  const updatedTicket = await Ticket.findById(ticket.id);

  expect(updatedTicket!.orderId).toEqual(order.id);
});

it('acks the message', async () => {
  const { listener, order, msg } = await setup();

  await listener.onMessage(order, msg);

  expect(msg.ack).toHaveBeenCalled();
});

it('publishes a ticket updated event', async () => {
  const { listener, order, msg } = await setup();
  await listener.onMessage(order, msg);
  expect(natsWrapper.client.publish).toHaveBeenCalled();

  const args = (natsWrapper.client.publish as jest.Mock).mock.calls[0][1];
  const ticketUpdatedData = JSON.parse(args);
  expect(ticketUpdatedData.orderId).toEqual(order.id);
});
