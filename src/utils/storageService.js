// Storage Service (IndexedDB backed)
// Handles file uploads, photo evidence, and document storage with metadata.
// Much higher capacity than localStorage — ideal for prototype/testing with photos.
// Data remains local to this browser/device only (perfect for single-device testing).

const DB_NAME = 'fleet_ops_files';
const STORE_NAME = 'attachments';
const DB_VERSION = 1;

// Old localStorage key for migration
const OLD_LOCAL_KEY = 'fleet_ops_storage_files';

class StorageService {
  constructor() {
    this.cache = [];           // In-memory cache for sync-like reads
    this.db = null;
    this.ready = this._initDB(); // Promise that resolves when DB + cache ready
  }

  async _initDB() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onerror = () => {
        console.error('IndexedDB open failed:', request.error);
        // Fallback behavior: keep empty cache. App can still run.
        resolve(null);
      };

      request.onsuccess = async (event) => {
        this.db = event.target.result;
        await this._loadAllToCache();
        await this._migrateFromLocalStorageIfNeeded();
        resolve(this.db);
      };

      request.onupgradeneeded = (event) => {
        const db = event.target.result;
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          const store = db.createObjectStore(STORE_NAME, { keyPath: 'id' });
          store.createIndex('documentId', 'documentId', { unique: false });
          store.createIndex('category', 'category', { unique: false });
          store.createIndex('timestamp', 'metadata.timestamp', { unique: false });
        }
      };
    });
  }

  async _loadAllToCache() {
    if (!this.db) {
      this.cache = [];
      return;
    }
    return new Promise((resolve) => {
      try {
        const tx = this.db.transaction([STORE_NAME], 'readonly');
        const store = tx.objectStore(STORE_NAME);
        const req = store.getAll();
        req.onsuccess = () => {
          this.cache = req.result || [];
          resolve();
        };
        req.onerror = () => {
          this.cache = [];
          resolve();
        };
      } catch {
        this.cache = [];
        resolve();
      }
    });
  }

  async _migrateFromLocalStorageIfNeeded() {
    try {
      if (!this.db) return;

      const oldData = localStorage.getItem(OLD_LOCAL_KEY);
      if (!oldData) return;

      const oldFiles = JSON.parse(oldData);
      if (!Array.isArray(oldFiles) || oldFiles.length === 0) {
        localStorage.removeItem(OLD_LOCAL_KEY);
        return;
      }

      // Bulk insert into IDB
      const tx = this.db.transaction([STORE_NAME], 'readwrite');
      const store = tx.objectStore(STORE_NAME);

      let migrated = 0;
      for (const file of oldFiles) {
        // Put will overwrite if same id exists
        store.put(file);
        migrated++;
      }

      await new Promise((res) => { tx.oncomplete = res; tx.onerror = res; });

      // Clear old localStorage after successful migration
      localStorage.removeItem(OLD_LOCAL_KEY);

      // Refresh cache
      await this._loadAllToCache();

      console.info(`[storageService] Migrated ${migrated} photo/attachment records from localStorage → IndexedDB (higher capacity).`);
    } catch (e) {
      console.warn('[storageService] Migration from localStorage skipped/failed:', e);
    }
  }

  async _persistRecord(record) {
    if (!this.db) return;
    return new Promise((resolve) => {
      try {
        const tx = this.db.transaction([STORE_NAME], 'readwrite');
        tx.objectStore(STORE_NAME).put(record);
        tx.oncomplete = resolve;
        tx.onerror = resolve; // best effort
      } catch {
        resolve();
      }
    });
  }

  async _deleteRecord(id) {
    if (!this.db) return;
    return new Promise((resolve) => {
      try {
        const tx = this.db.transaction([STORE_NAME], 'readwrite');
        tx.objectStore(STORE_NAME).delete(id);
        tx.oncomplete = resolve;
        tx.onerror = resolve;
      } catch {
        resolve();
      }
    });
  }

  async _clearAll() {
    if (!this.db) return;
    return new Promise((resolve) => {
      try {
        const tx = this.db.transaction([STORE_NAME], 'readwrite');
        tx.objectStore(STORE_NAME).clear();
        tx.oncomplete = () => {
          this.cache = [];
          resolve();
        };
        tx.onerror = resolve;
      } catch {
        this.cache = [];
        resolve();
      }
    });
  }

  // ==================== PUBLIC API (async where they touch storage) ====================

  /**
   * Store a file (photo, signature, document, etc.)
   * Accepts dataUrl (base64). Stored in IndexedDB for high capacity.
   */
  async storeFile(documentId, fileType, category, dataUrl, metadata = {}) {
    await this.ready;

    const record = {
      id: this._generateId(),
      documentId,
      fileType,
      category,
      dataUrl: dataUrl || '',
      metadata: {
        timestamp: new Date().toISOString(),
        fileSize: dataUrl ? dataUrl.length : 0,
        ...metadata,
      },
    };

    this.cache.push(record);
    await this._persistRecord(record);
    return record;
  }

  /**
   * Get all attached files for a specific document (e.g. one SJ)
   */
  async getFilesByDocument(documentId) {
    await this.ready;
    return this.cache.filter(f => f.documentId === documentId);
  }

  /**
   * Get files by category
   */
  async getFilesByCategory(category) {
    await this.ready;
    return this.cache.filter(f => f.category === category);
  }

  /**
   * Get photos for a document
   */
  async getRequiredPhotos(documentType, documentId) {
    const files = await this.getFilesByDocument(documentId);
    return files.filter(f => f.fileType === 'photo');
  }

  /**
   * Check minimum photo requirements (used by some forms)
   */
  async checkPhotoRequirements(documentType, documentId, requirements) {
    const files = await this.getFilesByDocument(documentId);
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
   * Delete a single file by its id
   */
  async deleteFile(fileId) {
    await this.ready;
    this.cache = this.cache.filter(f => f.id !== fileId);
    await this._deleteRecord(fileId);
  }

  /**
   * Clear ALL stored files (used by "Reset Data" in Settings)
   */
  async clearAll() {
    await this.ready;
    await this._clearAll();
  }

  // ==================== Helpers that produce data URLs (no storage involved) ====================

  /**
   * Convert File/Blob → data URL (base64). Still useful for immediate preview.
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
   * Resize + compress image. Returns data URL (JPEG).
   * We still use data URL for <img src> compatibility across the app.
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
}

export const storageService = new StorageService();
export default storageService;
