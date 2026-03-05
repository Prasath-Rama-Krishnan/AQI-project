import sys
import pandas as pd
import json
from sklearn.linear_model import LinearRegression

df = pd.read_csv(sys.stdin)

df["date"] = pd.to_datetime(df["date"], dayfirst=True)
df["aqi_value"] = pd.to_numeric(df["aqi_value"], errors="coerce")
df = df.dropna()

df["date_ordinal"] = df["date"].map(pd.Timestamp.toordinal)

future_dates = pd.date_range(
    start=df["date"].max(),
    periods=365,
    freq="D"
)

future_df = pd.DataFrame({
    "date": future_dates,
    "date_ordinal": future_dates.map(pd.Timestamp.toordinal)
})

results = []

for (state, area), g in df.groupby(["state", "area"]):
    if len(g) < 30:
        continue

    # determine most common historic pollutant for this state/area
    top_pollutant = ""
    if "prominent_pollutants" in g.columns:
        poll_counts = {}
        for val in g["prominent_pollutants"].dropna():
            for p in str(val).split(","):
                p = p.strip()
                if p:
                    poll_counts[p] = poll_counts.get(p, 0) + 1
        if poll_counts:
            top_pollutant = max(poll_counts, key=poll_counts.get)

    model = LinearRegression()
    model.fit(g[["date_ordinal"]], g["aqi_value"])

    preds = model.predict(future_df[["date_ordinal"]])

    for d, aqi in zip(future_dates, preds):
        results.append({
            "date": d.strftime("%Y-%m-%d"),
            "state": state,
            "area": area,
            "aqi_value": max(0, int(aqi)),
            "air_quality_status":
                "Good" if aqi <= 50 else
                "Moderate" if aqi <= 100 else
                "Poor" if aqi <= 200 else
                "Severe",
            "prominent_pollutants": top_pollutant
        })

print(json.dumps(results))
