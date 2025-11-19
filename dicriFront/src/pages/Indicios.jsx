// src/pages/Indicios.jsx
import { useEffect, useState } from "react";
import api from "../services/api";
import IndicioForm from "../components/IndicioForm";

export default function Indicios() {
  const [indicios, setIndicios] = useState([]);
  const [token, setToken] = useState(""); // Token JWT
  const [selectedIndicio, setSelectedIndicio] = useState(null); // Detalle del indicio
  const expedienteId = 1; // Cambiar según expediente actual

  // Cargar lista de indicios
  const loadIndicios = async () => {
    try {
      const res = await api.get("/indicios", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setIndicios(res.data);
    } catch (err) {
      console.error("Error cargando indicios:", err.response?.data || err.message);
    }
  };

  // Cargar detalle de un indicio por ID
  const loadIndicioDetail = async (id) => {
    try {
      const res = await api.get(`/indicios/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSelectedIndicio(res.data);
    } catch (err) {
      console.error("Error cargando detalle del indicio:", err.response?.data || err.message);
    }
  };

  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    if (storedToken) setToken(storedToken);
    if (token) loadIndicios();
  }, [token]);

  return (
    <div className="content-centered gap-2">

      {/* Formulario de nuevo indicio */}
      <div className="card" style={{ width: "60%" }}>
        <h3 style={{ textAlign: "center" }}>Agregar Indicio</h3>
        <IndicioForm
          expedienteId={expedienteId}
          onCreated={loadIndicios}
          token={token}
        />
      </div>

      {/* Lista de indicios */}
      <div className="card" style={{ width: "60%" }}>
        <h3 style={{ textAlign: "center" }}>Listado de Indicios</h3>
        {indicios.length === 0 && <p>No hay indicios registrados</p>}
        {indicios.map((i) => (
          <div
            key={i.id}
            className="hover"
            style={{ padding: ".7rem", cursor: "pointer" }}
            onClick={() => loadIndicioDetail(i.id)}
          >
            <strong>ID #{i.id}</strong>
            <p style={{ color: "var(--text-muted)" }}>{i.descripcion}</p>
          </div>
        ))}
      </div>

      {/* Panel de detalle del indicio */}
      {selectedIndicio && (
        <div className="card" style={{ width: "60%" }}>
          <h3 style={{ textAlign: "center" }}>Detalle del Indicio</h3>
          <p><strong>ID:</strong> {selectedIndicio.id}</p>
          <p><strong>Descripción:</strong> {selectedIndicio.descripcion}</p>
          <p><strong>Color:</strong> {selectedIndicio.color || "-"}</p>
          <p><strong>Tamaño:</strong> {selectedIndicio.tamano || "-"}</p>
          <p><strong>Peso:</strong> {selectedIndicio.peso != null ? selectedIndicio.peso : "-"}</p>
          <p><strong>Ubicación:</strong> {selectedIndicio.ubicacion || "-"}</p>
          <p><strong>Técnico:</strong> {selectedIndicio.tecnico.nombre}</p>
          <p><strong>Expediente:</strong> {selectedIndicio.expediente.codigo_unico}</p>
          <button onClick={() => setSelectedIndicio(null)}>Cerrar</button>
        </div>
      )}

    </div>
  );
}
