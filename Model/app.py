from flask import Flask, request, jsonify
from predict import make_prediction

app = Flask(__name__)

REQUIRED_FIELDS = [
    "cpu_usage", "memory_usage", "net_io", "disk_io",
    "cloud_provider", "region", "vm_type",
    "vCPU", "RAM_GB", "price_per_hour",
    "latency_ms", "throughput"
]

NUMERIC_FIELDS = [
    "cpu_usage", "memory_usage", "net_io", "disk_io",
    "vCPU", "RAM_GB", "price_per_hour",
    "latency_ms", "throughput"
]

@app.route("/predict", methods=["POST"])
def predict():

    data = request.json

    # Check missing fields
    for field in REQUIRED_FIELDS:
        if field not in data:
            return jsonify({"error": f"Missing field: {field}"}), 400

    # Validate numeric types
    for field in NUMERIC_FIELDS:
        try:
            float(data[field])
        except:
            return jsonify({"error": f"Invalid numeric value for {field}"}), 400

    result = make_prediction(data)
    return jsonify(result)

import os
if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=port, debug=False)