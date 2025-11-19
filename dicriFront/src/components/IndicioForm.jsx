// src/components/IndicioForm.jsx
import { useState } from "react";
import api from "../services/api";

export default function IndicioForm({ expedienteId, onCreated, token }) {
  const [descripcion, setDescripcion] = useState("");
  const [color, setColor] = useState("");
  const [tamano, setTamano] = useState("");
  const [peso, setPeso] = useState("");
  const [ubicacion, setUbicacion] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await api.post(
        "/indicios",
        {
          expediente_id: expedienteId,
          descripcion,
          color,
          tamano,
          peso: peso ? parseFloat(peso) : null,
          ubicacion,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`, // enviar JWT
          },
        }
      );

      // Limpiar formulario
      setDescripcion("");
      setColor("");
      setTamano("");
      setPeso("");
      setUbicacion("");

      if (onCreated) onCreated(); // recargar lista
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "Error al crear indicio");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="card" onSubmit={submit}>
      <h4>Nuevo Indicio</h4>

      <textarea
        className="mt-1"
        placeholder="Descripción"
        value={descripcion}
        onChange={(e) => setDescripcion(e.target.value)}
        required
      />

      <input
        type="text"
        className="mt-1"
        placeholder="Color"
        value={color}
        onChange={(e) => setColor(e.target.value)}
      />

      <input
        type="text"
        className="mt-1"
        placeholder="Tamaño"
        value={tamano}
        onChange={(e) => setTamano(e.target.value)}
      />

      <input
        type="number"
        step="0.01"
        className="mt-1"
        placeholder="Peso"
        value={peso}
        onChange={(e) => setPeso(e.target.value)}
      />

      <input
        type="text"
        className="mt-1"
        placeholder="Ubicación"
        value={ubicacion}
        onChange={(e) => setUbicacion(e.target.value)}
      />

      {error && <p style={{ color: "red" }}>{error}</p>}

      <button className="mt-2" type="submit" disabled={loading}>
        {loading ? "Agregando..." : "Agregar indicio"}
      </button>
    </form>
  );
}
