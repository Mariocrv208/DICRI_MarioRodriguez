import { useState } from "react";
import api from "../services/api";

export default function Login() {
  const [correo, setCorreo] = useState("");
  const [password, setPassword] = useState("");

  const login = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post("/auth/login", { correo, password });
      localStorage.setItem("token", res.data.token);
      window.location.href = "/";
    } catch {
      alert("Credenciales incorrectas");
    }
  };

  return (
    <div className="center-all full-page">
      <form className="card" onSubmit={login} style={{ width: "350px" }}>
        <h2 style={{ textAlign: "center" }}>Iniciar sesión</h2>

        <input
          className="mt-1"
          placeholder="Correo"
          value={correo}
          onChange={(e) => setCorreo(e.target.value)}
        />

        <input
          className="mt-1"
          type="password"
          placeholder="Contraseña"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button className="mt-2" style={{ width: "100%" }}>Entrar</button>
      </form>
    </div>
  );
}
