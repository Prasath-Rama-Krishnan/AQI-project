import { NavLink } from "react-router-dom";
import "./Navbar.css";

export default function Navbar() {
  return (
    <nav className="navbar">
      <h2 className="logo">AQI Predictor</h2>
      <div className="links">
        <NavLink to="/" end>Home</NavLink>
        <NavLink to="/prediction">Prediction</NavLink>
      </div>
    </nav>
  );
}
