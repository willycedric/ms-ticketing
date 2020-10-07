import express from 'express';
import 'express-async-errors';
import { json } from 'body-parser';
import cookieSessesion from 'cookie-session';
import {
  errorHandler,
  NotFoundError,
  currentUser,
} from '@invasivemushrooms/ticketing-common';
import { createChargeRouter } from './routes/new';
const app = express();
app.set('trust proxy', true); //making sure that express is aware that it's behin a proxy (ingress nginx)
app.use(json());

app.use(
  cookieSessesion({
    signed: false,
    secure: process.env.NODE_ENV !== 'test', //cookie availabe only in https connection
  })
);
app.use(currentUser);
app.use(createChargeRouter);
app.all('*', async () => {
  throw new NotFoundError();
});
app.use(errorHandler);

export { app };
