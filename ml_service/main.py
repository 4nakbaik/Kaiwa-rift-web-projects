from fastapi import FastAPI
from pydantic import BaseModel
from typing import List
import numpy as np
import math

app = FastAPI()

class UserStats(BaseModel):
    total_learned: int
    ingat_count: int
    ragu_count: int
    lupa_count: int

@app.post("/predict_retention")
def predict(stats: UserStats):
    if stats.total_learned == 0:
        return {
            "retention_rate": 100,
            "status": "AWAITING DATA",
            "decay_risk": "LOW",
            "next_review_hours": 0,
            "graph_data": [100] * 12 
        }

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

    t_now = 1.0 
    retention_now = np.exp(-t_now / stability) * 100

    graph_time_points = np.linspace(0, 7, 12) 
    graph_data = []
    
    for t in graph_time_points:
        r = np.exp(-t / stability) * 100
        graph_data.append(round(r, 1))

    status = "STABLE"
    risk = "LOW"
    color_code = "text-cyan-400"

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