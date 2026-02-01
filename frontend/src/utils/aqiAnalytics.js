export function analyzeAQIData(rows) {
  const totalDays = rows.length;

  const avgAQI =
    rows.reduce((s, r) => s + Number(r.aqi_value), 0) / totalDays;

  const maxAQI = Math.max(...rows.map((r) => Number(r.aqi_value)));

  const categoryCount = {};
  rows.forEach((r) => {
    categoryCount[r.air_quality_status] =
      (categoryCount[r.air_quality_status] || 0) + 1;
  });

  const stateMap = {};
  rows.forEach((r) => {
    if (!stateMap[r.state]) {
      stateMap[r.state] = { sum: 0, count: 0 };
    }
    stateMap[r.state].sum += Number(r.aqi_value);
    stateMap[r.state].count++;
  });

  const stateAvgAQI = Object.entries(stateMap).map(
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
