import numpy as np
import faiss

try:
    image_embeddings = np.load("../Data/embeddings/image_embeddings.npy").astype("float32")
    print("Embeddings cargados:", image_embeddings.shape)
except Exception as e:
    print("Error cargando embeddings:", e)

try:
    image_names = np.loadtxt("../Data/embeddings/image_names.txt", dtype=str)
    print("Nombres cargados:", len(image_names))
except Exception as e:
    print("Error cargando nombres:", e)

try:
    index = faiss.read_index("../Data/embeddings/faiss_index.index")
    print("FAISS index cargado:", index.ntotal)
except Exception as e:
    print("Error cargando FAISS index:", e)

try:
    from transformers import CLIPModel, CLIPProcessor
    clip_model = CLIPModel.from_pretrained("openai/clip-vit-base-patch32")
    clip_processor = CLIPProcessor.from_pretrained("openai/clip-vit-base-patch32")
    print("Modelo CLIP cargado correctamente.")
except Exception as e:
    print("Error cargando CLIP:", e)

from transformers import CLIPModel, CLIPProcessor

print("Descargando modelo CLIP...")
clip_model = CLIPModel.from_pretrained("openai/clip-vit-base-patch32")
print("Modelo listo")
clip_processor = CLIPProcessor.from_pretrained("openai/clip-vit-base-patch32")
print("Processor listo")
