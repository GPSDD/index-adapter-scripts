import os
import multiprocessing as mp
from utils import delete, get
from dotenv import load_dotenv

load_dotenv()

api_token = os.getenv("API_TOKEN")
api_url = os.getenv("HOST")

result = get({}, 'v1/dataset?page[size]=10000&provider=hdx', api_url, api_token)


def delete_dataset(row):
    print(row['id'])
    delete({}, 'v1/dataset/'+row['id'], api_url, api_token)


pool = mp.Pool(processes=4)
pool.map(delete_dataset, result['data'])

exit(0)
