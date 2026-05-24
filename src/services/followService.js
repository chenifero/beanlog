//Maneja los seguimientos entre users

import { supabase } from './supabase'

export const followService = {
  async follow(userId, targetId) {
    const { error } = await supabase
      .from('follows')
      .insert({ user_id: userId, following_id: targetId })
    if (error) throw error
  },

  async unfollow(userId, targetId) {
    const { error } = await supabase
      .from('follows')
      .delete()
      .eq('user_id', userId)
      .eq('following_id', targetId)
    if (error) throw error
  },

  async isFollowing(userId, targetId) {
    const { data, error } = await supabase
      .from('follows')
      .select('id')
      .eq('user_id', userId)
      .eq('following_id', targetId)
      .maybeSingle()
    if (error) throw error
    return !!data
  },

  async getFollowing(userId) {
    const { data, error } = await supabase
      .from('follows')
      .select('following_id, profiles!follows_following_id_fkey(id, username, avatar_url, bio)')
      .eq('user_id', userId)
    if (error) throw error
    return data.map(d => d.profiles)
  },

  async getFollowers(userId) {
    const { data, error } = await supabase
      .from('follows')
      .select('user_id, profiles!follows_user_id_fkey(id, username, avatar_url, bio)')
      .eq('following_id', userId)
    if (error) throw error
    return data.map(d => d.profiles)
  },
}