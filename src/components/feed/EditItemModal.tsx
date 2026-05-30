import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Loader2, ImagePlus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useEditPost, useEditProduct } from "@/hooks/api/use-feed";
import { uploadMediaToS3 } from "@/services/s3.service";

interface EditItemModalProps {
  open: boolean;
  onClose: () => void;
  item: {
    _id: string;
    type: "POST" | "PRODUCT";
    caption: string;
    tags: string[];
    media?: string[];
    productDetails?: {
      _id: string;
      name: string;
      price: number;
      description: string;
      category: string;
      stock: number;
      media: string[];
    };
  };
}

export const EditItemModal = ({ open, onClose, item }: EditItemModalProps) => {
  const isProduct = item.type === "PRODUCT";
  const product = item.productDetails;

  // Post fields
  const [caption, setCaption] = useState(item.caption);
  const [tagsInput, setTagsInput] = useState(item.tags?.join(", ") || "");
  // Product fields
  const [productName, setProductName] = useState(product?.name || "");
  const [price, setPrice] = useState(product?.price?.toString() || "");
  const [description, setDescription] = useState(product?.description || "");
  const [category, setCategory] = useState(product?.category || "");
  const [stock, setStock] = useState(product?.stock?.toString() || "");
  const [newMediaFiles, setNewMediaFiles] = useState<File[]>([]);
  const [existingMedia, setExistingMedia] = useState<string[]>(product?.media || item.media || []);
  const [uploading, setUploading] = useState(false);

  const editPost = useEditPost(item._id, "social");
  const editProduct = useEditProduct(product?._id || item._id);

  // Reset form when modal opens
  useEffect(() => {
    if (open) {
      setCaption(item.caption);
      setTagsInput(item.tags?.join(", ") || "");
      if (isProduct && product) {
        setProductName(product.name);
        setPrice(product.price.toString());
        setDescription(product.description);
        setCategory(product.category);
        setStock(product.stock.toString());
        setExistingMedia(product.media || []);
      } else if (!isProduct) {
        setExistingMedia(item.media || []);
      }
      setNewMediaFiles([]);
    }
  }, [open, item, product, isProduct]);

  // Cleanup object URLs when component unmounts or newMediaFiles changes
  useEffect(() => {
    return () => {
      newMediaFiles.forEach((file) => URL.revokeObjectURL(URL.createObjectURL(file)));
    };
  }, [newMediaFiles]);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setUploading(true);

    try {
      let uploadedMedia: string[] = [...existingMedia];
      if (newMediaFiles.length) {
        const uploaded = await Promise.all(newMediaFiles.map((f) => uploadMediaToS3(f)));
        uploadedMedia = [...uploadedMedia, ...uploaded];
      }

      if (isProduct) {
        // Update product
        await editProduct.mutateAsync({
          name: productName,
          price: parseFloat(price),
          description,
          category,
          stock: parseInt(stock),
          media: uploadedMedia,
        });
        // Also update the post caption & tags (optional)
        await editPost.mutateAsync({
          caption,
          tags: tagsInput.split(",").map((t) => t.trim()),
        });
      } else {
        // Update social post
        await editPost.mutateAsync({
          caption,
          tags: tagsInput.split(",").map((t) => t.trim()),
          media: uploadedMedia,
        });
      }
      onClose();
    } catch (error) {
      console.error(error);
    } finally {
      setUploading(false);
    }
  };

  const isLoading = editPost.isPending || editProduct.isPending || uploading;

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm"
          />
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h2 className="text-xl font-black text-gray-900">
                Edit {isProduct ? "Product" : "Post"}
              </h2>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Scrollable Form */}
            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* Post fields always present */}
              <div className="space-y-2">
                <Label htmlFor="caption">Caption</Label>
                <Textarea
                  id="caption"
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                  rows={4}
                  placeholder="What's on your mind?"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="tags">Tags (comma separated)</Label>
                <Input
                  id="tags"
                  value={tagsInput}
                  onChange={(e) => setTagsInput(e.target.value)}
                  placeholder="e.g., design, food, travel"
                />
              </div>

              {/* Product specific fields */}
              {isProduct && (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Product Name</Label>
                      <Input
                        value={productName}
                        onChange={(e) => setProductName(e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Price (NGN)</Label>
                      <Input
                        type="number"
                        value={price}
                        onChange={(e) => setPrice(e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Category</Label>
                      <Input
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Stock</Label>
                      <Input
                        type="number"
                        value={stock}
                        onChange={(e) => setStock(e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Description</Label>
                    <Textarea
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      rows={3}
                      required
                    />
                  </div>
                </>
              )}

              {/* Media section – works for both product and social */}
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

              <div className="flex justify-end gap-3 pt-4">
                <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isLoading} variant="brand">
                  {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                  Save Changes
                </Button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};