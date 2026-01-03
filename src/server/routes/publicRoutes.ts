import { Express, Router } from 'express';
import * as fs from 'fs';
import { basename } from 'node:path';
import * as path from 'node:path';
import { RoutesInterface } from './RoutesInterface';




export default async function (): Promise<Router> {
  const publicRoutes = Router();
  const routerFiles = fs.readdirSync(__dirname).filter((file) => !file.includes('Routes') && !(file == 'index.js'));



  for (const filePath of routerFiles) {
      const moduleLoc = path.parse(filePath).name;
      console.log('getting', moduleLoc);
      const { default: module } = await import(`./${moduleLoc}`);
      if (module.isRouter) {
        const mRouter = module as RoutesInterface;
        if (mRouter.public) {
          publicRoutes.use(mRouter.name, mRouter.public);
        }
      }
      // console.log(moduleLoc);
  }

  return publicRoutes;
};
