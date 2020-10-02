import {
  Subjects,
  Publisher,
  ExpirationCompleteEvent,
} from '@invasivemushrooms/ticketing-common';

export class ExpirationCompletePublisher extends Publisher<
  ExpirationCompleteEvent
> {
  readonly subject = Subjects.ExpirationComplete;
}
