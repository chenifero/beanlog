// Servicio para gestionar las publicaciones del feed
// Maneja creación, listado, eliminación y subida de fotos

import { supabase } from "./supabase";
import { notificationService } from "./notificationService";

export const postService = {
  // Obtiene el feed completo ordenao por fecha
  async getFeed(limit = 20, offset = 0) {
    const { data, error } = await supabase
      .from("posts")
      .select(
        `
      *,
      profiles!posts_user_id_fkey (
        id,
        username,
        avatar_url,
        experience_level
      ),
      tastings (
        id,
        puntuacion,
        notas,
        radar_data,
        cafes_master (
          nombre,
          origen,
          proceso,
          tueste
        )
      ),
      coffee_shops (
        id,
        nombre,
        lat,
        lng
      )
    `,
      )
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) throw error;
    return data;
  },

  // Obtiene TODAS las publicaciones de un usuario específico por su ID
  async getPostsByUserId(userId) {
    const { data, error } = await supabase
      .from("posts")
      .select(
        `
      *,
      profiles (username, avatar_url, experience_level),
      tastings (puntuacion, cafes_master (nombre, origen)),
      coffee_shops (nombre)
    `,
      )
      .eq("user_id", userId)
      .order("created_at", { ascending: false });
    if (error) throw error;
    return data;
  },

  // Obtiene una publicación por su ID
  async getPostById(postId) {
    const { data, error } = await supabase
      .from("posts")
      .select(
        `
      *,
      profiles!posts_user_id_fkey (
        id,
        username,
        display_name,
        avatar_url,
        experience_level
      ),
      tastings (
        id,
        puntuacion,
        notas,
        radar_data,
        cafes_master (
          nombre,
          origen,
          proceso,
          tueste
        )
      ),
      coffee_shops (
        id,
        nombre,
        lat,
        lng,
        ciudad,
        pais
      )
    `,
      )
      .eq("id", postId)
      .single();

    if (error) throw error;
    return data;
  },

  // Obtiene solo las publicaciones de los usuarios que sigue el usuario actual
  async getFollowingFeed(userId, limit = 20, offset = 0) {
    // Primero obtenemos los IDs de usuarios seguidos
    const { data: follows, error: followsError } = await supabase
      .from("follows")
      .select("following_id")
      .eq("user_id", userId);

    if (followsError) throw followsError;

    const followingIds = follows.map((f) => f.following_id);

    if (followingIds.length === 0) return [];

    const { data, error } = await supabase
      .from("posts")
      .select(
        `
      *,
      profiles (
        id,
        username,
        avatar_url,
        experience_level
      ),
      tastings (
        id,
        puntuacion,
        notas,
        cafes_master (
          nombre,
          origen
        )
      ),
      coffee_shops (
        id,
        nombre
      )
    `,
      )
      .in("user_id", followingIds)
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) throw error;
    return data;
  },

  // Crea una nueva publicación
  async createPost(
    userId,
    {
      type,
      content,
      imageUrls = [],
      tastingId = null,
      coffeeShopId = null,
      rating = null,
    },
  ) {
    const { data, error } = await supabase
      .from("posts")
      .insert({
        user_id: userId,
        type,
        content,
        image_urls: imageUrls,
        tasting_id: tastingId,
        coffee_shop_id: coffeeShopId,
        rating,
      })
      .select()
      .single();

    if (error) throw error;
    try {
      const { data: followers } = await supabase
        .from("follows")
        .select("user_id")
        .eq("following_id", userId);
      if (followers?.length) {
        await Promise.allSettled(
          followers.map((f) =>
            notificationService.createNotification(
              f.user_id,
              userId,
              "new_post",
              data.id,
            ),
          ),
        );
      }
    } catch (e) {
      console.warn("Notificaciones no creadas:", e);
    }
    return data;
    return data;
  },

  // Elimina una publicación — solo el autor puede borrar la suya
  async deletePost(postId) {
    const { error } = await supabase.from("posts").delete().eq("id", postId);

    if (error) throw error;
  },

  // Sube múltiples fotos al bucket 'posts' y devuelve sus URLs públicas
  async uploadImages(userId, files) {
    const urls = [];

    for (const file of files) {
      const fileExt = file.name.split(".").pop();
      // Nombre único usando timestamp para evitar colisiones
      const filePath = `${userId}/${Date.now()}-${Math.random().toString(36).slice(2)}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("posts")
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data } = supabase.storage.from("posts").getPublicUrl(filePath);

      urls.push(data.publicUrl);
    }

    return urls;
  },

  // Obtiene el número de likes de un post
  async getLikesCount(postId) {
    const { count, error } = await supabase
      .from("likes")
      .select("*", { count: "exact", head: true })
      .eq("post_id", postId);

    if (error) throw error;
    return count;
  },

  // Comprueba si el usuario actual ha dado like a un post
  async hasLiked(userId, postId) {
    const { data, error } = await supabase
      .from("likes")
      .select("id")
      .eq("user_id", userId)
      .eq("post_id", postId)
      .maybeSingle();

    if (error) throw error;
    return !!data;
  },

  // Alterna el like de un post — si tiene like lo quita, si no lo añade
  async toggleLike(userId, postId) {
    const liked = await postService.hasLiked(userId, postId);

    if (liked) {
      const { error } = await supabase
        .from("likes")
        .delete()
        .eq("user_id", userId)
        .eq("post_id", postId);
      if (error) throw error;
      return false;
    } else {
      const { error } = await supabase
        .from("likes")
        .insert({ user_id: userId, post_id: postId });
      if (error) throw error;
      try {
        const { data: post } = await supabase
          .from("posts")
          .select("user_id")
          .eq("id", postId)
          .single();
        if (post)
          await notificationService.createNotification(
            post.user_id,
            userId,
            "like",
            postId,
          );
      } catch (e) {
        console.warn("Notificación no creada:", e);
      }
      return true;
      return true;
    }
  },

  // Obtiene los comentarios de un post con el perfil del autor
  async getComments(postId) {
    const { data, error } = await supabase
      .from("comments")
      .select(
        `
        *,
        profiles (
          username,
          avatar_url
        )
      `,
      )
      .eq("post_id", postId)
      .order("created_at", { ascending: true });

    if (error) throw error;
    return data;
  },

  // Añade un comentario a un post
  async addComment(userId, postId, content) {
    const { data, error } = await supabase
      .from("comments")
      .insert({ user_id: userId, post_id: postId, content })
      .select(
        `
        *,
        profiles (
          username,
          avatar_url
        )
      `,
      )
      .single();

    if (error) throw error;
    try {
      const { data: post } = await supabase
        .from("posts")
        .select("user_id")
        .eq("id", postId)
        .single();
      if (post)
        await notificationService.createNotification(
          post.user_id,
          userId,
          "comment",
          postId,
        );
    } catch (e) {
      console.warn("Notificación no creada:", e);
    }
    return data;
  },

  // Obtiene el número de comentarios de un post
  async getCommentsCount(postId) {
    const { count, error } = await supabase
      .from("comments")
      .select("*", { count: "exact", head: true })
      .eq("post_id", postId);
    if (error) throw error;
    return count;
  },
};
