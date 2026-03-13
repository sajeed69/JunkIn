import os
import json
import uvicorn
from datetime import datetime
from typing import Optional, List, Dict
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from dotenv import load_dotenv
from groq import Groq

# Load environment variables
load_dotenv()

app = FastAPI(title="JunkIn AI Analysis Service", version="2.0.0")

# Configure Groq
api_key = os.getenv("GROQ_API_KEY")
client = None

if not api_key:
    print("CRITICAL ERROR: GROQ_API_KEY not found in environment variables.")
else:
    try:
        client = Groq(api_key=api_key)
        print("[LOG] Groq client configured successfully.")
    except Exception as e:
        print(f"CRITICAL ERROR: Failed to configure Groq: {str(e)}")


def test_groq_connection():
    """Test Groq connection at startup."""
    if not client:
        return False
    try:
        print("[LOG] Testing Groq connection...")
        response = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[{"role": "user", "content": "Say hello in one word"}],
            max_tokens=10,
        )
        print(f"[LOG] Groq connection test success: {response.choices[0].message.content.strip()}")
        return True
    except Exception as e:
        print(f"[ERROR] Groq connection failed: {str(e)}")
        return False


class AnalysisRequest(BaseModel):
    title: str
    category: str
    condition: str
    brand: Optional[str] = None
    age: Optional[int] = None
    description: Optional[str] = None
    estimated_weight: Optional[float] = None
    image_urls: Optional[List[str]] = []


class ResaleEstimate(BaseModel):
    min: float
    max: float


class AnalysisResponse(BaseModel):
    resale_estimate: ResaleEstimate
    scrap_estimate: float
    recycle_value: float
    recommended_mode: str
    resale_probability: int
    confidence: int
    identified_item: str
    reasoning: str
    material_type: Optional[str] = None
    co2_saving_est: float
    market_demand: Optional[str] = "Moderate"
    environmental_impact: Optional[str] = "High"
    source: str = "groq"


@app.get("/")
async def health():
    return {"status": "alive", "service": "JunkIn-AI-Groq", "timestamp": str(datetime.now())}


def get_groq_analysis(req: AnalysisRequest) -> Optional[Dict]:
    """
    Calls Groq (Llama 3.3 70B) to analyze the item and return a structured JSON response.
    """
    if not client:
        print("[ERROR] Groq client not initialized, cannot perform analysis")
        return None

    try:
        prompt = f"""You are an expert second-hand market analyst and recycling specialist for JunkIn, a circular economy platform in India.

Item Details:
- Title: {req.title}
- Category: {req.category}
- Condition: {req.condition}
- Brand: {req.brand or 'Unknown/Generic'}
- Age: {req.age if req.age is not None else 'Unknown'} years
- Description: {req.description or 'N/A'}
- Estimated Weight: {req.estimated_weight if req.estimated_weight is not None else 'Unknown'} kg

Based on these details, provide a REALISTIC and SPECIFIC valuation in Indian Rupees (INR).
Consider the actual brand, category, condition, and age to give DIFFERENT values for DIFFERENT items.
A Samsung phone should be valued differently than a wooden chair.
A "New" condition item should be worth much more than a "Poor" condition one.
Premium brands should have higher resale values.

You MUST respond with ONLY a valid JSON object, no other text:
{{
    "identified_item": "precise name of the item based on title and description",
    "resale_estimate": {{ "min": <realistic_min_INR>, "max": <realistic_max_INR> }},
    "scrap_estimate": <scrap_value_INR>,
    "recycle_value": <recycler_premium_value_INR>,
    "recommended_mode": "reuse" or "scrap",
    "resale_probability": <0_to_100>,
    "confidence": <0_to_100>,
    "material_type": "<primary material like plastic, iron, copper, electronics, wood, fabric, glass, paper>",
    "co2_saving_est": <estimated_kg_co2_saved>,
    "market_demand": "Low" or "Moderate" or "High",
    "environmental_impact": "<one sentence about environmental benefit>",
    "reasoning": "<2-3 sentences explaining your valuation logic, mentioning specific factors>"
}}"""

        print(f"[LOG] Requesting Groq analysis for: {req.title}")
        response = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[
                {
                    "role": "system",
                    "content": "You are a JSON-only response bot. You analyze second-hand items and return structured JSON valuations. Never include any text outside the JSON object."
                },
                {"role": "user", "content": prompt}
            ],
            temperature=0.7,
            max_tokens=800,
            response_format={"type": "json_object"},
        )

        text = response.choices[0].message.content.strip()
        print(f"[LOG] Groq response: {text}")
        return json.loads(text)

    except Exception as e:
        import traceback
        traceback.print_exc()
        error_msg = str(e)
        if "authentication" in error_msg.lower() or "api_key" in error_msg.lower():
            print(f"[ERROR] Groq API Error: INVALID_API_KEY - {error_msg}")
        elif "rate" in error_msg.lower() or "quota" in error_msg.lower():
            print(f"[ERROR] Groq API Error: RATE_LIMIT - {error_msg}")
        elif "model" in error_msg.lower():
            print(f"[ERROR] Groq API Error: MODEL_ERROR - {error_msg}")
        else:
            print(f"[ERROR] Groq API Error: {error_msg}")
        return None


