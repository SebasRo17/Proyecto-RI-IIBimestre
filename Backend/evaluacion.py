import os
import torch
import numpy as np
from tqdm import tqdm
from transformers import CLIPProcessor, CLIPModel

# 📍 Rutas
DATA_DIR = r"C:\Users\roble\OneDrive\Documentos\GitHub\Proyecto-RI-IIBimestre\Data"
EMBEDDINGS_DIR = os.path.join(DATA_DIR, "embeddings")
ANNOTATIONS_FILE = os.path.join(DATA_DIR, "ExpertAnnotations.txt")
CAPTIONS_FILE = os.path.join(DATA_DIR, "Flickr8k.lemma.token.txt")

# 🔁 Cargar modelo CLIP
device = "cuda" if torch.cuda.is_available() else "cpu"
model = CLIPModel.from_pretrained("openai/clip-vit-base-patch32").to(device)
processor = CLIPProcessor.from_pretrained("openai/clip-vit-base-patch32")

# 📥 Cargar embeddings de imágenes y nombres
image_embeddings = np.load(os.path.join(EMBEDDINGS_DIR, "image_embeddings.npy")).astype("float32")
with open(os.path.join(EMBEDDINGS_DIR, "image_names.txt"), "r", encoding="utf-8") as f:
    image_names = [line.strip() for line in f.readlines()]

# 🧠 Función para generar embedding de texto
def get_text_embedding(text):
    inputs = processor(text=[text], return_tensors="pt", padding=True).to(device)
    with torch.no_grad():
        emb = model.get_text_features(**inputs)
    return emb.cpu().numpy().flatten()

# 📊 Inicializar métricas
ranks = []
top1 = 0
top5 = 0
total = 0

# 📄 Cargar captions a memoria
captions_dict = {}
with open(CAPTIONS_FILE, "r", encoding="utf-8") as f:
    for line in f:
        parts = line.strip().split("\t")
        if len(parts) == 2:
            captions_dict[parts[0]] = parts[1]

# 🧪 Evaluación
with open(ANNOTATIONS_FILE, "r", encoding="utf-8") as f:
    for line in tqdm(f, desc="🧪 Evaluando"):
        parts = line.strip().split()
        if len(parts) < 5:
            continue

        image_file, caption_id, s1, s2, s3 = parts
        if caption_id not in captions_dict:
            continue

        caption_text = captions_dict[caption_id]

        try:
            query_emb = get_text_embedding(caption_text)
            dists = np.linalg.norm(image_embeddings - query_emb, axis=1)
            sorted_indices = np.argsort(dists)

            if image_file in image_names:
                correct_idx = image_names.index(image_file)
                rank = np.where(sorted_indices == correct_idx)[0][0]
                ranks.append(rank)
                total += 1
                if rank == 0:
                    top1 += 1
                if rank < 5:
                    top5 += 1
        except Exception as e:
            print(f"⚠️ Error con {caption_id}: {e}")

# 📈 Reporte
if total == 0:
    print("❌ No se pudo evaluar ninguna muestra.")
else:
    print(f"\n📊 Resultados de Evaluación sobre {total} pares imagen-caption:")
    print(f"🏅 Top-1 Accuracy: {top1 / total:.4f}")
    print(f"🏅 Top-5 Accuracy: {top5 / total:.4f}")
    print(f"📈 Mean Rank: {np.mean(ranks):.2f}")