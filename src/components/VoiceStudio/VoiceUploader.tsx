import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface VoiceUploaderProps {
  onUploadComplete?: (file: File, audioUrl: string) => void;
  acceptedFormats?: string[];
  maxFileSize?: number; // in MB
}

const VoiceUploader: React.FC<VoiceUploaderProps> = ({
  onUploadComplete,
  acceptedFormats = ['.mp3', '.wav', '.m4a', '.ogg', '.webm'],
  maxFileSize = 10, // 10MB default
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateFile = (file: File): boolean => {
    // Check file size
    const fileSizeMB = file.size / (1024 * 1024);
    if (fileSizeMB > maxFileSize) {
      setError(`File size must be less than ${maxFileSize}MB`);
      return false;
    }

    // Check file format
    const fileExtension = `.${file.name.split('.').pop()?.toLowerCase()}`;
    if (!acceptedFormats.includes(fileExtension)) {
      setError(`Invalid file format. Accepted formats: ${acceptedFormats.join(', ')}`);
      return false;
    }

    setError(null);
    return true;
  };

  const handleFileUpload = async (file: File) => {
    if (!validateFile(file)) return;

    setUploadedFile(file);
    setIsUploading(true);
    setUploadProgress(0);

    // Simulate upload progress
    const progressInterval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 90) {
          clearInterval(progressInterval);
          return 90;
        }
        return prev + 10;
      });
    }, 200);

    try {
      // Create object URL for preview
      const audioUrl = URL.createObjectURL(file);
      
      // TODO: Replace with actual upload API
      const formData = new FormData();
      formData.append('audio', file);
      
      // Simulated API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setUploadProgress(100);
      
      if (onUploadComplete) {
        onUploadComplete(file, audioUrl);
      }
    } catch (error) {
      console.error('Upload error:', error);
      setError('Failed to upload file. Please try again.');
    } finally {
      clearInterval(progressInterval);
      setIsUploading(false);
    }
  };

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileUpload(files[0]);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileUpload(files[0]);
    }
  };

  const formatFileSize = (bytes: number): string => {
    const mb = bytes / (1024 * 1024);
    return `${mb.toFixed(2)} MB`;
  };

  return (
    <div className="neural-card">
      <h3 className="text-xl font-semibold mb-6">Voice Uploader</h3>

      {/* Drop Zone */}
      <div
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`relative border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all ${
          isDragging
            ? 'border-electric-purple bg-electric-purple/10'
            : 'border-neural-light hover:border-electric-purple/50'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={acceptedFormats.join(',')}
          onChange={handleFileSelect}
          className="hidden"
        />

        <AnimatePresence mode="wait">
          {!uploadedFile ? (
            <motion.div
              key="upload"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-4"
            >
              <div className="w-16 h-16 mx-auto rounded-full bg-neural-light flex items-center justify-center">
                <svg className="w-8 h-8 text-electric-purple" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
              </div>
              <div>
                <p className="text-lg font-medium">Drop your audio file here</p>
                <p className="text-sm text-text-muted mt-1">or click to browse</p>
              </div>
              <p className="text-xs text-text-muted">
                Accepted formats: {acceptedFormats.join(', ')} • Max size: {maxFileSize}MB
              </p>
            </motion.div>
          ) : (
            <motion.div
              key="uploaded"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-4"
            >
              <div className="w-16 h-16 mx-auto rounded-full bg-green-500/20 flex items-center justify-center">
                <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <p className="text-lg font-medium">{uploadedFile.name}</p>
                <p className="text-sm text-text-muted mt-1">{formatFileSize(uploadedFile.size)}</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Upload Progress */}
        {isUploading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-x-0 bottom-0 p-4"
          >
            <div className="w-full h-2 bg-neural-darker rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${uploadProgress}%` }}
                transition={{ duration: 0.3 }}
                className="h-full bg-gradient-to-r from-electric-purple to-electric-pink"
              />
            </div>
            <p className="text-xs text-center mt-2">{uploadProgress}%</p>
          </motion.div>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20"
        >
          <p className="text-sm text-red-500">{error}</p>
        </motion.div>
      )}

      {/* File Details */}
      {uploadedFile && !isUploading && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-6 space-y-4"
        >
          <div className="p-4 bg-neural-light rounded-lg space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-text-muted">Format</span>
              <span className="font-medium">{uploadedFile.name.split('.').pop()?.toUpperCase()}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-text-muted">Size</span>
              <span className="font-medium">{formatFileSize(uploadedFile.size)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-text-muted">Type</span>
              <span className="font-medium">{uploadedFile.type || 'Audio'}</span>
            </div>
          </div>

          <div className="flex gap-4">
            <button
              onClick={() => {
                setUploadedFile(null);
                setError(null);
              }}
              className="flex-1 py-2 rounded-lg border border-electric-purple text-electric-purple hover:bg-electric-purple/10 transition-colors"
            >
              Remove
            </button>
            <button className="flex-1 neural-button">
              Process Voice
            </button>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default VoiceUploader;