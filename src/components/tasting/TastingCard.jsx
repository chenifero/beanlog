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
import { FaCartShopping } from "react-icons/fa6";

const CHIP_ICONS = {
  origen:  { viewBox: "0 0 64 64", path: "M32,0C14.328,0,0,14.328,0,32s14.328,32,32,32s32-14.328,32-32S49.672,0,32,0z M52.812,20.078c-2.293,1.973-4.105,3.762-7.457,3.887c-2.562,0.094-4.445,0.105-6.359-1.598c-2.727-2.477-0.859-5.777-0.758-9.504C38.273,11.43,38.512,10.18,38.824,9C44.789,10.766,49.773,14.789,52.812,20.078z M9.867,41.289c2.09-2.031,5.508-3.109,7.949-5.816c2.492-2.785,2.41-7.836,6.129-7.375c3.039,0.422,2.5,4.23,4.906,6.125c2.836,2.266,6.328,0.824,8.59,3.676c2.969,3.77,2.277,8.066,0,12.293c-1.676,3.055-3.836,4.137-6.723,5.742C21.316,55.438,13.34,49.555,9.867,41.289z" },
  proceso: { viewBox: "0 0 32 32", path: "M27.526,18.036L27,17.732c-0.626-0.361-1-1.009-1-1.732s0.374-1.371,1-1.732l0.526-0.304c1.436-0.83,1.927-2.662,1.098-4.098l-1-1.732c-0.827-1.433-2.666-1.925-4.098-1.098L23,7.339c-0.626,0.362-1.375,0.362-2,0c-0.626-0.362-1-1.009-1-1.732V5c0-1.654-1.346-3-3-3h-2c-1.654,0-3,1.346-3,3v0.608c0,0.723-0.374,1.37-1,1.732c-0.626,0.361-1.374,0.362-2,0L8.474,7.036C7.042,6.209,5.203,6.701,4.375,8.134l-1,1.732c-0.829,1.436-0.338,3.269,1.098,4.098L5,14.268C5.626,14.629,6,15.277,6,16s-0.374,1.371-1,1.732l-0.526,0.304c-1.436,0.829-1.927,2.662-1.098,4.098l1,1.732c0.828,1.433,2.667,1.925,4.098,1.098L9,24.661c0.626-0.363,1.374-0.361,2,0c0.626,0.362,1,1.009,1,1.732V27c0,1.654,1.346,3,3,3h2c1.654,0,3-1.346,3-3v-0.608c0-0.723,0.374-1.37,1-1.732c0.625-0.361,1.374-0.362,2,0l0.526,0.304c1.432,0.826,3.271,0.334,4.098-1.098l1-1.732C29.453,20.698,28.962,18.865,27.526,18.036z M16,21c-2.757,0-5-2.243-5-5s2.243-5,5-5s5,2.243,5,5S18.757,21,16,21z" },
  tueste:  { viewBox: "0 0 24 24", path: "M9.75838 1.09929C9.85156 1.13153 9.9852 1.17902 10.1535 1.24207C10.49 1.36812 10.9661 1.55678 11.5355 1.81078C12.6715 2.31752 14.193 3.09073 15.7215 4.15505C18.745 6.26052 22 9.65692 22 14.5393C22 16.6738 21.4305 18.7869 20.1046 20.3856C18.7552 22.0126 16.7095 23 14 23C13.9352 23 13.6752 22.9978 13.4169 22.8125C13.0566 22.5541 12.9699 22.1541 13.0085 21.8667C13.0376 21.6502 13.1305 21.5025 13.1576 21.4602C13.1966 21.3993 13.234 21.3556 13.2534 21.3338C13.293 21.2893 13.3281 21.2581 13.3407 21.247C13.3575 21.2322 13.3716 21.2207 13.3801 21.214C13.4065 21.1929 13.4323 21.1745 13.4402 21.1689L13.4413 21.1681L13.5185 21.1136C13.5762 21.0727 13.6587 21.0131 13.7588 20.9348C13.9606 20.7768 14.2297 20.546 14.4969 20.2526C15.0448 19.6509 15.5 18.8819 15.5 18C15.5 16.3681 14.571 14.8515 13.5067 13.669C12.9869 13.0914 12.4644 12.6267 12.0715 12.3065C12.0471 12.2866 12.0233 12.2674 12 12.2487C11.9767 12.2674 11.9529 12.2866 11.9285 12.3065C11.5356 12.6267 11.0131 13.0914 10.4933 13.669C9.42904 14.8515 8.5 16.3681 8.5 18C8.5 18.8887 8.95405 19.6581 9.49825 20.2564C9.76406 20.5486 10.0319 20.7779 10.2327 20.934C10.3323 21.0114 10.4142 21.0699 10.47 21.1087C10.4933 21.125 10.5115 21.1374 10.5281 21.1487L10.5401 21.1569C10.5471 21.1616 10.5635 21.1728 10.5787 21.1837C10.5832 21.187 10.6139 21.2089 10.6476 21.2376C10.6583 21.2467 10.6772 21.2632 10.6995 21.285C10.7154 21.3005 10.7647 21.3492 10.8157 21.4212C10.8424 21.4607 10.901 21.5658 10.9302 21.6326C10.9668 21.7437 10.9991 22.045 10.9733 22.2301C10.89 22.4562 10.6027 22.798 10.4241 22.9056C10.2979 22.9546 10.0834 22.9965 10 23C7.29045 23 5.24478 22.0126 3.89543 20.3856C2.56953 18.7869 2 16.6738 2 14.5393C2 11.9892 2.88357 10.3815 4.05286 9.15507C4.5965 8.58486 5.19715 8.10224 5.73579 7.66945L5.77852 7.63511C6.34602 7.17903 6.84273 6.7759 7.26778 6.31893C8.30821 5.20037 8.54446 4.18717 8.56055 3.49802C8.56885 3.14245 8.51857 2.85417 8.46943 2.66213C8.44495 2.56644 8.42112 2.49608 8.40592 2.45502C8.39834 2.43455 8.39298 2.42158 8.39089 2.41662C8.22725 2.05872 8.28834 1.6367 8.54841 1.34037C8.86981 0.974175 9.32884 0.950674 9.75838 1.09929Z" },
  finca:   { viewBox: "0 0 296.158 296.158", path: "M81.085,123.034c-2.115-4.241-6.446-6.921-11.186-6.921s-9.07,2.68-11.186,6.921L1.314,238.11c-1.933,3.875-1.723,8.474,0.556,12.156c2.278,3.682,6.3,5.923,10.63,5.923h80.399h34.399c4.33,0,8.352-2.241,10.63-5.923c2.278-3.683,2.488-8.281,0.556-12.156L81.085,123.034z M294.844,238.11L199.465,46.89c-2.115-4.241-6.446-6.921-11.186-6.921s-9.07,2.68-11.186,6.921l-44.645,89.505l41.831,83.864c5.671,11.371,6.979,24.037,4.035,35.931h105.343c4.33,0,8.352-2.241,10.63-5.923C296.566,246.584,296.776,241.985,294.844,238.11z" },
  sca:     { viewBox: "0 0 64 64", path: "M16,42.96v17.039c0,1.477,0.812,2.832,2.113,3.527c1.297,0.699,2.879,0.617,4.105-0.199L32,56.808l9.78,6.52c0.668,0.445,1.441,0.672,2.219,0.672c0.648,0,1.297-0.156,1.887-0.473c1.301-0.695,2.113-2.051,2.113-3.527V42.96C43.46,46.128,37.953,47.999,32,47.999S20.539,46.128,16,42.96z M32,0C20.852,0,12,8.953,12,20s8.852,20,20,20s20-8.953,20-20S43.148,0,32,0z" },
  precio:  { viewBox: "0 0 52 52", path: "M20.5,9.1c0.2,0.6,0.8,0.9,1.4,0.9H30c0.6,0,1.2-0.3,1.4-0.9l3.2-5.9C34.8,2.6,34.4,2,33.8,2H26h-7.8c-0.6,0-1,0.6-0.7,1.1L20.5,9.1z M30.7,14.7h-9.4C13.4,14.7,7,21.2,7,29.2v16c0,2.6,2.1,4.8,4.8,4.8h28.4c2.6,0,4.8-2.2,4.8-4.8v-16C45,21.2,38.5,14.7,30.7,14.7z M28.4,41.7v2.7c0,0.5-0.5,0.8-1,0.8h-3.2c-0.5,0-0.6-0.3-0.6-0.8v-2.6c-2.4-0.5-4.4-1.5-4.9-2c-0.6-0.6-0.8-1.1-0.3-1.8l1-1.6c0.2-0.4,0.7-0.6,1.2-0.6c0.3,0,0.6,0.1,0.8,0.2h0.1c1.6,1,3,1.4,4,1.4c1.1,0,2-0.6,2-1.2c0-0.5-0.3-1.3-3.3-2.3c-2.7-1-6-2.6-6-6.3c0-2.2,1.4-4.7,5.4-5.5v-2.4c0-0.5,0.2-0.8,0.6-0.8h3.2c0.5,0,1,0.3,1,0.8V22c1.6,0.4,3.3,1.2,3.9,1.6c0.3,0.2,0.5,0.6,0.6,1c0.1,0.4-0.1,0.8-0.3,1L31.2,27c-0.3,0.4-0.9,0.7-1.3,0.7c-0.2,0-0.5-0.1-0.7-0.2c-1.6-0.9-2.9-1.4-3.8-1.4c-1.3,0-1.9,0.6-1.9,1c0,0.6,0.3,1.2,3,2.2c3.3,1.1,7,2.9,7,6.7C33.6,38.6,31.5,40.9,28.4,41.7z" },
  marca:   { viewBox: "0 0 24 24", path: "M12.6761 19.9589C12.9508 20.0228 12.976 20.3827 12.7084 20.4719L11.1284 20.9919C7.15839 22.2719 5.06839 21.2019 3.77839 17.2319L2.49839 13.2819C1.21839 9.31187 2.27839 7.21187 6.24839 5.93187L6.77238 5.75834C7.17525 5.62493 7.56731 6.02899 7.45292 6.43766C7.39622 6.64023 7.34167 6.85164 7.28839 7.07188L6.30839 11.2619C5.20839 15.9719 6.81839 18.5719 11.5284 19.6919L12.6761 19.9589Z M17.1702 3.20854L15.5002 2.81854C12.1602 2.02854 10.1702 2.67854 9.00018 5.09854C8.70018 5.70854 8.46018 6.44854 8.26018 7.29854L7.28018 11.4885C6.30018 15.6685 7.59018 17.7285 11.7602 18.7185L13.4402 19.1185C14.0202 19.2585 14.5602 19.3485 15.0602 19.3885C18.1802 19.6885 19.8402 18.2285 20.6802 14.6185L21.6602 10.4385C22.6402 6.25854 21.3602 4.18854 17.1702 3.20854ZM15.2902 13.3285C15.2002 13.6685 14.9002 13.8885 14.5602 13.8885C14.5002 13.8885 14.4402 13.8785 14.3702 13.8685L11.4602 13.1285C11.0602 13.0285 10.8202 12.6185 10.9202 12.2185C11.0202 11.8185 11.4302 11.5785 11.8302 11.6785L14.7402 12.4185C15.1502 12.5185 15.3902 12.9285 15.2902 13.3285ZM18.2202 9.94854C18.1302 10.2885 17.8302 10.5085 17.4902 10.5085C17.4302 10.5085 17.3702 10.4985 17.3002 10.4885L12.4502 9.25854C12.0502 9.15854 11.8102 8.74854 11.9102 8.34854C12.0102 7.94854 12.4202 7.70854 12.8202 7.80854L17.6702 9.03854C18.0802 9.12854 18.3202 9.53854 18.2202 9.94854Z" },
};

