import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Prediction from "./pages/Prediction";
import FutureDashboard from "./pages/FutureDashboard";

export default function App() {
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/prediction" element={<Prediction />} />
        <Route path="/dashboard" element={<FutureDashboard />} />
      </Routes>
    </>
  );
}
