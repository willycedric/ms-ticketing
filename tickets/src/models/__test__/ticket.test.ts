import { Ticket } from '../ticket';
import mongoose from 'mongoose';

it('implements optimistic concurrency control', async (done) => {
  //Create an instance of a ticketId
  const ticket = Ticket.build({
    title: 'concert',
    price: 5,
    userId: mongoose.Types.ObjectId().toHexString(),
  });
  await ticket.save();
  //Save the ticket to the database
  const firstInstance = await Ticket.findById(ticket.id);
  const secondInstance = await Ticket.findById(ticket.id);
  //fetch the ticket twice
  firstInstance!.set({ price: 10 });
  secondInstance!.set({ price: 15 });

  //make two separate changes to the tickets we fetchedOrder
  await firstInstance!.save();
  //save the first fetched ticket the
  try {
    await secondInstance!.save();
  } catch (err) {
    return done();
  }
  throw new Error('Should not reach this point');
});
it('increments the version number on multiples saves', async () => {
  const ticket = Ticket.build({
    title: 'new concert',
    price: 20,
    userId: mongoose.Types.ObjectId().toHexString(),
  });
  await ticket.save();
  expect(ticket.version).toEqual(0);
  await ticket.save();
  expect(ticket.version).toEqual(1);
  await ticket.save();
  expect(ticket.version).toEqual(2);
});
