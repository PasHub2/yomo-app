/**
 * Image Compression Utilities for YoMo
 * 
 * Pure TypeScript utilities for client-side image compression and validation.
 * Optimized for yomo-app: Moments (~1.5MB target), Profiles (~100KB target)
 */

/**
 * Compression options for image processing
 */
export interface CompressionOptions {
    /** Maximum width in pixels (default: 1920) */
    maxWidth?: number;
    /** Maximum height in pixels (default: 1920) */
    maxHeight?: number;
    /** JPEG quality 0-1 (default: 0.85) */
    quality?: number;
    /** Target max file size in MB (default: 1.5) */
    maxSizeMB?: number;
    /** Output MIME type (default: 'image/jpeg') */
    mimeType?: string;
    /** Maintain original aspect ratio (default: true) */
    maintainAspectRatio?: boolean;
  }
  
  /**
   * Validation options for image checks
   */
  export interface ValidationOptions {
    /** Maximum file size in bytes (default: 10MB) */
    maxSize?: number;
    /** Allowed MIME types (default: jpeg, png, webp) */
    allowedTypes?: string[];
    /** Maximum width in pixels (default: 8192) */
    maxWidth?: number;
    /** Maximum height in pixels (default: 8192) */
    maxHeight?: number;
  }
  
  /**
   * Resize options for image resizing
   */
  export interface ResizeOptions {
    /** How to fit the image: 'cover' or 'contain' (default: 'cover') */
    fit?: 'cover' | 'contain';
    /** JPEG quality 0-1 (default: 0.92) */
    quality?: number;
  }
  
  /**
   * Image information object
   */
  export interface ImageInfo {
    width: number;
    height: number;
    size: number;
    type: string;
    name: string;
  }
  
  /**
   * Validation result object
   */
  export interface ValidationResult {
    valid: boolean;
    error?: string;
  }
  
  /**
   * Compresses an image file to target quality with automatic size optimization
   * 
   * Recursively reduces quality if file exceeds maxSizeMB target.
   * Optimized for YoMo: Moments (1.5MB), Profiles (100KB)
   * 
   * @param file - The image file to compress
   * @param options - Compression options
   * @returns Promise resolving to compressed image as File object
   * @throws Error if file is not a valid image or processing fails
   * 
   * @example
   * ```ts
   * const compressed = await compressImage(file, {
   *   maxSizeMB: 1.5,
   *   quality: 0.85,
   *   maxWidth: 1920
   * });
   * ```
   */
  export async function compressImage(
    file: File | Blob,
    options: CompressionOptions = {}
  ): Promise<File> {
    const {
      maxWidth = 1920,
      maxHeight = 1920,
      quality = 0.85,
      maxSizeMB = 1.5,
      mimeType = 'image/jpeg',
      maintainAspectRatio = true
    } = options;
  
    return new Promise((resolve, reject) => {
      // Validate input
      if (!file || !(file instanceof Blob)) {
        reject(new Error('Invalid file: must be a File or Blob object'));
        return;
      }
  
      if (!file.type.startsWith('image/')) {
        reject(new Error(`Invalid file type: ${file.type} is not an image`));
        return;
      }
  
      // Create image element
      const img = new Image();
      const reader = new FileReader();
  
      reader.onerror = () => {
        reject(new Error('Failed to read file'));
      };
      
      reader.onload = (e) => {
        img.onerror = () => {
          reject(new Error('Failed to load image'));
        };
        
        img.onload = async () => {
          try {
            // Calculate new dimensions
            let { width, height } = img;
            
            if (maintainAspectRatio) {
              if (width > maxWidth || height > maxHeight) {
                const ratio = Math.min(maxWidth / width, maxHeight / height);
                width = Math.round(width * ratio);
                height = Math.round(height * ratio);
              }
            } else {
              width = Math.min(width, maxWidth);
              height = Math.min(height, maxHeight);
            }
  
            // Create canvas and draw image
            const canvas = document.createElement('canvas');
            canvas.width = width;
            canvas.height = height;
            
            const ctx = canvas.getContext('2d');
            if (!ctx) {
              reject(new Error('Failed to get canvas context'));
              return;
            }
  
            ctx.imageSmoothingEnabled = true;
            ctx.imageSmoothingQuality = 'high';
            
            // Draw image on canvas
            ctx.drawImage(img, 0, 0, width, height);
  
            // Convert to blob with optimization loop
            canvas.toBlob(
              async (blob) => {
                if (!blob) {
                  reject(new Error('Failed to create blob from canvas'));
                  return;
                }
  
                // Target check: reduce quality if too large
                if (blob.size > maxSizeMB * 1024 * 1024 && quality > 0.5) {
                  try {
                    // Recursive call with lower quality
                    const recompressed = await compressImage(file, {
                      ...options,
                      quality: quality - 0.1
                    });
                    resolve(recompressed);
                    return;
                  } catch (err) {
                    // Recompression failed, continue with current blob
                  }
                }
                
                // Create File from Blob
                const fileName = file instanceof File ? file.name : 'compressed-image.jpg';
                const compressedFile = new File(
                  [blob],
                  fileName.replace(/\.\w+$/, '.jpg') || 'compressed-image.jpg',
                  { type: mimeType, lastModified: Date.now() }
                );
  
                resolve(compressedFile);
              },
              mimeType,
              quality
            );
          } catch (error) {
            reject(new Error(`Canvas processing failed: ${error instanceof Error ? error.message : 'Unknown error'}`));
          }
        };
  
        img.src = e.target?.result as string;
      };
  
      reader.readAsDataURL(file);
    });
  }
  
  /**
   * Batch compress multiple images with optimization
   * 
   * @param files - Array of image files to compress
   * @param options - Compression options (same as compressImage)
   * @returns Promise resolving to array of compressed images
   * @throws Error if any compression fails
   * 
   * @example
   * ```ts
   * const compressed = await batchCompressImages(files, {
   *   maxSizeMB: 1.5,
   *   quality: 0.85
   * });
   * ```
   */
  export async function batchCompressImages(
    files: File[],
    options: CompressionOptions = {}
  ): Promise<File[]> {
    try {
      const results = await Promise.all(
        files.map(file => compressImage(file, options))
      );
      return results;
    } catch (error) {
      throw new Error(`Batch compression failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
  
  /**
   * Check if a file is an image
   * 
   * @param file - The file to check
   * @returns True if file is an image
   * 
   * @example
   * ```ts
   * if (isImageFile(file)) {
   *   // Process image
   * }
   * ```
   */
  export function isImageFile(file: File | Blob): boolean {
    return file && file.type.startsWith('image/');
  }
  
  /**
   * Get image dimensions and file info
   * 
   * @param file - The image file
   * @returns Promise resolving to object with width, height, size, type, name
   * @throws Error if file is not an image or reading fails
   * 
   * @example
   * ```ts
   * const info = await getImageInfo(file);
   * console.log(`Image: ${info.width}x${info.height}, ${info.size} bytes`);
   * ```
   */
  export async function getImageInfo(file: File | Blob): Promise<ImageInfo> {
    return new Promise((resolve, reject) => {
      if (!isImageFile(file)) {
        reject(new Error('Not an image file'));
        return;
      }
  
      const img = new Image();
      const reader = new FileReader();
  
      reader.onerror = () => reject(new Error('Failed to read file'));
      
      reader.onload = (e) => {
        img.onerror = () => reject(new Error('Failed to load image'));
        
        img.onload = () => {
          resolve({
            width: img.width,
            height: img.height,
            size: file.size,
            type: file.type,
            name: file instanceof File ? file.name : 'unknown'
          });
        };
  
        img.src = e.target?.result as string;
      };
  
      reader.readAsDataURL(file);
    });
  }
  
  /**
   * Validate image file (size, type, dimensions)
   * 
   * @param file - The image file to validate
   * @param options - Validation options
   * @returns Promise resolving to object with { valid: boolean, error?: string }
   * 
   * @example
   * ```ts
   * const result = await validateImage(file, {
   *   maxSize: 50 * 1024 * 1024, // 50MB
   *   allowedTypes: ['image/jpeg', 'image/png']
   * });
   * 
   * if (!result.valid) {
   *   throw new Error(result.error);
   * }
   * ```
   */
  export async function validateImage(
    file: File,
    options: ValidationOptions = {}
  ): Promise<ValidationResult> {
    const {
      maxSize = 10 * 1024 * 1024, // 10MB
      allowedTypes = ['image/jpeg', 'image/png', 'image/webp'],
      maxWidth = 8192,
      maxHeight = 8192
    } = options;
  
    // Check if it's a file
    if (!file) {
      return { valid: false, error: 'No file provided' };
    }
  
    // Check if it's an image
    if (!isImageFile(file)) {
      return { valid: false, error: 'File is not an image' };
    }
  
    // Check file type
    if (!allowedTypes.includes(file.type)) {
      return { valid: false, error: `File type ${file.type} not allowed` };
    }
  
    // Check file size
    if (file.size > maxSize) {
      return { valid: false, error: `File size exceeds ${Math.round(maxSize / 1024 / 1024)}MB limit` };
    }
  
    // Check dimensions
    try {
      const info = await getImageInfo(file);
      if (info.width > maxWidth || info.height > maxHeight) {
        return { valid: false, error: `Image dimensions exceed ${maxWidth}x${maxHeight}px limit` };
      }
    } catch (error) {
      return { valid: false, error: 'Failed to read image dimensions' };
    }
  
    return { valid: true };
  }
  
  /**
   * Resize image to exact dimensions (cropping if needed)
   * 
   * @param file - The image file to resize
   * @param targetWidth - Target width in pixels
   * @param targetHeight - Target height in pixels
   * @param options - Additional options (fit, quality)
   * @returns Promise resolving to resized image as File object
   * @throws Error if resizing fails
   * 
   * @example
   * ```ts
   * // Resize to 512x512 with cover (crop to fill)
   * const resized = await resizeImage(file, 512, 512, { fit: 'cover' });
   * ```
   */
  export async function resizeImage(
    file: File | Blob,
    targetWidth: number,
    targetHeight: number,
    options: ResizeOptions = {}
  ): Promise<File> {
    const {
      fit = 'cover',
      quality = 0.92
    } = options;
  
    return new Promise((resolve, reject) => {
      if (!isImageFile(file)) {
        reject(new Error('File is not an image'));
        return;
      }
  
      const img = new Image();
      const reader = new FileReader();
  
      reader.onerror = () => reject(new Error('Failed to read file'));
      
      reader.onload = (e) => {
        img.onerror = () => reject(new Error('Failed to load image'));
        
        img.onload = () => {
          try {
            const canvas = document.createElement('canvas');
            canvas.width = targetWidth;
            canvas.height = targetHeight;
            
            const ctx = canvas.getContext('2d');
            if (!ctx) {
              reject(new Error('Failed to get canvas context'));
              return;
            }
  
            ctx.imageSmoothingEnabled = true;
            ctx.imageSmoothingQuality = 'high';
  
            let sx: number, sy: number, sWidth: number, sHeight: number;
            let dx: number, dy: number, dWidth: number, dHeight: number;
  
            if (fit === 'cover') {
              // Object-fit: cover logic (crop to fill)
              const sourceRatio = img.width / img.height;
              const targetRatio = targetWidth / targetHeight;
  
              if (sourceRatio > targetRatio) {
                sHeight = img.height;
                sWidth = Math.round(img.height * targetRatio);
                sx = Math.round((img.width - sWidth) / 2);
                sy = 0;
              } else {
                sWidth = img.width;
                sHeight = Math.round(img.width / targetRatio);
                sx = 0;
                sy = Math.round((img.height - sHeight) / 2);
              }
  
              dx = 0;
              dy = 0;
              dWidth = targetWidth;
              dHeight = targetHeight;
            } else {
              // Object-fit: contain logic
              const ratio = Math.min(targetWidth / img.width, targetHeight / img.height);
              dWidth = Math.round(img.width * ratio);
              dHeight = Math.round(img.height * ratio);
              dx = Math.round((targetWidth - dWidth) / 2);
              dy = Math.round((targetHeight - dHeight) / 2);
              
              sx = 0;
              sy = 0;
              sWidth = img.width;
              sHeight = img.height;
  
              ctx.fillStyle = '#000000';
              ctx.fillRect(0, 0, targetWidth, targetHeight);
            }
  
            ctx.drawImage(
              img,
              sx, sy, sWidth, sHeight,
              dx, dy, dWidth, dHeight
            );
  
            canvas.toBlob(
              (blob) => {
                if (!blob) {
                  reject(new Error('Failed to create blob from canvas'));
                  return;
                }
                
                const fileName = file instanceof File ? file.name : 'resized-image.jpg';
                const resizedFile = new File(
                  [blob],
                  fileName || 'resized-image.jpg',
                  { type: 'image/jpeg', lastModified: Date.now() }
                );
                
                resolve(resizedFile);
              },
              'image/jpeg',
              quality
            );
          } catch (error) {
            reject(new Error(`Resize failed: ${error instanceof Error ? error.message : 'Unknown error'}`));
          }
        };
  
        img.src = e.target?.result as string;
      };
  
      reader.readAsDataURL(file);
    });
  }
  
  