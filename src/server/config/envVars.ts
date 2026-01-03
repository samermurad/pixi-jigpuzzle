import dotenv from "dotenv";
import {dirname, join} from 'path'

type EnvVarsType = {
  PORT: string;
  WORK_DIR: string;
  CLIENT_CODE_LOCATION: string;
  SHARED_CODE_LOCATION: string;
  INDEX_HTML: string;
  UNSPLASH_APP_ID: string;
  UNSPLASH_APP_KEY: string;
  UNSPLASH_SECRET_KEY: string;

}
const config = dotenv.config({ path: ".env.server" })

if (config.parsed == undefined) {
  throw new Error('envVars must be defined (check your .env.server file in root directory)');
}


const EnvVars = {
  ...config.parsed,
  WORK_DIR: process.cwd(),
  CLIENT_CODE_LOCATION: join(process.cwd(), 'dist','client'),
  INDEX_HTML: join(process.cwd(), 'dist','client', 'index.html'),
} as EnvVarsType;


export default EnvVars as EnvVarsType;

