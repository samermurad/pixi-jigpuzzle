import express from 'express';
import { getRandomPhoto } from '../services/unsplash.service';
import { RoutesInterface } from './RoutesInterface';


const router = express.Router();

router.get('/random/:w/:h', async (req, res) => {
  // @ts-ignore
  const data = await getRandomPhoto(req.params.w, req.params.h)

  res.status(200).json(data)
})
export default {
  name: '/imgs',
  public: router,
  get isRouter(): true {
    return true;
  }
} as RoutesInterface;
