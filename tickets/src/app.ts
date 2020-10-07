import express from 'express';
import 'express-async-errors';
import { json } from 'body-parser';
import cookieSessesion from 'cookie-session';
export { createTicketRouter } from './routes/new';
import {
  errorHandler,
  NotFoundError,
  currentUser,
} from '@invasivemushrooms/ticketing-common';
import { createTicketRouter } from './routes/new';
import { showTicketRouter } from './routes/show';
import { indexTicketRouter } from './routes/index';
import { updateTicketRouter } from './routes/update';

const app = express();
app.set('trust proxy', true); //making sure that express is aware that it's behin a proxy (ingress nginx)
app.use(json());

app.use(
  cookieSessesion({
    signed: false,
    secure: false,
    //secure: process.env.NODE_ENV !== 'test', //cookie availabe only in https connection
  })
);
app.use(currentUser);
app.use(createTicketRouter);
app.use(showTicketRouter);
app.use(indexTicketRouter);
app.use(updateTicketRouter);

app.all('*', async () => {
  throw new NotFoundError();
});
app.use(errorHandler);

export { app };
