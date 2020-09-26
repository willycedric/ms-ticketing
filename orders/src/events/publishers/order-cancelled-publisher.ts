import {
  Publisher,
  Subjects,
  OrderCancelledEvent,
} from '@invasivemushrooms/ticketing-common';

export class OrderCancelledPublisher extends Publisher<OrderCancelledEvent> {
  readonly subject = Subjects.OrderCancelled;
}
