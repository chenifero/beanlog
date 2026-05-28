import { supabase } from './supabase'

export const coffeeShopStatusService = {

  async getStatus(userId, coffeeShopId) {
    const { data, error } = await supabase
      .from('user_coffee_shop_status')
      .select('status')
      .eq('user_id', userId)
      .eq('coffee_shop_id', coffeeShopId)
      .maybeSingle()
    if (error) throw error
    return data?.status || null
  },

  async getUserStatuses(userId) {
    const { data, error } = await supabase
      .from('user_coffee_shop_status')
      .select('coffee_shop_id, status')
      .eq('user_id', userId)
    if (error) throw error
    return Object.fromEntries(data.map(r => [r.coffee_shop_id, r.status]))
  },

  async setStatus(userId, coffeeShopId, status) {
    const current = await coffeeShopStatusService.getStatus(userId, coffeeShopId)

    if (current === status) {
      const { error } = await supabase
        .from('user_coffee_shop_status')
        .delete()
        .eq('user_id', userId)
        .eq('coffee_shop_id', coffeeShopId)
      if (error) throw error
      return null
    }

    const { error } = await supabase
      .from('user_coffee_shop_status')
      .upsert({ user_id: userId, coffee_shop_id: coffeeShopId, status })
    if (error) throw error
    return status
  },
}