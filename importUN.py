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
unPackageListResult = requests.get('https://unstats.un.org/SDGAPI/v1/sdg/Series/List?allreleases=false', headers=headers)

UNPackages = json.loads(unPackageListResult.text)

apiUNDatasetResponse = get(payload={}, endpoint='v1/dataset?provider=un&page[size]=10000', api_url=api_url,
                           api_token=api_token)
apiUNDatasetList = list(map(lambda x: x['attributes']['tableName'], apiUNDatasetResponse['data']))


def add_dataset(dataset):
    if dataset['code'] in apiUNDatasetList:
        print('Dataset ' + dataset['code'] + ' already exists, skipping...')
        return

    print('Adding dataset ' + dataset['code'])

    result = post(
        payload={
            "name": dataset['description'],
            "provider": "un",
            "connectorType": "rest",
            "tableName": dataset['code']
        }, endpoint='v1/dataset', api_url=api_url, api_token=api_token)
    dataset_id = result['data']['id']

    status = 'pending'

    while status == 'pending':
        get_result = get(payload={}, endpoint='v1/dataset/' + dataset_id, api_url=api_url, api_token=api_token)
        status = get_result['data']['attributes']['status']
        if status == 'pending':
            print('Sleeping...')
            time.sleep(2)

    print(dataset, result)


print('Datasets found:', len(UNPackages))

pool = mp.Pool(processes=4)
pool.map(add_dataset, UNPackages)


exit(0)
