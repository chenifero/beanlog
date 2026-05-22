// Tarjeta de publicación del feed
// Muestra: autor, fotos en carrusel, texto, info de cata/cafetería y likes/comentarios

import { useState } from "react";
import { postService } from "@/services/postService";
import { useAuth } from "@/context/AuthContext";
import "./PostCard.css";
import { FaCoffee } from "react-icons/fa";
import { FcLike } from "react-icons/fc";
import { FcLikePlaceholder } from "react-icons/fc";
import { FaComment } from "react-icons/fa";
import { FaLocationDot } from "react-icons/fa6";
import { BiSolidCoffeeBean } from "react-icons/bi";
import { useNavigate } from "react-router-dom";

// Formatea la fecha relativa — "hace 2 horas", "hace 3 días"
function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  const hours = Math.floor(mins / 60);
  const days = Math.floor(hours / 24);
  if (mins < 1) return "ahora mismo";
  if (mins < 60) return `hace ${mins}m`;
  if (hours < 24) return `hace ${hours}h`;
  return `hace ${days}d`;
}

// Etiqueta del nivel de experiencia
function levelLabel(level) {
  const config = {
    Casual: { count: 1, text: "Casual" },
    Enthusiast: { count: 2, text: "Enthusiast" },
    Barista: { count: 3, text: "Barista" },
  };
  const { count, text } = config[level] || config.Casual;
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: "4px" }}>
      {/* Creamos un array vacío del tamaño de 'count' para repetir el icono */}
      {[...Array(count)].map((_, index) => (
        <FaCoffee key={index} />
      ))}
      <span style={{ marginLeft: "4px" }}>{text}</span>
    </span>
  );
}

