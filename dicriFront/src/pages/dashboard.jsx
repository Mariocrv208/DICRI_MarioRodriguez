import { useEffect, useState } from "react";
import api from "../services/api";

export default function Dashboard() {
  const [stats, setStats] = useState(null);

  const load = async () => {
    const a = await api.get("/expedientes/count");
    const b = await api.get("/indicios/count");
    setStats({ exp: a.data.total, ind: b.data.total });
  };

  useEffect(() => { load(); }, []);

  if (!stats) return <div className="center-all full-page">Cargando...</div>;

  return (
    <div className="content-centered gap-2">
      <h2 style={{ marginBottom: "1rem" }}>Dashboard General</h2>

      <div className="grid grid-2" style={{ width: "60%" }}>
        <div className="card center-horizontal">
          <div>
            <h3 style={{ textAlign: "center" }}>Total Expedientes</h3>
            <p style={{ fontSize: "2rem", textAlign: "center" }}>
              📁 {stats.exp}
            </p>
          </div>
        </div>

        <div className="card center-horizontal">
          <div>
            <h3 style={{ textAlign: "center" }}>Total Indicios</h3>
            <p style={{ fontSize: "2rem", textAlign: "center" }}>
              🔍 {stats.ind}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
