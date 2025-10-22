import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { Plus, Edit, Trash2, Image as ImageIcon, MoveUp, MoveDown, Upload } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

interface PromotionalSlide {
  id: string;
  title: string;
  title_ar?: string;
  description?: string;
  description_ar?: string;
  image_url: string;
  discount_text?: string;
  discount_text_ar?: string;
  button_url: string;
  display_order: number;
  is_active: boolean;
  slide_duration?: number;
  supplier_id?: string;
}

interface Supplier {
  id: string;
  business_name: string;
  business_name_ar?: string;
  is_active: boolean;
}

export const SlideshowManagement = () => {
  const [slides, setSlides] = useState<PromotionalSlide[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingSlide, setEditingSlide] = useState<PromotionalSlide | null>(null);
  const [uploading, setUploading] = useState(false);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [formData, setFormData] = useState({
    title: '',
    title_ar: '',
    description: '',
    description_ar: '',
    image_url: '',
    discount_text: '',
    discount_text_ar: '',
    button_url: '/customer-suppliers',
    is_active: true,
    slide_duration: 5,
    supplier_id: ''
  });

  useEffect(() => {
    fetchSlides();
    fetchSuppliers();
  }, []);

  const fetchSlides = async () => {
    try {
      const { data, error } = await supabase
        .from('promotional_slides')
        .select('*')
        .order('display_order', { ascending: true });

      if (error) throw error;
      setSlides(data || []);
    } catch (error) {
      console.error('Error fetching slides:', error);
      toast.error('Failed to load slides');
    } finally {
      setLoading(false);
    }
  };

  const fetchSuppliers = async () => {
    try {
      const { data, error } = await supabase
        .from('suppliers')
        .select('id, business_name, business_name_ar, is_active')
        .eq('is_active', true)
        .order('business_name', { ascending: true });

      if (error) throw error;
      setSuppliers(data || []);
    } catch (error) {
      console.error('Error fetching suppliers:', error);
      toast.error('Failed to load suppliers');
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size should be less than 5MB');
      return;
    }

    setUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `slide-${Date.now()}.${fileExt}`;
      const filePath = `slides/${fileName}`;

      console.log('Uploading file:', { fileName, filePath, fileSize: file.size, fileType: file.type });

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('business-images')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) {
        console.error('Upload error:', uploadError);
        throw new Error(uploadError.message || 'Failed to upload file');
      }

      console.log('Upload successful:', uploadData);

      const { data: { publicUrl } } = supabase.storage
        .from('business-images')
        .getPublicUrl(filePath);

      console.log('Public URL:', publicUrl);

      setFormData({ ...formData, image_url: publicUrl });
      setImagePreview(publicUrl);
      toast.success('Image uploaded successfully');
    } catch (error: any) {
      console.error('Error uploading image:', error);
      const errorMessage = error?.message || 'Failed to upload image';
      toast.error(errorMessage);
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.image_url) {
      toast.error('Please upload an image');
      return;
    }

    if (!formData.supplier_id) {
      toast('⚠️ No supplier linked - button will redirect to suppliers list', {
        duration: 4000,
      });
    }
    
    try {
      if (editingSlide) {
        const { error } = await supabase
          .from('promotional_slides')
          .update(formData)
          .eq('id', editingSlide.id);

        if (error) throw error;
        toast.success('Slide updated successfully');
      } else {
        const maxOrder = slides.length > 0 ? Math.max(...slides.map(s => s.display_order)) : -1;
        const { error } = await supabase
          .from('promotional_slides')
          .insert([{ ...formData, display_order: maxOrder + 1 }]);

        if (error) throw error;
        toast.success('Slide created successfully');
      }

      resetForm();
      fetchSlides();
    } catch (error) {
      console.error('Error saving slide:', error);
      toast.error('Failed to save slide');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this slide?')) return;

    try {
      const { error } = await supabase
        .from('promotional_slides')
        .delete()
        .eq('id', id);

      if (error) throw error;
      toast.success('Slide deleted successfully');
      fetchSlides();
    } catch (error) {
      console.error('Error deleting slide:', error);
      toast.error('Failed to delete slide');
    }
  };

  const handleToggleActive = async (slide: PromotionalSlide) => {
    try {
      const { error } = await supabase
        .from('promotional_slides')
        .update({ is_active: !slide.is_active })
        .eq('id', slide.id);

      if (error) throw error;
      toast.success(`Slide ${!slide.is_active ? 'activated' : 'deactivated'}`);
      fetchSlides();
    } catch (error) {
      console.error('Error toggling slide:', error);
      toast.error('Failed to update slide');
    }
  };

  const handleMoveSlide = async (slide: PromotionalSlide, direction: 'up' | 'down') => {
    const currentIndex = slides.findIndex(s => s.id === slide.id);
    const targetIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    
    if (targetIndex < 0 || targetIndex >= slides.length) return;

    const targetSlide = slides[targetIndex];

    try {
      await supabase.from('promotional_slides').update({ display_order: targetSlide.display_order }).eq('id', slide.id);
      await supabase.from('promotional_slides').update({ display_order: slide.display_order }).eq('id', targetSlide.id);
      
      toast.success('Slide order updated');
      fetchSlides();
    } catch (error) {
      console.error('Error moving slide:', error);
      toast.error('Failed to update order');
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      title_ar: '',
      description: '',
      description_ar: '',
      image_url: '',
      discount_text: '',
      discount_text_ar: '',
      button_url: '/customer-suppliers',
      is_active: true,
      slide_duration: 5,
      supplier_id: ''
    });
    setImagePreview('');
    setEditingSlide(null);
  };

  const startEdit = (slide: PromotionalSlide) => {
    setEditingSlide(slide);
    setImagePreview(slide.image_url);
    setFormData({
      title: slide.title,
      title_ar: slide.title_ar || '',
      description: slide.description || '',
      description_ar: slide.description_ar || '',
      image_url: slide.image_url,
      discount_text: slide.discount_text || '',
      discount_text_ar: slide.discount_text_ar || '',
      button_url: slide.button_url,
      is_active: slide.is_active,
      slide_duration: slide.slide_duration || 5,
      supplier_id: slide.supplier_id || ''
    });
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>{editingSlide ? 'Edit Slide' : 'Add New Slide'}</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Title (English)</Label>
                <Input
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label>Title (Arabic)</Label>
                <Input
                  value={formData.title_ar}
                  onChange={(e) => setFormData({ ...formData, title_ar: e.target.value })}
                  dir="rtl"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Discount Text (English)</Label>
                <Input
                  value={formData.discount_text}
                  onChange={(e) => setFormData({ ...formData, discount_text: e.target.value })}
                  placeholder="e.g., 20% OFF"
                />
              </div>
              <div>
                <Label>Discount Text (Arabic)</Label>
                <Input
                  value={formData.discount_text_ar}
                  onChange={(e) => setFormData({ ...formData, discount_text_ar: e.target.value })}
                  placeholder="مثال: خصم 20%"
                  dir="rtl"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Description (English)</Label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                />
              </div>
              <div>
                <Label>Description (Arabic)</Label>
                <Textarea
                  value={formData.description_ar}
                  onChange={(e) => setFormData({ ...formData, description_ar: e.target.value })}
                  rows={3}
                  dir="rtl"
                />
              </div>
            </div>

            <div>
              <Label>Upload Image</Label>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={handleImageUpload}
                    disabled={uploading}
                    className="flex-1"
                  />
                  {uploading && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                      Uploading...
                    </div>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  Recommended size: 1200 x 400 pixels (JPG, PNG, or WebP)
                </p>
                {imagePreview && (
                  <div className="relative w-full rounded-lg overflow-hidden border">
                    <img 
                      src={imagePreview} 
                      alt="Preview" 
                      className="w-full h-48 object-cover"
                    />
                  </div>
                )}
              </div>
            </div>

            <div>
              <Label>Select Supplier / اختر المورد *</Label>
              <select
                value={formData.supplier_id}
                onChange={(e) => setFormData({ ...formData, supplier_id: e.target.value })}
                className="w-full px-3 py-2 border border-input bg-background rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                required
              >
                <option value="">-- Select Supplier / اختر المورد --</option>
                {suppliers.map((supplier) => (
                  <option key={supplier.id} value={supplier.id}>
                    {supplier.business_name} {supplier.business_name_ar && `/ ${supplier.business_name_ar}`}
                  </option>
                ))}
              </select>
              <p className="text-xs text-muted-foreground mt-1">
                This supplier's page will open when users click "Order Now"
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label>Slide Duration (seconds)</Label>
                <Input
                  type="number"
                  min="1"
                  max="30"
                  value={formData.slide_duration}
                  onChange={(e) => setFormData({ ...formData, slide_duration: parseInt(e.target.value) || 5 })}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  How long this slide displays (1-30 seconds)
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                checked={formData.is_active}
                onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
              />
              <Label>Active</Label>
            </div>

            <div className="flex gap-2">
              <Button type="submit" disabled={uploading || !formData.image_url}>
                {editingSlide ? 'Update Slide' : 'Add Slide'}
              </Button>
              {editingSlide && (
                <Button type="button" variant="outline" onClick={resetForm}>
                  Cancel
                </Button>
              )}
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Existing Slides</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {slides.map((slide, index) => (
              <div key={slide.id} className="flex items-center gap-4 p-4 border rounded-lg">
                {slide.image_url ? (
                  <img src={slide.image_url} alt={slide.title} className="w-24 h-24 object-cover rounded" />
                ) : (
                  <div className="w-24 h-24 bg-muted flex items-center justify-center rounded">
                    <ImageIcon className="w-8 h-8 text-muted-foreground" />
                  </div>
                )}
                
                <div className="flex-1">
                  <h4 className="font-semibold">{slide.title}</h4>
                  {slide.discount_text && (
                    <p className="text-sm text-primary">{slide.discount_text}</p>
                  )}
                  <p className="text-sm text-muted-foreground">{slide.description}</p>
                  {slide.supplier_id && (
                    <p className="text-xs text-green-600 mt-1">
                      ✓ Supplier: {suppliers.find(s => s.id === slide.supplier_id)?.business_name || 'Unknown'}
                    </p>
                  )}
                  {!slide.supplier_id && (
                    <p className="text-xs text-destructive mt-1">⚠️ No supplier linked</p>
                  )}
                  <p className="text-xs text-muted-foreground mt-1">Order: {slide.display_order}</p>
                </div>

                <div className="flex flex-col gap-2">
                  <Button size="sm" variant="outline" onClick={() => handleMoveSlide(slide, 'up')} disabled={index === 0}>
                    <MoveUp className="w-4 h-4" />
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => handleMoveSlide(slide, 'down')} disabled={index === slides.length - 1}>
                    <MoveDown className="w-4 h-4" />
                  </Button>
                </div>

                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={() => handleToggleActive(slide)}>
                    {slide.is_active ? 'Deactivate' : 'Activate'}
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => startEdit(slide)}>
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button size="sm" variant="destructive" onClick={() => handleDelete(slide.id)}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};