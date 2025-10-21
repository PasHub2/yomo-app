import { supabase } from '../../lib/supabaseClient.js';

/**
 * Create a circle membership (add user to circle)
 * @param {string} userId - The user ID
 * @param {string} circleId - The circle ID
 * @param {string} role - The role (default: 'member')
 * @returns {Promise<Object>} Created membership object
 * @throws {Error} If query fails
 */
export const create = async (userId, circleId, role = 'member') => {
  const { data, error } = await supabase
    .from('circle_memberships')
    .insert({ user_id: userId, circle_id: circleId, role })
    .select()
    .single();
  
  if (error) throw new Error(`Failed to create circle membership: ${error.message}`);
  return data;
};

/**
 * Get membership by ID
 * @param {string} id - The membership ID
 * @returns {Promise<Object>} Membership object
 * @throws {Error} If query fails
 */
export const getById = async (id) => {
  const { data, error } = await supabase
    .from('circle_memberships')
    .select('*')
    .eq('id', id)
    .single();
  
  if (error) throw new Error(`Failed to get membership by id: ${error.message}`);
  return data;
};

/**
 * Get all circles a user is member of
 * @param {string} userId - The user ID
 * @param {Object} options - Pagination options
 * @param {number} options.limit - Maximum number of items to return (default: 20)
 * @param {number} options.offset - Number of items to skip (default: 0)
 * @returns {Promise<Array>} Array of membership objects
 * @throws {Error} If query fails
 */
export const getByUser = async (userId, options = {}) => {
  const { limit = 20, offset = 0 } = options;
  
  const { data, error } = await supabase
    .from('circle_memberships')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);
  
  if (error) throw new Error(`Failed to get memberships by user: ${error.message}`);
  return data;
};

/**
 * Get all members of a circle
 * @param {string} circleId - The circle ID
 * @param {Object} options - Pagination options
 * @param {number} options.limit - Maximum number of items to return (default: 20)
 * @param {number} options.offset - Number of items to skip (default: 0)
 * @returns {Promise<Array>} Array of membership objects
 * @throws {Error} If query fails
 */
export const getByCircle = async (circleId, options = {}) => {
  const { limit = 20, offset = 0 } = options;
  
  const { data, error } = await supabase
    .from('circle_memberships')
    .select('*')
    .eq('circle_id', circleId)
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);
  
  if (error) throw new Error(`Failed to get memberships by circle: ${error.message}`);
  return data;
};

/**
 * Update a membership (e.g., change role)
 * @param {string} userId - The user ID
 * @param {string} circleId - The circle ID
 * @param {Object} data - Membership data to update
 * @returns {Promise<Object>} Updated membership object
 * @throws {Error} If query fails
 */
export const update = async (userId, circleId, data) => {
  const { data: updated, error } = await supabase
    .from('circle_memberships')
    .update(data)
    .eq('user_id', userId)
    .eq('circle_id', circleId)
    .select()
    .single();
  
  if (error) throw new Error(`Failed to update membership: ${error.message}`);
  return updated;
};

/**
 * Delete a membership (remove user from circle)
 * @param {string} userId - The user ID
 * @param {string} circleId - The circle ID
 * @returns {Promise<void>}
 * @throws {Error} If query fails
 */
export const deleteById = async (userId, circleId) => {
  const { error } = await supabase
    .from('circle_memberships')
    .delete()
    .eq('user_id', userId)
    .eq('circle_id', circleId);
  
  if (error) throw new Error(`Failed to delete membership: ${error.message}`);
};

