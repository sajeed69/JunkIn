import urllib.request
import json

BASE_URL = "http://localhost:8001"

def test_analyze(title, category, condition, brand=None, age=None, weight=None):
    payload = {
        "title": title,
        "category": category,
        "condition": condition,
        "brand": brand,
        "age": age,
        "estimated_weight": weight,
        "image_urls": ["https://res.cloudinary.com/dknvkg2jl/image/upload/v1710332456/junkin/example_bike.jpg"] if "Bicycle" in title else []
    }
    data = json.dumps(payload).encode('utf-8')
    req = urllib.request.Request(f"{BASE_URL}/analyze-item", data=data)
    req.add_header('Content-Type', 'application/json')
    
    try:
        with urllib.request.urlopen(req) as response:
            print(f"\n--- Testing: {title} ({category}) ---")
            print(f"Condition: {condition}, Brand: {brand}, Age: {age}, Weight: {weight}")
            if response.getcode() == 200:
                res = json.loads(response.read().decode('utf-8'))
                print(f"Resale Estimate: ₹{res['resale_estimate']['min']} - ₹{res['resale_estimate']['max']}")
                print(f"Scrap Estimate: ₹{res['scrap_estimate']}")
                print(f"Recycle Value: ₹{res['recycle_value']}")
                print(f"Recommendation: {res['recommended_mode'].upper()}")
                print(f"Reasoning: {res['reasoning'][:200]}...")
            else:
                print(f"Error ({response.getcode()})")
    except Exception as e:
        print(f"Request failed: {e}")

if __name__ == "__main__":
    # Test cases from user example
    test_analyze("Vintage Rolex Watch", "Electronics", "Good", brand="Rolex", age=10)
    test_analyze("Old Iron Scraps", "Metals", "Poor", weight=25.5)
    test_analyze("Modern iPhone 14", "Electronics", "New", brand="Apple", age=1)
    test_analyze("Broken Plastic Chair", "Plastics", "Scrap", weight=2.0)
    test_analyze("Premium Bicycle", "Other", "Good", brand="Giant", age=2)
