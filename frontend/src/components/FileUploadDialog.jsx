import React, { useState, useCallback } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Progress } from './ui/progress';
import { Upload, X, Music, CheckCircle, AlertCircle } from 'lucide-react';
import { trackAPI, handleApiError } from '../services/api';
import { useToast } from '../hooks/use-toast';

const FileUploadDialog = ({ isOpen, onClose, onUploadComplete }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const { toast } = useToast();

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = Array.from(e.dataTransfer.files);
    const audioFiles = files.filter(file => 
      file.type.startsWith('audio/') || 
      /\.(mp3|flac|m4a|aac|ogg|wav)$/i.test(file.name)
    );
    
    if (audioFiles.length > 0) {
      handleFileUpload(audioFiles);
    } else {
      toast({
        title: "Invalid files",
        description: "Please select audio files only",
        variant: "destructive"
      });
    }
  }, [toast]);

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    handleFileUpload(files);
  };

  const handleFileUpload = async (files) => {
    setIsUploading(true);
    setUploadedFiles([]);
    const results = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      try {
        const track = await trackAPI.uploadTrack(file, (progress) => {
          const overallProgress = ((i / files.length) * 100) + (progress / files.length);
          setUploadProgress(Math.round(overallProgress));
        });
        
        results.push({ file: file.name, status: 'success', track });
        toast({
          title: "Upload successful",
          description: `${track.title} by ${track.artist} added to library`
        });
      } catch (error) {
        const errorInfo = handleApiError(error);
        results.push({ file: file.name, status: 'error', error: errorInfo.message });
        toast({
          title: "Upload failed",
          description: `Failed to upload ${file.name}: ${errorInfo.message}`,
          variant: "destructive"
        });
      }
    }

    setUploadedFiles(results);
    setIsUploading(false);
    setUploadProgress(0);
    
    // Notify parent component
    if (onUploadComplete) {
      onUploadComplete(results.filter(r => r.status === 'success').map(r => r.track));
    }
  };

  const resetDialog = () => {
    setUploadProgress(0);
    setIsUploading(false);
    setUploadedFiles([]);
    setIsDragging(false);
  };

  const handleClose = () => {
    resetDialog();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md bg-gray-900 border-gray-700">
        <DialogHeader>
          <DialogTitle className="text-white flex items-center gap-2">
            <Music className="text-blue-400" size={20} />
            Upload Music Files
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {!isUploading && uploadedFiles.length === 0 && (
            <div
              className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                isDragging
                  ? 'border-blue-400 bg-blue-400/10'
                  : 'border-gray-600 hover:border-gray-500'
              }`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              <Upload className="mx-auto mb-4 text-gray-400" size={48} />
              <p className="text-white mb-2">Drag & drop audio files here</p>
              <p className="text-gray-400 text-sm mb-4">
                Supports MP3, FLAC, M4A, AAC, OGG, WAV
              </p>
              <input
                type="file"
                accept="audio/*,.mp3,.flac,.m4a,.aac,.ogg,.wav"
                multiple
                onChange={handleFileSelect}
                className="hidden"
                id="file-upload"
              />
              <Button
                asChild
                className="bg-blue-600 hover:bg-blue-700"
              >
                <label htmlFor="file-upload" className="cursor-pointer">
                  Choose Files
                </label>
              </Button>
            </div>
          )}

          {isUploading && (
            <div className="space-y-4">
              <div className="text-center">
                <p className="text-white mb-2">Uploading files...</p>
                <Progress value={uploadProgress} className="w-full" />
                <p className="text-gray-400 text-sm mt-1">{uploadProgress}%</p>
              </div>
            </div>
          )}

          {uploadedFiles.length > 0 && (
            <div className="space-y-2 max-h-48 overflow-y-auto">
              <h4 className="text-white font-medium">Upload Results:</h4>
              {uploadedFiles.map((result, index) => (
                <div
                  key={index}
                  className={`flex items-center gap-2 p-2 rounded text-sm ${
                    result.status === 'success'
                      ? 'bg-green-900/20 text-green-400'
                      : 'bg-red-900/20 text-red-400'
                  }`}
                >
                  {result.status === 'success' ? (
                    <CheckCircle size={16} />
                  ) : (
                    <AlertCircle size={16} />
                  )}
                  <span className="flex-1 truncate">
                    {result.status === 'success'
                      ? `${result.track.title} - ${result.track.artist}`
                      : result.file
                    }
                  </span>
                </div>
              ))}
            </div>
          )}

          <div className="flex justify-end gap-2 pt-4">
            <Button
              variant="outline"
              onClick={handleClose}
              disabled={isUploading}
              className="border-gray-600 text-gray-300 hover:bg-gray-800"
            >
              {uploadedFiles.length > 0 ? 'Close' : 'Cancel'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default FileUploadDialog;