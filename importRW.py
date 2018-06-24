import csv
import time
import os
from utils import post, get
from dotenv import load_dotenv

load_dotenv()

api_token = os.getenv("API_TOKEN")
api_url = os.getenv("HOST")


with open('datasetsRW.csv')as csvfile:
    readCSV = csv.reader(csvfile, delimiter=',')
    for row in readCSV:
        name = row[2]
        code = row[0]
        result = post(
            payload={
                "name": name,
                "provider": "resourcewatch",
                "connectorType": "rest",
                "tableName": code
            }, endpoint='v1/dataset', api_url=api_url, api_token=api_token)
        datasetId = result['data']['id']

        status = 'pending'

        while status == 'pending':
            getResult = get(payload={}, endpoint='v1/dataset/'+datasetId, api_url=api_url, api_token=api_token)
            status = getResult['data']['attributes']['status']
            if status == 'pending':
                print('Sleeping...')
                time.sleep(2)


        print(name, code, status)
    exit(0)
