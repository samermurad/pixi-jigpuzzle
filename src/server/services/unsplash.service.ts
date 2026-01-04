import axios from 'axios';
import * as url from 'node:url';
import EnvVars from '../config/envVars';
import dataset from '../unsplashDataset.json'

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
  let url = '';
  try {
    const res = await unsplashClient.get('/photos/random');
    if (res.status !== 200) {
      const photo = dataset[Math.floor(Math.random() * dataset.length)]
      // @ts-ignore
      url = `${photo.urls.raw.split('?')[0]}?w=${w}&h=${h}&fit=crop`;
    } else {
      // @ts-ignore
      url =  `${res.data.urls.raw.split('?')[0]}?w=${w}&h=${h}&fit=crop`;
    }
    // @ts-ignore
    return { url };
  } catch (error) {
    console.log(error);
    const photo = dataset[Math.floor(Math.random() * dataset.length)]
    // @ts-ignore
    url = `${photo.urls.raw.split('?')[0]}?w=${w}&h=${h}&fit=crop`;
    return { url };
  }
}
