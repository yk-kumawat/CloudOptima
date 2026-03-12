import joblib
import pandas as pd

# Load your pre-trained models
cost_pipeline = joblib.load("sub_models/cost_pipeline.joblib")
util_pipeline = joblib.load("sub_models/util_pipeline.joblib")
opt_pipeline = joblib.load("sub_models/opt_pipeline.joblib")

USD_TO_INR = 83

# VM specs and approximate pricing for prediction accuracy
VM_SPECS = {
    "t3.small": {"vCPU": 2, "RAM": 2, "base_price": 0.0208},
    "t3.medium": {"vCPU": 2, "RAM": 4, "base_price": 0.0416},
    "t3.large": {"vCPU": 2, "RAM": 8, "base_price": 0.0832},

    "B1s": {"vCPU": 1, "RAM": 1, "base_price": 0.0110},
    "B2s": {"vCPU": 2, "RAM": 4, "base_price": 0.0464},
    "B4ms": {"vCPU": 4, "RAM": 16, "base_price": 0.1660},

    "n1-standard-1": {"vCPU": 1, "RAM": 3.75, "base_price": 0.0475},
    "n1-standard-2": {"vCPU": 2, "RAM": 7.5, "base_price": 0.0950},
    "n1-standard-4": {"vCPU": 4, "RAM": 15.0, "base_price": 0.1900}
}

CLOUD_OPTIONS = {
    "AWS": {
        "US": ["t3.small", "t3.medium", "t3.large"],
        "Asia": ["t3.small", "t3.medium", "t3.large"]
    },
    "Azure": {
        "US": ["B1s", "B2s", "B4ms"],
        "Asia": ["B1s", "B2s", "B4ms"]
    },
    "GCP": {
        "US": ["n1-standard-1", "n1-standard-2", "n1-standard-4"],
        "Asia": ["n1-standard-1", "n1-standard-2", "n1-standard-4"]
    }
}

def compute_cloud_score(cost, util, base_cost):
    # Higher is better
    cost_score = 1 - (cost / (base_cost + 1e-6))
    util_score = 1 - abs(util - 65) / 15  # Normalizes score around 65% target. Extrema penalized exponentially.

    overload_penalty = 0
    if util > 80:
        overload_penalty = 0.5
    elif util < 50:
        overload_penalty = 0.5

    return (0.5 * cost_score) + (0.4 * util_score) - overload_penalty

def estimate_new_util(current_util, current_cap, new_cap):
    if new_cap <= 0:
        return current_util
    return min(round(current_util * (current_cap / new_cap), 2), 100.0)

feature_cols = [
    "cpu_usage", "memory_usage", "net_io", "disk_io",
    "cloud_provider", "region", "vm_type",
    "vCPU", "RAM_GB", "price_per_hour",
    "latency_ms", "throughput"
]

