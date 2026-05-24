import { useState, useEffect } from 'react'
import { postService } from '@/services/postService'
import { useAuth } from '@/context/AuthContext'
import PostCard from '@/components/social/PostCard'
import CreatePostModal from '@/components/social/CreatePostModal'
import UserSearchModal from '@/components/social/UserSearchModal'
import { FiSearch } from 'react-icons/fi'
import { FaHandPointUp } from "react-icons/fa";
import { FaCoffee } from "react-icons/fa";
import './HomePage.css'

export default function HomePage() {
  const { user } = useAuth()
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [showSearch, setShowSearch] = useState(false)
  const [feedTab, setFeedTab] = useState('global')
  const [showFriends, setShowFriends] = useState(false)

  useEffect(() => {
    loadFeed()
  }, [feedTab])

  const loadFeed = async () => {
    setLoading(true)
    try {
      const data = feedTab === 'following'
        ? await postService.getFollowingFeed(user.id)
        : await postService.getFeed()
      setPosts(data)
    } catch (err) {
      console.error('Error cargando feed:', err)
    } finally {
      setLoading(false)
    }
  }

  const handlePostCreated = async () => { await loadFeed() }
  const handlePostDeleted = (postId) => { setPosts(prev => prev.filter(p => p.id !== postId)) }

  return (
    <div className="home-page">
      <div className="home-header">
        <h1 className="home-title">Feed</h1>
        <div className="home-header-actions">
          <button className="home-search-btn" onClick={() => setShowSearch(true)}>
            <FiSearch size={18} />
          </button>
          <button className="home-new-post-btn" onClick={() => setShowModal(true)}>
            + Nueva publicación
          </button>
        </div>
      </div>

      <div className="home-feed-tabs">
        <button
          className={`home-feed-tab ${feedTab === 'global' ? 'active' : ''}`}
          onClick={() => setFeedTab('global')}
        >
          Para ti
        </button>
        <button
          className={`home-feed-tab ${feedTab === 'following' ? 'active' : ''}`}
          onClick={() => setFeedTab('following')}
        >
          Siguiendo
        </button>
      </div>

      <div className="home-feed">
        {loading && <div className="home-loading">Cargando publicaciones...</div>}

        {!loading && posts.length === 0 && (
          <div className="home-empty">
            {feedTab === 'following'
              ? <><p>Aún no sigues a nadie.</p><p>Busca usuarios con la lupa <FaHandPointUp />.</p></>
              : <><p>Aún no hay publicaciones.</p><p>¡Sé el primero en compartir tu café! <FaCoffee /></p></>
            }
          </div>
        )}

        {posts.map(post => (
          <PostCard key={post.id} post={post} onDelete={handlePostDeleted} />
        ))}
      </div>

      <button className="home-fab" onClick={() => setShowModal(true)}>+</button>

      {showModal && (
        <CreatePostModal onClose={() => setShowModal(false)} onPostCreated={handlePostCreated} />
      )}
      {showSearch && <UserSearchModal onClose={() => setShowSearch(false)} />}
    </div>
  )
}