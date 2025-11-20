import { Outlet } from "react-router-dom";
import Navbar from "./components/Navbar";
import "./styles/layout.css";
import "./styles/global.css";

export default function App() {
  return (
    <div className="layout">

      <div className="sidebar">
        <h2 style={{ marginBottom: "1rem" }}>DICRI</h2>

        <a href="/">Dashboard</a>
        <a href="/expedientes">Expedientes</a>
        <a href="/indicios">Indicios</a>
      </div>

      <div className="content">
        <Navbar />
        <div className="inner-content">
          <Outlet />
        </div>
      </div>

    </div>
  );
}
