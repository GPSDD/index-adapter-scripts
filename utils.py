import requests
import json


def get(payload, endpoint, api_url, api_token):
    print("Doing authenticated request to the API")
    print(endpoint)
    headers = {'User-Agent': 'python-requests', 'Content-Type': 'application/json',
               'Authorization': api_token}
    result = requests.get('/'.join((api_url, endpoint)), json=payload, headers=headers)
    status_code, result = result.status_code, result.text
    print(f"Status code: {status_code}")
    return json.loads(result)


def delete(payload, endpoint, api_url, api_token):
    print("Doing authenticated request to the API")
    print(endpoint)
    headers = {'User-Agent': 'python-requests', 'Content-Type': 'application/json',
               'Authorization': api_token}
    result = requests.delete('/'.join((api_url, endpoint)), json=payload, headers=headers)
    status_code, result = result.status_code, result.text
    print(f"Status code: {status_code}")
    return json.loads(result)


def post(payload, endpoint, api_url, api_token):
    print("Doing authenticated request to the API")
    headers = {'User-Agent': 'python-requests', 'Content-Type': 'application/json',
               'Authorization': api_token}
    result = requests.post('/'.join((api_url, endpoint)), json=payload, headers=headers)
    status_code, result = result.status_code, result.text
    print(f"Status code: {status_code}")
    return json.loads(result)