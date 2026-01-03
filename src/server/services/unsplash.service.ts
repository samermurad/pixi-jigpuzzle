import axios from 'axios';
import EnvVars from '../config/envVars';

const unsplashClient = axios.create({
  baseURL: 'https://api.unsplash.com',
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
    'Authorization': 'Client-ID ' + EnvVars.UNSPLASH_APP_KEY,
  }
})


const randomPhoto = async () => {
  const data = await unsplashClient.get('/photos/random');
}

export const getRandomPhoto = async (w: number, h: number) => {
  try {
    const res = await unsplashClient.get('/photos/random');
    // @ts-ignore
    const photo = `${res.data.urls.raw}&w=${w}&h=${h}&fit=crop`;
    return {url: photo};
  } catch (error) {
    console.log(error);
  }
  return null;
}
