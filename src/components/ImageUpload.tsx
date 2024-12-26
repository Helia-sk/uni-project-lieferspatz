import React, { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Camera, Upload } from 'lucide-react';

interface ImageUploadProps {
  imageUrl?: string;
  onImageUpload: (file: File) => void;
  className?: string;
}

const ImageUpload: React.FC<ImageUploadProps> = ({
  imageUrl,
  onImageUpload,
  className = 'h-32 w-32',
}) => {
  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      onImageUpload(acceptedFiles[0]);
    }
  }, [onImageUpload]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.webp'],
    },
    multiple: false,
  });

  return (
    <div
      {...getRootProps()}
      className={`${className} relative rounded-lg cursor-pointer overflow-hidden group
        ${isDragActive ? 'border-2 border-orange-500' : 'border-2 border-dashed border-gray-300'}
        ${imageUrl ? '' : 'bg-gray-50'}`}
    >
      <input {...getInputProps()} />
      
      {imageUrl ? (
        <>
          <img
            src={imageUrl}
            alt="Upload preview"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
            <Upload className="h-8 w-8 text-white" />
          </div>
        </>
      ) : (
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <Camera className="h-8 w-8 text-gray-400" />
          <p className="mt-2 text-sm text-gray-500">
            {isDragActive ? 'Drop image here' : 'Drag image here or click to upload'}
          </p>
        </div>
      )}
    </div>
  );
};

export default ImageUpload;