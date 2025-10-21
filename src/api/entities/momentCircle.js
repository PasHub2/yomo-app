import { supabase } from '../../lib/supabaseClient.js';

/**
 * Create a moment-circle link (add moment to circle)
 * @param {string} momentId - The moment ID
 * @param {string} circleId - The circle ID
 * @returns {Promise<Object>} Created moment-circle link object
 * @throws {Error} If query fails
 */
export const create = async (momentId, circleId) => {
  const { data, error } = await supabase
    .from('moment_circles')
    .insert({ moment_id: momentId, circle_id: circleId })
    .select()
    .single();
  
  if (error) throw new Error(`Failed to create moment-circle link: ${error.message}`);
  return data;
};

/**
 * Get all circles for a specific moment
 * @param {string} momentId - The moment ID
 * @param {Object} options - Pagination options
 * @param {number} options.limit - Maximum number of items to return (default: 20)
 * @param {number} options.offset - Number of items to skip (default: 0)
 * @returns {Promise<Array>} Array of moment-circle link objects
 * @throws {Error} If query fails
 */
export const getByMoment = async (momentId, options = {}) => {
  const { limit = 20, offset = 0 } = options;
  
  const { data, error } = await supabase
    .from('moment_circles')
    .select('*')
    .eq('moment_id', momentId)
    .range(offset, offset + limit - 1);
  
  if (error) throw new Error(`Failed to get circles by moment: ${error.message}`);
  return data;
};

/**
 * Get all moments in a specific circle (returns full moment objects)
 * @param {string} circleId - The circle ID
 * @param {Object} options - Pagination options
 * @param {number} options.limit - Maximum number of items to return (default: 20)
 * @param {number} options.offset - Number of items to skip (default: 0)
 * @returns {Promise<Array>} Array of moment objects
 * @throws {Error} If query fails
 */
export const getByCircle = async (circleId, options = {}) => {
  const { limit = 20, offset = 0 } = options;
  
  const { data, error } = await supabase
    .from('moment_circles')
    .select('moments(*)')
    .eq('circle_id', circleId)
    .range(offset, offset + limit - 1);
  
  if (error) throw new Error(`Failed to fetch moments: ${error.message}`);
  return data.map(row => row.moments);
};

/**
 * Delete a moment-circle link using composite key (hard delete)
 * @param {string} momentId - The moment ID
 * @param {string} circleId - The circle ID
 * @returns {Promise<void>}
 * @throws {Error} If query fails
 */
export const deleteById = async (momentId, circleId) => {
  const { error } = await supabase
    .from('moment_circles')
    .delete()
    .eq('moment_id', momentId)
    .eq('circle_id', circleId);
  
  if (error) throw new Error(`Failed to delete moment-circle link: ${error.message}`);
};

