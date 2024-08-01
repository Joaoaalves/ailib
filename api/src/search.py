import requests
from embed import embed
import os

QDRANT_URL = os.environ['QDRANT_URL']

def search_qdrant(collection_name, query_vector, top_k=5):
    url = f"{QDRANT_URL}/collections/{collection_name}/points/search"
    payload = {
        "vector": query_vector.tolist(),
        "top": top_k,
        "with_payload": True
    }
    response = requests.post(url, json=payload)
    response.raise_for_status()
    return response.json()

def search(query_text, collection_name):
    query_vector = embed(query_text, 'find related content.')
    search_results = search_qdrant(collection_name, query_vector)
    return search_results