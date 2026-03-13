import os
import re
import json
import uvicorn
from datetime import datetime
from typing import Optional, List, Dict
from urllib.parse import quote_plus
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from dotenv import load_dotenv
from groq import Groq
import httpx
from bs4 import BeautifulSoup

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


# ─────────────────────────────────────────────────
# RARITY ANALYSIS ENDPOINT
# ─────────────────────────────────────────────────

class RarityRequest(BaseModel):
    title: str
    category: str
    condition: str
    brand: Optional[str] = None
    description: Optional[str] = None
    identified_item: Optional[str] = None


class RarityResponse(BaseModel):
    is_rare: bool
    rarity_score: int
    rarity_signals: List[str]
    search_snippets: List[str]
    item_name: str
    rarity_label: str  # "Common", "Uncommon", "Rare", "Ultra Rare"


RARITY_KEYWORDS = {
    "rare": 2,
    "limited edition": 3,
    "collector": 1,
    "collector's item": 2,
    "collectible": 2,
    "vintage": 2,
    "antique": 2,
    "discontinued": 2,
    "out of production": 2,
    "hard to find": 2,
    "sought after": 1,
    "museum": 1,
}

AUCTION_DOMAINS = [
    "ebay.com", "catawiki.com", "sothebys.com", "christies.com",
    "invaluable.com", "liveauctioneers.com", "heritage.com",
    "auction", "bid",
]


async def web_search_rarity(query: str) -> Dict:
    """
    Search DuckDuckGo HTML for rarity signals.
    Returns parsed snippets and detected signals.
    """
    signals = []
    snippets = []
    score = 0

    try:
        encoded_query = quote_plus(query)
        url = f"https://html.duckduckgo.com/html/?q={encoded_query}"

        print(f"[RARITY] Searching: {query}")

        async with httpx.AsyncClient(timeout=10.0) as http_client:
            response = await http_client.get(url, headers={
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
            })

        if response.status_code != 200:
            print(f"[RARITY] Search returned status {response.status_code}")
            return {"signals": signals, "snippets": snippets, "score": score}

        soup = BeautifulSoup(response.text, "html.parser")
        results = soup.select(".result__body")[:10]  # top 10 results

        for result in results:
            title_el = result.select_one(".result__title")
            snippet_el = result.select_one(".result__snippet")
            link_el = result.select_one(".result__url")

            title_text = title_el.get_text().strip().lower() if title_el else ""
            snippet_text = snippet_el.get_text().strip().lower() if snippet_el else ""
            link_text = link_el.get_text().strip().lower() if link_el else ""
            combined_text = f"{title_text} {snippet_text} {link_text}"

            # Collect readable snippets
            if snippet_el:
                readable = snippet_el.get_text().strip()
                if len(readable) > 20:
                    snippets.append(readable[:200])

            # Check for rarity keywords
            for keyword, points in RARITY_KEYWORDS.items():
                if keyword in combined_text and keyword not in signals:
                    signals.append(keyword)
                    score += points
                    print(f"[RARITY] Signal found: '{keyword}' (+{points})")

            # Check for auction/collector domains
            for domain in AUCTION_DOMAINS:
                if domain in combined_text and "auction_site" not in signals:
                    signals.append("auction_site")
                    score += 2
                    print(f"[RARITY] Auction domain found: '{domain}' (+2)")
                    break

        print(f"[RARITY] Search complete. Score: {score}, Signals: {signals}")

    except Exception as e:
        print(f"[RARITY] Web search error: {str(e)}")

    return {"signals": signals, "snippets": snippets[:5], "score": score}


