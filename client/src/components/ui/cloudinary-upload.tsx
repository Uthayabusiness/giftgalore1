import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Button } from './button';
import { Input } from './input';
import { Label } from './label';
import { Upload, X, Image as ImageIcon, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface CloudinaryUploadProps {
  value: string[];
  onChange: (urls: string[]) => void;
  maxFiles?: number;
  className?: string;
}

export function CloudinaryUpload({ 
  value = [], 
  onChange, 
  maxFiles = 5,
  className = '' 
}: CloudinaryUploadProps) {
  const [uploading, setUploading] = useState(false);
  const { toast } = useToast();

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (value.length + acceptedFiles.length > maxFiles) {
      toast({
        title: "Too many files",
        description: `You can only upload up to ${maxFiles} images.`,
        variant: "destructive",
      });
      return;
    }

    setUploading(true);
    const newUrls: string[] = [];

    try {
      for (const file of acceptedFiles) {
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
        newUrls.push(result.url);
      }

      onChange([...value, ...newUrls]);
      toast({
        title: "Upload successful",
        description: `${acceptedFiles.length} image(s) uploaded successfully.`,
      });
    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: "Upload failed",
        description: "Failed to upload image(s). Please try again.",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  }, [value, onChange, maxFiles, toast]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif', '.webp']
    },
    maxSize: 5 * 1024 * 1024, // 5MB
    disabled: uploading,
  });

  const removeImage = (index: number) => {
    const newUrls = value.filter((_, i) => i !== index);
    onChange(newUrls);
  };

  const handleUrlInput = (url: string, index: number) => {
    const newUrls = [...value];
    newUrls[index] = url;
    onChange(newUrls);
  };

  const addUrlInput = () => {
    if (value.length < maxFiles) {
      onChange([...value, '']);
    }
  };

  return (
    <div className={`space-y-4 ${className}`}>
      <Label>Product Images *</Label>
      
      {/* Dropzone */}
      <div
        {...getRootProps()}
        className={`
          border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors
          ${isDragActive ? 'border-primary bg-primary/5' : 'border-muted-foreground/25'}
          ${uploading ? 'opacity-50 cursor-not-allowed' : 'hover:border-primary hover:bg-primary/5'}
        `}
      >
        <input {...getInputProps()} />
        <div className="space-y-2">
          <Upload className="h-8 w-8 mx-auto text-muted-foreground" />
          {uploading ? (
            <div className="flex items-center justify-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Uploading...</span>
            </div>
          ) : isDragActive ? (
            <p>Drop the images here...</p>
          ) : (
            <div>
              <p className="font-medium">Drag & drop images here, or click to select</p>
              <p className="text-sm text-muted-foreground">
                Supports: JPG, PNG, GIF, WebP (max 5MB each)
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Image URLs Input */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label className="text-sm">Image URLs</Label>
          {value.length < maxFiles && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={addUrlInput}
            >
              Add URL
            </Button>
          )}
        </div>
        
        {value.map((url, index) => (
          <div key={index} className="flex gap-2">
            <Input
              placeholder="Image URL"
              value={url}
              onChange={(e) => handleUrlInput(e.target.value, index)}
            />
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={() => removeImage(index)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        ))}
      </div>

      {/* Image Preview */}
      {value.length > 0 && (
        <div className="space-y-2">
          <Label className="text-sm">Preview</Label>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {value.map((url, index) => (
              <div key={index} className="relative group">
                <div className="aspect-square rounded-lg overflow-hidden border bg-muted">
                  {url ? (
                    <img
                      src={url}
                      alt={`Product image ${index + 1}`}
                      className="w-full h-full object-contain bg-white"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = '/placeholder-image.jpg';
                      }}
                    />
                  ) : (
                    <div className="w-full h-full bg-muted flex items-center justify-center">
                      <ImageIcon className="h-8 w-8 text-muted-foreground" />
                    </div>
                  )}
                </div>
                <Button
                  type="button"
                  variant="destructive"
                  size="icon"
                  className="absolute top-1 right-1 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={() => removeImage(index)}
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Help text */}
      <p className="text-xs text-muted-foreground">
        Upload images or provide URLs. At least one image is required. Maximum {maxFiles} images allowed.
      </p>
    </div>
  );
}
