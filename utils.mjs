import axios from 'axios';


export async function get(endpoint, api_url, api_token){
  console.log("Doing authenticated GET request to the API")
  console.log(endpoint)
  let config = {
    headers: {
      'User-Agent': 'python-requests', 
      'Content-Type': 'application/json',
      'Authorization': api_token  
    }
  };  
  let result = await axios.get(`${api_url}/${endpoint}`, config);
  
  console.log(`Status code: ${result.status}`)
  if (result.status != 200)
    console.error(result)
  
  return result.data;
}

export async function deleteRow(endpoint, api_url, api_token){
  console.log("Doing authenticated DELETE request to the API")
  console.log(endpoint)
  let config = {
    headers: {
      'User-Agent': 'python-requests', 
      'Content-Type': 'application/json',
      'Authorization': api_token  
    }
  };  
  let result = await axios.delete(`${api_url}/${endpoint}`, config);
  
  console.log(`Status code: ${result.status}`)
  if (result.status != 200)
    console.error(result)
  
  return result.data
}

export async function post(payload, endpoint, api_url, api_token){
  console.log("Doing authenticated POST request to the API")
  console.log(endpoint)
  let config = {
    headers: {
      'User-Agent': 'python-requests', 
      'Content-Type': 'application/json',
      'Authorization': api_token  
    }
  };  
  let result = await axios.post(`${api_url}/${endpoint}`, payload, config);
  
  console.log(`Status code: ${result.status}`)
  if (result.status != 200)
    console.error(result)
  
  return result.data
}


export const waitFor = async (ms) => new Promise(r => setTimeout(r, ms))

export const asyncForEach = async (array, callback) => {
  for (let index = 0; index < array.length; index++) {
    await callback(array[index], index, array)
  }
}
