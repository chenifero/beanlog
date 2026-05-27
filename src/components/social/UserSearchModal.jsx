// Modal para buscar users
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { profileService } from "@/services/profileService";
import { followService } from "@/services/followService";
import { useAuth } from "@/context/AuthContext";
import "./UserSearchModal.css";

export default function UserSearchModal({ onClose }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [following, setFollowing] = useState({});

  const handleSearch = async (val) => {
    setQuery(val);
    if (val.trim().length < 2) {
      setResults([]);
      return;
    }
    setLoading(true);
    try {
      const data = await profileService.searchUsers(val.trim());
      const filtered = data.filter((p) => p.id !== user.id);
      setResults(filtered);
      // Comprueba cuáles ya sigues
      const followMap = {};
      await Promise.all(
        filtered.map(async (p) => {
          followMap[p.id] = await followService.isFollowing(user.id, p.id);
        }),
      );
      setFollowing(followMap);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const toggleFollow = async (targetId) => {
    try {
      if (following[targetId]) {
        await followService.unfollow(user.id, targetId);
      } else {
        await followService.follow(user.id, targetId);
      }
      setFollowing((prev) => ({ ...prev, [targetId]: !prev[targetId] }));
    } catch (err) {
      console.error(err);
    }
  };

  const goToProfile = (username) => {
    onClose();
    navigate(`/user/${username}`);
  };

  return (
    <div className="usearch-overlay" onClick={onClose}>
      <div className="usearch-modal" onClick={(e) => e.stopPropagation()}>
        <div className="usearch-header">
          <h3>Buscar usuarios</h3>
          <button className="usearch-close" onClick={onClose}>
            ✕
          </button>
        </div>
        <input
          className="usearch-input"
          type="text"
          placeholder="Buscar usuario..."
          value={query}
          onChange={(e) => handleSearch(e.target.value)}
          autoFocus
        />
        <div className="usearch-results">
          {loading && <p className="usearch-hint">Buscando...</p>}
          {!loading && query.length >= 2 && results.length === 0 && (
            <p className="usearch-hint">Sin resultados</p>
          )}
          {results.map((profile) => (
            <div key={profile.id} className="usearch-item">
              <div
                className="usearch-avatar"
                onClick={() => goToProfile(profile.username)}
              >
                {profile.avatar_url ? (
                  <img src={profile.avatar_url} alt={profile.username} />
                ) : (
                  profile.username?.charAt(0).toUpperCase()
                )}
              </div>
              <div
                className="usearch-info"
                onClick={() => goToProfile(profile.username)}
              >
                <p className="usearch-username">
                  {profile.display_name || profile.username}
                </p>
                <p className="usearch-bio">@{profile.username}</p>
              </div>
              <button
                className={`usearch-follow-btn ${following[profile.id] ? "following" : ""}`}
                onClick={() => toggleFollow(profile.id)}
              >
                {following[profile.id] ? "Siguiendo" : "+ Seguir"}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
