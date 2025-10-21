import { supabase } from '../../lib/supabaseClient.js';

/**
 * Toggle like on a moment (like if not liked, unlike if already liked)
 * @param {string} userId - The user ID
 * @param {string} momentId - The moment ID
 * @returns {Promise<Object|void>} Created like object or void if unliked
 * @throws {Error} If query fails
 */
export const create = async (userId, momentId) => {
  const existing = await supabase
    .from('likes')
    .select('id')
    .eq('moment_id', momentId)
    .eq('user_id', userId)
    .single();
  
  if (existing.data) {
    return deleteById(existing.data.id);  // Already liked → unlike
  }
  
  const { data, error } = await supabase
    .from('likes')
    .insert({ moment_id: momentId, user_id: userId })
    .select()
    .single();
  
  if (error) throw new Error(`Failed to like: ${error.message}`);
  return data;
};

/**
 * Get all likes for a specific moment
 * @param {string} momentId - The moment ID
 * @param {Object} options - Pagination options
 * @param {number} options.limit - Maximum number of items to return (default: 20)
 * @param {number} options.offset - Number of items to skip (default: 0)
 * @returns {Promise<Array>} Array of like objects
 * @throws {Error} If query fails
 */
export const getByMoment = async (momentId, options = {}) => {
  const { limit = 20, offset = 0 } = options;
  
  const { data, error } = await supabase
    .from('likes')
    .select('*')
    .eq('moment_id', momentId)
    .range(offset, offset + limit - 1);
  
  if (error) throw new Error(`Failed to get likes by moment: ${error.message}`);
  return data;
};

/**
 * Get all likes by a specific user
 * @param {string} userId - The user ID
 * @param {Object} options - Pagination options
 * @param {number} options.limit - Maximum number of items to return (default: 20)
 * @param {number} options.offset - Number of items to skip (default: 0)
 * @returns {Promise<Array>} Array of like objects
 * @throws {Error} If query fails
 */
export const getByUser = async (userId, options = {}) => {
  const { limit = 20, offset = 0 } = options;
  
  const { data, error } = await supabase
    .from('likes')
    .select('*')
    .eq('user_id', userId)
    .range(offset, offset + limit - 1);
  
  if (error) throw new Error(`Failed to get likes by user: ${error.message}`);
  return data;
};

/**
 * Delete a like by ID (hard delete)
 * @param {string} likeId - The like ID
 * @returns {Promise<void>}
 * @throws {Error} If query fails
 */
export const deleteById = async (likeId) => {
  const { error } = await supabase
    .from('likes')
    .delete()
    .eq('id', likeId);
  
  if (error) throw new Error(`Failed to delete like: ${error.message}`);
};

