from predict import make_prediction
import json

inputs = [
    {
        "name": "Input 1: Azure Underutilized Scale-Down",
        "data": {
            "cpu_usage": 17.96, "memory_usage": 27.64, "net_io": 70.35, "disk_io": 392.8,
            "cloud_provider": "Azure", "region": "us-east", "vm_type": "B1s",
            "vCPU": 1, "RAM_GB": 1.0, "price_per_hour": 0.012,
            "latency_ms": 262.41, "throughput": 420.01
        }
    },
    {
        "name": "Input 2: GCP Overutilized Scale-Up",
        "data": {
            "cpu_usage": 97.7, "memory_usage": 98.76, "net_io": 364.17, "disk_io": 582.49,
            "cloud_provider": "GCP", "region": "us-west", "vm_type": "B1s",
            "vCPU": 1, "RAM_GB": 1.0, "price_per_hour": 0.012,
            "latency_ms": 211.27, "throughput": 1935.75
        }
    },
    {
        "name": "Input 3: AWS Optimal/No Action",
        "data": {
            "cpu_usage": 79.94, "memory_usage": 60.26, "net_io": 240.9, "disk_io": 915.72,
            "cloud_provider": "AWS", "region": "asia-south", "vm_type": "n1-standard-1",
            "vCPU": 1, "RAM_GB": 3.75, "price_per_hour": 0.0475,
            "latency_ms": 229.71, "throughput": 1351.87
        }
    },
    {
        "name": "Input 4: GCP Optimal/No Action",
        "data": {
            "cpu_usage": 32.92, "memory_usage": 71.34, "net_io": 392.1, "disk_io": 636.07,
            "cloud_provider": "GCP", "region": "us-west", "vm_type": "n1-standard-1",
            "vCPU": 1, "RAM_GB": 3.75, "price_per_hour": 0.0475,
            "latency_ms": 223.15, "throughput": 1002.76
        }
    },
    {
        "name": "Input 5: AWS Overutilized Scale-Up",
        "data": {
            "cpu_usage": 83.15, "memory_usage": 95.25, "net_io": 493.7, "disk_io": 778.04,
            "cloud_provider": "AWS", "region": "asia-south", "vm_type": "t2.micro",
            "vCPU": 1, "RAM_GB": 1.0, "price_per_hour": 0.0116,
            "latency_ms": 203.62, "throughput": 1773.33
        }
    }
]

for item in inputs:
    print(f"\n{'='*50}")
    print(f"Testing: {item['name']}")
    res = make_prediction(item["data"])
    
    print(f"Status: {res['optimization_status']}")
    print(f"Recommendation: {res['recommendation']}")
    print(f"Old VM: {item['data']['vm_type']} -> New VM: {res['recommended_instance']}")
    print(f"Utilization: {res['predicted_utilization']}% -> {res['optimized_util']}%")
    print(f"Cost: {res['predicted_monthly_cost']} -> {res['optimized_monthly_cost']}")
    
    if res.get("arbitrage_details"):
        print(f"Monthly Savings: {res['arbitrage_details']['savings_monthly']}")
    else:
        print("Monthly Savings: None (Optimal state)")
