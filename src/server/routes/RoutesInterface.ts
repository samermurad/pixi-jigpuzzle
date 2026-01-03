import { Router } from 'express';

export interface RoutesInterface {
  name: string;
  public?: Router;

  get isRouter(): true;
}
