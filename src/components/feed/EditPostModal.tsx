import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, ImagePlus, Trash2 } from 'lucide-react';
import { useEditPost } from '@/hooks/api/use-feed';
import { Textarea } from '../ui/textarea';
import { uploadMediaToS3 } from '@/services/s3.service';

interface EditPostModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  postId: string;
  initialCaption: string;
  initialTags: string[];
  initialMedia?: string[];
}

export function EditPostModal({
  open,
  onOpenChange,
  postId,
  initialCaption,
  initialTags,
  initialMedia = [],
}: EditPostModalProps) {
  const [caption, setCaption] = useState(initialCaption);
  const [tagsInput, setTagsInput] = useState(initialTags.join(', '));
  const [existingMedia, setExistingMedia] = useState<string[]>(initialMedia);
  const [newMediaFiles, setNewMediaFiles] = useState<File[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const editMutation = useEditPost(postId, 'social');

  // Reset form when modal opens
  useEffect(() => {
    if (open) {
      setCaption(initialCaption);
      setTagsInput(initialTags.join(', '));
      setExistingMedia(initialMedia);
      setNewMediaFiles([]);
    }
  }, [open, initialCaption, initialTags, initialMedia]);

  const handleMediaSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      setNewMediaFiles((prev) => [...prev, ...files]);
    }
  };

  const removeExistingMedia = (index: number) => {
    setExistingMedia((prev) => prev.filter((_, i) => i !== index));
  };

  const removeNewMedia = (index: number) => {
    setNewMediaFiles((prev) => prev.filter((_, i) => i !== index));
  };

  // Cleanup object URLs on unmount
  useEffect(() => {
    return () => {
      newMediaFiles.forEach((file) => URL.revokeObjectURL(URL.createObjectURL(file)));
    };
  }, [newMediaFiles]);

  const handleSubmit = async () => {
    const tags = tagsInput
      .split(',')
      .map((tag) => tag.trim())
      .filter((tag) => tag.length > 0);

    setIsUploading(true);
    try {
      let uploadedMediaUrls: string[] = [];
      if (newMediaFiles.length > 0) {
        uploadedMediaUrls = await Promise.all(
          newMediaFiles.map((file) => uploadMediaToS3(file))
        );
      }

      const finalMedia = [...existingMedia, ...uploadedMediaUrls];

      await editMutation.mutateAsync({ caption, tags, media: finalMedia });
      onOpenChange(false);
    } catch (error) {
      console.error('Failed to update post:', error);
    } finally {
      setIsUploading(false);
    }
  };

  const isLoading = editMutation.isPending || isUploading;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Edit Post</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4 max-h-[60vh] overflow-y-auto">
          <div className="space-y-2">
            <Label htmlFor="caption">Caption</Label>
            <Textarea
              id="caption"
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              placeholder="What's on your mind?"
              rows={4}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="tags">Tags (comma separated)</Label>
            <Input
              id="tags"
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
              placeholder="e.g., technology, startup, react"
            />
          </div>

          <div className="space-y-2">
            <Label>Media</Label>
            <div className="flex flex-wrap gap-3 mb-3">
              {/* Existing media preview */}
              {existingMedia.map((url, idx) => (
                <div
                  key={`existing-${idx}`}
                  className="relative w-20 h-20 rounded-lg overflow-hidden border group"
                >
                  <img src={url} className="w-full h-full object-cover" alt="" />
                  <button
                    type="button"
                    onClick={() => removeExistingMedia(idx)}
                    className="absolute top-1 right-1 bg-black/60 rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Trash2 size={12} className="text-white" />
                  </button>
                </div>
              ))}
              {/* New media preview (optimistic) */}
              {newMediaFiles.map((file, idx) => {
                const previewUrl = URL.createObjectURL(file);
                return (
                  <div
                    key={`new-${idx}`}
                    className="relative w-20 h-20 rounded-lg overflow-hidden border group"
                  >
                    <img src={previewUrl} className="w-full h-full object-cover" alt="preview" />
                    <button
                      type="button"
                      onClick={() => removeNewMedia(idx)}
                      className="absolute top-1 right-1 bg-black/60 rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Trash2 size={12} className="text-white" />
                    </button>
                  </div>
                );
              })}
            </div>
            <label className="flex items-center gap-2 cursor-pointer bg-gray-100 hover:bg-gray-200 transition-colors rounded-lg px-4 py-2 w-fit">
              <ImagePlus size={18} />
              <span className="text-sm">Add images</span>
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleMediaSelect}
                className="hidden"
              />
            </label>
            {newMediaFiles.length > 0 && (
              <p className="text-xs text-gray-500">{newMediaFiles.length} new file(s) selected</p>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              'Save Changes'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
