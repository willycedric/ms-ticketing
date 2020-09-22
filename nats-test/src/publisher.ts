import nats from 'node-nats-streaming';
import { TicketCreatedPublisher } from './events/ticket-created-publisher';
console.clear();
const stan = nats.connect('ticketing', 'abc', {
  url: 'http://localhost:4222',
});
stan.on('connect', async () => {
  console.log('publisher connected to NATS');
  const pusblisher = new TicketCreatedPublisher(stan);
  try {
    await pusblisher.publish({
      id: '123',
      title: 'concert',
      price: 20,
    });
  } catch (err) {
    console.log(err);
  }
  // const data = JSON.stringify({
  //   id: '123',
  //   title: 'concert',
  //   price: 20,
  // });

  // stan.publish('ticket:created', data, () => {
  //   console.log('Event published');
  // });
});
