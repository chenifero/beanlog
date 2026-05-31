// Página del mapa de cafeterías
// Muestra las cafeterías en un mapa de Mapbox
// El usuario puede añadir nuevas cafeterías

import { useState, useEffect } from "react";
import { coffeeShopService } from "@/services/coffeeShopService";
import { MapContainer, TileLayer, Marker, useMap } from "react-leaflet";
import { useAuth } from "@/context/AuthContext";
import { postService } from "@/services/postService";
import MentionInput from "@/components/ui/MentionInput";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "./MapaPage.css";
import { FaChair } from "react-icons/fa";
import { FaChevronRight } from "react-icons/fa6";
import { coffeeShopStatusService } from "@/services/coffeeShopStatusService";

function createMarkerIcon(color = "#c349ee") {
  return L.divIcon({
    html: `
      <div style="width:40px;height:50px;display:flex;flex-direction:column;align-items:center;justify-content:flex-start;">
        <div style="width:36px;height:36px;background:${color};border-radius:50% 50% 50% 0;transform:rotate(-45deg);display:flex;align-items:center;justify-content:center;box-shadow:0 2px 8px rgba(0,0,0,0.3);">
          <svg style="transform:rotate(45deg)" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 640 512" fill="white">
            <path d="M192 384h192c53 0 96-43 96-96h32c70.6 0 128-57.4 128-128S582.6 32 512 32H120c-13.3 0-24 10.7-24 24v232c0 53 43 96 96 96zM512 96c35.3 0 64 28.7 64 64s-28.7 64-64 64h-32V96h32zm47.7 384H48.3c-47.6 0-61-64-36-64h583.4c25 0 11.8 64-36 64z"/>
          </svg>
        </div>
      </div>`,
    className: "",
    iconSize: [40, 50],
    iconAnchor: [20, 46],
  });
}

const STATUS_COLORS = {
  want_to_go: "#F5A623",
  visited: "#52C97A",
  default: "#c349ee"
};

function FlyTo({ center, zoom }) {
  const map = useMap();
  useEffect(() => {
    if (center) map.flyTo(center, zoom ?? 14);
  }, [center, zoom, map]);
  return null;
}

function LocateUser() {
  const map = useMap();
  useEffect(() => {
    navigator.geolocation?.getCurrentPosition((pos) => {
      map.flyTo([pos.coords.latitude, pos.coords.longitude], 12);
    });
  }, [map]);
  return null;
}

