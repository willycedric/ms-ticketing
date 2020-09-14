import express from 'express';
import 'express-async-errors';
import { json } from 'body-parser';
import cookieSessesion from 'cookie-session';

import { currentUserRouter } from './routes/current-user';
import { signinRouter } from './routes/signin';
import { signupRouter } from './routes/signup';
import { signoutRouter } from './routes/signout';
import { errorHandler } from '@invasivemushrooms/ticketing-common';
import { NotFoundError } from '@invasivemushrooms/ticketing-common';
const app = express();
app.set('trust proxy', true); //making sure that express is aware that it's behin a proxy (ingress nginx)
app.use(json());
app.use(
  cookieSessesion({
    signed: false,
    secure: process.env.NODE_ENV !== 'test', //cookie availabe only in https connection
  })
);

app.use(currentUserRouter);
app.use(signinRouter);
app.use(signupRouter);
app.use(signoutRouter);

app.all('*', async () => {
  throw new NotFoundError();
});
app.use(errorHandler);

export { app };
