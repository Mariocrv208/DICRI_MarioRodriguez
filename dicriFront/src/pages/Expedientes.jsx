import { useEffect, useState } from "react";
import api from "../services/api";
import ExpedienteForm from "../components/ExpedienteForm";
import ExpedienteDetail from "../components/ExpedienteDetail";

export default function Expedientes() {
  const [expedientes, setExpedientes] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [user, setUser] = useState(null); // Usuario logeado

  const loadExpedientes = async () => {
    try {
      const res = await api.get("/expedientes");
      let data = res.data.expedientes || res.data;

      if (res.data.user) setUser(res.data.user);

      // ⛔ Filtrar si el usuario es coordinador
      if (res.data.user?.role === "coordinador") {
        data = data.filter(exp => exp.estado !== "en_registro");
      }

      setExpedientes(data);
    } catch (err) {
      console.error("Error al cargar expedientes:", err);
    }
  };

  useEffect(() => {
    loadExpedientes();
  }, []);

  // Color de fila según estado (sólido, sin aclarado)
  const getRowStyle = (exp) => {
    let background = "#d3d1ddff"; // por defecto para EN_REGISTRO
    switch (exp.estado) {
      case "revision":
        background = "#FFD700"; // amarillo sólido
        break;
      case "aprobado":
        background = "#008000"; // verde sólido
        break;
      case "rechazado":
        background = "#FF0000"; // rojo sólido
        break;
    }
    return {
      background,
      cursor: "pointer",
      transition: "0.2s",
      outline: selectedId === exp.id ? "2px solid #3B82F6" : "none",
      color: exp.estado === "aprobado" || exp.estado === "rechazado" ? "#fff" : "#000", // contraste para texto
    };
  };

  const getEstadoTexto = (estado) => {
    switch (estado) {
      case "EN_REGISTRO":
        return "En registro";
      case "revision":
        return "En revisión";
      case "aprobado":
        return "Aprobado";
      case "rechazado":
        return "Rechazado";
      default:
        return estado;
    }
  };

  return (
    <div style={{ display: "flex", gap: "1rem", padding: "2rem", height: "100%" }}>
      {/* IZQUIERDA: Crear y listar expedientes */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "1rem" }}>
        <ExpedienteForm onCreated={loadExpedientes} />

        <div
          style={{
            flex: 1,
            overflowY: "auto",
            padding: "1rem",
            borderRadius: "10px",
            boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
            backgroundColor: "#383646ff",
          }}
        >
          <h3 style={{ marginBottom: "1rem", color: "black" }}>Listado de Expedientes</h3>

          {expedientes.length === 0 && <p>No hay expedientes registrados</p>}

          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ backgroundColor: "#1f2937", color: "#fff" }}>
                <th style={{ padding: "0.7rem", textAlign: "left" }}>Código / Descripción</th>
                <th style={{ padding: "0.7rem", textAlign: "left" }}>Estado</th>
              </tr>
            </thead>
            <tbody>
              {expedientes.map((exp) => (
                <tr
                  key={exp.id}
                  onClick={() => setSelectedId(exp.id)}
                  style={getRowStyle(exp)}
                  onMouseEnter={(e) => e.currentTarget.style.opacity = "0.9"}
                  onMouseLeave={(e) => e.currentTarget.style.opacity = "1"}
                >
                  <td style={{ padding: "0.7rem" }}>
                    <strong>{exp.codigo_unico}</strong>
                    <p style={{ fontSize: "0.85rem" }}>{exp.descripcion}</p>
                  </td>
                  <td style={{ padding: "0.7rem", fontWeight: "600" }}>{getEstadoTexto(exp.estado)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* DERECHA: Detalle del expediente */}
      <div style={{ flex: 1 }}>
        {selectedId && user ? (
          <ExpedienteDetail
            id={selectedId}
            user={user}
            onUpdated={loadExpedientes}
          />
        ) : (
          <div
            style={{
              padding: "1rem",
              borderRadius: "10px",
              boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
              backgroundColor: "#f9f9f9",
            }}
          >
            Seleccione un expediente
          </div>
        )}
      </div>
    </div>
  );
}
