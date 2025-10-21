import { supabase } from '../../lib/supabaseClient.js';

/**
 * Create a new circle
 * @param {Object} data - Circle data to create
 * @returns {Promise<Object>} Created circle object
 * @throws {Error} If query fails
 */
export const create = async (data) => {
  const { data: created, error } = await supabase
    .from('circles')
    .insert(data)
    .select()
    .single();
  
  if (error) throw new Error(`Failed to create circle: ${error.message}`);
  return created;
};

/**
 * Get circle by ID
 * @param {string} id - The circle ID
 * @returns {Promise<Object>} Circle object
 * @throws {Error} If query fails
 */
export const getById = async (id) => {
  const { data, error } = await supabase
    .from('circles')
    .select('*')
    .eq('id', id)
    .single();
  
  if (error) throw new Error(`Failed to get circle by id: ${error.message}`);
  return data;
};

/**
 * Get circles created by a specific user
 * @param {string} userId - The user ID
 * @param {Object} options - Pagination options
 * @param {number} options.limit - Maximum number of items to return (default: 20)
 * @param {number} options.offset - Number of items to skip (default: 0)
 * @returns {Promise<Array>} Array of circle objects
 * @throws {Error} If query fails
 */
export const getByCreator = async (userId, options = {}) => {
  const { limit = 20, offset = 0 } = options;
  
  const { data, error } = await supabase
    .from('circles')
    .select('*')
    .eq('created_by', userId)
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);
  
  if (error) throw new Error(`Failed to get circles by creator: ${error.message}`);
  return data;
};

/**
 * Get all public circles, ordered by newest first
 * @param {Object} options - Pagination options
 * @param {number} options.limit - Maximum number of items to return (default: 20)
 * @param {number} options.offset - Number of items to skip (default: 0)
 * @returns {Promise<Array>} Array of public circle objects
 * @throws {Error} If query fails
 */
export const getPublic = async (options = {}) => {
  const { limit = 20, offset = 0 } = options;
  
  const { data, error } = await supabase
    .from('circles')
    .select('*')
    .eq('is_public', true)
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);
  
  if (error) throw new Error(`Failed to get public circles: ${error.message}`);
  return data;
};

/**
 * List all circles with pagination, ordered by newest first
 * @param {Object} options - Pagination options
 * @param {number} options.limit - Maximum number of items to return (default: 20)
 * @param {number} options.offset - Number of items to skip (default: 0)
 * @returns {Promise<Array>} Array of circle objects
 * @throws {Error} If query fails
 */
export const list = async (options = {}) => {
  const { limit = 20, offset = 0 } = options;
  
  const { data, error } = await supabase
    .from('circles')
    .select('*')
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);
  
  if (error) throw new Error(`Failed to list circles: ${error.message}`);
  return data;
};

/**
 * Filter circles with custom criteria and pagination
 * @param {Object} filters - Filter criteria (e.g., { created_by: 'user-id', is_public: true })
 * @param {Object} options - Pagination options
 * @param {number} options.limit - Maximum number of items to return (default: 20)
 * @param {number} options.offset - Number of items to skip (default: 0)
 * @returns {Promise<Array>} Array of circle objects matching filters
 * @throws {Error} If query fails
 */
export const filter = async (filters = {}, options = {}) => {
  const { limit = 20, offset = 0 } = options;
  let query = supabase.from('circles').select('*');
  
  for (const [key, value] of Object.entries(filters)) {
    if (value !== undefined && value !== null) {
      query = query.eq(key, value);
    }
  }
  
  query = query
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);
  
  const { data, error } = await query;
  
  if (error) throw new Error(`Failed to filter circles: ${error.message}`);
  return data;
};

/**
 * Update circle by ID
 * @param {string} id - The circle ID
 * @param {Object} data - Circle data to update
 * @returns {Promise<Object>} Updated circle object
 * @throws {Error} If query fails
 */
export const update = async (id, data) => {
  const { data: updated, error } = await supabase
    .from('circles')
    .update(data)
    .eq('id', id)
    .select()
    .single();
  
  if (error) throw new Error(`Failed to update circle: ${error.message}`);
  return updated;
};

/**
 * Delete circle by ID (hard delete)
 * @param {string} id - The circle ID
 * @returns {Promise<void>}
 * @throws {Error} If query fails
 */
export const deleteById = async (id) => {
  const { error } = await supabase
    .from('circles')
    .delete()
    .eq('id', id);
  
  if (error) throw new Error(`Failed to delete circle: ${error.message}`);
};

