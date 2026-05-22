import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { profileService } from '@/services/profileService'
import { postService } from '@/services/postService'
import PostCard from '@/components/social/PostCard'
import './UserProfilePage.css'

export default function UserProfilePage() {
  const { username } = useParams()
  const navigate = useNavigate()
  const [profile, setProfile] = useState(null)
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      try {
        const p = await profileService.getProfileByUsername(username)
        setProfile(p)
        const data = await postService.getPostsByUserId(p.id)
        setPosts(data)
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [username])

  if (loading) return <div className="uprofile-loading">Cargando...</div>
  if (!profile) return <div className="uprofile-loading">Usuario no encontrado</div>

  return (
    <div className="uprofile-page">
      <button className="uprofile-close" onClick={() => navigate(-1)}>✕</button>

      <div className="uprofile-header">
        <div className="uprofile-avatar">
          {profile.avatar_url
            ? <img src={profile.avatar_url} alt={profile.username} />
            : profile.username?.charAt(0).toUpperCase()
          }
        </div>
        <h2 className="uprofile-username">{profile.username}</h2>
        {profile.bio && <p className="uprofile-bio">{profile.bio}</p>}
        {profile.location && <p className="uprofile-location">📍 {profile.location}</p>}
      </div>

      <div className="uprofile-posts">
        {posts.length === 0
          ? <p className="uprofile-empty">Sin publicaciones</p>
          : posts.map(post => <PostCard key={post.id} post={post} />)
        }
      </div>
    </div>
  )
}