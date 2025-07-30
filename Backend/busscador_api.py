import os
os.environ["KMP_DUPLICATE_LIB_OK"] = "TRUE"  # Opcional: silencia el warning de OMP

from fastapi import FastAPI, UploadFile, File, Form
from fastapi.responses import JSONResponse
import faiss
import numpy as np
from PIL import Image
from io import BytesIO
from transformers import CLIPModel, CLIPProcessor
import torch

print("Configurando FastAPI...")

# ================================
# CONFIGURACIÓN Y CARGA DE MODELOS
# ================================

app = FastAPI(title="API de Búsqueda de Imágenes")

# ----------- AGREGA ESTO ----------
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # O pon ["http://localhost:5173"] para ser más estricto
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
# ----------- FIN DE AGREGAR ESTO ----------

device = torch.device("cpu")  # Fuerza a CPU
print("Cargando modelo CLIP (CPU)...")
clip_model = CLIPModel.from_pretrained("openai/clip-vit-base-patch32").to(device)
clip_processor = CLIPProcessor.from_pretrained("openai/clip-vit-base-patch32")
print("Modelo CLIP cargado.")

print("Cargando embeddings y FAISS...")
image_embeddings = np.load("../Data/embeddings/image_embeddings.npy").astype("float32")
image_names = np.loadtxt("../Data/embeddings/image_names.txt", dtype=str)
index = faiss.read_index("../Data/embeddings/faiss_index.index")
print("Embeddings y FAISS cargados.")

from fastapi.staticfiles import StaticFiles

app.mount(
    "/dataset-images",
    StaticFiles(directory=r"C:\Users\gboy2\OneDrive - Escuela Politécnica Nacional\OCTAVO SEMESTRE\RECUPERACION DE INFORMACION\PROYECTO 2BIM\Flickr8k_Dataset\Flicker8k_Dataset"),
    name="dataset-images"
)

# ================================
# FUNCIONES DE BÚSQUEDA
# ================================

def buscar_similares(query_vector: np.ndarray, k: int = 10):
    print("Buscando similares en FAISS...")
    distances, indices = index.search(query_vector, k)
    resultados = [image_names[i] for i in indices[0]]
    print("Resultados encontrados:", resultados)
    return resultados

# ================================
# ENDPOINT: Búsqueda por Texto
# ================================

@app.post("/buscar_por_texto")
async def buscar_por_texto(texto: str = Form(...)):
    print(f"Recibido texto: {texto}")
    inputs = clip_processor(text=[texto], return_tensors="pt", padding=True)
    for k, v in inputs.items():
        inputs[k] = v.to(device)
    print("Obteniendo embedding de texto...")
    text_embedding = clip_model.get_text_features(**inputs)
    text_embedding = text_embedding.detach().numpy().astype("float32")
    print("Embedding obtenido, buscando similares...")
    resultados = buscar_similares(text_embedding)
    return {"query": texto, "resultados": resultados}

# ================================
# ENDPOINT: Búsqueda por Imagen
# ================================

@app.post("/buscar_por_imagen")
async def buscar_por_imagen(file: UploadFile = File(...)):
    print(f"Recibida imagen: {file.filename}")
    contents = await file.read()
    image = Image.open(BytesIO(contents)).convert("RGB")
    inputs = clip_processor(images=image, return_tensors="pt")
    for k, v in inputs.items():
        inputs[k] = v.to(device)
    print("Obteniendo embedding de imagen...")
    image_embedding = clip_model.get_image_features(**inputs)
    image_embedding = image_embedding.detach().numpy().astype("float32")
    print("Embedding obtenido, buscando similares...")
    resultados = buscar_similares(image_embedding)
    return {"filename": file.filename, "resultados": resultados}
