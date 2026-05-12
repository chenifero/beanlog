// Página principal — feed de publicaciones de la comunidad
// Muestra posts de todos los usuarios y permite crear nuevos

import { useState, useEffect } from 'react'
import { postService } from '@/services/postService'
import { useAuth } from '@/context/AuthContext'
import PostCard from '@/components/social/PostCard'
import CreatePostModal from '@/components/social/CreatePostModal'
import './HomePage.css'

export default function HomePage() {
  const { user } = useAuth()
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)

  // Carga el feed al entrar en la página
  useEffect(() => {
    loadFeed()
  }, [])

  const loadFeed = async () => {
  try {
    const data = await postService.getFeed()
    setPosts(data)
  } catch (err) {
    console.error('Error cargando feed:', err)
  } finally {
    setLoading(false)
  }
}

  // Añade el nuevo post al principio del feed sin recargar todo
  // Recarga el feed completo para que el nuevo post tenga todos los datos
  const handlePostCreated = async () => {
    await loadFeed()
  }

  // Elimina el post del feed localmente
  const handlePostDeleted = (postId) => {
    setPosts(prev => prev.filter(p => p.id !== postId))
  }

  return (
    <div className="home-page">

      {/* Header */}
      <div className="home-header">
        <h1 className="home-title">Feed</h1>
        <button className="home-new-post-btn" onClick={() => setShowModal(true)}>
          + Nueva publicación
        </button>
      </div>

      {/* Feed */}
      <div className="home-feed">
        {loading && (
          <div className="home-loading">Cargando publicaciones...</div>
        )}

        {!loading && posts.length === 0 && (
          <div className="home-empty">
            <p>Aún no hay publicaciones.</p>
            <p>¡Sé el primero en compartir tu café! ☕</p>
          </div>
        )}

        {posts.map(post => (
          <PostCard
            key={post.id}
            post={post}
            onDelete={handlePostDeleted}
          />
        ))}
      </div>

      {/* Botón flotante para móvil */}
      <button className="home-fab" onClick={() => setShowModal(true)}>+</button>

      {/* Modal de crear publicación */}
      {showModal && (
        <CreatePostModal
          onClose={() => setShowModal(false)}
          onPostCreated={handlePostCreated}
        />
      )}

    </div>
  )
}