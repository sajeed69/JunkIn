import requests
import json

def test_item(title, category, condition, brand, age, description, weight):
    print(f"\n🚀 Testing: {title}")
    payload = {
        "title": title,
        "category": category,
        "condition": condition,
        "brand": brand,
        "age": age,
        "description": description,
        "estimated_weight": weight
    }
    try:
        r = requests.post("http://localhost:8001/analyze-item", json=payload, timeout=15)
        if r.status_code == 200:
            data = r.json()
            print(f"✅ Status: {r.status_code} (Source: {data.get('source')})")
            print(f"💰 Resale: ₹{data['resale_estimate']['min']} - ₹{data['resale_estimate']['max']}")
            print(f"♻️ Scrap: ₹{data['scrap_estimate']}")
            print(f"📋 Identified As: {data['identified_item']}")
            print(f"📝 Reasoning: {data['reasoning'][:100]}...")
        else:
            print(f"❌ Error: {r.status_code}")
            print(r.text)
    except Exception as e:
        print(f"💥 Failed: {str(e)}")

# Test 1: Premium Electronics
test_item("iPhone 13 128GB", "Electronics", "Good", "Apple", 2, "Minor scratches on screen, battery 88%", 0.2)

# Test 2: Furniture
test_item("IKEA Wooden Dining Table", "Furniture", "Moderate", "IKEA", 4, "Solid pine table, some water stains", 25.0)

# Test 3: Poor condition item
test_item("Broken Ceiling Fan", "Appliances", "Poor", "Crompton", 8, "Motor burned out, blades bent", 5.0)
