import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Button } from './button';
import { Input } from './input';
import { Label } from './label';
import { Upload, X, Image as ImageIcon, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface CategoryImageUploadProps {
  value: string;
  onChange: (url: string) => void;
  className?: string;
}

export function CategoryImageUpload({ 
  value = '', 
  onChange, 
  className = '' 
}: CategoryImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const { toast } = useToast();

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return;

    setUploading(true);

    try {
      const file = acceptedFiles[0];
      const formData = new FormData();
      formData.append('image', file);

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      const result = await response.json();
      onChange(result.url);
      
      toast({
        title: "Upload successful",
        description: "Category image uploaded successfully.",
      });
    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: "Upload failed",
        description: "Failed to upload image. Please try again.",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  }, [onChange, toast]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif', '.webp']
    },
    maxSize: 5 * 1024 * 1024, // 5MB
    disabled: uploading,
    multiple: false,
  });

  const handleUrlInput = (url: string) => {
    try {
      if (typeof onChange === 'function') {
        onChange(url);
      } else {
        console.error('onChange is not a function:', onChange);
      }
    } catch (error) {
      console.error('Error in handleUrlInput:', error);
    }
  };

  return (
    <div className={`space-y-4 ${className}`}>
      <Label>Category Image</Label>
      
      {/* Dropzone */}
      <div
        {...getRootProps()}
        className={`
          border-2 border-dashed rounded-lg p-4 text-center cursor-pointer transition-colors
          ${isDragActive ? 'border-primary bg-primary/5' : 'border-muted-foreground/25'}
          ${uploading ? 'opacity-50 cursor-not-allowed' : 'hover:border-primary hover:bg-primary/5'}
        `}
      >
        <input {...getInputProps()} />
        <div className="space-y-2">
          <Upload className="h-6 w-6 mx-auto text-muted-foreground" />
          {uploading ? (
            <div className="flex items-center justify-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Uploading...</span>
            </div>
          ) : isDragActive ? (
            <p>Drop the image here...</p>
          ) : (
            <div>
              <p className="font-medium">Drag & drop image here, or click to select</p>
              <p className="text-sm text-muted-foreground">
                Supports: JPG, PNG, GIF, WebP (max 5MB)
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Image URL Input */}
      <div className="space-y-2">
        <Label className="text-sm">Image URL</Label>
        <Input
          placeholder="Image URL"
          value={value}
          onChange={(e) => handleUrlInput(e.target.value)}
          onBlur={(e) => {
            const url = e.target.value.trim();
            if (url && !url.startsWith('http')) {
              console.warn('URL should start with http:// or https://');
            }
          }}
        />
        {value && !value.startsWith('http') && (
          <p className="text-xs text-yellow-600">
            Warning: URL should start with http:// or https://
          </p>
        )}
      </div>

      {/* Image Preview */}
      {value && (
        <div className="space-y-2">
          <Label className="text-sm">Preview</Label>
          <div className="relative w-32 h-32">
            <img
              src={value}
              alt="Category preview"
              className="w-full h-full object-cover rounded-lg border"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = '/placeholder-image.jpg';
              }}
              
            />
            <Button
              type="button"
              variant="destructive"
              size="icon"
              className="absolute top-1 right-1 h-6 w-6"
              onClick={() => {
                try {
                  if (typeof onChange === 'function') {
                    onChange('');
                  }
                } catch (error) {
                  console.error('Error clearing image:', error);
                }
              }}
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
        </div>
      )}

      {/* Help text */}
      <p className="text-xs text-muted-foreground">
        Upload an image or provide a URL for the category. Recommended size: 400x400 pixels.
      </p>
    </div>
  );
}
