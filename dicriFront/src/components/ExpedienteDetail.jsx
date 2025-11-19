import { useEffect, useState } from "react";
import api from "../services/api";
import IndicioForm from "./IndicioForm";

export default function ExpedienteDetail({ id, user, onUpdated }) {
  const [expediente, setExpediente] = useState(null);
  const [justificacion, setJustificacion] = useState("");

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

  if (!id) return <div className="card p-4">Seleccione un expediente</div>;
  if (!expediente) return <div className="card p-4">Cargando...</div>;

  const estado = expediente.estado.toLowerCase();

  // ================= PERMISOS SEGÚN ESTADO ==================
  const puedeAgregarIndicios = estado === "en_registro";
  const puedePasarRevision = user.role !== "coordinador" && estado === "en_registro";
  const puedeAprobarRechazar = user.role === "coordinador" && estado === "revision";

  const handlePasarRevision = async () => {
    try {
      await api.put(`/expedientes/${id}/revision`);
      loadExpediente();
      if (onUpdated) onUpdated();
      alert("Expediente enviado a revisión.");
    } catch (err) {
      alert(err.response?.data?.message || "Error al enviar a revisión");
    }
  };

  const handleAprobar = async () => {
    try {
      await api.put(`/expedientes/${id}/approve`);
      loadExpediente();
      if (onUpdated) onUpdated();
      alert("Expediente aprobado.");
    } catch (err) {
      alert(err.response?.data?.message || "Error al aprobar expediente");
    }
  };

  const handleRechazar = async () => {
    if (!justificacion.trim()) return alert("Debe ingresar motivo del rechazo.");

    try {
      await api.put(`/expedientes/${id}/reject`, { razon_rechazo: justificacion });
      setJustificacion("");
      loadExpediente();
      if (onUpdated) onUpdated();
      alert("Expediente rechazado.");
    } catch (err) {
      alert(err.response?.data?.message || "Error al rechazar expediente");
    }
  };

  // ================= COLORES UI ==================
  const bgColor =
    estado === "revision"
      ? "bg-yellow-200"
      : estado === "aprobado"
      ? "bg-green-200"
      : estado === "rechazado"
      ? "bg-red-200"
      : "bg-white";

  return (
    <div className={`card p-4 rounded-md shadow-md ${bgColor}`}>
      <h3 className="text-lg font-semibold">{expediente.codigo_unico}</h3>
      <p className="text-gray-600 dark:text-gray-300">{expediente.descripcion}</p>

      {/* ---------- MOTIVO DE RECHAZO ----------- */}
      {estado === "rechazado" && expediente.razon_rechazo && (
        <div className="mt-3 p-3 bg-red-300 text-black rounded-md">
          <strong>Motivo del rechazo: </strong> {expediente.razon_rechazo}
        </div>
      )}

      <h4 className="mt-4 mb-2">Indicios</h4>

      {expediente.indicios.length === 0 && <p>No hay indicios</p>}

      {expediente.indicios.map((i) => (
        <div
          key={i.id}
          className="p-2 rounded-md bg-gray-50 dark:bg-gray-700 mb-1 transition"
        >
          {i.descripcion}
        </div>
      ))}

      {/* ========= FORMULARIO DE INDICIOS ========= */}
      {puedeAgregarIndicios ? (
        <IndicioForm
          expedienteId={id}
          onCreated={loadExpediente}
          token={user?.token}
          disabled={!puedeAgregarIndicios}
        />
      ) : (
        <p className="mt-2 text-sm italic text-gray-600">
          No se pueden agregar indicios en este estado.
        </p>
      )}

      <hr className="my-4" />

      {/* ========= ACCIONES DEL USUARIO ========= */}
      {puedePasarRevision && (
        <button
          onClick={handlePasarRevision}
          className="mt-2 px-4 py-2 bg-yellow-300 rounded-md font-semibold hover:bg-yellow-400"
        >
          Pasar a revisión
        </button>
      )}

      {/* ========= ACCIONES DEL COORDINADOR ========= */}
      {puedeAprobarRechazar && (
        <>
          <button
            onClick={handleAprobar}
            className="mt-2 mr-2 px-4 py-2 bg-green-300 rounded-md font-semibold hover:bg-green-400"
          >
            Aprobar expediente
          </button>

          <div className="mt-2">
            <input
              type="text"
              placeholder="Justificación de rechazo"
              value={justificacion}
              onChange={(e) => setJustificacion(e.target.value)}
              className="border px-2 py-1 rounded-md w-full mb-1"
            />
            <button
              onClick={handleRechazar}
              className="px-4 py-2 bg-red-300 rounded-md font-semibold hover:bg-red-400"
            >
              Rechazar expediente
            </button>
          </div>
        </>
      )}
    </div>
  );
}
