import { useState, useEffect } from 'react'
import { followService } from '@/services/followService'
import { profileService } from '@/services/profileService'
import { useAuth } from '@/context/AuthContext'

export function useMentionSuggestions() {
  const { user } = useAuth()
  const [following, setFollowing] = useState([])

  useEffect(() => {
    if (!user?.id) return
    followService.getFollowing(user.id)
      .then(setFollowing)
      .catch(console.error)
  }, [user?.id])

  const getSuggestions = async (query) => {
    if (!query) {
      return following.slice(0, 3)
    }
    // Primero filtra los que sigues
    const fromFollowing = following.filter(p =>
      p.username?.toLowerCase().includes(query.toLowerCase()) ||
      p.display_name?.toLowerCase().includes(query.toLowerCase())
    )
    if (fromFollowing.length >= 3) return fromFollowing.slice(0, 5)

    // Si no hay suficientes, busca en todos
    try {
      const results = await profileService.searchUsers(query)
      const filtered = results.filter(r => r.id !== user.id)
      // Mezcla priorizando los que sigues
      const ids = new Set(fromFollowing.map(p => p.id))
      const extra = filtered.filter(p => !ids.has(p.id))
      return [...fromFollowing, ...extra].slice(0, 5)
    } catch {
      return fromFollowing.slice(0, 5)
    }
  }

  return { getSuggestions }
}