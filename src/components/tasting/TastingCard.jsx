// Tarjeta de cata — muestra resumen de una cata en el listado

import { useState } from "react";
import { tastingService } from "@/services/tastingService";
import { useAuth } from "@/context/AuthContext";
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
} from "recharts";
import "./TastingCard.css";
import { FaEarthAfrica } from "react-icons/fa6";
import { FaGear } from "react-icons/fa6";
import { FaFire } from "react-icons/fa6";


export default function TastingCard({ tasting, onDelete }) {
  const { user } = useAuth();
  const [expanded, setExpanded] = useState(false);

  const cafe = tasting.cafes_master;
  const radarData = tasting.radar_data || {};

  const radarChartData = [
    { attribute: "Acidez", value: radarData.acidez || 0 },
    { attribute: "Cuerpo", value: radarData.cuerpo || 0 },
    { attribute: "Dulzor", value: radarData.dulzor || 0 },
    { attribute: "Amargor", value: radarData.amargor || 0 },
    { attribute: "Aroma", value: radarData.aroma || 0 },
    { attribute: "Frutado", value: radarData.frutado || 0 },
  ];

  const handleDelete = async () => {
    if (!confirm("¿Eliminar esta cata?")) return;
    try {
      await tastingService.deleteTasting(tasting.id);
      onDelete?.(tasting.id);
    } catch (err) {
      console.error("Error eliminando cata:", err);
    }
  };

  return (
    <div className="tasting-card">
      {tasting.foto_url && (
        <div className="tasting-card-photo">
          <img src={tasting.foto_url} alt="etiqueta" />
        </div>
      )}

      {/* Cabecera */}
      <div
        className="tasting-card-header"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="tasting-card-info">
          <h3 className="tasting-card-name">
            {cafe?.nombre || "Café sin nombre"}
          </h3>
          <div className="tasting-card-meta">
            {cafe?.origen && (
              <span>
                <FaEarthAfrica /> {cafe.origen}
              </span>
            )}
            {cafe?.proceso && (
              <span>
                <FaGear /> {cafe.proceso}
              </span>
            )}
            {cafe?.tueste && (
              <span>
                <FaFire /> {cafe.tueste}
              </span>
            )}
          </div>
        </div>
        <div className="tasting-card-right">
          {tasting.puntuacion && (
            <span className="tasting-card-score">{tasting.puntuacion}</span>
          )}
          <span className="tasting-card-expand">{expanded ? "▲" : "▼"}</span>
        </div>
      </div>

      {/* Detalle expandible */}
      {expanded && (
        <div className="tasting-card-detail">
          {/* Radar chart */}
          {Object.keys(radarData).length > 0 && (
            <div className="tasting-card-radar">
              <ResponsiveContainer width="100%" height={220} minWidth={280}>
                <RadarChart
                  data={radarChartData}
                  cx="50%"
                  cy="50%"
                  outerRadius="70%"
                >
                  <PolarGrid stroke="var(--border)" />
                  <PolarAngleAxis
                    dataKey="attribute"
                    tick={{ fill: "var(--text-dim)", fontSize: 9 }}
                  />
                  <PolarRadiusAxis
                    domain={[0, 10]}
                    tick={false}
                    axisLine={false}
                  />
                  <Radar
                    dataKey="value"
                    stroke="var(--amber)"
                    fill="var(--amber)"
                    fillOpacity={0.25}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Notas */}
          {tasting.notas && (
            <div className="tasting-card-notes">
              <p className="tasting-card-notes-label">Notas de cata</p>
              <p className="tasting-card-notes-text">{tasting.notas}</p>
            </div>
          )}

          {/* Fecha y acciones */}
          <div className="tasting-card-footer">
            <span className="tasting-card-date">
              {new Date(tasting.fecha).toLocaleDateString("es-ES")}
            </span>
            <button className="tasting-card-delete" onClick={handleDelete}>
              Eliminar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
