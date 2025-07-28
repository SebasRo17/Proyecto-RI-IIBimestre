import React, { useRef, useState } from 'react';
import { Upload, Image as ImageIcon, X } from 'lucide-react';

interface ImageUploadProps {
  onImageSelect: (file: File) => void;
  isLoading: boolean;
  selectedImage?: string;
  onClearImage: () => void;
}

export const ImageUpload: React.FC<ImageUploadProps> = ({ 
  onImageSelect, 
  isLoading, 
  selectedImage, 
  onClearImage 
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragActive, setDragActive] = useState(false);

  const handleFileSelect = (file: File) => {
    if (file && file.type.startsWith('image/')) {
      onImageSelect(file);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelect(e.target.files[0]);
    }
  };

  return (
    <div className="w-full max-w-md">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleInputChange}
        className="hidden"
        disabled={isLoading}
      />
      
      {selectedImage ? (
        <div className="relative">
          <div className="relative overflow-hidden rounded-xl border-2 border-slate-200 shadow-lg">
            <img
              src={selectedImage}
              alt="Imagen seleccionada"
              className="w-full h-48 object-cover"
            />
            <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-10 transition-all duration-200" />
          </div>
          <button
            onClick={onClearImage}
            className="absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-1 shadow-lg transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <div
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`
            relative border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-200
            ${dragActive 
              ? 'border-sky-500 bg-sky-50' 
              : 'border-slate-300 hover:border-sky-400 hover:bg-slate-50'
            }
            ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}
          `}
        >
          <div className="flex flex-col items-center gap-4">
            {dragActive ? (
              <Upload className="w-12 h-12 text-sky-500" />
            ) : (
              <ImageIcon className="w-12 h-12 text-slate-400" />
            )}
            <div>
              <p className="text-lg font-semibold text-slate-700 mb-1">
                {dragActive ? 'Suelta la imagen aquí' : 'Subir imagen'}
              </p>
              <p className="text-sm text-slate-500">
                Arrastra y suelta o haz clic para seleccionar
              </p>
              <p className="text-xs text-slate-400 mt-2">
                PNG, JPG, WEBP hasta 10MB
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};