export function analyzeAQIData(rows) {
  const totalDays = rows.length;

  const avgAQI =
    rows.reduce((sum, r) => sum + Number(r.aqi_value), 0) / totalDays;

  const maxAQI = Math.max(...rows.map((r) => Number(r.aqi_value)));

  const categoryCount = {};
  rows.forEach((r) => {
    categoryCount[r.air_quality_status] =
      (categoryCount[r.air_quality_status] || 0) + 1;
  });

  const stateAvg = {};
  rows.forEach((r) => {
    if (!stateAvg[r.state]) {
      stateAvg[r.state] = { sum: 0, count: 0 };
    }
    stateAvg[r.state].sum += Number(r.aqi_value);
    stateAvg[r.state].count += 1;
  });

  const stateAvgAQI = Object.entries(stateAvg).map(
    ([state, v]) => ({
      state,
      avgAQI: Math.round(v.sum / v.count),
    })
  );

  return {
    avgAQI: Math.round(avgAQI),
    maxAQI,
    totalDays,
    categoryCount,
    stateAvgAQI,
  };
}
