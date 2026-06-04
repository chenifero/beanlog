// ShareCard.jsx
// Componente oculto que se renderiza para capturarlo con html2canvas y compartirlo.
// Se monta fuera del flujo visual (position absolute, fuera de pantalla).
// Soporta type: 'tasting' | 'post' | 'cafe'

import { useEffect, useRef } from "react";
import "./ShareCard.css";

const LOGO_URL =
  "https://wwoonbjbeqtuhdcputrs.supabase.co/storage/v1/object/public/svg/logo_header_sin_slogan.png";

const N = 6;
const LABELS = ["Acidez", "Cuerpo", "Dulzor", "Amargor", "Aroma", "Frutado"];
const RADAR_SIZE = 210;
const CX = RADAR_SIZE / 2;
const CY = RADAR_SIZE / 2;
const MAX_R = 68;
const LABEL_OFFSET = 5;

function angleRad(i) {
  return ((2 * Math.PI) / N) * i - Math.PI / 2;
}

function pt(r, i) {
  const a = angleRad(i);
  return [CX + r * Math.cos(a), CY + r * Math.sin(a)];
}

function polyStr(r) {
  return Array.from({ length: N }, (_, i) => pt(r, i).join(",")).join(" ");
}

function RadarChart({ radarData }) {
  const values = [
    radarData?.acidez ?? 5,
    radarData?.cuerpo ?? 5,
    radarData?.dulzor ?? 5,
    radarData?.amargor ?? 5,
    radarData?.aroma ?? 5,
    radarData?.frutado ?? 5,
  ];

  const dataPts = values
    .map((v, i) => pt(MAX_R * (v / 10), i).join(","))
    .join(" ");

  return (
    <svg
      width={RADAR_SIZE}
      height={RADAR_SIZE}
      style={{ overflow: "visible" }}
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Anillos */}
      {[1, 2, 3].map((ring) => (
        <polygon
          key={ring}
          points={polyStr((MAX_R * ring) / 3)}
          fill="none"
          stroke="#b8d890"
          strokeWidth="1"
        />
      ))}

      {/* Ejes */}
      {Array.from({ length: N }, (_, i) => {
        const [x, y] = pt(MAX_R, i);
        return (
          <line
            key={i}
            x1={CX}
            y1={CY}
            x2={x}
            y2={y}
            stroke="#b8d890"
            strokeWidth="0.7"
          />
        );
      })}

      {/* Polígono de datos */}
      <polygon
        points={dataPts}
        fill="rgba(195,73,238,0.18)"
        stroke="#c349ee"
        strokeWidth="2"
      />

      {/* Puntos en vértices */}
      {values.map((v, i) => {
        const [x, y] = pt(MAX_R * (v / 10), i);
        return <circle key={i} cx={x} cy={y} r="3.5" fill="#c349ee" />;
      })}

      {/* Etiquetas */}
      {LABELS.map((label, i) => {
        const a = angleRad(i);
        const lx = CX + (MAX_R + LABEL_OFFSET) * Math.cos(a);
        const ly = CY + (MAX_R + LABEL_OFFSET) * Math.sin(a);
        const dx = lx - CX;
        const anchor = Math.abs(dx) < 8 ? "middle" : dx > 0 ? "start" : "end";
        return (
          <text
            key={i}
            x={lx}
            y={ly}
            fontSize="8.5"
            fontWeight="500"
            fill="#2e1560"
            fontFamily="DM Sans, sans-serif"
            dominantBaseline="middle"
            textAnchor={anchor}
          >
            {label}
          </text>
        );
      })}
    </svg>
  );
}

