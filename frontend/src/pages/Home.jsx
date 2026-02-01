import "./Home.css";
import { useNavigate } from "react-router-dom";

export default function Home() {
  const navigate = useNavigate();

  return (
    <div className="home">
      <h1>Air Quality Prediction System</h1>
      <p>
        This project analyzes historical air quality data and predicts
        future AQI values using machine learning techniques. The insights
        help understand pollution trends and support air purifier market
        strategies in India.
      </p>

      <button onClick={() => navigate("/prediction")}>
        Go to Prediction
      </button>
    </div>
  );
}
