import { useEffect, useState } from "react";
import api from "../services/api";
import { Bar, Pie } from "react-chartjs-2";
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement } from "chart.js";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement);

export default function Dashboard() {
  const [expEstado, setExpEstado] = useState([]);
  const [indExp, setIndExp] = useState([]);
  const [expUsuario, setExpUsuario] = useState([]);
  const [expCoord, setExpCoord] = useState([]);
  const [expMes, setExpMes] = useState([]);
  const [mesSeleccionado, setMesSeleccionado] = useState(""); // YYYY-MM

  const loadData = async () => {
    const eEstado = await api.get("/dashboard/expedientes-estado");
    const iExp = await api.get("/dashboard/indicios-expediente");
    const eUsu = await api.get("/dashboard/expedientes-usuario");
    const eCoord = await api.get("/dashboard/expedientes-coordinador");
    const eMes = await api.get("/dashboard/expedientes-mes", { params: { mes: mesSeleccionado } });

    setExpEstado(eEstado.data);
    setIndExp(iExp.data);
    setExpUsuario(eUsu.data);
    setExpCoord(eCoord.data);
    setExpMes(eMes.data);
  };

  useEffect(() => { loadData(); }, [mesSeleccionado]);

  return (
    <div style={{ padding: "2rem", marginTop: "120vh" }}>
      <h2 style={{ marginBottom: "1rem" }}>Dashboard General</h2>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(400px, 1fr))",
          gap: "1rem",
        }}
      >
        {/* Expedientes por estado */}
        <div
          className="card"
          style={{
            padding: "1rem",
            boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
            borderRadius: "10px",
          }}
        >
          <h3 style={{ textAlign: "center" }}>Expedientes por Estado</h3>
          <Pie
            data={{
              labels: expEstado.map(e => e.estado),
              datasets: [{
                data: expEstado.map(e => e.total),
                backgroundColor: ["#FACC15", "#10B981", "#EF4444", "#E5E7EB"]
              }]
            }}
          />
        </div>

        {/* Indicios por expediente */}
        <div
          className="card"
          style={{
            padding: "1rem",
            boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
            borderRadius: "10px",
          }}
        >
          <h3 style={{ textAlign: "center" }}>Indicios por Expediente</h3>
          <Bar
            data={{
              labels: indExp.map(i => i.codigo_unico),
              datasets: [{
                label: "Cantidad de indicios",
                data: indExp.map(i => i.total_indicios),
                backgroundColor: "#3B82F6"
              }]
            }}
            options={{ indexAxis: 'y' }}
          />
        </div>

        {/* Expedientes por usuario */}
        <div
          className="card"
          style={{
            padding: "1rem",
            boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
            borderRadius: "10px",
          }}
        >
          <h3 style={{ textAlign: "center" }}>Expedientes por Usuario</h3>
          <Bar
            data={{
              labels: expUsuario.map(u => u.nombre),
              datasets: [{
                label: "Cantidad de expedientes",
                data: expUsuario.map(u => u.total_expedientes),
                backgroundColor: "#6366F1"
              }]
            }}
          />
        </div>

        {/* Expedientes autorizados/rechazados por coordinador */}
        <div
          className="card"
          style={{
            padding: "1rem",
            boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
            borderRadius: "10px",
          }}
        >
          <h3 style={{ textAlign: "center" }}>Expedientes Aprobados/Rechazados por Coordinador</h3>
          <Bar
            data={{
              labels: expCoord.map(c => c.coordinador),
              datasets: [
                { label: "Aprobados", data: expCoord.map(c => c.aprobados), backgroundColor: "#10B981" },
                { label: "Rechazados", data: expCoord.map(c => c.rechazados), backgroundColor: "#EF4444" }
              ]
            }}
          />
        </div>

        {/* Expedientes por mes */}
        <div
          className="card"
          style={{
            padding: "1rem",
            boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
            borderRadius: "10px",
          }}
        >
          <h3 style={{ textAlign: "center" }}>Expedientes por Mes</h3>
          <select value={mesSeleccionado} onChange={e => setMesSeleccionado(e.target.value)} style={{ marginBottom: "1rem", width: "100%", padding: "0.5rem" }}>
            <option value="">Seleccionar mes</option>
            <option value="2025-11">Noviembre 2025</option>
            <option value="2025-10">Octubre 2025</option>
            <option value="2025-09">Septiembre 2025</option>
            <option value="2025-08">Agosto 2025</option>
          </select>
          <Bar
            data={{
              labels: expMes.map(m => m.mes),
              datasets: [{ label: "Cantidad de expedientes", data: expMes.map(m => m.total), backgroundColor: "#F59E0B" }]
            }}
          />
        </div>
      </div>
    </div>
  );
}
