import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { savedPostsService } from "@/services/savedPostsService";
import { useAuth } from "@/context/AuthContext";
import { BiSolidCoffeeBean } from "react-icons/bi";
import PostCard from "@/components/social/PostCard";
import "./SavedPostsModal.css";

export default function SavedPostsModal({ onClose }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    savedPostsService
      .getSavedPosts(user.id)
      .then(setPosts)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [user.id]);

  const goToPost = (postId) => {
    onClose();
    navigate(`/post/${postId}`);
  };

  return (
    <div className="saved-overlay" onClick={onClose}>
      <div className="saved-modal" onClick={(e) => e.stopPropagation()}>
        <div className="saved-header">
          <h3>Publicaciones guardadas</h3>
          <button className="saved-close" onClick={onClose}>
            ✕
          </button>
        </div>
        <div className="saved-list">
          {loading && <p className="saved-hint">Cargando...</p>}
          {!loading && posts.length === 0 && (
            <p className="saved-hint">No tienes publicaciones guardadas</p>
          )}
          {posts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      </div>
    </div>
  );
}
