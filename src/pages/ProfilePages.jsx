// Página de perfil del usuario actual
import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { IoSettings } from 'react-icons/io5'
import { useAuth } from '@/context/AuthContext'
import './ProfilePages.css'

export default function ProfilePage() {
  const { user, profile, refreshProfile } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (user?.id) refreshProfile(user.id)
  }, [user?.id])


  return (
    <div className="profile-page">
      <div className="profile-header">
        <button className="profile-settings-btn" onClick={() => navigate('/settings')}>
          <IoSettings size={26} />
        </button>
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