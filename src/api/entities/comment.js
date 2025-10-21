import { supabase } from '../supabase.ts';

/**
 * Create a new comment
 * @param {Object} data - Comment data to create (must include moment_id, user_id, content)
 * @returns {Promise<Object>} Created comment object
 * @throws {Error} If query fails
 */
export const create = async (data) => {
  const { data: created, error } = await supabase
    .from('comments')
    .insert(data)
    .select()
    .single();
  
  if (error) throw new Error(`Failed to create comment: ${error.message}`);
  return created;
};

/**
 * Get comment by ID
 * @param {string} id - The comment ID
 * @returns {Promise<Object>} Comment object
 * @throws {Error} If query fails
 */
export const getById = async (id) => {
  const { data, error } = await supabase
    .from('comments')
    .select('*')
    .eq('id', id)
    .single();
  
  if (error) throw new Error(`Failed to get comment by id: ${error.message}`);
  return data;
};

/**
 * Get all comments for a specific moment, ordered by newest first
 * @param {string} momentId - The moment ID
 * @param {Object} options - Pagination options
 * @param {number} options.limit - Maximum number of items to return (default: 20)
 * @param {number} options.offset - Number of items to skip (default: 0)
 * @returns {Promise<Array>} Array of comment objects
 * @throws {Error} If query fails
 */
export const getByMoment = async (momentId, options = {}) => {
  const { limit = 20, offset = 0 } = options;
  
  const { data, error } = await supabase
    .from('comments')
    .select('*')
    .eq('moment_id', momentId)
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);
  
  if (error) throw new Error(`Failed to get comments by moment: ${error.message}`);
  return data;
};

/**
 * List all comments with pagination, ordered by newest first
 * @param {Object} options - Pagination options
 * @param {number} options.limit - Maximum number of items to return (default: 20)
 * @param {number} options.offset - Number of items to skip (default: 0)
 * @returns {Promise<Array>} Array of comment objects
 * @throws {Error} If query fails
 */
export const list = async (options = {}) => {
  const { limit = 20, offset = 0 } = options;
  
  const { data, error } = await supabase
    .from('comments')
    .select('*')
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);
  
  if (error) throw new Error(`Failed to list comments: ${error.message}`);
  return data;
};

/**
 * Update comment content
 * @param {string} id - The comment ID
 * @param {string} content - The new comment content
 * @returns {Promise<Object>} Updated comment object
 * @throws {Error} If query fails
 */
export const update = async (id, content) => {
  const { data, error } = await supabase
    .from('comments')
    .update({ content })
    .eq('id', id)
    .select()
    .single();
  
  if (error) throw new Error(`Failed to update comment: ${error.message}`);
  return data;
};

/**
 * Delete comment by ID (hard delete)
 * @param {string} id - The comment ID
 * @returns {Promise<void>}
 * @throws {Error} If query fails
 */
export const deleteById = async (id) => {
  const { error } = await supabase
    .from('comments')
    .delete()
    .eq('id', id);
  
  if (error) throw new Error(`Failed to delete comment: ${error.message}`);
};