@app.post("/analyze-item", response_model=AnalysisResponse)
async def analyze_item(req: AnalysisRequest):
    """
    AI Valuation Engine powered by Groq (Llama 3.3 70B).
    """
    try:
        # Try Groq
        ai_data = get_groq_analysis(req)

        if ai_data:
            return AnalysisResponse(
                resale_estimate=ResaleEstimate(
                    min=float(ai_data.get('resale_estimate', {}).get('min', 0)),
                    max=float(ai_data.get('resale_estimate', {}).get('max', 0))
                ),
                scrap_estimate=float(ai_data.get('scrap_estimate', 0)),
                recycle_value=float(ai_data.get('recycle_value', 0)),
                recommended_mode=ai_data.get('recommended_mode', 'reuse'),
                resale_probability=int(ai_data.get('resale_probability', 70)),
                confidence=int(ai_data.get('confidence', 95)),
                identified_item=ai_data.get('identified_item', req.title),
                reasoning=ai_data.get('reasoning', "Analyzed based on market trends."),
                material_type=ai_data.get('material_type', 'Other'),
                co2_saving_est=float(ai_data.get('co2_saving_est', 0)),
                market_demand=ai_data.get('market_demand', 'Moderate'),
                environmental_impact=ai_data.get('environmental_impact', 'Helps preserve natural resources.'),
                source="groq"
            )

        # Fallback to simulation if Groq fails
        print("[WARN] Groq analysis failed, using fallback simulation")
        multiplier = {"New": 1.0, "Good": 0.8, "Moderate": 0.5, "Poor": 0.3, "Scrap": 0.1}.get(req.condition, 0.5)
        
        # Use category-aware base prices for better fallback
        category_prices = {
            "Electronics": 5000, "Furniture": 3000, "Clothing": 800,
            "Books": 300, "Appliances": 4000, "Metals": 1500,
            "Plastics": 500, "Paper": 200, "Glass": 400, "Other": 1000,
        }
        base_price = float(category_prices.get(req.category, 1000))
        
        resale_min = base_price * multiplier * 0.6
        resale_max = base_price * multiplier * 1.4
        scrap_val = (req.estimated_weight or 2.0) * 25.0

        return AnalysisResponse(
            resale_estimate=ResaleEstimate(min=resale_min, max=resale_max),
            scrap_estimate=scrap_val,
            recycle_value=scrap_val * 1.2,
            recommended_mode="reuse" if resale_max > (scrap_val * 2) else "scrap",
            resale_probability=60,
            confidence=40,
            identified_item=req.title,
            reasoning=f"Fallback estimate for {req.category} in {req.condition} condition. AI service was temporarily unavailable.",
            material_type="Other",
            co2_saving_est=(req.estimated_weight or 2.0) * 1.5,
            market_demand="Moderate",
            environmental_impact="Reusing or recycling this item helps reduce landfill waste.",
            source="fallback"
        )

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.on_event("startup")
async def startup_event():
    test_groq_connection()


if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8001)
