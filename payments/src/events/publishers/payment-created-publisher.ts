import {
  Subjects,
  Publisher,
  PaymentCreatedEvent,
} from '@invasivemushrooms/ticketing-common';

export class PaymentCreatedPublisher extends Publisher<PaymentCreatedEvent> {
  readonly subject = Subjects.PaymentCreated;
}