async def ai_rarity_fallback(item_name: str, brand: str, category: str, description: str) -> Dict:
    """
    AI-based rarity analysis fallback when web search fails.
    Uses Groq to assess collectibility directly.
    """
    signals = []
    snippets = []
    score = 0

    if not client:
        return {"signals": signals, "snippets": snippets, "score": score}

    try:
        prompt = f"""Analyze the rarity and collectibility of this item. Be honest and realistic.

Item: {item_name}
Brand: {brand}
Category: {category}
Description: {description or 'N/A'}

Return ONLY a JSON object:
{{
    "is_collectible": true/false,
    "rarity_score": 0-10,
    "signals": ["list", "of", "rarity", "signals"],
    "reasoning": "brief explanation of why this item is or isn't rare/collectible",
    "estimated_collector_value_usd": 0
}}

Rules:
- Common everyday items (normal phones, basic clothes, regular furniture) should score 0-2
- Vintage/retro items from notable brands should score 3-5
- Limited editions, discontinued models, antiques should score 5-8
- Truly rare collectibles should score 8-10
- Be realistic, don't inflate scores"""

        response = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[
                {"role": "system", "content": "You are a collectibles and antiques expert. Return JSON only."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.3,
            max_tokens=300,
            response_format={"type": "json_object"},
        )

        data = json.loads(response.choices[0].message.content.strip())
        score = min(data.get("rarity_score", 0), 10)
        signals = data.get("signals", [])
        reasoning = data.get("reasoning", "")
        if reasoning:
            snippets.append(f"AI Analysis: {reasoning[:200]}")

        print(f"[RARITY] AI fallback result: score={score}, signals={signals}")

    except Exception as e:
        print(f"[RARITY] AI fallback error: {str(e)}")

    return {"signals": signals, "snippets": snippets, "score": score}


def get_rarity_label(score: int) -> str:
    """Map rarity score to a human-readable label."""
    if score >= 10:
        return "Ultra Rare"
    elif score >= 5:
        return "Rare"
    elif score >= 3:
        return "Uncommon"
    return "Common"


@app.post("/analyze-rarity", response_model=RarityResponse)
async def analyze_rarity(req: RarityRequest):
    """
    Rarity Analysis Engine.
    1. Identifies the item precisely using AI.
    2. Searches the web for rarity signals.
    3. Scores the item and returns classification.
    """
    try:
        # Step 1: Use identified_item if available, else use title
        item_name = req.identified_item or req.title
        brand = req.brand or ""

        # Step 2: Try AI-enhanced identification via Groq
        if client:
            try:
                id_prompt = f"""Identify this item precisely for a rarity/collectibility search.
Item: {req.title}
Brand: {brand}
Category: {req.category}
Description: {req.description or 'N/A'}

Return ONLY a JSON object:
{{
    "item_name": "precise searchable name",
    "is_potentially_collectible": true/false,
    "collectibility_reason": "brief reason"
}}"""

                id_response = client.chat.completions.create(
                    model="llama-3.3-70b-versatile",
                    messages=[
                        {"role": "system", "content": "You are a JSON-only bot that identifies items for collectibility research."},
                        {"role": "user", "content": id_prompt}
                    ],
                    temperature=0.3,
                    max_tokens=200,
                    response_format={"type": "json_object"},
                )

                id_data = json.loads(id_response.choices[0].message.content.strip())
                item_name = id_data.get("item_name", item_name)
                print(f"[RARITY] AI identified item as: {item_name}")
                print(f"[RARITY] AI collectibility hint: {id_data.get('is_potentially_collectible', 'unknown')} - {id_data.get('collectibility_reason', '')}")

            except Exception as e:
                print(f"[RARITY] AI identification failed, using title: {str(e)}")

        # Step 3: Web search for rarity
        search_query = f"{item_name} {brand} rarity value collectors price"
        search_results = await web_search_rarity(search_query)

        rarity_score = search_results["score"]
        rarity_signals = search_results["signals"]
        search_snippets = search_results["snippets"]

        # Step 3b: If web search failed/returned nothing, use AI fallback
        if rarity_score == 0 and len(rarity_signals) == 0:
            print("[RARITY] Web search returned nothing, using AI fallback...")
            ai_results = await ai_rarity_fallback(item_name, brand, req.category or "", req.description or "")
            rarity_score = ai_results["score"]
            rarity_signals = ai_results["signals"]
            search_snippets = ai_results["snippets"]

        # Step 4: Bonus points from condition/age context
        condition_lower = req.condition.lower() if req.condition else ""
        title_lower = req.title.lower()
        desc_lower = (req.description or "").lower()
        full_text = f"{title_lower} {desc_lower} {brand.lower()}"

        for keyword, points in RARITY_KEYWORDS.items():
            if keyword in full_text and keyword not in rarity_signals:
                rarity_signals.append(f"{keyword} (from listing)")
                rarity_score += points
                print(f"[RARITY] Listing signal: '{keyword}' (+{points})")

        is_rare = rarity_score >= 5
        rarity_label = get_rarity_label(rarity_score)

        print(f"[RARITY] === FINAL RESULT ===")
        print(f"[RARITY] Item: {item_name}")
        print(f"[RARITY] Score: {rarity_score}")
        print(f"[RARITY] Is Rare: {is_rare}")
        print(f"[RARITY] Label: {rarity_label}")
        print(f"[RARITY] Signals: {rarity_signals}")

        return RarityResponse(
            is_rare=is_rare,
            rarity_score=rarity_score,
            rarity_signals=rarity_signals,
            search_snippets=search_snippets,
            item_name=item_name,
            rarity_label=rarity_label,
        )

    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))


@app.on_event("startup")
async def startup_event():
    test_groq_connection()


if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8001)



