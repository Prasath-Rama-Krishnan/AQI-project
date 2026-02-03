import {
  getProminentPollutants,
  aqiCategoryBreakdown
} from "../utils/aqiAnalytics";
import { PieChart, Pie, BarChart, Bar, XAxis, YAxis, Tooltip } from "recharts";
import "./Dashboard.css";
import CustomTick from "../components/CustomTick";
import CustomTooltip from "../components/CustomTooltip";

export default function Dashboard({ data }) {
  const pollutants = getProminentPollutants(data);
  const categories = aqiCategoryBreakdown(data);

  return (
    <div className="dashboard">
      <h2>Prominent Pollutants</h2>
      <BarChart width={600} height={300} data={pollutants}>
        <XAxis dataKey="name" tick={<CustomTick />} />
        <YAxis />
        <Tooltip content={<CustomTooltip/>} />
        <Bar dataKey="value" fill="#38bdf8" />
      </BarChart>

      <h2>AQI Category Breakdown</h2>
      <PieChart width={400} height={300}>
        <Pie data={categories} dataKey="value" nameKey="name" />
      </PieChart>
    </div>
  );
}
