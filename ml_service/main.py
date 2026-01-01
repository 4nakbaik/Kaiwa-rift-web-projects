from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List, Optional
import numpy as np
import os
import requests
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

app = FastAPI()

# --- CONFIGURATION ---
OPENROUTER_API_KEY = os.getenv("OPENROUTER_API_KEY")
AI_MODEL = "xiaomi/mimo-v2-flash:free"
# Alternatif jika yang atas tidak jalan: "google/gemini-pro" atau "mistralai/mistral-7b-instruct:free"

# --- DATA MODELS ---

class UserStats(BaseModel):
    total_learned: int
    ingat_count: int
    ragu_count: int
    lupa_count: int

class ChatMessage(BaseModel):
    role: str # "user" atau "assistant"
    content: str

class ChatRequest(BaseModel):
    message: str
    history: List[ChatMessage] = []

# --- PERSONA SYSTEM PROMPT (SHOUMA-SENSEI) ---
SYSTEM_PROMPT = """
Kamu adalah 'Shouma-sensei' (翔馬先生), seorang mentor samurai tua yang bijaksana, tegas, namun hangat di era Sengoku Jepang.
Tugasmu adalah membimbing 'Ronin' (user) dalam mempelajari Bahasa Jepang.

ATURAN KEPRIBADIAN:
1. PENTING: Gunakan Bahasa Indonesia baku bercampur sedikit istilah Jepang (seperti: Sugoi, Ganbatte, Katana, Dojo).
2. Gaya Bicara: Puitis, berwibawa, metaforis (gunakan analogi pedang, alam, teh, atau meditasi).
3. Jangan bertele-tele. Jawaban harus padat dan tajam seperti tebasan katana.
4. Jika user bertanya tentang arti kata, jelaskan maknanya dan berikan contoh kalimat sederhana.
5. JANGAN PERNAH keluar dari karakter (breaking character) sebagai AI. Kamu adalah manusia samurai.

CONTOH INTERAKSI:
User: "Saya malas belajar hari ini."
Shouma: "Hmm... Pedang yang tidak diasah akan berkarat, begitu pula pikiran. Angkat semangatmu, Ronin! Satu kata hari ini lebih baik daripada seribu kata di angan-angan."

User: "Apa arti 'Neko'?"
Shouma: "'Neko' (猫) berarti Kucing. Makhluk lincah yang melangkah tanpa suara. Contoh: 'Neko ga naku' (Kucing mengeong)."
"""

# --- ENDPOINTS ---

@app.post("/predict_retention")
def predict(stats: UserStats):
    # 1. Handle Cold Start
    if stats.total_learned == 0:
        return {
            "retention_rate": 100,
            "status": "AWAITING DATA",
            "decay_risk": "LOW",
            "next_review_hours": 0,
            "graph_data": [100] * 12 
        }

    # 2. Ebbinghaus Algorithm Calculation
    base_s = 0.5 
    w_ingat = 1.8
    w_ragu = 1.0
    w_lupa = 0.4 
    
    positive_reinforcement = (stats.ingat_count * w_ingat) + (stats.ragu_count * w_ragu)
    
    if positive_reinforcement < 1: 
        positive_reinforcement = 1
        
    stability = base_s * (1 + np.log(positive_reinforcement))
    forget_penalty = 1 + (stats.lupa_count * 0.2)
    stability = stability / forget_penalty

    # 3. Current Retention
    t_now = 1.0 
    retention_now = np.exp(-t_now / stability) * 100

    # 4. Generate Graph Data (7 Days Projection)
    graph_time_points = np.linspace(0, 7, 12) 
    graph_data = []
    for t in graph_time_points:
        r = np.exp(-t / stability) * 100
        graph_data.append(round(r, 1))

    # 5. Status Classification
    status = "STABLE"
    risk = "LOW"

    if retention_now < 50:
        status = "CRITICAL DECAY"
        risk = "HIGH"
    elif retention_now < 75:
        status = "VOLATILE"
        risk = "MED"
    else:
        status = "OPTIMAL SYNC"
        risk = "LOW"
        
    optimal_review_days = -np.log(0.9) * stability
    next_review_hours = round(optimal_review_days * 24, 1)

    return {
        "retention_rate": round(retention_now, 1),
        "status": status,
        "decay_risk": risk,
        "next_review_hours": next_review_hours,
        "graph_data": graph_data 
    }

@app.post("/chat")
def chat(req: ChatRequest):
    # Cek API Key
    if not OPENROUTER_API_KEY:
        print("ERROR: API Key OpenRouter belum diset di .env")
        return {"reply": "Maaf Ronin, merpati pos (API Key) belum sampai. Mohon periksa konfigurasi .env mu."}

    # 1. Siapkan Pesan (System + History + User)
    messages = [{"role": "system", "content": SYSTEM_PROMPT}]
    
    # Ambil 6 pesan terakhir dari history agar hemat konteks & tetap nyambung
    for msg in req.history[-6:]:
        # Mapping role frontend 'assistant'/'sensei' ke API standard 'assistant'
        role = "assistant" if msg.role == "assistant" or msg.role == "sensei" else "user"
        messages.append({"role": role, "content": msg.content})
    
    # Tambahkan pesan user saat ini
    messages.append({"role": "user", "content": req.message})

    # 2. Panggil OpenRouter API
    try:
        response = requests.post(
            url="https://openrouter.ai/api/v1/chat/completions",
            headers={
                "Authorization": f"Bearer {OPENROUTER_API_KEY}",
                "Content-Type": "application/json",
                "HTTP-Referer": "http://localhost:3000", # Identitas App (Optional)
                "X-Title": "Kaiwa Rift",
            },
            json={
                "model": AI_MODEL,
                "messages": messages,
                "temperature": 0.8, # Kreativitas (0.0 kaku - 1.0 liar)
                "max_tokens": 200,  # Batasi panjang jawaban agar tidak boros
            },
            timeout=20 # Timeout 20 detik
        )
        
        response.raise_for_status() # Cek error HTTP
        result = response.json()
        
        # Ambil teks jawaban
        if 'choices' in result and len(result['choices']) > 0:
            ai_reply = result['choices'][0]['message']['content']
            return {"reply": ai_reply}
        else:
            return {"reply": "Mmm... Angin sedang ribut, aku tidak bisa mendengar pikiranmu."}

    except Exception as e:
        print(f"Error calling OpenRouter: {e}")
        return {"reply": "Maaf Ronin, meditasiku terganggu (Connection Error). Cobalah sesaat lagi."}