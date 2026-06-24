import React, { useState, useRef } from 'react';
import { storageService } from '../../utils/storageService';

export default function FileUpload({
  documentId,
  category,
  fileType = 'photo',
  label = 'Upload File',
  multiple = false,
  required = false,
  maxFiles = 5,
  acceptedTypes = 'image/*',
  onUploadComplete = null,
  existingFiles = [],
  compressImage = true,
}) {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = async (e) => {
    e.preventDefault();
    setIsDragging(false);
    const files = Array.from(e.dataTransfer.files);
    await processFiles(files);
  };

  const handleFileSelect = async (e) => {
    const files = Array.from(e.target.files);
    await processFiles(files);
  };

  const processFiles = async (files) => {
    if (existingFiles.length + files.length > maxFiles) {
      setError(`Maximum ${maxFiles} files allowed`);
      return;
    }

    setError(null);
    setIsUploading(true);

    try {
      const results = [];

      for (const file of files) {
        let dataUrl;

        if (compressImage && file.type.startsWith('image/')) {
          dataUrl = await storageService.compressImage(file);
        } else {
          dataUrl = await storageService.fileToDataUrl(file);
        }

        const metadata = {
          fileName: file.name,
          fileType: file.type,
          originalSize: file.size,
        };

        // Try to extract GPS from file if available (mobile devices)
        if (file.location) {
          metadata.gps = file.location;
        }

        const record = await storageService.storeFile(
          documentId,
          fileType,
          category,
          dataUrl,
          metadata
        );

        results.push(record);
      }

      if (onUploadComplete) {
        onUploadComplete(results);
      }
    } catch (err) {
      setError(err.message || 'Failed to upload files');
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemoveFile = async (fileId) => {
    await storageService.deleteFile(fileId);
    if (onUploadComplete) {
      onUploadComplete(existingFiles.filter(f => f.id !== fileId));
    }
  };

  return (
    <div className="space-y-3">
      {/* Label */}
      <div className="flex items-center justify-between">
        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
          {label} {required && <span className="text-error">*</span>}
        </label>
        <span className="text-[10px] text-slate-400">
          {existingFiles.length}/{maxFiles} files
        </span>
      </div>

      {/* Drop Zone */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`
          relative border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all
          ${isDragging
            ? 'border-primary bg-primary/5'
            : 'border-slate-200 dark:border-slate-700 hover:border-primary/50 hover:bg-slate-50 dark:hover:bg-slate-800/50'
          }
          ${isUploading ? 'pointer-events-none opacity-50' : ''}
        `}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={acceptedTypes}
          multiple={multiple}
          onChange={handleFileSelect}
          className="hidden"
        />

        <div className="flex flex-col items-center gap-2">
          <span className="material-symbols-outlined text-3xl text-slate-400">
            {isDragging ? 'file_download' : 'cloud_upload'}
          </span>
          <p className="text-sm font-medium text-slate-600 dark:text-slate-300">
            {isDragging ? 'Drop files here' : 'Click or drag files to upload'}
          </p>
          <p className="text-xs text-slate-400">
            {acceptedTypes === 'image/*' ? 'JPG, PNG, WebP supported' : acceptedTypes}
          </p>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="flex items-center gap-2 text-xs text-error bg-error/5 px-3 py-2 rounded-lg">
          <span className="material-symbols-outlined text-sm">error</span>
          {error}
        </div>
      )}

      {/* Uploading Indicator */}
      {isUploading && (
        <div className="flex items-center gap-2 text-xs text-primary bg-primary/5 px-3 py-2 rounded-lg">
          <span className="material-symbols-outlined text-sm animate-spin">sync</span>
          Uploading...
        </div>
      )}

      {/* File List */}
      {existingFiles.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {existingFiles.map((file) => (
            <div
              key={file.id}
              className="relative group rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-sm"
            >
              {file.dataUrl && (
                <img
                  src={file.dataUrl}
                  alt={file.metadata?.fileName || 'Uploaded'}
                  className="w-full h-24 object-cover"
                />
              )}
              <div className="p-2">
                <p className="text-[10px] font-medium text-slate-600 dark:text-slate-300 truncate">
                  {file.metadata?.fileName || 'File'}
                </p>
                <p className="text-[9px] text-slate-400">
                  {new Date(file.metadata?.timestamp).toLocaleDateString()}
                </p>
              </div>

              {/* Remove Button */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleRemoveFile(file.id);
                }}
                className="absolute top-1 right-1 w-6 h-6 bg-error/90 hover:bg-error rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                type="button"
              >
                <span className="material-symbols-outlined text-white text-sm">close</span>
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
