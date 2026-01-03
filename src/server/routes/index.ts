import { Express, Router } from 'express';
import publicRoutes from './publicRoutes';



export default async function initializeRoutes(app: Express) {
  const mainRouter = Router();
  const pRoutes = await publicRoutes();
  mainRouter.use('/public', pRoutes);

  app.use('/api', mainRouter);
};
