// src/components/ImageUpload.tsx
import React, { useState, useRef, useEffect } from 'react';
import { Camera, UserCircle, XCircle, Loader2 } from 'lucide-react';

interface ImageUploadProps {
  initialImageUrl?: string | null; // URL da imagem atual
  onImageChange: (file: File | null) => void; // Callback para o arquivo File
  onImageUrlChange?: (url: string | null) => void; // Callback para a URL (se quiser salvar na hora, ou gerenciar no pai)
  disabled?: boolean;
  isLoading?: boolean;
}

const ImageUpload: React.FC<ImageUploadProps> = ({
  initialImageUrl,
  onImageChange,
  onImageUrlChange,
  disabled = false,
  isLoading = false,
}) => {
  const [previewUrl, setPreviewUrl] = useState<string | null>(initialImageUrl || null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setPreviewUrl(initialImageUrl || null);
  }, [initialImageUrl]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
        onImageChange(file); // Envia o File para o componente pai
      };
      reader.readAsDataURL(file);
    } else {
      setPreviewUrl(initialImageUrl || null); // Reseta para a imagem inicial se nenhum arquivo for selecionado
      onImageChange(null);
    }
  };

  const handleRemoveImage = (e: React.MouseEvent) => {
    e.stopPropagation(); // Previne que o clique dispare o input de arquivo
    if (fileInputRef.current) {
      fileInputRef.current.value = ''; // Limpa o input file
    }
    setPreviewUrl(null); // Limpa a pré-visualização
    onImageChange(null); // Informa ao pai que a imagem foi removida
    if (onImageUrlChange) {
        onImageUrlChange(null); // Também informa que a URL deve ser limpa
    }
  };

  const triggerFileInput = () => {
    if (fileInputRef.current && !disabled && !isLoading) {
      fileInputRef.current.click();
    }
  };

  return (
    <div className="relative w-32 h-32 mx-auto rounded-full group cursor-pointer" onClick={triggerFileInput}>
      <input
        type="file"
        ref={fileInputRef}
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
        disabled={disabled || isLoading}
      />
      <div className="w-full h-full bg-neutral-100 rounded-full flex items-center justify-center overflow-hidden border-4 border-white shadow-lg relative">
        {isLoading && (
            <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center z-10">
                <Loader2 className="animate-spin text-white" size={24} />
            </div>
        )}
        {previewUrl ? (
          <img src={previewUrl} alt="Pré-visualização" className="w-full h-full object-cover" />
        ) : (
          <UserCircle size={80} className="text-neutral-400" />
        )}
        {!disabled && !isLoading && (
            <>
                <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10">
                    <Camera size={30} className="text-white" />
                </div>
                {previewUrl && (
                    <button
                        type="button"
                        onClick={handleRemoveImage}
                        className="absolute top-0 right-0 p-1 bg-red-500 text-white rounded-full text-xs opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-20"
                        title="Remover imagem"
                    >
                        <XCircle size={16} />
                    </button>
                )}
            </>
        )}
      </div>
      {!disabled && !isLoading && (
        <p className="text-xs text-center text-gray-500 mt-2">Clique para alterar</p>
      )}
    </div>
  );
};

export default ImageUpload;