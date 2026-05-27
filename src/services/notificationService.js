import { supabase } from './supabase'

export const notificationService = {
  async createNotification(userId, actorId, type, postId = null) {
    if (userId === actorId) return // no notificarse a uno mismo
    const { error } = await supabase
      .from('notifications')
      .insert({ user_id: userId, actor_id: actorId, type, post_id: postId })
    if (error) throw error
  },

  async getNotifications(userId) {
    const { data, error } = await supabase
      .from('notifications')
      .select(`
        *,
        actor:profiles!notifications_actor_id_fkey (
          id, username, display_name, avatar_url
        )
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(50)
    if (error) throw error
    return data
  },

  async getUnreadCount(userId) {
    const { count, error } = await supabase
      .from('notifications')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('read', false)
    if (error) throw error
    return count
  },

  async markAllAsRead(userId) {
    const { error } = await supabase
      .from('notifications')
      .update({ read: true })
      .eq('user_id', userId)
      .eq('read', false)
    if (error) throw error
  },

  async markAsRead(notificationId) {
    const { error } = await supabase
      .from('notifications')
      .update({ read: true })
      .eq('id', notificationId)
    if (error) throw error
  }
}