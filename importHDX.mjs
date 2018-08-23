import axios from 'axios';
import dotenv from 'dotenv';
dotenv.config();

import {get, post, waitFor, asyncForEach, deleteRow} from './utils.mjs';

const api_token = process.env.API_TOKEN;
const api_url = process.env.HOST;
const ACCEPTED_LICENSE_STRINGS = [
  'Public Domain',
  'CC-0',
  'PDDL',
  'CC-BY',
  'CDLA-Permissive-1.0',
  'ODC-BY',
  'CC-BY-SA',
  'CDLA-Sharing-1.0',
  'ODC-ODbL',
  'CC BY-NC',
  'CC BY-ND',
  'CC BY-NC-SA',
  'CC BY-NC-ND',
  'Other'
];

const hdxConfig = {
  hdx: {
    "package": "https://data.humdata.org/api/3/action/package_show?id=:package-id",
    "graph": "https://api.hdx.org/v1/dataset/:package-id/vocabulary/knowledge_graph",
    "dataSourceUrl": "https://data.humdata.org/dataset/:package-id",
    "dataSourceEndpoint": "https://data.humdata.org:resouce-file-path"
  }
}

const config = {
  headers: {'User-Agent': 'python-requests', 'Content-Type': 'application/json'}
};

async function runProcess() {
  const result = await axios.get('https://data.humdata.org/api/action/package_search?&fq=(res_format:JSON%20OR%20res_format:CSV)%20AND%20groups:yem', config);

  let humData = result.data.result;
  //console.log('UN', humData.results[0]);
  // console.log('Datasets found:', humData.length)
  
  let hdxResponse = await get('v1/dataset?provider=hdx&page[size]=10000', api_url, api_token)
  let csvResponse = await get('v1/dataset?provider=csv&page[size]=10000', api_url, api_token)
  
  //console.log(hdxResponse.data)                             
  let tableNames = hdxResponse.data.map(x => { return {tableName: x.attributes.tableName, id: x.id, connectorType: x.attributes.connectorType, name: x.attributes.name}})
  let csvNames = csvResponse.data.map(x => { return {tableName: x.attributes.tableName, id: x.id, connectorType: x.attributes.connectorType, name: x.attributes.name}})
  // console.log(hdxResponse.data[0])
  // var firstResult = humData.results[0];
  // await addDataset(firstResult.resources[0], tableNames, csvNames, firstResult);  
  await asyncForEach(humData.results, async (hdxResult) => {
    await waitFor(50)
    await asyncForEach(hdxResult.resources, async (resource) => {
      await waitFor(50)
      if(resource.mimetype === 'text/csv' || resource.url.indexOf('csv') > -1){
        await addDataset(resource, tableNames, csvNames, hdxResult);  
      }  
    })
  })
    
}

async function addDataset(dataset, tableNamesCodes, csvNames, hdxPackage) {
  console.log(dataset.name);
  if(tableNamesCodes.filter(y => y.name === hdxPackage.name).length > 0) {
    let existingDataset = tableNamesCodes.find(y => y.name === hdxPackage.name);
    await deleteRow('v1/dataset/'+ existingDataset.id, api_url, api_token);  
  }

  const dataSetName = dataset.description.indexOf('[') > -1 ? dataset.name : dataset.description;
  if(csvNames.filter(y => y.name === dataSetName).length > 0) {
    const csv = csvNames.find(y => y.name === dataSetName)
    console.warn('Dataset ' + dataset.name + ` with id ${csv.id} already exists, skipping...`);
    return;
  }

  console.log('Adding dataset ' + dataset.name)
  
  //some descriptions have markdown links, just use the name field
  
  let result = await post(
    {
        "name": dataSetName,
        "provider": "csv",
        "connectorType": "document",
        "connectorUrl": dataset.url,
        "application":[
          "data4sdgs"
        ],
        "published": false
    }, 'v1/dataset', api_url, api_token)
  
  let dataset_id = result.data.id
  console.log(`dataset added with id ${dataset_id}`)
  //TODO: status isn't changing at the moment.  we can comment this out until we debug the document connector
  let status = 'pending'

  while (status == 'pending'){
    let get_result = await get('v1/dataset/' + dataset_id, api_url, api_token)
    status = get_result.data.attributes.status;
    if (status == 'pending') {
      console.log('Sleeping...')
      await waitFor(4000)
    }

  }
  console.log('dataset saved - updating vocab/tags')
  let tags = ['hdx-fullimport'];
  const organization = hdxPackage.organization ? hdxPackage.organization.title : 'HDX';
  hdxPackage.organization ? tags.push(organization) : '';
  await post({ legacy: { tags: tags } },`v1/dataset/${dataset_id}/vocabulary`, api_url, api_token);



  const dataDownloadURL = dataset.url;
  const dataSourceUrl = hdxConfig.hdx.dataSourceUrl.replace(':package-id', dataset.package_id);
  const license = hdxPackage.license_title || hdxPackage.license_id  || '';
  var revisedLicense = ACCEPTED_LICENSE_STRINGS.includes(license.toUpperCase()) ? license : 'Other';
  let metadata = {
    language: 'en',
    name: dataSetName,
    description: dataset.description,
    sourceOrganization: organization,
    dataSourceUrl,
    dataSourceEndpoint: dataDownloadURL,
    dataDownloadUrl: dataDownloadURL,
    status: 'published',
    license: revisedLicense,
    userId: result.data.attributes.userId
  };
  if(revisedLicense === 'Other') {
    metadata.info = {
      license: license //TODO: Should this be url? and if so where should it go;
    }
  }
  console.log(metadata)
  await post(metadata, `v1/dataset/${result.data.id}/metadata`, api_url, api_token)

}




runProcess();

