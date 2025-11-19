import { useState } from "react";
import api from "../services/api";

export default function ExpedienteForm({ onCreated }) {
  const [codigo, setCodigo] = useState("");
  const [descripcion, setDescripcion] = useState("");

  const submit = async (e) => {
    e.preventDefault();
    try {
      await api.post("/expedientes", {
        codigo_unico: codigo,
        descripcion,
      });
      setCodigo("");
      setDescripcion("");
      if (onCreated) onCreated(); // Refresca la lista
    } catch (err) {
      console.error("Error al crear expediente:", err);
    }
  };

  return (
    <form className="card" onSubmit={submit}>
      <h3>Nuevo Expediente</h3>
      <input
        className="mt-1"
        placeholder="Código único"
        value={codigo}
        onChange={(e) => setCodigo(e.target.value)}
      />
      <textarea
        className="mt-1"
        placeholder="Descripción del expediente"
        value={descripcion}
        onChange={(e) => setDescripcion(e.target.value)}
      />
      <button className="mt-2">Crear</button>
    </form>
  );
}