// ── Card de Cata ─────────────────────────────────────────────────────────────
function TastingShareCard({ data }) {
  const { tasting, profile } = data;
  const cafe = tasting?.cafes_master;

  return (
    <div className="sc-card-inner">
      {/* Header */}
      <div className="sc-header">
        <div className="sc-badge">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="18"
            height="18"
            viewBox="0 0 640 512"
            fill="#c349ee"
          >
            <path d="M192 384h192c53 0 96-43 96-96h32c70.6 0 128-57.4 128-128S582.6 32 512 32H120c-13.3 0-24 10.7-24 24v232c0 53 43 96 96 96zM512 96c35.3 0 64 28.7 64 64s-28.7 64-64 64h-32V96h32zm47.7 384H48.3c-47.6 0-61-64-36-64h583.4c25 0 11.8 64-36 64z" />
          </svg>
          Cata
        </div>
      </div>

      {/* Foto */}
      {tasting?.foto_url ? (
        <img
          src={tasting.foto_url}
          alt="cata"
          className="sc-photo"
          crossOrigin="anonymous"
        />
      ) : (
        <div className="sc-photo-placeholder sc-photo-placeholder--tasting" />
      )}

      {/* Body */}
      <div className="sc-body">
        <div className="sc-author">
          <div className="sc-avatar">
            {profile?.avatar_url ? (
              <img
                src={profile.avatar_url}
                alt={profile.username}
                crossOrigin="anonymous"
              />
            ) : (
              profile?.username?.charAt(0).toUpperCase()
            )}
          </div>
          <div>
            <div className="sc-username">
              {profile?.display_name || profile?.username}
            </div>
            <div className="sc-handle">@{profile?.username}</div>
          </div>
        </div>

        <div className="sc-tasting-name">
          {cafe?.nombre || "Café sin nombre"}
        </div>
        <div className="sc-tasting-meta">
          {[cafe?.origen, cafe?.proceso, cafe?.finca]
            .filter(Boolean)
            .join(" · ")}
        </div>

        {tasting?.puntuacion && (
          <div className="sc-score-row">
            <span className="sc-score">{tasting.puntuacion}</span>
            <span className="sc-score-label">
              puntuación
              <br />
              personal
            </span>
          </div>
        )}

        {tasting?.radar_data && (
          <div className="sc-radar-wrap">
            <RadarChart radarData={tasting.radar_data} />
          </div>
        )}

        <div className="sc-chips">
          {cafe?.sca && <span className="sc-chip">SCA {cafe.sca}</span>}
          {cafe?.proceso && <span className="sc-chip">{cafe.proceso}</span>}
          {cafe?.tueste && <span className="sc-chip">{cafe.tueste}</span>}
        </div>
      </div>

      {/* Footer */}
      <div className="sc-footer">
        <img
          src={LOGO_URL}
          alt="BeanLog"
          className="sc-logo"
          crossOrigin="anonymous"
        />
      </div>
    </div>
  );
}

// ── Card de Post ──────────────────────────────────────────────────────────────
function PostShareCard({ data }) {
  const { post, profile } = data;
  const photos = post?.image_urls || [];

  return (
    <div className="sc-card-inner">
      <div className="sc-header">
        <div className="sc-badge">
          <svg width="16" height="16" viewBox="0 0 512 512" fill="#c349ee">
            <path d="M256 32C114.6 32 0 125.1 0 240c0 49.6 21.4 95 57 130.7C44.5 421.1 2.7 466 2.2 466.5c-2.2 2.3-2.8 5.7-1.5 8.7C1.9 478.1 4.8 480 8 480c66.3 0 116-31.8 140.6-51.4C169.1 433.1 212.2 448 256 448c141.4 0 256-93.1 256-208S397.4 32 256 32z" />
          </svg>
          Post
        </div>
      </div>

      {photos.length > 0 ? (
        <img
          src={photos[0]}
          alt="post"
          className="sc-photo"
          crossOrigin="anonymous"
        />
      ) : (
        <div className="sc-photo-placeholder sc-photo-placeholder--post" />
      )}

      <div className="sc-body">
        <div className="sc-author">
          <div className="sc-avatar">
            {profile?.avatar_url ? (
              <img
                src={profile.avatar_url}
                alt={profile.username}
                crossOrigin="anonymous"
              />
            ) : (
              profile?.username?.charAt(0).toUpperCase()
            )}
          </div>
          <div>
            <div className="sc-username">
              {profile?.display_name || profile?.username}
            </div>
            <div className="sc-handle">@{profile?.username}</div>
          </div>
        </div>

        {post?.location && (
          <div className="sc-location">
            <svg width="10" height="10" viewBox="0 0 384 512" fill="#c349ee">
              <path d="M215.7 499.2C267 435 384 279.4 384 192C384 86 298 0 192 0S0 86 0 192c0 87.4 117 243 168.3 307.2c12.3 15.3 35.1 15.3 47.4 0zM192 128a64 64 0 1 1 0 128 64 64 0 1 1 0-128z" />
            </svg>
            {post.location}
          </div>
        )}

        {post?.content && <div className="sc-post-text">{post.content}</div>}

        <div className="sc-post-stats">
          <span className="sc-stat">
            <svg width="12" height="12" viewBox="0 0 512 512" fill="#c349ee">
              <path d="M462.3 62.6C407.5 15.9 326 24.3 275.7 76.2L256 96.5l-19.7-20.3C186.1 24.3 104.5 15.9 49.7 62.6c-62.8 53.6-66.1 149.8-9.9 207.9l193.5 199.8c12.5 12.9 32.8 12.9 45.3 0l193.5-199.8c56.3-58.1 53-154.3-9.8-207.9z" />
            </svg>
            {data.likesCount ?? 0}
          </span>
          <span className="sc-stat">
            <svg width="12" height="12" viewBox="0 0 512 512" fill="#9b72cc">
              <path d="M256 32C114.6 32 0 125.1 0 240c0 49.6 21.4 95 57 130.7C44.5 421.1 2.7 466 2.2 466.5c-2.2 2.3-2.8 5.7-1.5 8.7C1.9 478.1 4.8 480 8 480c66.3 0 116-31.8 140.6-51.4C169.1 433.1 212.2 448 256 448c141.4 0 256-93.1 256-208S397.4 32 256 32z" />
            </svg>
            {data.commentsCount ?? 0}
          </span>
        </div>
      </div>

      <div className="sc-footer">
        <img
          src={LOGO_URL}
          alt="BeanLog"
          className="sc-logo"
          crossOrigin="anonymous"
        />
      </div>
    </div>
  );
}