function Carrusel({ fotos }) {
  const [idx, setIdx] = useState(0);
  return (
    <div className="mapa-carrusel">
      <img src={fotos[idx]} alt={`foto-${idx}`} className="mapa-detail-foto" />
      {fotos.length > 1 && (
        <>
          <button
            className="mapa-carrusel-btn left"
            onClick={() => setIdx((i) => (i - 1 + fotos.length) % fotos.length)}
          >
            ‹
          </button>
          <button
            className="mapa-carrusel-btn right"
            onClick={() => setIdx((i) => (i + 1) % fotos.length)}
          >
            ›
          </button>
          <div className="mapa-carrusel-dots">
            {fotos.map((_, i) => (
              <span
                key={i}
                className={`dot${i === idx ? " active" : ""}`}
                onClick={() => setIdx(i)}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export default function MapaPage() {
  const [coffeeShops, setCoffeeShops] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedShop, setSelectedShop] = useState(null);
  const [loading, setLoading] = useState(true);
  const [flyTo, setFlyTo] = useState(null);
  const { user } = useAuth();

  // Foto de la cafetería
  const [fotoFiles, setFotoFiles] = useState([]);
  const [fotoPreviews, setFotoPreviews] = useState([]);

  const [userStatuses, setUserStatuses] = useState({});
  const [activeFilters, setActiveFilters] = useState([
    "default",
    "want_to_go",
    "visited",
  ]);

  const toggleFilter = (filter) => {
    setActiveFilters((prev) =>
      prev.includes(filter)
        ? prev.length === 1
          ? prev
          : prev.filter((f) => f !== filter)
        : [...prev, filter],
    );
  };

  // Form de nueva cafetería
  const [formData, setFormData] = useState({
    nombre: "",
    valoracion: "",
    notas: "",
    location: "",
    lat: null,
    lng: null,
    ciudad: "",
    pais: "",
  });
  const [locationSuggestions, setLocationSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const loadCoffeeShops = async () => {
    try {
      const data = await coffeeShopService.getCoffeeShops();
      setCoffeeShops(data);
      const statuses = await coffeeShopStatusService.getUserStatuses(user.id);
      setUserStatuses(statuses);
    } catch (err) {
      console.error("Error cargando cafeterías:", err);
    } finally {
      setLoading(false);
    }
  };

  // Foto de la cafetería
  const handleFotoChange = (e) => {
    const newFiles = Array.from(e.target.files).slice(0, 5 - fotoFiles.length);
    const newPreviews = newFiles.map((f) => URL.createObjectURL(f));
    setFotoFiles((prev) => [...prev, ...newFiles].slice(0, 5));
    setFotoPreviews((prev) => [...prev, ...newPreviews].slice(0, 5));
  };

  useEffect(() => {
    loadCoffeeShops();
  }, []);

  // Autocomplete de ubicación con Photon
  useEffect(() => {
    if (formData.location.length < 2) {
      setLocationSuggestions([]);
      setShowSuggestions(false);
      return;
    }
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(
          `https://photon.komoot.io/api/?q=${encodeURIComponent(formData.location)}&limit=7&layer=house&layer=street&layer=locality&layer=city`,
        );
        const data = await res.json();
        const suggestions = (data.features || []).map((f) => {
          const p = f.properties;
          let name = p.name;
          if (p.type === "house") {
            name =
              p.street && p.housenumber
                ? `${p.street} ${p.housenumber}`
                : p.street || p.name;
          }
          const parts = [name];
          if (p.city && p.city !== name) parts.push(p.city);
          if (p.country) parts.push(p.country);
          return {
            label: parts.filter(Boolean).join(", "),
            lat: f.geometry.coordinates[1],
            lng: f.geometry.coordinates[0],
            ciudad: p.city || p.name,
            pais: p.country,
          };
        });
        setLocationSuggestions(suggestions);
        setShowSuggestions(suggestions.length > 0);
      } catch (err) {
        console.error("[Photon] Error:", err);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [formData.location]);

  const handleSelectLocation = (suggestion) => {
    setFormData((p) => ({
      ...p,
      location: suggestion.label,
      lat: suggestion.lat,
      lng: suggestion.lng,
      ciudad: suggestion.ciudad,
      pais: suggestion.pais,
    }));
    setShowSuggestions(false);
    setLocationSuggestions([]);

    // Centra el mapa en la ubicación seleccionada
    setFlyTo([suggestion.lat, suggestion.lng]);
  };

  const handleSave = async () => {
    if (!formData.nombre) {
      setError("El nombre es obligatorio");
      return;
    }
    if (!formData.lat || !formData.lng) {
      setError("Selecciona una ubicación");
      return;
    }

    setSaving(true);
    setError("");
    try {
      let foto_urls = [];
      if (fotoFiles.length > 0) {
        foto_urls = await coffeeShopService.uploadFotos(fotoFiles);
      }
      const shop = await coffeeShopService.createCoffeeShop({
        nombre: formData.nombre,
        lat: formData.lat,
        lng: formData.lng,
        valoracion: formData.valoracion || null,
        notas: formData.notas || null,
        ciudad: formData.ciudad,
        pais: formData.pais,
        foto_urls: foto_urls || null,
      });
      setCoffeeShops((prev) => [...prev, shop]);
      try {
        const content = [
          formData.notas || "",
          formData.valoracion ? `Valoración: ${formData.valoracion}/10` : "",
        ]
          .filter(Boolean)
          .join("\n");

        await postService.createPost(user.id, {
          type: "visit",
          coffeeShopId: shop.id,
          content,
          imageUrls: foto_urls,
          rating: formData.valoracion || null,
        });
      } catch (postErr) {
        console.warn("Post no creado:", postErr);
      }
      setShowModal(false);
      setFotoFiles([]);
      setFotoPreviews([]);
      setFormData({
        nombre: "",
        valoracion: "",
        notas: "",
        location: "",
        lat: null,
        lng: null,
        ciudad: "",
        pais: "",
      });
    } catch (err) {
      setError("Error al guardar la cafetería");
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const handleRemoveFoto = (index) => {
    setFotoFiles((prev) => prev.filter((_, i) => i !== index));
    setFotoPreviews((prev) => prev.filter((_, i) => i !== index));
  };

  // Abre Google Maps o Apple Maps
  const openInMaps = (shop) => {
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    const url = isIOS
      ? `maps://maps.apple.com/?q=${shop.nombre}&ll=${shop.lat},${shop.lng}`
      : `https://www.google.com/maps/search/?api=1&query=${shop.lat},${shop.lng}`;
    window.open(url, "_blank");
  };

  return (
    <div className={`mapa-page${showModal ? " modal-open" : ""}`}>
      {/* Mapa */}
      <MapContainer
        center={[40.4168, -3.7038]}
        zoom={5}
        className="mapa-container"
      >
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
          attribution="&copy; OpenStreetMap &copy; CARTO"
        />
        <LocateUser />
        {flyTo && <FlyTo center={flyTo} zoom={14} />}
        {coffeeShops
          .filter((shop) => {
            const status = userStatuses[shop.id] || "default";
            return activeFilters.includes(status);
          })
          .map((shop) => (
            <Marker
              key={shop.id}
              position={[shop.lat, shop.lng]}
              icon={createMarkerIcon(
                STATUS_COLORS[userStatuses[shop.id]] || STATUS_COLORS.default,
              )}
              eventHandlers={{ click: () => setSelectedShop(shop) }}
            />
          ))}
      </MapContainer>

      <div className="mapa-leyenda">
        {[
          { key: "default", color: "#c349ee", label: "Mis cafeterías" },
          { key: "want_to_go", color: "#F5A623", label: "Quiero ir" },
          { key: "visited", color: "#52C97A", label: "Visitada" },
        ].map(({ key, color, label }) => (
          <span
            key={key}
            className={`mapa-leyenda-item ${activeFilters.includes(key) ? "active" : "inactive"}`}
            onClick={() => toggleFilter(key)}
          >
            <span className="mapa-leyenda-dot" style={{ background: color }} />
            {label}
          </span>
        ))}
      </div>

      {/* Botón añadir cafetería */}
      <button className="mapa-add-btn" onClick={() => setShowModal(true)}>
        + Añadir cafetería
      </button>

      {/* Modal de nueva cafetería */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="mapa-modal" onClick={(e) => e.stopPropagation()}>
            <div className="mapa-modal-header">
              <h3>Nueva cafetería</h3>
              <button
                className="modal-close"
                onClick={() => setShowModal(false)}
              >
                ✕
              </button>
            </div>
            <div className="mapa-modal-body">
              <div className="mapa-field">
                <label>Nombre *</label>
                <input
                  type="text"
                  placeholder="Ej: Nomad Coffee"
                  value={formData.nombre}
                  onChange={(e) =>
                    setFormData((p) => ({ ...p, nombre: e.target.value }))
                  }
                />
              </div>

              <div className="mapa-field">
                <label>
                  Fotos {fotoFiles.length > 0 ? `(${fotoFiles.length}/5)` : ""}
                </label>
                {fotoFiles.length < 5 && (
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleFotoChange}
                  />
                )}
                {fotoPreviews.length > 0 && (
                  <div className="mapa-fotos-preview">
                    {fotoPreviews.map((src, i) => (
                      <div key={i} className="mapa-foto-thumb">
                        <img src={src} alt={`foto-${i}`} />
                        <button
                          className="mapa-foto-remove"
                          onClick={() => handleRemoveFoto(i)}
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="mapa-field">
                <label>Ubicación *</label>
                <div className="mapa-location-wrapper">
                  <input
                    type="text"
                    placeholder="Busca la dirección..."
                    value={formData.location}
                    autoComplete="off"
                    onChange={(e) =>
                      setFormData((p) => ({ ...p, location: e.target.value }))
                    }
                    onBlur={() =>
                      setTimeout(() => setShowSuggestions(false), 150)
                    }
                  />
                  {showSuggestions && locationSuggestions.length > 0 && (
                    <ul className="mapa-suggestions">
                      {locationSuggestions.map((s, i) => (
                        <li key={i} onMouseDown={() => handleSelectLocation(s)}>
                          📍 {s.label}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>

              <div className="mapa-field">
                <label>Valoración</label>
                <input
                  type="number"
                  min={0}
                  max={10}
                  step={0.5}
                  placeholder="Ej: 8.5"
                  value={formData.valoracion}
                  onChange={(e) =>
                    setFormData((p) => ({ ...p, valoracion: e.target.value }))
                  }
                />
              </div>

              <div className="mapa-field">
                <label>Notas</label>
                <MentionInput
                  placeholder="Ambiente, especialidad, horario..."
                  rows={3}
                  value={formData.notas}
                  onChange={(text) =>
                    setFormData((p) => ({ ...p, notas: text }))
                  }
                />
              </div>

              {error && <p className="mapa-error">{error}</p>}
            </div>

            <div className="mapa-modal-footer">
              <button
                className="tasting-btn-secondary"
                onClick={() => setShowModal(false)}
              >
                Cancelar
              </button>
              <button
                className="tasting-btn-primary"
                onClick={handleSave}
                disabled={saving}
              >
                {saving ? "Guardando..." : "Guardar"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Panel de detalle */}
      {selectedShop && (
        <div className="mapa-detail">
          <button
            className="mapa-detail-close"
            onClick={() => setSelectedShop(null)}
          >
            ✕
          </button>
          {selectedShop.foto_urls?.length > 0 ? (
            <Carrusel fotos={selectedShop.foto_urls} />
          ) : (
            <div className="mapa-detail-foto-placeholder">☕</div>
          )}

          <div className="mapa-detail-header">
            <h3 className="mapa-detail-name">{selectedShop.nombre}</h3>
            {selectedShop.valoracion && (
              <span className="mapa-detail-score">
                {selectedShop.valoracion}/10
              </span>
            )}
          </div>
          {selectedShop.ciudad && (
            <p className="mapa-detail-location">
              📍 {selectedShop.ciudad}
              {selectedShop.pais ? `, ${selectedShop.pais}` : ""}
            </p>
          )}
          {selectedShop.notas && (
            <p className="mapa-detail-notes">{selectedShop.notas}</p>
          )}
          <button
            className="mapa-detail-maps-btn"
            onClick={() => openInMaps(selectedShop)}
          >
            Abrir en Maps <FaChevronRight />
          </button>
        </div>
      )}
    </div>
  );
}
