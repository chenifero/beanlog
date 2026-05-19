// Página del mapa de cafeterías
// Muestra las cafeterías en un mapa de Mapbox
// El usuario puede añadir nuevas cafeterías

import { useState, useEffect, useRef } from "react";
import mapboxgl from "mapbox-gl";
import { coffeeShopService } from "@/services/coffeeShopService";
import "./MapaPage.css";

// Icono SVG personalizado para los marcadores
const MARKER_SVG = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 50" width="40" height="50">
  <circle cx="20" cy="20" r="18" fill="#c349ee" stroke="white" stroke-width="2"/>
  <text x="20" y="26" text-anchor="middle" font-size="16">☕</text>
  <polygon points="20,44 13,32 27,32" fill="#c349ee"/>
</svg>
`;

export default function MapaPage() {
  const mapContainer = useRef(null);
  const map = useRef(null);
  const markersRef = useRef([]);

  const [coffeeShops, setCoffeeShops] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedShop, setSelectedShop] = useState(null);
  const [loading, setLoading] = useState(true);

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

  // Inicializa el mapa
  useEffect(() => {
    if (map.current) return;

    mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN;

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: "mapbox://styles/mapbox/dark-v11",
      center: [-3.7038, 40.4168], // Madrid por defecto
      zoom: 5,
    });

    map.current.addControl(new mapboxgl.NavigationControl(), "top-right");

    // Intenta centrar en la ubicación del usuario
    navigator.geolocation?.getCurrentPosition((pos) => {
      map.current.flyTo({
        center: [pos.coords.longitude, pos.coords.latitude],
        zoom: 12,
      });
    });

    return () => map.current?.remove();
  }, []);

  // Carga las cafeterías
  useEffect(() => {
    loadCoffeeShops();
  }, []);

  // Añade marcadores cuando carga el mapa y las cafeterías
  useEffect(() => {
    if (!map.current || coffeeShops.length === 0) return;

    const addMarkers = () => {
      markersRef.current.forEach((m) => m.remove());
      markersRef.current = [];

      coffeeShops.forEach((shop) => {
        const el = document.createElement("div");
        el.innerHTML = MARKER_SVG;
        el.style.cursor = "pointer";
        el.style.width = "40px";
        el.style.height = "50px";
        el.addEventListener("click", () => setSelectedShop(shop));

        const marker = new mapboxgl.Marker({ element: el })
          .setLngLat([shop.lng, shop.lat])
          .addTo(map.current);

        markersRef.current.push(marker);
      });
    };

    // Espera a que el mapa esté completamente cargado
    if (map.current.loaded()) {
      addMarkers();
    } else {
      map.current.once("load", addMarkers);
    }
  }, [coffeeShops]);

  const loadCoffeeShops = async () => {
    try {
      const data = await coffeeShopService.getCoffeeShops();
      setCoffeeShops(data);
    } catch (err) {
      console.error("Error cargando cafeterías:", err);
    } finally {
      setLoading(false);
    }
  };

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
          `https://photon.komoot.io/api/?q=${encodeURIComponent(formData.location)}&limit=5`,
        );
        const data = await res.json();
        const suggestions = (data.features || []).map((f) => ({
          label: [
            f.properties.name,
            f.properties.city !== f.properties.name ? f.properties.city : null,
            f.properties.country,
          ]
            .filter(Boolean)
            .join(", "),
          lat: f.geometry.coordinates[1],
          lng: f.geometry.coordinates[0],
          ciudad: f.properties.city || f.properties.name,
          pais: f.properties.country,
        }));
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
    map.current?.flyTo({
      center: [suggestion.lng, suggestion.lat],
      zoom: 14,
    });
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
      const shop = await coffeeShopService.createCoffeeShop({
        nombre: formData.nombre,
        lat: formData.lat,
        lng: formData.lng,
        valoracion: formData.valoracion || null,
        notas: formData.notas || null,
        ciudad: formData.ciudad,
        pais: formData.pais,
      });
      setCoffeeShops((prev) => [...prev, shop]);
      setShowModal(false);
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

  // Abre Google Maps o Apple Maps
  const openInMaps = (shop) => {
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    const url = isIOS
      ? `maps://maps.apple.com/?q=${shop.nombre}&ll=${shop.lat},${shop.lng}`
      : `https://www.google.com/maps/search/?api=1&query=${shop.lat},${shop.lng}`;
    window.open(url, "_blank");
  };

  return (
    <div className="mapa-page">
      {/* Mapa */}
      <div ref={mapContainer} className="mapa-container" />

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
                <textarea
                  placeholder="Ambiente, especialidad, horario..."
                  rows={3}
                  value={formData.notas}
                  onChange={(e) =>
                    setFormData((p) => ({ ...p, notas: e.target.value }))
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

      {/* Panel de detalle de cafetería */}
      {selectedShop && (
        <div className="mapa-detail">
          <button
            className="mapa-detail-close"
            onClick={() => setSelectedShop(null)}
          >
            ✕
          </button>
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
            Abrir en Maps →
          </button>
        </div>
      )}
    </div>
  );
}
