// Modal para mostrar seguidores y seguidos
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { followService } from "@/services/followService";
import { useAuth } from "@/context/AuthContext";
import "./FriendsModal.css";

export default function FriendsModal({ onClose }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState("following");
  const [following, setFollowing] = useState([]);
  const [followers, setFollowers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [f1, f2] = await Promise.all([
          followService.getFollowing(user.id),
          followService.getFollowers(user.id),
        ]);
        setFollowing(f1);
        setFollowers(f2);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [user.id]);

  const goToProfile = (username) => {
    onClose();
    navigate(`/user/${username}`);
  };

  const list = tab === "following" ? following : followers;

  return (
    <div className="friends-overlay" onClick={onClose}>
      <div className="friends-modal" onClick={(e) => e.stopPropagation()}>
        <div className="friends-header">
          <h3>Comunidad</h3>
          <button className="friends-close" onClick={onClose}>
            ✕
          </button>
        </div>
        <div className="friends-tabs">
          <button
            className={`friends-tab ${tab === "following" ? "active" : ""}`}
            onClick={() => setTab("following")}
          >
            Siguiendo {following.length > 0 && <span>{following.length}</span>}
          </button>
          <button
            className={`friends-tab ${tab === "followers" ? "active" : ""}`}
            onClick={() => setTab("followers")}
          >
            Seguidores {followers.length > 0 && <span>{followers.length}</span>}
          </button>
        </div>
        <div className="friends-list">
          {loading && <p className="friends-hint">Cargando...</p>}
          {!loading && list.length === 0 && (
            <p className="friends-hint">
              {tab === "following"
                ? "Aún no sigues a nadie"
                : "Aún no tienes seguidores"}
            </p>
          )}
          {list.map((profile) => (
            <div
              key={profile.id}
              className="friends-item"
              onClick={() => goToProfile(profile.username)}
            >
              <div className="friends-avatar">
                {profile.avatar_url ? (
                  <img src={profile.avatar_url} alt={profile.username} />
                ) : (
                  profile.username?.charAt(0).toUpperCase()
                )}
              </div>
              <div className="friends-info">
                <p className="friends-username">
                  {profile.display_name || profile.username}
                </p>
                <p className="friends-handle">@{profile.username}</p>
                {profile.bio && <p className="friends-bio">{profile.bio}</p>}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
