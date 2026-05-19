// Página de Mis Cafés — listado de catas con filtros
import { useState, useEffect, useMemo } from "react";
import { useAuth } from "@/context/AuthContext";
import { tastingService } from "@/services/tastingService";
import TastingModal from "@/components/tasting/TastingModal";
import TastingCard from "@/components/tasting/TastingCard";
import { FaFilter, FaSearch, FaTimes } from "react-icons/fa";
import {
  ORIGENES,
  PROCESOS,
  TUESTES,
  normalizeText,
} from "@/utils/coffeeConstants";
import "./MisCafesPage.css";

export default function MisCafesPage() {
  const { user } = useAuth();
  const [tastings, setTastings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  // Estados de filtros
  const [search, setSearch] = useState("");
  const [filterOrigen, setFilterOrigen] = useState("");
  const [filterProceso, setFilterProceso] = useState("");
  const [filterTueste, setFilterTueste] = useState("");
  const [filterMarca, setFilterMarca] = useState("");
  const [filterPuntuacion, setFilterPuntuacion] = useState("");
  const [sortBy, setSortBy] = useState("recientes");

  useEffect(() => {
    loadTastings();
  }, []);

  const loadTastings = async () => {
    try {
      const data = await tastingService.getUserTastings(user.id);
      setTastings(data);
    } catch (err) {
      console.error("Error cargando catas:", err);
    } finally {
      setLoading(false);
    }
  };

  // Coge solo la marcas y las pone en los filtros
  const uniqueValues = useMemo(() => {
    const marcas = [
      ...new Set(tastings.map((t) => t.cafes_master?.marca).filter(Boolean)),
    ].sort();
    return { marcas };
  }, [tastings]);

  // Filtra y ordena las catas según los filtros activos
  const filteredTastings = useMemo(() => {
    let result = [...tastings];

    // Buscador con soporte de acentos
    if (search) {
      const q = normalizeText(search);
      result = result.filter(
        (t) =>
          normalizeText(t.cafes_master?.nombre).includes(q) ||
          normalizeText(t.cafes_master?.marca).includes(q) ||
          normalizeText(t.cafes_master?.origen).includes(q),
      );
    }

    if (filterOrigen)
      result = result.filter((t) => t.cafes_master?.origen === filterOrigen);
    if (filterProceso)
      result = result.filter((t) => t.cafes_master?.proceso === filterProceso);
    if (filterTueste)
      result = result.filter((t) => t.cafes_master?.tueste === filterTueste);
    if (filterMarca)
      result = result.filter((t) => t.cafes_master?.marca === filterMarca);

    // Filtro por puntuación mínima
    if (filterPuntuacion) {
      result = result.filter((t) => t.puntuacion >= Number(filterPuntuacion));
    }

    // Ordenación
    switch (sortBy) {
      case "recientes":
        result.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        break;
      case "antiguas":
        result.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
        break;
      case "mayor_puntuacion":
        result.sort((a, b) => (b.puntuacion || 0) - (a.puntuacion || 0));
        break;
      case "menor_puntuacion":
        result.sort((a, b) => (a.puntuacion || 0) - (b.puntuacion || 0));
        break;
    }

    return result;
  }, [
    tastings,
    search,
    filterOrigen,
    filterProceso,
    filterTueste,
    filterMarca,
    filterPuntuacion,
    sortBy,
  ]);

  // Cuenta filtros activos para mostrar el badge
  const activeFiltersCount = [
    filterOrigen,
    filterProceso,
    filterTueste,
    filterMarca,
    filterPuntuacion,
  ].filter(Boolean).length;

  const resetFilters = () => {
    setSearch("");
    setFilterOrigen("");
    setFilterProceso("");
    setFilterTueste("");
    setFilterMarca("");
    setFilterPuntuacion("");
    setSortBy("recientes");
  };

  const handleTastingCreated = async () => {
    await loadTastings();
  };

  const handleTastingDeleted = (tastingId) => {
    setTastings((prev) => prev.filter((t) => t.id !== tastingId));
  };

  return (
    <div className="mis-cafes-page">
      <div className="mis-cafes-header">
        <h1 className="mis-cafes-title">Mis Cafés</h1>
        <button
          className="mis-cafes-new-btn"
          onClick={() => setShowModal(true)}
        >
          + Nueva cata
        </button>
      </div>

      {/* Buscador + botón filtros */}
      <div className="mis-cafes-search-row">
        <div className="mis-cafes-search-input-wrapper">
          <FaSearch className="mis-cafes-search-icon" />
          <input
            type="text"
            placeholder="Buscar por nombre, marca u origen..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="mis-cafes-search-input"
          />
          {search && (
            <button
              className="mis-cafes-search-clear"
              onClick={() => setSearch("")}
            >
              <FaTimes />
            </button>
          )}
        </div>
        <button
          className={`mis-cafes-filter-btn ${showFilters ? "active" : ""}`}
          onClick={() => setShowFilters(!showFilters)}
        >
          <FaFilter />
          {activeFiltersCount > 0 && (
            <span className="mis-cafes-filter-badge">{activeFiltersCount}</span>
          )}
        </button>
      </div>

      {/* Panel de filtros */}
      {showFilters && (
        <div className="mis-cafes-filters">
          <div className="mis-cafes-filters-grid">
            <div className="mis-cafes-filter-field">
              <label>Origen</label>
              <select
                value={filterOrigen}
                onChange={(e) => setFilterOrigen(e.target.value)}
              >
                <option value="">Todos</option>
                {ORIGENES.map((v) => (
                  <option key={v} value={v}>
                    {v}
                  </option>
                ))}
              </select>
            </div>
            <div className="mis-cafes-filter-field">
              <label>Proceso</label>
              <select
                value={filterProceso}
                onChange={(e) => setFilterProceso(e.target.value)}
              >
                <option value="">Todos</option>
                {PROCESOS.map((v) => (
                  <option key={v} value={v}>
                    {v}
                  </option>
                ))}
              </select>
            </div>
            <div className="mis-cafes-filter-field">
              <label>Tueste</label>
              <select
                value={filterTueste}
                onChange={(e) => setFilterTueste(e.target.value)}
              >
                <option value="">Todos</option>
                {TUESTS.map((v) => (
                  <option key={v} value={v}>
                    {v}
                  </option>
                ))}
              </select>
            </div>
            <div className="mis-cafes-filter-field">
              <label>Marca</label>
              <select
                value={filterMarca}
                onChange={(e) => setFilterMarca(e.target.value)}
              >
                <option value="">Todas</option>
                {uniqueValues.marcas.map((v) => (
                  <option key={v} value={v}>
                    {v}
                  </option>
                ))}
              </select>
            </div>
            <div className="mis-cafes-filter-field">
              <label>Puntuación mínima</label>
              <select
                value={filterPuntuacion}
                onChange={(e) => setFilterPuntuacion(e.target.value)}
              >
                <option value="">Cualquiera</option>
                <option value="1">1</option>
                <option value="2">2</option>
                <option value="3">3</option>
                <option value="4">4</option>
                <option value="5">5</option>
                <option value="6">6</option>
                <option value="7">7</option>
                <option value="8">8</option>
                <option value="9">9</option>
                <option value="10">10</option>
              </select>
            </div>
            <div className="mis-cafes-filter-field">
              <label>Ordenar por</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
              >
                <option value="recientes">Más recientes</option>
                <option value="antiguas">Más antiguas</option>
                <option value="mayor_puntuacion">Mayor puntuación</option>
                <option value="menor_puntuacion">Menor puntuación</option>
              </select>
            </div>
          </div>

          {/* Botón resetear filtros */}
          {activeFiltersCount > 0 && (
            <button className="mis-cafes-reset-btn" onClick={resetFilters}>
              <FaTimes /> Limpiar filtros
            </button>
          )}
        </div>
      )}

      {/* Contador de resultados */}
      {!loading && tastings.length > 0 && (
        <p className="mis-cafes-count">
          {filteredTastings.length} de {tastings.length} catas
        </p>
      )}

      {loading && <div className="mis-cafes-loading">Cargando catas...</div>}

      {!loading && tastings.length === 0 && (
        <div className="mis-cafes-empty">
          <p>☕</p>
          <p>Aún no tienes catas registradas.</p>
          <button
            className="tasting-btn-primary"
            onClick={() => setShowModal(true)}
          >
            Registrar mi primer café
          </button>
        </div>
      )}

      {!loading && tastings.length > 0 && filteredTastings.length === 0 && (
        <div className="mis-cafes-empty">
          <p>🔍</p>
          <p>No hay catas que coincidan con los filtros.</p>
          <button className="mis-cafes-reset-btn" onClick={resetFilters}>
            Limpiar filtros
          </button>
        </div>
      )}

      <div className="mis-cafes-grid">
        {filteredTastings.map((tasting) => (
          <TastingCard
            key={tasting.id}
            tasting={tasting}
            onDelete={handleTastingDeleted}
          />
        ))}
      </div>

      <button className="mis-cafes-fab" onClick={() => setShowModal(true)}>
        +
      </button>

      {showModal && (
        <TastingModal
          onClose={() => setShowModal(false)}
          onTastingCreated={handleTastingCreated}
        />
      )}
    </div>
  );
}
