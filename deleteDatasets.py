import os
import time
import multiprocessing as mp
from utils import delete, get
from dotenv import load_dotenv

load_dotenv()

api_token = os.getenv("API_TOKEN")
api_url = os.getenv("HOST")



result = get({}, 'v1/dataset?page[size]=10&provider=un', api_url, api_token)


def delete_dataset(row):
    print(row['id'])
    time.sleep(2)
    delete({}, 'v1/dataset/'+row['id'], api_url, api_token)


print("Dataset count:", len(result['data']))

if __name__ ==  '__main__':
    pool = mp.Pool(processes=1)
    pool.map(delete_dataset, result['data'])

exit(0)
