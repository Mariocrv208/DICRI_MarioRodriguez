import { useState } from "react";
import api from "../services/api";

export default function ExpedienteForm({ onCreated }) {
  const [codigo, setCodigo] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const validarDatos = () => {
    if (!codigo.trim()) return "El código es obligatorio";
    if (codigo.length < 3) return "El código debe tener al menos 3 caracteres";
    if (!/^[A-Za-z0-9_-]+$/.test(codigo))
      return "El código solo puede contener letras, números, guiones y guion bajo";

    if (!descripcion.trim()) return "La descripción es obligatoria";
    if (descripcion.length < 10)
      return "La descripción debe ser más detallada (mínimo 10 caracteres)";

    return null;
  };

  const submit = async (e) => {
    e.preventDefault();
    setError(null);

    const mensajeError = validarDatos();
    if (mensajeError) {
      setError(mensajeError);
      return;
    }

    setLoading(true);

    try {
      await api.post("/expedientes", {
        codigo_unico: codigo.trim(),
        descripcion: descripcion.trim(),
      });

      setCodigo("");
      setDescripcion("");
      onCreated && onCreated();
    } catch (err) {
      console.error("Error al crear expediente:", err);

      // Captura error de codigo duplicado
      if (err.response?.status === 409) {
        setError("El código de expediente ya existe. Prueba otro.");
      } else {
        setError(err.response?.data?.message || "Error al crear expediente");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="card" onSubmit={submit}>
      <h3>Nuevo Expediente</h3>

      <input
        className="mt-1"
        placeholder="Código único del expediente"
        value={codigo}
        disabled={loading}
        onChange={(e) => setCodigo(e.target.value)}
        required
      />

      <textarea
        className="mt-1"
        placeholder="Descripción del expediente"
        value={descripcion}
        disabled={loading}
        onChange={(e) => setDescripcion(e.target.value)}
        required
      />

      {error && <p style={{ color: "red", fontWeight: "bold" }}>{error}</p>}

      <button className="mt-2" disabled={loading}>
        {loading ? "Creando..." : "Crear"}
      </button>
    </form>
  );
}
