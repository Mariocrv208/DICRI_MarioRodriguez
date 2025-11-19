import { useEffect, useState } from "react";
import api from "../services/api";
import IndicioForm from "./IndicioForm";

export default function ExpedienteDetail({ id }) {
  const [expediente, setExpediente] = useState(null);

  const loadExpediente = async () => {
    try {
      const res = await api.get(`/expedientes/${id}`);
      setExpediente({
        ...res.data.expediente,
        indicios: res.data.indicios,
      });
    } catch (err) {
      console.error("Error al cargar detalle del expediente:", err);
    }
  };

  useEffect(() => {
    if (id) loadExpediente();
  }, [id]);

  if (!id) return <div className="card">Seleccione un expediente</div>;
  if (!expediente) return <div className="card">Cargando...</div>;

  return (
    <div className="card">
      <h3>{expediente.codigo_unico}</h3>
      <p style={{ color: "var(--text-muted)" }}>{expediente.descripcion}</p>

      <h4 style={{ marginTop: "1rem" }}>Indicios</h4>
      {expediente.indicios.length === 0 && <p>No hay indicios</p>}
      {expediente.indicios.map((i) => (
        <div key={i.id} className="hover" style={{ padding: ".5rem" }}>
          {i.descripcion}
        </div>
      ))}

      <IndicioForm expedienteId={id} onCreated={loadExpediente} />
    </div>
  );
}
