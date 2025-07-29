from fastapi import FastAPI, UploadFile, File, Form
from fastapi.responses import JSONResponse
import faiss
import numpy as np
from PIL import Image
from io import BytesIO
from transformers import CLIPModel, CLIPProcessor


# ================================
# CONFIGURACIÓN Y CARGA DE MODELOS
# ================================

app = FastAPI(title="API de Búsqueda de Imágenes")

# Carga del modelo CLIP
clip_model = CLIPModel.from_pretrained("openai/clip-vit-base-patch32")
clip_processor = CLIPProcessor.from_pretrained("openai/clip-vit-base-patch32")

# Cargar embeddings
image_embeddings = np.load("../Data/embeddings/image_embeddings.npy").astype("float32")
image_names = np.loadtxt("../Data/embeddings/image_names.txt", dtype=str)
index = faiss.read_index("../Data/embeddings/faiss_index.index")


# ================================
# FUNCIONES DE BÚSQUEDA
# ================================

def buscar_similares(query_vector: np.ndarray, k: int = 10):
    """Realiza búsqueda en FAISS y devuelve los nombres de las imágenes más similares"""
    distances, indices = index.search(query_vector, k)
    resultados = [image_names[i] for i in indices[0]]
    return resultados

# ================================
# ENDPOINT: Búsqueda por Texto
# ================================

@app.post("/buscar_por_texto")
async def buscar_por_texto(texto: str = Form(...)):
    """Busca imágenes similares al texto proporcionado"""
    inputs = clip_processor(text=[texto], return_tensors="pt", padding=True)
    text_embedding = clip_model.get_text_features(**inputs)
    text_embedding = text_embedding.detach().numpy().astype("float32")

    resultados = buscar_similares(text_embedding)
    return {"query": texto, "resultados": resultados}

# ================================
# ENDPOINT: Búsqueda por Imagen
# ================================

@app.post("/buscar_por_imagen")
async def buscar_por_imagen(file: UploadFile = File(...)):
    """Busca imágenes similares a la imagen proporcionada"""
    contents = await file.read()
    image = Image.open(BytesIO(contents)).convert("RGB")
    inputs = clip_processor(images=image, return_tensors="pt")
    image_embedding = clip_model.get_image_features(**inputs)
    image_embedding = image_embedding.detach().numpy().astype("float32")

    resultados = buscar_similares(image_embedding)
    return {"filename": file.filename, "resultados": resultados}
