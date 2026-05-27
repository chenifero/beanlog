import { supabase } from './supabase'

export const savedPostsService = {
  async savePost(userId, postId) {
    const { error } = await supabase
      .from('saved_posts')
      .insert({ user_id: userId, post_id: postId })
    if (error) throw error
  },

  async unsavePost(userId, postId) {
    const { error } = await supabase
      .from('saved_posts')
      .delete()
      .eq('user_id', userId)
      .eq('post_id', postId)
    if (error) throw error
  },

  async isSaved(userId, postId) {
    const { data, error } = await supabase
      .from('saved_posts')
      .select('id')
      .eq('user_id', userId)
      .eq('post_id', postId)
      .maybeSingle()
    if (error) throw error
    return !!data
  },

  async getSavedPosts(userId) {
    const { data, error } = await supabase
      .from('saved_posts')
      .select(`
        id,
        created_at,
        posts (
          *,
          profiles!posts_user_id_fkey (
            id, username, display_name, avatar_url, experience_level
          ),
          tastings (
            id, puntuacion,
            cafes_master ( nombre, origen )
          ),
          coffee_shops ( id, nombre )
        )
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
    if (error) throw error
    return data.map(d => d.posts)
  }
}