def make_prediction(data):
    input_df = pd.DataFrame([data])[feature_cols]

    predicted_cost_hourly = float(cost_pipeline.predict(input_df)[0])
    predicted_util = float(util_pipeline.predict(input_df)[0])

    current_vm = data.get("vm_type")
    current_provider = data.get("cloud_provider")
    current_region = data.get("region")

    monthly_inr = predicted_cost_hourly * 720 * USD_TO_INR
    formatted_cost = "₹ {:,.2f}".format(monthly_inr)

    # 1. Determine Status (Target: 50-80%)
    if predicted_util < 50:
        status_label = "Underutilized"
        recommendation = "Downgrade VM to smaller instance."
    elif predicted_util > 80:
        status_label = "Overutilized"
        recommendation = "Upgrade VM to larger instance."
    else:
        status_label = "Optimal"
        recommendation = "Current VM configuration is performing well."

    if status_label == "Optimal":
        return {
            "predicted_monthly_cost": formatted_cost,
            "optimized_monthly_cost": formatted_cost,
            "predicted_utilization": round(predicted_util, 2),
            "optimized_util": round(predicted_util, 2),
            "optimization_status": status_label,
            "recommendation": recommendation,
            "recommended_instance": current_vm, 
            "arbitrage_insight": "Current deployment is performing optimally (50-80%).",
            "arbitrage_details": None,
            "current_config": {"provider": current_provider, "region": current_region, "vm_type": current_vm}
        }

    # 2. Optimization Logic
    best_option = None
    best_score = -float('inf')
    
    current_cap = float(data.get("vCPU", 0)) + float(data.get("RAM_GB", 0))

    for provider, regions in CLOUD_OPTIONS.items():
        for region, vm_list in regions.items():
            for vm in vm_list:
                new_specs = VM_SPECS.get(vm, {})
                new_cap = new_specs.get("vCPU", 0) + new_specs.get("RAM", 0)
                new_util = estimate_new_util(predicted_util, current_cap, new_cap)

                # Requirement Filter
                is_valid = False
                if status_label == "Underutilized" and new_cap < current_cap:
                    # Downgrade must be smaller and shouldn't push util way over 80
                    if new_util <= 85: is_valid = True
                elif status_label == "Overutilized" and new_cap > current_cap:
                    # Upgrade must be larger but try not to drop util way under 50
                    if new_util >= 40: is_valid = True
                
                # If we completely fail strict checks, allow the first simple upgrade/downgrade to avoid empty suggestions.
                if not is_valid and best_option is None:
                    if status_label == "Underutilized" and new_cap < current_cap: is_valid = True
                    elif status_label == "Overutilized" and new_cap > current_cap: is_valid = True
                
                if is_valid:
                    # Update input features for accurate optimized cost prediction
                    test_input = data.copy()
                    test_input.update({
                        "cloud_provider": provider,
                        "region": region,
                        "vm_type": vm,
                        "vCPU": new_specs["vCPU"],
                        "RAM_GB": new_specs["RAM"],
                        "price_per_hour": new_specs["base_price"],
                        "cpu_usage": (data["cpu_usage"] * (current_cap / new_cap)) if new_cap > 0 else data["cpu_usage"],
                        "memory_usage": (data["memory_usage"] * (current_cap / new_cap)) if new_cap > 0 else data["memory_usage"]
                    })
                    
                    test_df = pd.DataFrame([test_input])[feature_cols]
                    predicted_test_cost = float(cost_pipeline.predict(test_df)[0])
                    score = compute_cloud_score(predicted_test_cost, new_util, predicted_cost_hourly)

                    if score > best_score:
                        best_score = score
                        best_option = {
                            "provider": provider, "region": region, "vm_type": vm,
                            "optimized_util": new_util, "hourly_cost": predicted_test_cost
                        }

    if best_option:
        recommended_instance = best_option["vm_type"]
        optimized_util = best_option["optimized_util"]
        opt_monthly_inr = best_option["hourly_cost"] * 720 * USD_TO_INR
        savings_monthly_inr = monthly_inr - opt_monthly_inr

        is_arbitrage = (best_option["provider"] != current_provider)
        
        provider_text = f"by migrating to {best_option['provider']}" if is_arbitrage else "while remaining on your current provider"
        if savings_monthly_inr > 0:
            savings_text = f"saving you ₹ {savings_monthly_inr:,.2f} monthly"
        elif savings_monthly_inr < 0:
            savings_text = f"costing an additional ₹ {abs(savings_monthly_inr):,.2f} monthly to handle the necessary capacity"
        else:
            savings_text = "with no change in monthly cost"
            
        action = "Downsizing" if status_label == "Underutilized" else "Upgrading"
        
        arbitrage_message = (
            f"{action} your {status_label.lower()} {current_vm} instance to a {recommended_instance} "
            f"in {best_option['region']} {provider_text} balances resource allocation. "
            f"This brings your workload utilization to a target {optimized_util}%, {savings_text}."
        )

        formatted_opt_cost = "₹ {:,.2f}".format(opt_monthly_inr)
        arbitrage_data = {
            "provider": best_option["provider"], "region": best_option["region"],
            "vm_type": recommended_instance, "optimized_util": optimized_util,
            "monthly_cost": formatted_opt_cost,
            "savings_monthly": "₹ {:,.2f}".format(savings_monthly_inr)
        }
    else:
        recommended_instance, optimized_util, arbitrage_message, arbitrage_data = current_vm, round(predicted_util, 2), f"No suitable {status_label.lower()} found.", None
        formatted_opt_cost = formatted_cost

    return {
        "predicted_monthly_cost": formatted_cost,
        "optimized_monthly_cost": formatted_opt_cost,
        "predicted_utilization": round(predicted_util, 2),
        "optimized_util": optimized_util,
        "optimization_status": status_label,
        "recommendation": recommendation,
        "recommended_instance": recommended_instance, 
        "arbitrage_insight": arbitrage_message,
        "arbitrage_details": arbitrage_data,
        "current_config": {"provider": current_provider, "region": current_region, "vm_type": current_vm}
    }
