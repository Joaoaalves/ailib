from vectorDB import create_collection_qdrant

collection_name = "pdf_embeddings"
vector_size = 768

print("STARTING COLLECTION")
create_collection_qdrant(collection_name, vector_size)