import { createContext, useContext, useState, ReactNode } from 'react';
import { SupabaseStorageProvider } from './SupabaseStorageProvider';
import type { MomentImageType } from './StorageService';

/**
 * Storage context value type
 */
interface StorageContextValue {
  uploadMomentImage: (
    userId: string,
    momentId: string,
    imageType: MomentImageType,
    file: File
  ) => Promise<string>;
  uploadProfileImage: (userId: string, file: File) => Promise<string>;
  uploadTempFile: (userId: string, file: File) => Promise<string>;
  getSignedUrl: (path: string, expiresIn?: number) => Promise<string>;
  deleteFile: (path: string) => Promise<void>;
}

/**
 * Storage provider props
 */
interface StorageProviderProps {
  children: ReactNode;
}

/**
 * Storage context
 */
const StorageContext = createContext<StorageContextValue | undefined>(undefined);

/**
 * Storage Provider Component
 * 
 * Wraps the application and provides storage operations.
 * Handles image compression and upload to Supabase Storage.
 * 
 * @example
 * ```tsx
 * <StorageProvider>
 *   <App />
 * </StorageProvider>
 * ```
 */
export function StorageProvider({ children }: StorageProviderProps) {
  const [storageService] = useState(() => new SupabaseStorageProvider());

  /**
   * Uploads a moment image (front or back camera)
   * 
   * @param userId - The ID of the user uploading the image
   * @param momentId - The ID of the moment
   * @param imageType - 'front' or 'back' camera
   * @param file - The image file to upload
   * @returns Promise resolving to the public URL
   */
  const uploadMomentImage = async (
    userId: string,
    momentId: string,
    imageType: MomentImageType,
    file: File
  ): Promise<string> => {
    return storageService.uploadMomentImage(userId, momentId, imageType, file);
  };

  /**
   * Uploads a profile/avatar image
   * 
   * @param userId - The ID of the user
   * @param file - The image file to upload
   * @returns Promise resolving to the public URL
   */
  const uploadProfileImage = async (userId: string, file: File): Promise<string> => {
    return storageService.uploadProfileImage(userId, file);
  };

  /**
   * Uploads a temporary file
   * 
   * @param userId - The ID of the user
   * @param file - The file to upload
   * @returns Promise resolving to the public URL
   */
  const uploadTempFile = async (userId: string, file: File): Promise<string> => {
    return storageService.uploadTempFile(userId, file);
  };

  /**
   * Generates a signed URL for private file access
   * 
   * @param path - The storage path to the file
   * @param expiresIn - Optional expiration time in seconds
   * @returns Promise resolving to a signed URL
   */
  const getSignedUrl = async (path: string, expiresIn?: number): Promise<string> => {
    return storageService.getSignedUrl(path, expiresIn);
  };

  /**
   * Deletes a file from storage
   * 
   * @param path - The storage path to the file
   */
  const deleteFile = async (path: string): Promise<void> => {
    return storageService.deleteFile(path);
  };

  const value: StorageContextValue = {
    uploadMomentImage,
    uploadProfileImage,
    uploadTempFile,
    getSignedUrl,
    deleteFile
  };

  return <StorageContext.Provider value={value}>{children}</StorageContext.Provider>;
}

/**
 * Hook to access storage operations
 * 
 * Must be used within a StorageProvider component.
 * 
 * @returns Storage context value with upload, getSignedUrl, and delete methods
 * @throws Error if used outside of StorageProvider
 * 
 * @example
 * ```tsx
 * function MomentCapture() {
 *   const { uploadMomentImage } = useStorage();
 *   const { user } = useAuth();
 *   
 *   const handleCapture = async (file: File) => {
 *     const url = await uploadMomentImage(
 *       user.id,
 *       'moment123',
 *       'front',
 *       file
 *     );
 *     console.log('Uploaded:', url);
 *   };
 *   
 *   return <CameraInterface onCapture={handleCapture} />;
 * }
 * ```
 * 
 * @example
 * ```tsx
 * function ProfileSettings() {
 *   const { uploadProfileImage } = useStorage();
 *   const { user } = useAuth();
 *   
 *   const handleAvatarChange = async (file: File) => {
 *     const url = await uploadProfileImage(user.id, file);
 *     console.log('Avatar updated:', url);
 *   };
 *   
 *   return <input type="file" onChange={(e) => handleAvatarChange(e.target.files[0])} />;
 * }
 * ```
 */
export function useStorage(): StorageContextValue {
  const context = useContext(StorageContext);

  if (context === undefined) {
    throw new Error('useStorage must be used within a StorageProvider');
  }

  return context;
}

