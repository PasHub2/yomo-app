import { supabase } from '../supabase.ts';

/**
 * Create a new moment
 * @param {Object} data - Moment data to create
 * @returns {Promise<Object>} Created moment object
 * @throws {Error} If query fails
 */
export const create = async (data) => {
  const { data: created, error } = await supabase
    .from('moments')
    .insert(data)
    .select()
    .single();
  
  if (error) throw new Error(`Failed to create moment: ${error.message}`);
  return created;
};

/**
 * Get moment by ID
 * @param {string} id - The moment ID
 * @returns {Promise<Object>} Moment object
 * @throws {Error} If query fails
 */
export const getById = async (id) => {
  const { data, error } = await supabase
    .from('moments')
    .select('*')
    .eq('id', id)
    .single();
  
  if (error) throw new Error(`Failed to get moment by id: ${error.message}`);
  return data;
};

/**
 * Get moments created by a specific user
 * @param {string} userId - The user ID
 * @param {Object} options - Pagination options
 * @param {number} options.limit - Maximum number of items to return (default: 20)
 * @param {number} options.offset - Number of items to skip (default: 0)
 * @returns {Promise<Array>} Array of moment objects
 * @throws {Error} If query fails
 */
export const getByUser = async (userId, options = {}) => {
  const { limit = 20, offset = 0 } = options;
  
  const { data, error } = await supabase
    .from('moments')
    .select('*')
    .eq('created_by', userId)
    .range(offset, offset + limit - 1);
  
  if (error) throw new Error(`Failed to get moments by user: ${error.message}`);
  return data;
};

/**
 * Get moments in a specific circle (via moment_circles join)
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
  
  if (error) throw new Error(`Failed to get moments by circle: ${error.message}`);
  return data.map(row => row.moments);
};

/**
 * List all moments with pagination
 * @param {Object} options - Pagination options
 * @param {number} options.limit - Maximum number of items to return (default: 20)
 * @param {number} options.offset - Number of items to skip (default: 0)
 * @returns {Promise<Array>} Array of moment objects
 * @throws {Error} If query fails
 */
export const list = async (options = {}) => {
  const { limit = 20, offset = 0 } = options;
  
  const { data, error } = await supabase
    .from('moments')
    .select('*')
    .range(offset, offset + limit - 1);
  
  if (error) throw new Error(`Failed to list moments: ${error.message}`);
  return data;
};

/**
 * Filter moments with custom criteria and pagination
 * @param {Object} filters - Filter criteria (e.g., { created_by: 'user-id', title: 'My moment' })
 * @param {Object} options - Pagination options
 * @param {number} options.limit - Maximum number of items to return (default: 20)
 * @param {number} options.offset - Number of items to skip (default: 0)
 * @returns {Promise<Array>} Array of moment objects matching filters
 * @throws {Error} If query fails
 */
export const filter = async (filters = {}, options = {}) => {
  const { limit = 20, offset = 0 } = options;
  let query = supabase.from('moments').select('*');
  
  for (const [key, value] of Object.entries(filters)) {
    if (value !== undefined && value !== null) {
      query = query.eq(key, value);
    }
  }
  
  query = query.range(offset, offset + limit - 1);
  const { data, error } = await query;
  
  if (error) throw new Error(`Failed to filter moments: ${error.message}`);
  return data;
};

/**
 * Update moment by ID
 * @param {string} id - The moment ID
 * @param {Object} data - Moment data to update
 * @returns {Promise<Object>} Updated moment object
 * @throws {Error} If query fails
 */
export const update = async (id, data) => {
  const { data: updated, error } = await supabase
    .from('moments')
    .update(data)
    .eq('id', id)
    .select()
    .single();
  
  if (error) throw new Error(`Failed to update moment: ${error.message}`);
  return updated;
};

/**
 * Soft delete a moment by ID
 * Sets is_deleted to true and deleted_at to current timestamp
 * @param {string} id - The moment ID
 * @returns {Promise<Object>} Soft-deleted moment object
 * @throws {Error} If query fails
 */
export const deleteById = async (id) => {
  const { data, error } = await supabase
    .from('moments')
    .update({ 
      is_deleted: true, 
      deleted_at: new Date().toISOString() 
    })
    .eq('id', id)
    .select()
    .single();
  
  if (error) throw new Error(`Failed to delete moment: ${error.message}`);
  return data;
};

