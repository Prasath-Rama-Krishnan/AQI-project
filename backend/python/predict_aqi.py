import sys
import pandas as pd
from sklearn.linear_model import LinearRegression
from datetime import timedelta

input_csv = sys.argv[1]
output_csv = sys.argv[2]

df = pd.read_csv(input_csv)

df["date"] = pd.to_datetime(df["date"])
df["ord"] = df["date"].map(pd.Timestamp.toordinal)
df["aqi_value"] = pd.to_numeric(df["aqi_value"], errors="coerce")

future_dates = pd.date_range(
    df["date"].max() + timedelta(days=1),
    df["date"].max() + timedelta(days=365),
    freq="D"
)

results = []

for (state, area), group in df.groupby(["state", "area"]):
    if len(group) < 30:
        continue

    X = group[["ord"]]
    y = group["aqi_value"]

    model = LinearRegression()
    model.fit(X, y)

    for d in future_dates:
        pred = model.predict(
            pd.DataFrame({"ord": [d.toordinal()]})
        )[0]

        pred = max(0, int(pred))

        if pred <= 50:
            status = "Good"
        elif pred <= 100:
            status = "Satisfactory"
        elif pred <= 200:
            status = "Moderate"
        elif pred <= 300:
            status = "Poor"
        else:
            status = "Very Poor"

        results.append({
            "date": d.strftime("%Y-%m-%d"),
            "state": state,
            "area": area,
            "aqi_value": pred,
            "air_quality_status": status
        })

out_df = pd.DataFrame(results)
out_df.to_csv(output_csv, index=False)
