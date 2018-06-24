import csv
import requests
import json
import os
from dotenv import load_dotenv

load_dotenv()

api_token = os.getenv("API_TOKEN")
api_url = os.getenv("HOST")


# Convenience function for registering datasets
def register(payload, endpoint='v1/dataset', api_url=api_url, api_token=api_token):
    print("Doing authenticated request to the API")
    headers = {'User-Agent': 'python-requests', 'Content-Type': 'application/json',
               'Authorization': api_token}
    result = requests.post('/'.join((api_url, endpoint)), json=payload, headers=headers)
    status_code, result = result.status_code, result.text
    print(f"Status code: {status_code}")
    return json.loads(result)


with open('datasetsWB.csv')as csvfile:
    readCSV = csv.reader(csvfile, delimiter=',')
    for row in readCSV:
        name = row[0]
        code = row[1]
        result = register(
            payload={
                "name": name,
                "provider": "worldbank",
                "connectorType": "rest",
                "tableName": code
            })

        print(name, code, result)
    exit(0)
