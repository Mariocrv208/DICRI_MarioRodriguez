// src/pages/Indicios.jsx
import { useEffect, useState } from "react";
import api from "../services/api";

export default function Indicios() {
  const [indicios, setIndicios] = useState([]);
  const [filteredIndicios, setFilteredIndicios] = useState([]);
  const [selectedIndicio, setSelectedIndicio] = useState(null);
  const [token, setToken] = useState("");
  const [searchCodigo, setSearchCodigo] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Cargar todos los indicios
  const loadIndicios = async () => {
    try {
      const res = await api.get("/indicios", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setIndicios(res.data);
      setFilteredIndicios(res.data);
    } catch (err) {
      console.error("Error cargando indicios:", err.response?.data || err.message);
    }
  };

  // Filtrar por código de expediente
  const handleSearch = async () => {
    try {
        let url = "/indicios";
        if (searchCodigo) {
        url += `?expedienteCodigo=${encodeURIComponent(searchCodigo)}`;
        }
        const res = await api.get(url, {
        headers: { Authorization: `Bearer ${token}` },
        });
        setFilteredIndicios(res.data);
        setCurrentPage(1);
        setSelectedIndicio(null);
    } catch (err) {
        console.error("Error filtrando indicios:", err.response?.data || err.message);
    }
    };

  // Mostrar detalle al hacer click
  const handleClickIndicio = (indicio) => {
    setSelectedIndicio(indicio);
  };

  // Paginación
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredIndicios.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredIndicios.length / itemsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    if (storedToken) setToken(storedToken);
  }, []);

  useEffect(() => {
    if (token) loadIndicios();
  }, [token]);

  return (
    <div className="content-centered gap-4" style={{ padding: "2rem" }}>
      {/* Filtro de búsqueda */}
      <div className="card" style={{ width: "80%", padding: "1rem" }}>
        <h3>Filtrar Indicios por Código de Expediente</h3>
        <div style={{ display: "flex", gap: "1rem", marginTop: "0.5rem" }}>
          <input
            type="text"
            placeholder="Código de expediente"
            value={searchCodigo}
            onChange={(e) => setSearchCodigo(e.target.value)}
            style={{ flex: 1, padding: "0.5rem", borderRadius: "5px", border: "1px solid #ccc" }}
          />
          <button
            onClick={handleSearch}
            style={{
              padding: "0.5rem 1rem",
              backgroundColor: "#1f2937",
              color: "#fff",
              border: "none",
              borderRadius: "5px",
              cursor: "pointer",
            }}
          >
            Buscar
          </button>
        </div>
      </div>

      {/* Tabla de indicios */}
      <div className="card" style={{ width: "80%", overflowX: "auto", padding: "1rem", boxShadow: "0 4px 8px rgba(0,0,0,0.1)" }}>
        <h3 style={{ textAlign: "center", marginBottom: "1rem" }}>Listado de Indicios</h3>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ backgroundColor: "#1f2937", color: "#fff" }}>
              <th style={{ padding: "0.7rem", textAlign: "left" }}>Expediente / Indicio</th>
              <th style={{ padding: "0.7rem", textAlign: "left" }}>Descripción</th>
              <th style={{ padding: "0.7rem", textAlign: "left" }}>Técnico</th>
            </tr>
          </thead>
          <tbody>
            {currentItems.map((i) => (
              <tr
                key={i.id}
                onClick={() => handleClickIndicio(i)}
                style={{
                  cursor: "pointer",
                  borderBottom: "1px solid #e5e7eb",
                  transition: "background-color 0.2s",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#f3f4f6")}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
              >
                <td style={{ padding: "0.7rem" }}>
                  {i.expediente_codigo}, Indicio {i.id}
                </td>
                <td style={{ padding: "0.7rem" }}>{i.descripcion}</td>
                <td style={{ padding: "0.7rem" }}>{i.tecnico_nombre}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Paginación */}
        <div style={{ marginTop: "1rem", display: "flex", justifyContent: "center", gap: "0.5rem" }}>
          {Array.from({ length: totalPages }, (_, idx) => (
            <button
              key={idx + 1}
              onClick={() => paginate(idx + 1)}
              style={{
                padding: "0.4rem 0.8rem",
                borderRadius: "5px",
                border: "1px solid #ccc",
                backgroundColor: currentPage === idx + 1 ? "#1f2937" : "#fff",
                color: currentPage === idx + 1 ? "#fff" : "#000",
                cursor: "pointer",
              }}
            >
              {idx + 1}
            </button>
          ))}
        </div>
      </div>

      {/* Detalle del indicio */}
      {selectedIndicio && (
        <div className="card" style={{ width: "80%", padding: "1rem", marginTop: "1rem", boxShadow: "0 4px 12px rgba(0,0,0,0.15)" }}>
          <h3>Detalle del Indicio</h3>
          <p><strong>ID:</strong> {selectedIndicio.id}</p>
          <p><strong>Expediente:</strong> {selectedIndicio.expediente_codigo}</p>
          <p><strong>Descripción:</strong> {selectedIndicio.descripcion}</p>
          <p><strong>Color:</strong> {selectedIndicio.color || "-"}</p>
          <p><strong>Tamaño:</strong> {selectedIndicio.tamano || "-"}</p>
          <p><strong>Peso:</strong> {selectedIndicio.peso || "-"}</p>
          <p><strong>Ubicación:</strong> {selectedIndicio.ubicacion || "-"}</p>
          <p><strong>Técnico:</strong> {selectedIndicio.tecnico_nombre}</p>
        </div>
      )}
    </div>
  );
}
