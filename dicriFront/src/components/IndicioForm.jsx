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

  const validarDatos = () => {
    if (!descripcion.trim()) return "La descripción es obligatoria";
    if (!color.trim()) return "El color es obligatorio";
    if (!tamano.trim()) return "El tamaño es obligatorio";
    if (!ubicacion.trim()) return "La ubicación es obligatoria";

    const pesoNum = parseFloat(peso);
    if (!peso || isNaN(pesoNum) || pesoNum <= 0) return "El peso debe ser un número mayor a 0";

    return null;
  };

  const submit = async (e) => {
    e.preventDefault();
    if (disabled) return;

    const mensajeError = validarDatos();
    if (mensajeError) {
      setError(mensajeError);
      return;
    }

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
          peso: parseFloat(peso),
          ubicacion,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // Limpiar campos
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
        placeholder="Descripción detallada del indicio"
        value={descripcion}
        disabled={disabled}
        onChange={(e) => setDescripcion(e.target.value)}
        required
      />

      <input
        type="text"
        placeholder="Color (ej: Rojo, Azul)"
        value={color}
        disabled={disabled}
        onChange={(e) => setColor(e.target.value)}
        required
      />

      <input
        type="text"
        placeholder="Tamaño (ej: 10x20cm)"
        value={tamano}
        disabled={disabled}
        onChange={(e) => setTamano(e.target.value)}
        required
      />

      <input
        type="number"
        step="0.01"
        placeholder="Peso en gramos (ej: 120.5)"
        value={peso}
        disabled={disabled}
        onChange={(e) => setPeso(e.target.value)}
        required
        min="0.01"
      />

      <input
        type="text"
        placeholder="Ubicación del hallazgo"
        value={ubicacion}
        disabled={disabled}
        onChange={(e) => setUbicacion(e.target.value)}
        required
      />

      {error && <p style={{ color: "red", fontWeight: "bold" }}>{error}</p>}

      <button type="submit" disabled={loading || disabled}>
        {loading ? "Agregando..." : "Agregar indicio"}
      </button>
    </form>
  );
}
