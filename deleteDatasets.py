import os
from utils import delete, get
from dotenv import load_dotenv

load_dotenv()

api_token = os.getenv("API_TOKEN")
api_url = os.getenv("HOST")

result = get({}, 'v1/dataset?page[size]=10000&provider=hdx', api_url, api_token)

for row in result['data']:
    print(row['id'])
    delete({}, 'v1/dataset/'+row['id'], api_url, api_token)
exit(0)
