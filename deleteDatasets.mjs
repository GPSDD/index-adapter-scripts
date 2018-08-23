import dotenv from 'dotenv';
dotenv.config();

import {get, deleteRow} from './utils';

async function runProcess() {

  const api_token = process.env.API_TOKEN;
  const api_url = process.env.HOST;
  
  const result = await get('v1/dataset?page[size]=10000&provider=un', api_url, api_token);

  result.data.forEach(async (row) => {
    await deleteRow('v1/dataset/'+row.id, api_url, api_token);  
  });
  
}

runProcess();

