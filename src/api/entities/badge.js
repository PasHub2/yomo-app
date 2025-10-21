import { supabase } from '../supabase.ts';

/**
 * Create a new badge
 * @param {Object} data - Badge data to create
 * @returns {Promise<Object>} Created badge object
 * @throws {Error} If query fails
 */
export const create = async (data) => {
  const { data: created, error } = await supabase
    .from('badges')
    .insert(data)
    .select()
    .single();
  
  if (error) throw new Error(`Failed to create badge: ${error.message}`);
  return created;
};

/**
 * Get badge by ID
 * @param {string} id - The badge ID
 * @returns {Promise<Object>} Badge object
 * @throws {Error} If query fails
 */
export const getById = async (id) => {
  const { data, error } = await supabase
    .from('badges')
    .select('*')
    .eq('id', id)
    .single();
  
  if (error) throw new Error(`Failed to get badge by id: ${error.message}`);
  return data;
};

/**
 * Get all badges for a specific user
 * @param {string} userId - The user ID
 * @param {Object} options - Pagination options
 * @param {number} options.limit - Maximum number of items to return (default: 20)
 * @param {number} options.offset - Number of items to skip (default: 0)
 * @returns {Promise<Array>} Array of badge objects
 * @throws {Error} If query fails
 */
export const getByUser = async (userId, options = {}) => {
  const { limit = 20, offset = 0 } = options;
  
  const { data, error } = await supabase
    .from('badges')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);
  
  if (error) throw new Error(`Failed to get badges by user: ${error.message}`);
  return data;
};

/**
 * Get all badges for a specific circle
 * @param {string} circleId - The circle ID
 * @param {Object} options - Pagination options
 * @param {number} options.limit - Maximum number of items to return (default: 20)
 * @param {number} options.offset - Number of items to skip (default: 0)
 * @returns {Promise<Array>} Array of badge objects
 * @throws {Error} If query fails
 */
export const getByCircle = async (circleId, options = {}) => {
  const { limit = 20, offset = 0 } = options;
  
  const { data, error } = await supabase
    .from('badges')
    .select('*')
    .eq('circle_id', circleId)
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);
  
  if (error) throw new Error(`Failed to get badges by circle: ${error.message}`);
  return data;
};

/**
 * Get all badges for a specific user in a specific circle
 * @param {string} userId - The user ID
 * @param {string} circleId - The circle ID
 * @param {Object} options - Pagination options
 * @param {number} options.limit - Maximum number of items to return (default: 20)
 * @param {number} options.offset - Number of items to skip (default: 0)
 * @returns {Promise<Array>} Array of badge objects
 * @throws {Error} If query fails
 */
export const getByUserCircle = async (userId, circleId, options = {}) => {
  const { limit = 20, offset = 0 } = options;
  
  const { data, error } = await supabase
    .from('badges')
    .select('*')
    .eq('user_id', userId)
    .eq('circle_id', circleId)
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);
  
  if (error) throw new Error(`Failed to get badges by user and circle: ${error.message}`);
  return data;
};

/**
 * List all badges with pagination, ordered by newest first
 * @param {Object} options - Pagination options
 * @param {number} options.limit - Maximum number of items to return (default: 20)
 * @param {number} options.offset - Number of items to skip (default: 0)
 * @returns {Promise<Array>} Array of badge objects
 * @throws {Error} If query fails
 */
export const list = async (options = {}) => {
  const { limit = 20, offset = 0 } = options;
  
  const { data, error } = await supabase
    .from('badges')
    .select('*')
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);
  
  if (error) throw new Error(`Failed to list badges: ${error.message}`);
  return data;
};

/**
 * Filter badges with custom criteria and pagination
 * @param {Object} filters - Filter criteria (e.g., { user_id: 'user-id', circle_id: 'circle-id' })
 * @param {Object} options - Pagination options
 * @param {number} options.limit - Maximum number of items to return (default: 20)
 * @param {number} options.offset - Number of items to skip (default: 0)
 * @returns {Promise<Array>} Array of badge objects matching filters
 * @throws {Error} If query fails
 */
export const filter = async (filters = {}, options = {}) => {
  const { limit = 20, offset = 0 } = options;
  let query = supabase.from('badges').select('*');
  
  for (const [key, value] of Object.entries(filters)) {
    if (value !== undefined && value !== null) {
      query = query.eq(key, value);
    }
  }
  
  query = query
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);
  
  const { data, error } = await query;
  
  if (error) throw new Error(`Failed to filter badges: ${error.message}`);
  return data;
};

