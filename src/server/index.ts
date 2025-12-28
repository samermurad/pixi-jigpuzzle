import express from "express";
import EnvVars from './config/envVars';




const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));


console.log('ENV', EnvVars);
app.get('/app', (req, res) => {
  res.sendFile(EnvVars.INDEX_HTML);
})
app.use('/app', express.static(EnvVars.CLIENT_CODE_LOCATION));

app.listen(EnvVars.PORT, () => {
  console.log(`Server running on port: http://localhost:${EnvVars.PORT}`);
  console.log(`App is here: http://localhost:${EnvVars.PORT}/app`);
});


