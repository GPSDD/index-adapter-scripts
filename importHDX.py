import json
import requests
import time
import os
import multiprocessing as mp
from utils import post, get
from dotenv import load_dotenv

load_dotenv()

api_token = os.getenv("API_TOKEN")
api_url = os.getenv("HOST")

headers = {'User-Agent': 'python-requests', 'Content-Type': 'application/json'}
hdxPackageListResult = requests.get('https://data.humdata.org/api/3/action/package_list', headers=headers)

HDXPackages = json.loads(hdxPackageListResult.text)


def add_dataset(packageName):
    print(packageName)

    result = post(
        payload={
            "name": packageName,
            "provider": "hdx",
            "connectorType": "rest",
            "tableName": packageName
        }, endpoint='v1/dataset', api_url=api_url, api_token=api_token)
    dataset_id = result['data']['id']

    status = 'pending'

    while status == 'pending':
        get_result = get(payload={}, endpoint='v1/dataset/' + dataset_id, api_url=api_url, api_token=api_token)
        status = get_result['data']['attributes']['status']
        if status == 'pending':
            print('Sleeping...')
            time.sleep(2)

    print(packageName, result)



pool = mp.Pool(processes=4)
pool.map(add_dataset, HDXPackages['result'])


exit(0)
