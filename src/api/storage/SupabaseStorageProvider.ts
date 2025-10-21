import { supabase } from '../supabase';
import { compressImage, validateImage } from '@/utils/imageCompression';
import type { StorageService, MomentImageType } from './StorageService';

/**
 * Supabase implementation of StorageService
 * 
 * Provides file storage using Supabase Storage with automatic image compression.
 * Buckets: moments (1.5MB target), profiles (100KB target), temp-uploads (no compression)
 */
export class SupabaseStorageProvider implements StorageService {
  /**
   * Uploads a moment image (front or back camera) to storage
   * 
   * Flow:
   * 1. Validate: max 50MB, jpeg/png/webp only
   * 2. Compress: target 1.5MB, quality 0.85, max 1920x1920
   * 3. Upload: to 'moments' bucket with path {userId}/{momentId}/{imageType}_camera.jpg
   * 4. Return: public URL
   * 
   * @param userId - The ID of the user uploading the image
   * @param momentId - The ID of the moment this image belongs to
   * @param imageType - Whether this is a 'front' or 'back' camera image
   * @param file - The image file to upload (max 50MB)
   * @returns Promise resolving to the public URL of the uploaded image
   * @throws Error if validation fails, compression fails, or upload fails
   */
  async uploadMomentImage(
    userId: string,
    momentId: string,
    imageType: MomentImageType,
    file: File
  ): Promise<string> {
    try {
      // Validate image
      const validation = await validateImage(file, {
        maxSize: 50 * 1024 * 1024, // 50MB
        allowedTypes: ['image/jpeg', 'image/png', 'image/webp'],
        maxWidth: 8192,
        maxHeight: 8192
      });

      if (!validation.valid) {
        throw new Error(`Image validation failed: ${validation.error}`);
      }

      // Compress image (target: 1.5MB, quality: 0.85)
      const compressed = await compressImage(file, {
        maxSizeMB: 1.5,
        quality: 0.85,
        maxWidth: 1920,
        maxHeight: 1920,
        maintainAspectRatio: true,
        mimeType: 'image/jpeg'
      });

      // Upload to Supabase Storage
      const path = `${userId}/${momentId}/${imageType}_camera.jpg`;
      const { data, error } = await supabase.storage
        .from('moments')
        .upload(path, compressed, {
          upsert: true,
          contentType: 'image/jpeg'
        });

      if (error) {
        throw new Error(`Upload failed: ${error.message}`);
      }

      if (!data) {
        throw new Error('Upload failed: No data returned');
      }

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('moments')
        .getPublicUrl(path);

      if (!urlData?.publicUrl) {
        throw new Error('Failed to get public URL');
      }

      return urlData.publicUrl;
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Moment image upload error: ${error.message}`);
      }
      throw new Error('Moment image upload failed with unknown error');
    }
  }

  /**
   * Uploads a profile/avatar image to storage
   * 
   * Flow:
   * 1. Validate: max 10MB, jpeg/png/webp only
   * 2. Compress: target 100KB, quality 0.8, max 512x512
   * 3. Upload: to 'profiles' bucket with path {userId}/avatar.jpg
   * 4. Return: public URL
   * 
   * @param userId - The ID of the user uploading the profile image
   * @param file - The image file to upload (max 10MB)
   * @returns Promise resolving to the public URL of the uploaded image
   * @throws Error if validation fails, compression fails, or upload fails
   */
  async uploadProfileImage(userId: string, file: File): Promise<string> {
    try {
      // Validate image
      const validation = await validateImage(file, {
        maxSize: 10 * 1024 * 1024, // 10MB
        allowedTypes: ['image/jpeg', 'image/png', 'image/webp'],
        maxWidth: 4096,
        maxHeight: 4096
      });

      if (!validation.valid) {
        throw new Error(`Image validation failed: ${validation.error}`);
      }

      // Compress image (target: 100KB, quality: 0.8)
      const compressed = await compressImage(file, {
        maxSizeMB: 0.1,
        quality: 0.8,
        maxWidth: 512,
        maxHeight: 512,
        maintainAspectRatio: true,
        mimeType: 'image/jpeg'
      });

      // Upload to Supabase Storage
      const path = `${userId}/avatar.jpg`;
      const { data, error } = await supabase.storage
        .from('profiles')
        .upload(path, compressed, {
          upsert: true,
          contentType: 'image/jpeg'
        });

      if (error) {
        throw new Error(`Upload failed: ${error.message}`);
      }

      if (!data) {
        throw new Error('Upload failed: No data returned');
      }

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('profiles')
        .getPublicUrl(path);

      if (!urlData?.publicUrl) {
        throw new Error('Failed to get public URL');
      }

      return urlData.publicUrl;
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Profile image upload error: ${error.message}`);
      }
      throw new Error('Profile image upload failed with unknown error');
    }
  }

  /**
   * Uploads a temporary file to storage
   * 
   * Flow:
   * 1. No validation or compression (temporary buffer)
   * 2. Upload: to 'temp-uploads' bucket with path temp/{userId}/{timestamp}_{filename}
   * 3. Return: public URL
   * 
   * Note: Files auto-deleted after 24 hours (configured via bucket lifecycle)
   * 
   * @param userId - The ID of the user uploading the file
   * @param file - The file to upload (max 100MB)
   * @returns Promise resolving to the public URL of the uploaded file
   * @throws Error if upload fails
   */
  async uploadTempFile(userId: string, file: File): Promise<string> {
    try {
      // No compression for temp files
      const timestamp = Date.now();
      const path = `temp/${userId}/${timestamp}_${file.name}`;

      const { data, error } = await supabase.storage
        .from('temp-uploads')
        .upload(path, file, {
          upsert: false
        });

      if (error) {
        throw new Error(`Upload failed: ${error.message}`);
      }

      if (!data) {
        throw new Error('Upload failed: No data returned');
      }

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('temp-uploads')
        .getPublicUrl(path);

      if (!urlData?.publicUrl) {
        throw new Error('Failed to get public URL');
      }

      return urlData.publicUrl;
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Temp file upload error: ${error.message}`);
      }
      throw new Error('Temp file upload failed with unknown error');
    }
  }

  /**
   * Generates a signed URL for private file access
   * 
   * @param path - The storage path to the file (e.g., "user123/moment456/front_camera.jpg")
   * @param expiresIn - Optional expiration time in seconds (default: 3600 = 1 hour)
   * @returns Promise resolving to a signed URL
   * @throws Error if file doesn't exist or URL generation fails
   */
  async getSignedUrl(path: string, expiresIn: number = 3600): Promise<string> {
    try {
      // Determine bucket from path
      let bucket: string;
      if (path.startsWith('temp/')) {
        bucket = 'temp-uploads';
      } else if (path.includes('/avatar.')) {
        bucket = 'profiles';
      } else {
        bucket = 'moments';
      }

      const { data, error } = await supabase.storage
        .from(bucket)
        .createSignedUrl(path, expiresIn);

      if (error) {
        throw new Error(`Signed URL generation failed: ${error.message}`);
      }

      if (!data?.signedUrl) {
        throw new Error('Signed URL generation failed: No URL returned');
      }

      return data.signedUrl;
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Get signed URL error: ${error.message}`);
      }
      throw new Error('Get signed URL failed with unknown error');
    }
  }

  /**
   * Deletes a file from storage
   * 
   * @param path - The storage path to the file (e.g., "user123/moment456/front_camera.jpg")
   * @throws Error if file doesn't exist or deletion fails
   */
  async deleteFile(path: string): Promise<void> {
    try {
      // Determine bucket from path
      let bucket: string;
      if (path.startsWith('temp/')) {
        bucket = 'temp-uploads';
      } else if (path.includes('/avatar.')) {
        bucket = 'profiles';
      } else {
        bucket = 'moments';
      }

      const { error } = await supabase.storage
        .from(bucket)
        .remove([path]);

      if (error) {
        throw new Error(`Delete failed: ${error.message}`);
      }
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Delete file error: ${error.message}`);
      }
      throw new Error('Delete file failed with unknown error');
    }
  }
}

