import { useState } from "react";
import api from "../services/api";

export default function IndicioForm({ expedienteId, onCreated, token, disabled = false }) {
  const [descripcion, setDescripcion] = useState("");
  const [color, setColor] = useState("");
  const [tamano, setTamano] = useState("");
  const [peso, setPeso] = useState("");
  const [ubicacion, setUbicacion] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const submit = async (e) => {
    e.preventDefault();
    if (disabled) return;

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
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setDescripcion("");
      setColor("");
      setTamano("");
      setPeso("");
      setUbicacion("");

      onCreated && onCreated();
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
        placeholder="Descripción"
        value={descripcion}
        disabled={disabled}
        onChange={(e) => setDescripcion(e.target.value)}
        required
      />

      <input
        type="text"
        placeholder="Color"
        value={color}
        disabled={disabled}
        onChange={(e) => setColor(e.target.value)}
      />

      <input
        type="text"
        placeholder="Tamaño"
        value={tamano}
        disabled={disabled}
        onChange={(e) => setTamano(e.target.value)}
      />

      <input
        type="number"
        step="0.01"
        placeholder="Peso"
        value={peso}
        disabled={disabled}
        onChange={(e) => setPeso(e.target.value)}
      />

      <input
        type="text"
        placeholder="Ubicación"
        value={ubicacion}
        disabled={disabled}
        onChange={(e) => setUbicacion(e.target.value)}
      />

      {error && <p style={{ color: "red" }}>{error}</p>}

      <button type="submit" disabled={loading || disabled}>
        {loading ? "Agregando..." : "Agregar indicio"}
      </button>
    </form>
  );
}
