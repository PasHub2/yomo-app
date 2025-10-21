import { supabase } from '../supabase.ts';

/**
 * Add a user to a circle's whitelist
 * @param {string} circleId - The circle ID
 * @param {string} userId - The user ID
 * @returns {Promise<Object>} Created whitelist entry object
 * @throws {Error} If query fails
 */
export const create = async (circleId, userId) => {
  const { data, error } = await supabase
    .from('circle_whitelist')
    .insert({ circle_id: circleId, user_id: userId })
    .select()
    .single();
  
  if (error) throw new Error(`Failed to create whitelist entry: ${error.message}`);
  return data;
};

/**
 * Get all whitelisted users for a specific circle, ordered by newest first
 * @param {string} circleId - The circle ID
 * @param {Object} options - Pagination options
 * @param {number} options.limit - Maximum number of items to return (default: 20)
 * @param {number} options.offset - Number of items to skip (default: 0)
 * @returns {Promise<Array>} Array of whitelist entry objects
 * @throws {Error} If query fails
 */
export const getByCircle = async (circleId, options = {}) => {
  const { limit = 20, offset = 0 } = options;
  
  const { data, error } = await supabase
    .from('circle_whitelist')
    .select('*')
    .eq('circle_id', circleId)
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);
  
  if (error) throw new Error(`Failed to get whitelist by circle: ${error.message}`);
  return data;
};

/**
 * Remove a user from a circle's whitelist using composite key (hard delete)
 * @param {string} circleId - The circle ID
 * @param {string} userId - The user ID
 * @returns {Promise<void>}
 * @throws {Error} If query fails
 */
export const deleteById = async (circleId, userId) => {
  const { error } = await supabase
    .from('circle_whitelist')
    .delete()
    .eq('circle_id', circleId)
    .eq('user_id', userId);
  
  if (error) throw new Error(`Failed to delete whitelist entry: ${error.message}`);
};

