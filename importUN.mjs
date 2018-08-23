import axios from 'axios';
import dotenv from 'dotenv';
dotenv.config();

import {get, post, waitFor, asyncForEach} from './utils.mjs';

const api_token = process.env.API_TOKEN;
const api_url = process.env.HOST;

const config = {
  headers: {'User-Agent': 'python-requests', 'Content-Type': 'application/json'}
};

async function runProcess() {
  const result = await axios.get('https://unstats.un.org/SDGAPI/v1/sdg/Series/List?allreleases=false', config);

  let UNPackages = result.data;
  console.log('UN', UNPackages);
  console.log('Datasets found:', UNPackages.length)
  
  let apiUNDatasetResponse = await get('v1/dataset?provider=un&page[size]=10000', api_url, api_token)
  
  console.log(apiUNDatasetResponse.data)                             
  let tableNames = apiUNDatasetResponse.data.map(x => x.attributes.tableName)

  await asyncForEach(UNPackages, async (unPackage) => {
    await waitFor(50)
    await addDataset(unPackage, tableNames);  
  })
  //apiUNDatasetList = list(map(lambda x: x['attributes']['tableName'], apiUNDatasetResponse['data']))
    
}

async function addDataset(dataset, tableNamesCodes) {
  if (tableNamesCodes.indexOf(dataset.code) > -1) {
    console.warn('Dataset ' + dataset.code + ' already exists, skipping...');
    return;  
  }

  console.log('Adding dataset ' + dataset['code'])

  let result = await post(
    {
        "name": dataset.description,
        "provider": "un",
        "connectorType": "rest",
        "tableName": dataset.code
    }, 'v1/dataset', api_url, api_token)
  let dataset_id = result.data.id

  let status = 'pending'

  while (status == 'pending'){
    let get_result = await get('v1/dataset/' + dataset_id, api_url, api_token)
    status = get_result.data.attributes.status;
    if (status == 'pending') {
      console.log('Sleeping...')
      await waitFor(2000)
    }

  }

  console.log('dataset added')

}




runProcess();