// ── Card de Cafetería ─────────────────────────────────────────────────────────
function CafeShareCard({ data }) {
  const { cafe, profile } = data;
  const photos = cafe?.foto_urls || [];

  return (
    <div className="sc-card-inner">
      <div className="sc-header">
        <div className="sc-badge">
          <svg width="14" height="16" viewBox="0 0 384 512" fill="#c349ee">
            <path d="M215.7 499.2C267 435 384 279.4 384 192C384 86 298 0 192 0S0 86 0 192c0 87.4 117 243 168.3 307.2c12.3 15.3 35.1 15.3 47.4 0zM192 128a64 64 0 1 1 0 128 64 64 0 1 1 0-128z" />
          </svg>
          Cafetería
        </div>
      </div>

      {photos.length > 0 ? (
        <img
          src={photos[0]}
          alt="cafetería"
          className="sc-photo"
          crossOrigin="anonymous"
        />
      ) : (
        <div className="sc-photo-placeholder sc-photo-placeholder--cafe" />
      )}

      <div className="sc-body">
        <div className="sc-author">
          <div className="sc-avatar">
            {profile?.avatar_url ? (
              <img
                src={profile.avatar_url}
                alt={profile.username}
                crossOrigin="anonymous"
              />
            ) : (
              profile?.username?.charAt(0).toUpperCase()
            )}
          </div>
          <div>
            <div className="sc-username">
              {profile?.display_name || profile?.username}
            </div>
            <div className="sc-handle">@{profile?.username}</div>
          </div>
        </div>

        <div className="sc-cafe-name">{cafe?.nombre}</div>

        {(cafe?.ciudad || cafe?.pais) && (
          <div className="sc-location">
            <svg width="10" height="10" viewBox="0 0 384 512" fill="#c349ee">
              <path d="M215.7 499.2C267 435 384 279.4 384 192C384 86 298 0 192 0S0 86 0 192c0 87.4 117 243 168.3 307.2c12.3 15.3 35.1 15.3 47.4 0zM192 128a64 64 0 1 1 0 128 64 64 0 1 1 0-128z" />
            </svg>
            {[cafe.ciudad, cafe.pais].filter(Boolean).join(", ")}
          </div>
        )}

        {cafe?.valoracion && (
          <div className="sc-cafe-rating">
            <span className="sc-stars">
              {"★".repeat(Math.round(cafe.valoracion / 2))}
            </span>
            <span className="sc-rating-num">{cafe.valoracion} / 10</span>
          </div>
        )}

        {cafe?.notas && <div className="sc-cafe-note">"{cafe.notas}"</div>}
      </div>

      <div className="sc-footer">
        <img
          src={LOGO_URL}
          alt="BeanLog"
          className="sc-logo"
          crossOrigin="anonymous"
        />
      </div>
    </div>
  );
}

// ── Componente principal ──────────────────────────────────────────────────────
export default function ShareCard({ type, data, cardRef }) {
  return (
    <div className="sc-wrapper" ref={cardRef}>
      <div className="sc-outer">
        {type === "tasting" && <TastingShareCard data={data} />}
        {type === "post" && <PostShareCard data={data} />}
        {type === "cafe" && <CafeShareCard data={data} />}
      </div>
    </div>
  );
}
