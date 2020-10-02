import { TicketUpdatedEvent } from '@invasivemushrooms/ticketing-common';
import { TicketUpdatedListener } from '../ticket-updated-listener';
import { natsWrapper } from '../../../nats-wrapper';
import mongoose from 'mongoose';
import { Message } from 'node-nats-streaming';
import { Ticket } from '../../../models/ticket';

const setup = async () => {
  //create a listeners
  const listener = new TicketUpdatedListener(natsWrapper.client);
  //create and save a ticket
  const ticket = Ticket.build({
    title: 'concert',
    id: mongoose.Types.ObjectId().toHexString(),
    price: 20,
  });
  await ticket.save();
  //create a fake data object listener
  const data: TicketUpdatedEvent['data'] = {
    id: ticket.id,
    title: ticket.title,
    price: ticket.price,
    version: ticket.version + 1,
    userId: new mongoose.Types.ObjectId().toHexString(),
  };
  //Create a fake msg objects
  //@ts-ignore
  const msg: Message = {
    ack: jest.fn(),
  };
  //return all this stuff
  return { listener, data, msg, ticket };
};

it('finds, update, and saves a ticket', async () => {
  const { msg, ticket, data, listener } = await setup();
  await listener.onMessage(data, msg);

  const fetchedTicket = await Ticket.findById(ticket.id);

  expect(fetchedTicket!.title).toEqual(data.title);
  expect(fetchedTicket!.price).toEqual(data.price);
  expect(fetchedTicket!.version).toEqual(data.version);
});

it('acks the message', async () => {
  const { msg, data, listener } = await setup();
  await listener.onMessage(data, msg);
  expect(msg.ack).toHaveBeenCalled();
});

it('does not call ack if the event has a skip version number', async (done) => {
  const { msg, data, listener, ticket } = await setup();
  data.version = 10;
  try {
    await listener.onMessage(data, msg);
  } catch (err) {
    return done();
  }
  expect(msg.ack).not.toHaveBeenCalled();
});
