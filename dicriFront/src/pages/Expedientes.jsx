import { useEffect, useState } from "react";
import api from "../services/api";
import ExpedienteForm from "../components/ExpedienteForm";
import ExpedienteDetail from "../components/ExpedienteDetail";

export default function Expedientes() {
  const [expedientes, setExpedientes] = useState([]);
  const [selectedId, setSelectedId] = useState(null);

  const loadExpedientes = async () => {
    try {
      const res = await api.get("/expedientes"); // Recupera desde la DB
      setExpedientes(res.data);
    } catch (err) {
      console.error("Error al cargar expedientes:", err);
    }
  };

  useEffect(() => {
    loadExpedientes();
  }, []);

  return (
    <div className="grid grid-2 full-page gap-2">
      {/* IZQUIERDA: Crear y listar expedientes */}
      <div className="center-vertical gap-1">
        <ExpedienteForm onCreated={loadExpedientes} />

        <div className="card" style={{ width: "100%" }}>
          <h3>Listado de Expedientes</h3>
          {expedientes.length === 0 && <p>No hay expedientes registrados</p>}
          {expedientes.map((exp) => (
            <div
              key={exp.id}
              className="hover cursor"
              style={{
                padding: ".7rem",
                borderRadius: "var(--radius)",
                backgroundColor: selectedId === exp.id ? "#f0f0f0" : "white",
              }}
              onClick={() => setSelectedId(exp.id)}
            >
              <strong>{exp.codigo_unico}</strong>
              <p style={{ color: "var(--text-muted)", fontSize: ".9rem" }}>
                {exp.descripcion}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* DERECHA: Detalle del expediente seleccionado */}
      <div className="center-all">
        {selectedId ? (
          <ExpedienteDetail id={selectedId} />
        ) : (
          <div className="card">Seleccione un expediente</div>
        )}
      </div>
    </div>
  );
}
