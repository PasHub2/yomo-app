import { supabase } from '../supabase.ts';

/**
 * Create a follow relationship
 * @param {string} followerId - The follower user ID
 * @param {string} followingId - The following user ID (the one being followed)
 * @returns {Promise<Object>} Created follow object
 * @throws {Error} If query fails
 */
export const create = async (followerId, followingId) => {
  const { data, error } = await supabase
    .from('follows')
    .insert({ follower_id: followerId, following_id: followingId })
    .select()
    .single();
  
  if (error) throw new Error(`Failed to create follow: ${error.message}`);
  return data;
};

/**
 * Get all users that a specific user is following
 * @param {string} userId - The user ID
 * @param {Object} options - Pagination options
 * @param {number} options.limit - Maximum number of items to return (default: 20)
 * @param {number} options.offset - Number of items to skip (default: 0)
 * @returns {Promise<Array>} Array of follow objects
 * @throws {Error} If query fails
 */
export const getFollowing = async (userId, options = {}) => {
  const { limit = 20, offset = 0 } = options;
  
  const { data, error } = await supabase
    .from('follows')
    .select('*')
    .eq('follower_id', userId)
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);
  
  if (error) throw new Error(`Failed to get following: ${error.message}`);
  return data;
};

/**
 * Get all followers of a specific user
 * @param {string} userId - The user ID
 * @param {Object} options - Pagination options
 * @param {number} options.limit - Maximum number of items to return (default: 20)
 * @param {number} options.offset - Number of items to skip (default: 0)
 * @returns {Promise<Array>} Array of follow objects
 * @throws {Error} If query fails
 */
export const getFollowers = async (userId, options = {}) => {
  const { limit = 20, offset = 0 } = options;
  
  const { data, error } = await supabase
    .from('follows')
    .select('*')
    .eq('following_id', userId)
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);
  
  if (error) throw new Error(`Failed to get followers: ${error.message}`);
  return data;
};

/**
 * Update follow relationship (e.g., accept follow request)
 * @param {string} followerId - The follower user ID
 * @param {string} followingId - The following user ID
 * @param {boolean} accepted - Whether the follow is accepted
 * @returns {Promise<Object>} Updated follow object
 * @throws {Error} If query fails
 */
export const update = async (followerId, followingId, accepted) => {
  const { data, error } = await supabase
    .from('follows')
    .update({ accepted })
    .eq('follower_id', followerId)
    .eq('following_id', followingId)
    .select()
    .single();
  
  if (error) throw new Error(`Failed to update follow: ${error.message}`);
  return data;
};

/**
 * Delete follow relationship (unfollow) - hard delete
 * @param {string} followerId - The follower user ID
 * @param {string} followingId - The following user ID
 * @returns {Promise<void>}
 * @throws {Error} If query fails
 */
export const deleteById = async (followerId, followingId) => {
  const { error } = await supabase
    .from('follows')
    .delete()
    .eq('follower_id', followerId)
    .eq('following_id', followingId);
  
  if (error) throw new Error(`Failed to delete follow: ${error.message}`);
};

