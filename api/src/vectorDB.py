import requests
import os

QDRANT_URL = os.environ['QDRANT_URL']

def create_collection_qdrant(collection_name, vector_size):
    try:

        url = f"{QDRANT_URL}/collections/{collection_name}"
        payload = {
            "vectors": {
                "size": vector_size,
                "distance": "Cosine"
            }
        }
        response = requests.put(url, json=payload)
        response.raise_for_status()
        print(f'Collection "{collection_name}" created successfully.')
        
    except:
        print(f'Collection already exists.')

def add_embeddings_to_qdrant(collection_name, embeddings):
    url = f"{QDRANT_URL}/collections/{collection_name}/points"
    points = []
    for idx, (paragraph, embedding) in enumerate(embeddings):
        point = {
            "id": idx,
            "vector": embedding.tolist(),
            "payload": {"paragraph": paragraph}
        }
        points.append(point)
    
    payload = {"points": points}
    response = requests.put(url, json=payload)
    response.raise_for_status()
    print(f'Embeddings added to collection "{collection_name}".')