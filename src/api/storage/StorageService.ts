/**
 * Storage bucket type for organizing uploads
 */
export type StorageBucket = 'moments' | 'profiles' | 'temp-uploads';

/**
 * Image type for moment captures
 */
export type MomentImageType = 'front' | 'back';

/**
 * Storage service abstraction layer
 * 
 * This interface defines the contract for storage operations,
 * allowing for easy swapping of storage providers (Supabase → Base SDK in Phase 3)
 */
export interface StorageService {
  /**
   * Uploads a moment image (front or back camera) to storage
   * 
   * Images are compressed to ~1.5MB target before upload.
   * Path: {userId}/{momentId}/{imageType}_camera.jpg
   * 
   * @param userId - The ID of the user uploading the image
   * @param momentId - The ID of the moment this image belongs to
   * @param imageType - Whether this is a 'front' or 'back' camera image
   * @param file - The image file to upload (max 50MB)
   * @returns Promise resolving to the public URL of the uploaded image
   * @throws Error if validation fails, compression fails, or upload fails
   */
  uploadMomentImage(
    userId: string,
    momentId: string,
    imageType: MomentImageType,
    file: File
  ): Promise<string>;

  /**
   * Uploads a profile/avatar image to storage
   * 
   * Images are compressed to ~100KB target before upload.
   * Path: {userId}/avatar.jpg
   * 
   * @param userId - The ID of the user uploading the profile image
   * @param file - The image file to upload (max 10MB)
   * @returns Promise resolving to the public URL of the uploaded image
   * @throws Error if validation fails, compression fails, or upload fails
   */
  uploadProfileImage(userId: string, file: File): Promise<string>;

  /**
   * Uploads a temporary file to storage
   * 
   * Files are stored without compression in a temporary buffer.
   * Auto-deleted after 24 hours.
   * Path: temp/{userId}/{timestamp}_{filename}
   * 
   * @param userId - The ID of the user uploading the file
   * @param file - The file to upload (max 100MB)
   * @returns Promise resolving to the public URL of the uploaded file
   * @throws Error if upload fails
   */
  uploadTempFile(userId: string, file: File): Promise<string>;

  /**
   * Generates a signed URL for private file access
   * 
   * @param path - The storage path to the file
   * @param expiresIn - Optional expiration time in seconds (default: 3600)
   * @returns Promise resolving to a signed URL
   * @throws Error if file doesn't exist or URL generation fails
   */
  getSignedUrl(path: string, expiresIn?: number): Promise<string>;

  /**
   * Deletes a file from storage
   * 
   * @param path - The storage path to the file
   * @throws Error if file doesn't exist or deletion fails
   */
  deleteFile(path: string): Promise<void>;
}

