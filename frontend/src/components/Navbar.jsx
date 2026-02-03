import { Link, useLocation } from "react-router-dom";
import "./Navbar.css";

export default function Navbar() {
  const { pathname } = useLocation();

  return (
    <nav className="navbar">
      <h2>AQI Analytics</h2>

      <div className="nav-links">
        <Link className={pathname === "/" ? "active" : ""} to="/">
          Home
        </Link>
        <Link
          className={pathname === "/prediction" ? "active" : ""}
          to="/prediction"
        >
          Prediction
        </Link>
        <Link
          className={pathname === "/dashboard" ? "active" : ""}
          to="/dashboard"
        >
          Dashboard
        </Link>
      </div>
    </nav>
  );
}
