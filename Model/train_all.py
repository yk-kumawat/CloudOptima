import pandas as pd
import joblib

from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestRegressor, RandomForestClassifier
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import OneHotEncoder
from sklearn.metrics import r2_score, accuracy_score

# Load dataset
df = pd.read_csv("data/cloud_dataset.csv")

# Drop timestamp
df = df.drop(columns=["timestamp"])

# ----------------------------
# Common Feature Set
# ----------------------------
feature_cols = [
    "cpu_usage", "memory_usage", "net_io", "disk_io",
    "cloud_provider", "region", "vm_type",
    "vCPU", "RAM_GB", "price_per_hour",
    "latency_ms", "throughput"
]

X = df[feature_cols]

# Targets
y_cost = df["cost"]
y_util = df["utilization"]
y_opt = df["target"]

# Single consistent split
X_train, X_test, y_cost_train, y_cost_test = train_test_split(
    X, y_cost, test_size=0.2, random_state=42
)

_, _, y_util_train, y_util_test = train_test_split(
    X, y_util, test_size=0.2, random_state=42
)

_, _, y_opt_train, y_opt_test = train_test_split(
    X, y_opt, test_size=0.2, random_state=42
)

# Categorical Columns
categorical_cols = ["cloud_provider", "region", "vm_type"]

# Preprocessor
preprocessor = ColumnTransformer(
    transformers=[
        ("cat", OneHotEncoder(handle_unknown="ignore"), categorical_cols)
    ],
    remainder="passthrough"
)

# ----------------------------
# Cost Pipeline
# ----------------------------
cost_pipeline = Pipeline(steps=[
    ("preprocessor", preprocessor),
    ("model", RandomForestRegressor())
])

cost_pipeline.fit(X_train, y_cost_train)
cost_pred = cost_pipeline.predict(X_test)
print("Cost Model R2:", round(r2_score(y_cost_test, cost_pred) * 100, 2), "%")

joblib.dump(cost_pipeline, "sub_models/cost_pipeline.joblib")

# ----------------------------
# Utilization Pipeline
# ----------------------------
util_pipeline = Pipeline(steps=[
    ("preprocessor", preprocessor),
    ("model", RandomForestRegressor())
])

util_pipeline.fit(X_train, y_util_train)
util_pred = util_pipeline.predict(X_test)
print("Util Model R2:", round(r2_score(y_util_test, util_pred) * 100, 2), "%")

joblib.dump(util_pipeline, "sub_models/util_pipeline.joblib")

# ----------------------------
# Optimization Pipeline
# ----------------------------
opt_pipeline = Pipeline(steps=[
    ("preprocessor", preprocessor),
    ("model", RandomForestClassifier())
])

opt_pipeline.fit(X_train, y_opt_train)
opt_pred = opt_pipeline.predict(X_test)
print("Optimization Accuracy:", round(accuracy_score(y_opt_test, opt_pred) * 100, 2), "%")

joblib.dump(opt_pipeline, "sub_models/opt_pipeline.joblib")

print("All Models Trained & Saved Successfully ✅")