export default function PostCard({ post, onDelete }) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [liked, setLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [currentPhoto, setCurrentPhoto] = useState(0);

  const isOwner = user?.id === post.user_id;
  const photos = post.image_urls || [];

  // Alterna el like y actualiza el contador localmente
  const handleLike = async () => {
    try {
      const isNowLiked = await postService.toggleLike(user.id, post.id);
      setLiked(isNowLiked);
      setLikesCount((prev) => (isNowLiked ? prev + 1 : prev - 1));
    } catch (err) {
      console.error("Error al dar like:", err);
    }
  };

  // Carga los comentarios al abrir la sección
  const handleToggleComments = async () => {
    if (!showComments && comments.length === 0) {
      try {
        const data = await postService.getComments(post.id);
        setComments(data);
      } catch (err) {
        console.error("Error cargando comentarios:", err);
      }
    }
    setShowComments((prev) => !prev);
  };

  // Envía un nuevo comentario
  const handleAddComment = async () => {
    if (!newComment.trim()) return;
    try {
      const comment = await postService.addComment(
        user.id,
        post.id,
        newComment,
      );
      setComments((prev) => [...prev, comment]);
      setNewComment("");
    } catch (err) {
      console.error("Error al comentar:", err);
    }
  };

  const handleDelete = async () => {
    if (!confirm("¿Eliminar esta publicación?")) return;
    try {
      await postService.deletePost(post.id);
      onDelete?.(post.id);
    } catch (err) {
      console.error("Error al eliminar:", err);
    }
  };

  return (
    <article className="post-card">
      {/* Cabecera — avatar, nombre, nivel, fecha */}
      <div className="post-header">
        <div
          className="post-avatar"
          onClick={() => navigate(`/user/${post.profiles?.username}`)}
          style={{ cursor: "pointer" }}
        >
          {post.profiles?.avatar_url ? (
            <img src={post.profiles.avatar_url} alt={post.profiles.username} />
          ) : (
            post.profiles?.username?.charAt(0).toUpperCase()
          )}
        </div>
        <div className="post-author-info">
          <span
            className="post-username"
            onClick={() => navigate(`/user/${post.profiles?.username}`)}
            style={{ cursor: "pointer" }}
          >
            {post.profiles?.username || "Usuario"}
          </span>
          <span className="post-level">
            {levelLabel(post.profiles?.experience_level)}
          </span>
        </div>
        <div className="post-meta">
          <span className="post-time">{timeAgo(post.created_at)}</span>
          {/* Solo el autor ve el botón de eliminar */}
          {isOwner && (
            <button
              className="post-delete-btn"
              onClick={handleDelete}
              title="Eliminar"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Carrusel de fotos — solo si hay imágenes */}
      {photos.length > 0 && (
        <div className="post-photos">
          <img
            src={photos[currentPhoto]}
            alt={`foto ${currentPhoto + 1}`}
            className="post-photo"
          />
          {/* Controles del carrusel — solo si hay más de una foto */}
          {photos.length > 1 && (
            <>
              <button
                className="post-photo-prev"
                onClick={() => setCurrentPhoto((prev) => Math.max(0, prev - 1))}
                disabled={currentPhoto === 0}
              >
                ‹
              </button>
              <button
                className="post-photo-next"
                onClick={() =>
                  setCurrentPhoto((prev) =>
                    Math.min(photos.length - 1, prev + 1),
                  )
                }
                disabled={currentPhoto === photos.length - 1}
              >
                ›
              </button>
              {/* Indicadores de punto */}
              <div className="post-photo-dots">
                {photos.map((_, i) => (
                  <span
                    key={i}
                    className={`post-photo-dot ${i === currentPhoto ? "active" : ""}`}
                    onClick={() => setCurrentPhoto(i)}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      )}

      {/* Texto del post */}
      {post.content && <p className="post-content">{post.content}</p>}

      {/* Info extra si es una cata */}
      {post.type === "tasting" && post.tastings && (
        <div className="post-tasting-info">
          <span className="post-tasting-name">
            <BiSolidCoffeeBean />{" "}
            {post.tastings.cafes_master?.nombre || "Café sin nombre"}
          </span>
          {post.tastings.cafes_master?.origen && (
            <span className="post-tasting-origin">
              {post.tastings.cafes_master.origen}
            </span>
          )}
          {post.tastings.puntuacion && (
            <span className="post-tasting-score">
              {post.tastings.puntuacion}/10
            </span>
          )}
        </div>
      )}

      {/* Info extra si es una visita */}
      {post.type === "visit" && post.coffee_shops && (
        <div className="post-visit-info">
          <span className="post-visit-name">
            <FaLocationDot /> {post.coffee_shops.nombre}
          </span>
          {post.rating && (
            <span className="post-tasting-score">{post.rating}/10</span>
          )}
        </div>
      )}

      {/* Acciones — likes y comentarios */}
      <div className="post-actions">
        <button
          className={`post-action-btn ${liked ? "liked" : ""}`}
          onClick={handleLike}
        >
          {liked ? <FcLike /> : <FcLikePlaceholder />}{" "}
          {likesCount > 0 && likesCount}
        </button>
        <button className="post-action-btn" onClick={handleToggleComments}>
          <FaComment /> {comments.length > 0 && comments.length}
        </button>
      </div>

      {/* Sección de comentarios */}
      {showComments && (
        <div className="post-comments">
          {comments.length === 0 && (
            <p className="post-no-comments">Sé el primero en comentar</p>
          )}
          {comments.map((comment) => (
            <div key={comment.id} className="post-comment">
              <span className="post-comment-user">
                {comment.profiles?.username}
              </span>
              <span className="post-comment-text">{comment.content}</span>
            </div>
          ))}
          {/* Input para añadir comentario */}
          <div className="post-comment-input-row">
            <input
              type="text"
              placeholder="Añade un comentario..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAddComment()}
              className="post-comment-input"
            />
            <button className="post-comment-send" onClick={handleAddComment}>
              →
            </button>
          </div>
        </div>
      )}
    </article>
  );
}
