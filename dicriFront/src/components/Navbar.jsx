// src/components/Navbar.jsx
import { useNavigate } from "react-router-dom";

export default function Navbar() {
  const navigate = useNavigate();

  const logout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <div className="navbar">
      <h3>Sistema DICRI</h3>
      <button onClick={logout} style={{ background: "var(--danger)" }}>
        Cerrar sesión
      </button>
    </div>
  );
}
