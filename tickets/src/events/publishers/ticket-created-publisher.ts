import {
  Publisher,
  Subjects,
  TicketCreatedEvent,
} from '@invasivemushrooms/ticketing-common';

export class TicketCreatedPublisher extends Publisher<TicketCreatedEvent> {
  readonly subject = Subjects.TicketCreated;
}
