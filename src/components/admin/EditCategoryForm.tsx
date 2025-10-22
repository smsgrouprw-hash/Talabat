import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Upload, X } from "lucide-react";

interface Category {
  id: string;
  name: string;
  name_en: string;
  name_ar?: string;
  description?: string;
  parent_category_id: string | null;
  image_url?: string | null;
  is_active: boolean;
  sort_order: number;
  children?: Category[];
}

interface EditCategoryFormProps {
  category: Category;
  onClose: () => void;
  onSuccess: () => void;
  categories: Category[];
}

export function EditCategoryForm({ category, onClose, onSuccess, categories }: EditCategoryFormProps) {
  const [formData, setFormData] = useState({
    name_en: category.name_en || "",
    name_ar: category.name_ar || "",
    description: category.description || "",
    parent_category_id: category.parent_category_id || "",
    image_url: category.image_url || "",
    is_active: category.is_active,
    sort_order: category.sort_order,
  });
  const [loading, setLoading] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");
  const { toast } = useToast();

  useEffect(() => {
    setFormData({
      name_en: category.name_en || "",
      name_ar: category.name_ar || "",
      description: category.description || "",
      parent_category_id: category.parent_category_id || "",
      image_url: category.image_url || "",
      is_active: category.is_active,
      sort_order: category.sort_order,
    });
  }, [category]);

  const flattenCategories = (categories: Category[]): Category[] => {
    const flattened: Category[] = [];
    
    const flatten = (cats: Category[], level: number = 0) => {
      cats.forEach(cat => {
        // Don't include the current category or its descendants
        if (cat.id !== category.id && !isDescendantOf(cat.id, category.id, categories)) {
          flattened.push({
            ...cat,
            name_en: "  ".repeat(level) + cat.name_en
          });
          if (cat.children && cat.children.length > 0) {
            flatten(cat.children, level + 1);
          }
        }
      });
    };
    
    flatten(categories);
    return flattened;
  };

  const isDescendantOf = (categoryId: string, ancestorId: string, categories: Category[]): boolean => {
    const findInTree = (cats: Category[]): boolean => {
      for (const cat of cats) {
        if (cat.id === ancestorId) {
          return findCategoryInChildren(cat.children || [], categoryId);
        }
        if (cat.children && findInTree(cat.children)) {
          return true;
        }
      }
      return false;
    };

    const findCategoryInChildren = (children: Category[], targetId: string): boolean => {
      for (const child of children) {
        if (child.id === targetId) return true;
        if (child.children && findCategoryInChildren(child.children, targetId)) {
          return true;
        }
      }
      return false;
    };

    return findInTree(categories);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const uploadImage = async (file: File): Promise<string> => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random()}.${fileExt}`;
    const filePath = `categories/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('product-images')
      .upload(filePath, file);

    if (uploadError) {
      throw uploadError;
    }

    const { data } = supabase.storage
      .from('product-images')
      .getPublicUrl(filePath);

    return data.publicUrl;
  };

  const checkCircularReference = async (parentId: string | null): Promise<boolean> => {
    if (!parentId || parentId === category.id) return false;

    try {
      const { data, error } = await supabase
        .rpc('check_category_circular_reference', {
          category_id: category.id,
          parent_id: parentId
        });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error checking circular reference:', error);
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Check for circular reference if parent is selected
      if (formData.parent_category_id && formData.parent_category_id !== category.parent_category_id) {
        const hasCircularRef = await checkCircularReference(formData.parent_category_id);
        if (hasCircularRef) {
          toast({
            title: "Error",
            description: "Cannot update category: circular reference detected",
            variant: "destructive",
          });
          return;
        }
      }

      let imageUrl = formData.image_url;

      // Upload image if a file was selected
      if (imageFile) {
        imageUrl = await uploadImage(imageFile);
      }

      const categoryData = {
        name: formData.name_en, // Keep legacy name field
        name_en: formData.name_en,
        name_ar: formData.name_ar || null,
        description: formData.description || null,
        parent_category_id: formData.parent_category_id || null,
        image_url: imageUrl || null,
        is_active: formData.is_active,
        sort_order: formData.sort_order,
      };

      const { error } = await supabase
        .from("categories")
        .update(categoryData)
        .eq("id", category.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Category updated successfully",
      });

      onSuccess();
    } catch (error) {
      console.error("Error updating category:", error);
      toast({
        title: "Error",
        description: "Failed to update category",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Category</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name_en">Name (English) *</Label>
              <Input
                id="name_en"
                value={formData.name_en}
                onChange={(e) => setFormData({ ...formData, name_en: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="name_ar">Name (Arabic)</Label>
              <Input
                id="name_ar"
                value={formData.name_ar}
                onChange={(e) => setFormData({ ...formData, name_ar: e.target.value })}
                dir="rtl"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="parent_category">Parent Category</Label>
            <Select
              value={formData.parent_category_id}
              onValueChange={(value) => setFormData({ ...formData, parent_category_id: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select parent category (optional)" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">None (Root Category)</SelectItem>
                {flattenCategories(categories).map((cat) => (
                  <SelectItem key={cat.id} value={cat.id}>
                    {cat.name_en}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-4">
            <Label>Category Image</Label>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="image_url">Image URL</Label>
                <Input
                  id="image_url"
                  type="url"
                  value={formData.image_url}
                  onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                  placeholder="https://example.com/image.jpg"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="image_file">Or Upload Image</Label>
                <div className="flex items-center space-x-2">
                  <Input
                    id="image_file"
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => document.getElementById('image_file')?.click()}
                    className="flex items-center space-x-2"
                  >
                    <Upload className="h-4 w-4" />
                    <span>Choose File</span>
                  </Button>
                  {imageFile && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setImageFile(null);
                        setImagePreview("");
                      }}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            </div>

            {(imagePreview || formData.image_url) && (
              <div className="mt-4">
                <img
                  src={imagePreview || formData.image_url}
                  alt="Preview"
                  className="h-20 w-20 rounded object-cover border"
                />
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center space-x-2">
              <Switch
                id="is_active"
                checked={formData.is_active}
                onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
              />
              <Label htmlFor="is_active">Active</Label>
            </div>

            <div className="space-y-2">
              <Label htmlFor="sort_order">Sort Order</Label>
              <Input
                id="sort_order"
                type="number"
                value={formData.sort_order}
                onChange={(e) => setFormData({ ...formData, sort_order: parseInt(e.target.value) || 0 })}
              />
            </div>
          </div>

          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Updating..." : "Update Category"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}