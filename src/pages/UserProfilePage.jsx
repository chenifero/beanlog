import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { profileService } from "@/services/profileService";
import { postService } from "@/services/postService";
import { followService } from "@/services/followService";
import { useAuth } from "@/context/AuthContext";
import PostCard from "@/components/social/PostCard";
import "./UserProfilePage.css";

export default function UserProfilePage() {
  const { username } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const p = await profileService.getProfileByUsername(username);
        setProfile(p);
        const [data, following] = await Promise.all([
          postService.getPostsByUserId(p.id),
          followService.isFollowing(user.id, p.id),
        ]);
        setPosts(data);
        setIsFollowing(following);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [username]);

  const toggleFollow = async () => {
    setFollowLoading(true);
    try {
      if (isFollowing) {
        await followService.unfollow(user.id, profile.id);
      } else {
        await followService.follow(user.id, profile.id);
      }
      setIsFollowing(prev => !prev);
    } catch (err) {
      console.error(err);
    } finally {
      setFollowLoading(false);
    }
  };

  if (loading) return <div className="uprofile-loading">Cargando...</div>;
  if (!profile) return <div className="uprofile-loading">Usuario no encontrado</div>;

  const isOwnProfile = user.id === profile.id;

  return (
    <div className="uprofile-page">
      <button className="uprofile-close" onClick={() => navigate(-1)}>✕</button>

      <div className="uprofile-header">
        <div className="uprofile-avatar">
          {profile.avatar_url ? (
            <img src={profile.avatar_url} alt={profile.username} />
          ) : (
            profile.username?.charAt(0).toUpperCase()
          )}
        </div>
        <h2 className="uprofile-username">{profile.display_name || profile.username}</h2>
        <p className="uprofile-handle">@{profile.username}</p>
        {profile.bio && <p className="uprofile-bio">{profile.bio}</p>}
        {profile.location && <p className="uprofile-location">📍 {profile.location}</p>}

        {!isOwnProfile && (
          <button
            className={`uprofile-follow-btn ${isFollowing ? "following" : ""}`}
            onClick={toggleFollow}
            disabled={followLoading}
          >
            {followLoading ? "..." : isFollowing ? "Siguiendo" : "+ Seguir"}
          </button>
        )}
      </div>

      <div className="uprofile-posts">
        {posts.length === 0 ? (
          <p className="uprofile-empty">Sin publicaciones</p>
        ) : (
          posts.map((post) => <PostCard key={post.id} post={post} />)
        )}
      </div>
    </div>
  );
}