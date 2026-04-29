// Storage Service
// Handles file uploads, photo evidence, and document storage with metadata

const STORAGE_PREFIX = 'fleet_ops_storage';

class StorageService {
  constructor() {
    this.storageKey = `${STORAGE_PREFIX}_files`;
  }

  /**
   * Store a file with metadata
   * @param {string} documentId - Related document ID
   * @param {string} fileType - Type (photo, struk, signature, document)
   * @param {string} category - Category (muatan, checklist_pre, checklist_post, pod, lpj, etc.)
   * @param {string} dataUrl - Base64 data URL or file path
   * @param {object} metadata - Additional metadata
   * @returns {object} Stored file record
   */
  storeFile(documentId, fileType, category, dataUrl, metadata = {}) {
    const record = {
      id: this._generateId(),
      documentId,
      fileType,
      category,
      dataUrl,
      metadata: {
        timestamp: new Date().toISOString(),
        fileSize: dataUrl.length,
        ...metadata,
      },
    };

    const files = this._getFiles();
    files.push(record);
    this._saveFiles(files);

    return record;
  }

  /**
   * Get all files for a document
   */
  getFilesByDocument(documentId) {
    return this._getFiles().filter(f => f.documentId === documentId);
  }

  /**
   * Get files by category
   */
  getFilesByCategory(category) {
    return this._getFiles().filter(f => f.category === category);
  }

  /**
   * Get required photos for a document type
   */
  getRequiredPhotos(documentType, documentId) {
    const files = this.getFilesByDocument(documentId);
    return files.filter(f => f.fileType === 'photo');
  }

  /**
   * Check if minimum photo requirements are met
   */
  checkPhotoRequirements(documentType, documentId, requirements) {
    const files = this.getFilesByDocument(documentId);
    const photos = files.filter(f => f.fileType === 'photo');

    for (const req of requirements) {
      const matching = photos.filter(p => p.category === req.category);
      if (matching.length < req.minimum) {
        return {
          met: false,
          missing: req.category,
          required: req.minimum,
          current: matching.length,
        };
      }
    }

    return { met: true };
  }

  /**
   * Delete a file
   */
  deleteFile(fileId) {
    const files = this._getFiles().filter(f => f.id !== fileId);
    this._saveFiles(files);
  }

  /**
   * Convert file to base64 data URL
   */
  fileToDataUrl(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  /**
   * Compress image before storage
   */
  compressImage(file, maxWidth = 1200, maxHeight = 800, quality = 0.7) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;

          if (width > maxWidth) {
            height = (height * maxWidth) / width;
            width = maxWidth;
          }
          if (height > maxHeight) {
            width = (width * maxHeight) / height;
            height = maxHeight;
          }

          canvas.width = width;
          canvas.height = height;

          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);

          resolve(canvas.toDataURL('image/jpeg', quality));
        };
        img.onerror = reject;
        img.src = e.target.result;
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  _generateId() {
    return `FILE-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  _getFiles() {
    try {
      const data = localStorage.getItem(this.storageKey);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  _saveFiles(files) {
    // Warning: localStorage has ~5MB limit
    // In production, this should use IndexedDB or cloud storage
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(files));
    } catch (e) {
      console.warn('Storage limit reached. Consider using IndexedDB or cloud storage.');
      throw new Error('Storage limit reached');
    }
  }
}

export const storageService = new StorageService();
export default storageService;
