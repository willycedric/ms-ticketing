import express, { Request, Response, NextFunction } from 'express';
import { requireAuth } from '@invasivemushrooms/ticketing-common';

const router = express.Router();

router.post('/api/tickets', requireAuth, (req: Request, res: Response) => {
  res.sendStatus(200);
});

export { router as createTicketRouter };
