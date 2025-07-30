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

app = FastAPI(title="API de Búsqueda de Imágenes")

# Configuración de CORS para permitir solicitudes desde cualquier origen
from fastapi.middleware.cors import CORSMiddleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # O pon ["http://localhost:5173"] para ser más estricto
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


device = torch.device("cpu")  
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

# Direcion el directorio de imágenes estáticas
app.mount(
    "/dataset-images",
    StaticFiles(directory=r"D:\Descargas\Flickr8k_Dataset\Flicker8k_Dataset"),
    name="dataset-images"
)



# ================================
# Cargar descripciones de imágenes
# ================================ 
def cargar_descripciones(ruta_txt):
    descripciones = {}
    with open(ruta_txt, "r", encoding="utf-8") as f:
        for linea in f:
            partes = linea.strip().split('\t')
            if len(partes) != 2:
                continue
            nombre_completo, descripcion = partes
            nombre_imagen = nombre_completo.split('#')[0]
            if nombre_imagen not in descripciones:
                descripciones[nombre_imagen] = descripcion
    return descripciones

descripcion_imagen = cargar_descripciones("../Data/Flickr8k.token.txt")


# ================================
# FUNCIONES DE BÚSQUEDA
# ================================

def buscar_similares(query_vector: np.ndarray, k: int = 10):
    distances, indices = index.search(query_vector, k)
    resultados = []
    for idx in indices[0]:
        imagen = str(image_names[idx])
        descripcion = descripcion_imagen.get(imagen, "Sin descripción")
        resultados.append({
            "imageName": imagen,
            "caption": descripcion
        })
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
