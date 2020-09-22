import {
  Publisher,
  Subjects,
  TicketUpdatedEvent,
} from '@invasivemushrooms/ticketing-common';

export class TicketUpdatedPublisher extends Publisher<TicketUpdatedEvent> {
  readonly subject = Subjects.TicketUpdated;
}
