import os
import torch
import numpy as np
from tqdm import tqdm
from PIL import Image
from transformers import CLIPProcessor, CLIPModel

# 📍 Rutas
DATA_DIR = r"C:\Users\roble\OneDrive\Documentos\GitHub\Proyecto-RI-IIBimestre\Data"
IMAGES_FOLDER = os.path.join(DATA_DIR, "Flicker8k_Dataset")
DEV_IMAGES_FILE = os.path.join(DATA_DIR, "Flickr_8k.devImages.txt")
CAPTIONS_FILE = os.path.join(DATA_DIR, "Flickr8k.lemma.token.txt")

# 🔁 Cargar modelo CLIP
device = "cuda" if torch.cuda.is_available() else "cpu"
model = CLIPModel.from_pretrained("openai/clip-vit-base-patch32").to(device)
processor = CLIPProcessor.from_pretrained("openai/clip-vit-base-patch32")

# 📚 Leer lista de imágenes del dev set
with open(DEV_IMAGES_FILE, "r") as f:
    dev_images = set([line.strip() for line in f.readlines()])

# 🗂️ Leer captions lematizados
captions = {}
with open(CAPTIONS_FILE, "r", encoding="utf-8") as f:
    for line in f:
        parts = line.strip().split("\t")
        if len(parts) < 2:
            continue
        img_id, caption = parts
        img_name = img_id.split("#")[0]
        if img_name in dev_images:
            captions.setdefault(img_name, []).append(caption)

#############################################################################################################################

# 🔢 Funciones
def get_image_embedding(image_path):
    image = Image.open(image_path).convert("RGB")
    inputs = processor(images=image, return_tensors="pt").to(device)
    with torch.no_grad():
        image_emb = model.get_image_features(**inputs)
    return image_emb.cpu().numpy().flatten()

def get_text_embedding(text):
    inputs = processor(text=[text], return_tensors="pt", padding=True).to(device)
    with torch.no_grad():
        text_emb = model.get_text_features(**inputs)
    return text_emb.cpu().numpy().flatten()

def get_text_embedding_multiple(captions_list):
    embeddings = [get_text_embedding(c) for c in captions_list]
    return np.mean(embeddings, axis=0)

#############################################################################################################################

# 🔁 Generar embeddings
image_embeddings = []
text_embeddings = []
image_names = []

print("🔁 Generando embeddings del set de evaluación...")
for img_name in tqdm(dev_images):
    img_path = os.path.join(IMAGES_FOLDER, img_name)
    if not os.path.exists(img_path):
        continue
    try:
        image_emb = get_image_embedding(img_path)
        text_emb = get_text_embedding_multiple(captions[img_name])
        image_embeddings.append(image_emb)
        text_embeddings.append(text_emb)
        image_names.append(img_name)
    except Exception as e:
        print(f"⚠️ Error con {img_name}: {e}")

#############################################################################################################################

# 💾 Guardar embeddings
output_dir = os.path.join(DATA_DIR, "embeddings")
os.makedirs(output_dir, exist_ok=True)

np.save(os.path.join(output_dir, "image_embeddings.npy"), np.array(image_embeddings))
np.save(os.path.join(output_dir, "text_embeddings.npy"), np.array(text_embeddings))

with open(os.path.join(output_dir, "image_names.txt"), "w", encoding="utf-8") as f:
    for name in image_names:
        f.write(f"{name}\n")

#############################################################################################################################

# 🧠 Guardar índice FAISS
import faiss
if len(image_embeddings) == 0:
    print("❌ No se generaron embeddings.")
    exit()

image_embeddings_np = np.array(image_embeddings).astype("float32")
faiss_index = faiss.IndexFlatL2(image_embeddings_np.shape[1])
faiss_index.add(image_embeddings_np)
faiss.write_index(faiss_index, os.path.join(output_dir, "faiss_index.index"))

print("✅ Embeddings generados y guardados correctamente.")