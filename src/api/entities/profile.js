import { supabase } from '../../lib/supabaseClient.js';

/**
 * Get profile by email address
 * @param {string} email - The user's email address
 * @returns {Promise<Object>} Profile object
 * @throws {Error} If query fails
 */
export const getByEmail = async (email) => {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('email', email)
    .single();
  
  if (error) throw new Error(`Failed to get profile by email: ${error.message}`);
  return data;
};

/**
 * Get profile by username
 * @param {string} username - The username
 * @returns {Promise<Object>} Profile object
 * @throws {Error} If query fails
 */
export const getByUsername = async (username) => {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('username', username)
    .single();
  
  if (error) throw new Error(`Failed to get profile by username: ${error.message}`);
  return data;
};

/**
 * Get profile by ID
 * @param {string} id - The profile ID
 * @returns {Promise<Object>} Profile object
 * @throws {Error} If query fails
 */
export const getById = async (id) => {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', id)
    .single();
  
  if (error) throw new Error(`Failed to get profile by id: ${error.message}`);
  return data;
};

/**
 * List all profiles with pagination
 * @param {Object} options - Pagination options
 * @param {number} options.limit - Maximum number of items to return (default: 20)
 * @param {number} options.offset - Number of items to skip (default: 0)
 * @returns {Promise<Array>} Array of profile objects
 * @throws {Error} If query fails
 */
export const list = async (options = {}) => {
  const { limit = 20, offset = 0 } = options;
  
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .range(offset, offset + limit - 1);
  
  if (error) throw new Error(`Failed to list profiles: ${error.message}`);
  return data;
};

/**
 * Update profile by ID
 * Note: RLS policies ensure users can only update their own profile
 * @param {string} id - The profile ID
 * @param {Object} data - Profile data to update
 * @returns {Promise<Object>} Updated profile object
 * @throws {Error} If query fails
 */
export const update = async (id, data) => {
  const { data: updated, error } = await supabase
    .from('profiles')
    .update(data)
    .eq('id', id)
    .select()
    .single();
  
  if (error) throw new Error(`Failed to update profile: ${error.message}`);
  return updated;
};

/**
 * Filter profiles with custom criteria and pagination
 * @param {Object} filters - Filter criteria (e.g., { username: 'john', email: 'john@example.com' })
 * @param {Object} options - Pagination options
 * @param {number} options.limit - Maximum number of items to return (default: 20)
 * @param {number} options.offset - Number of items to skip (default: 0)
 * @returns {Promise<Array>} Array of profile objects matching filters
 * @throws {Error} If query fails
 */
export const filter = async (filters = {}, options = {}) => {
  const { limit = 20, offset = 0 } = options;
  let query = supabase.from('profiles').select('*');
  
  for (const [key, value] of Object.entries(filters)) {
    if (value !== undefined && value !== null) {
      query = query.eq(key, value);
    }
  }
  
  query = query.range(offset, offset + limit - 1);
  const { data, error } = await query;
  
  if (error) throw new Error(`Failed to filter profiles: ${error.message}`);
  return data;
};

