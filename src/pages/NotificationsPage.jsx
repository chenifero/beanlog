import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { notificationService } from '@/services/notificationService'
import { useAuth } from '@/context/AuthContext'
import './NotificationsPage.css'

function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  const hours = Math.floor(mins / 60)
  const days = Math.floor(hours / 24)
  if (mins < 1) return 'ahora mismo'
  if (mins < 60) return `hace ${mins}m`
  if (hours < 24) return `hace ${hours}h`
  return `hace ${days}d`
}

function notificationText(type) {
  switch (type) {
    case 'follow': return 'ha empezado a seguirte'
    case 'like': return 'ha dado like a tu publicación'
    case 'comment': return 'ha comentado tu publicación'
    case 'new_post': return 'ha publicado algo nuevo'
    default: return ''
  }
}

export default function NotificationsPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      try {
        const data = await notificationService.getNotifications(user.id)
        setNotifications(data)
        await notificationService.markAllAsRead(user.id)
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [user.id])

  const handleClick = (notif) => {
    if (notif.post_id) navigate(`/post/${notif.post_id}`)
    else navigate(`/user/${notif.actor?.username}`)
  }

  return (
    <div className="notif-page">
      <div className="notif-header">
        <h2>Notificaciones</h2>
      </div>
      {loading && <p className="notif-empty">Cargando...</p>}
      {!loading && notifications.length === 0 && (
        <p className="notif-empty">No tienes notificaciones</p>
      )}
      <div className="notif-list">
        {notifications.map(notif => (
          <div
            key={notif.id}
            className={`notif-item ${!notif.read ? 'unread' : ''}`}
            onClick={() => handleClick(notif)}
          >
            <div
              className="notif-avatar"
              onClick={(e) => {
                e.stopPropagation()
                navigate(`/user/${notif.actor?.username}`)
              }}
            >
              {notif.actor?.avatar_url
                ? <img src={notif.actor.avatar_url} alt={notif.actor.username} />
                : notif.actor?.username?.charAt(0).toUpperCase()
              }
            </div>
            <div className="notif-body">
              <span className="notif-actor">{notif.actor?.display_name || notif.actor?.username}</span>
              {' '}
              <span className="notif-text">{notificationText(notif.type)}</span>
            </div>
            <span className="notif-time">{timeAgo(notif.created_at)}</span>
          </div>
        ))}
      </div>
    </div>
  )
}