// Página de perfil del usuario actual
import { useAuth } from '@/context/AuthContext'
import './ProfilePages.css'

export default function ProfilePage() {
  const { user, profile } = useAuth()

  return (
    <div className="profile-page">
      <div className="profile-header">
        <div className="profile-avatar-lg">
          {profile?.avatar_url
            ? <img src={profile.avatar_url} alt="avatar" />
            : user?.email?.charAt(0).toUpperCase()
          }
        </div>
        <h2 className="profile-username">{profile?.username || 'Usuario'}</h2>
        {profile?.bio && <p className="profile-bio">{profile.bio}</p>}
        {profile?.location && <p className="profile-location">📍 {profile.location}</p>}
      </div>
    </div>
  )
}