function TastingChips({ cafe, tasting }) {
  const chips = [
    cafe?.origen   && { key: "origen",  icon: CHIP_ICONS.origen,  label: `Origen: ${cafe.origen}` },
    cafe?.proceso  && { key: "proceso", icon: CHIP_ICONS.proceso, label: `Proceso: ${cafe.proceso}` },
    cafe?.tueste   && { key: "tueste",  icon: CHIP_ICONS.tueste,  label: `Tueste: ${cafe.tueste}` },
    cafe?.finca    && { key: "finca",   icon: CHIP_ICONS.finca,   label: `Finca: ${cafe.finca}` },
    cafe?.sca      && { key: "sca",     icon: CHIP_ICONS.sca,     label: `SCA: ${cafe.sca}` },
    cafe?.marca    && { key: "marca",   icon: CHIP_ICONS.marca,   label: `Marca: ${cafe.marca}` },
    tasting.precio && { key: "precio",  icon: CHIP_ICONS.precio,  label: `Precio: ${tasting.precio}` },
  ].filter(Boolean);

  if (chips.length === 0) return null;

    return (
    <div className="tasting-card-chips">
      {chips.map(({ key, icon, label }) => (
        <div key={key} className="tasting-card-chip">
          <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox={icon.viewBox} fill="currentColor">
            <path d={icon.path} />
          </svg>
          <span>{label}</span>
        </div>
      ))}
    </div>
  );
}

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
          <TastingChips cafe={cafe} tasting={tasting} />
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

          {/* Link de compra */}
          {tasting.link_compra && (
            <div className="tasting-card-purchase">
              <a
                href={tasting.link_compra}
                target="_blank"
                rel="noopener noreferrer"
                className="tasting-card-purchase-link"
              >
                <FaCartShopping /> Comprar
              </a>
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
