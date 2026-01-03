import express, { Express } from "express";
import EnvVars from './config/envVars';
import mainRouter from './routes';




async function initApp(): Promise<Express> {

  const app = express();

  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));


  console.log('ENV', EnvVars);
  app.get('/app', (req, res) => {
    res.sendFile(EnvVars.INDEX_HTML);
  })
  app.use('/app', express.static(EnvVars.CLIENT_CODE_LOCATION));

  await mainRouter(app);

  app.get('/', (req, res) => {
    res.redirect(`/app`);
  //   http://localhost:${process.env.PORT}
  })

  return app;
}

async function main() {
  const app = await initApp();
  app.listen(EnvVars.PORT, () => {
    console.log(`Server running on port: http://localhost:${EnvVars.PORT}`);
    console.log(`App is here: http://localhost:${EnvVars.PORT}/app`);
  });
}

if (process.argv[1] === __filename) {
  main()
    .then(() => {
      console.log('Server started!')
    })
    .catch(console.error);
}

