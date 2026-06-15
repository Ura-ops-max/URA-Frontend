// src/components/product/MediaPreview.tsx
import { X, Play } from 'lucide-react';

export const MediaPreview = ({
  files,
  onRemove,
}: {
  files: any[];
  onRemove: (index: number) => void;
}) => {
  return (
    <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 mt-4">
      {files.map((file, index) => (
        <div
          key={index}
          className="relative aspect-square rounded-2xl overflow-hidden border border-gray-100 bg-gray-50 group"
        >
          {file.type.startsWith('video') ? (
            <div className="relative w-full h-full">
              <video src={file.preview} className="w-full h-full object-cover" />
              <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                <Play className="text-white fill-white" size={20} />
              </div>
            </div>
          ) : (
            <img src={file.preview} alt="preview" className="w-full h-full object-cover" />
          )}
          <button
            type="button"
            onClick={() => onRemove(index)}
            className="absolute top-1 right-1 p-1 bg-white/90 text-red-500 rounded-full shadow-sm opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <X size={14} />
          </button>
        </div>
      ))}
    </div>
  );
};
