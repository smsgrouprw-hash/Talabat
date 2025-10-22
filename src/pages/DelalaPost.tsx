import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useToast } from "@/hooks/use-toast";
import { Upload, X, Image as ImageIcon } from "lucide-react";
import { useLanguage } from "@/lib/language";

const formSchema = z.object({
  title_ar: z.string().min(1, "العنوان بالعربية مطلوب").max(200),
  title_en: z.string().min(1, "English title required").max(200),
  description_ar: z.string().min(1, "الوصف بالعربية مطلوب").max(1000),
  description_en: z.string().min(1, "English description required").max(1000),
  price: z.number().min(0, "السعر يجب أن يكون موجباً"),
  currency: z.enum(["RWF", "USD", "SAR"]),
  is_negotiable: z.boolean().default(false),
  category: z.string().min(1, "الفئة مطلوبة"),
  condition: z.string().min(1, "الحالة مطلوبة"),
  location_city: z.string().min(1, "المدينة مطلوبة"),
  location_district: z.string().optional(),
  phone: z.string().min(1, "رقم الهاتف مطلوب"),
  whatsapp_number: z.string().optional(),
  preferred_contact: z.enum(["call", "whatsapp", "both"]).default("both"),
  available_hours: z.string().optional(),
  is_delivery_available: z.boolean().default(false),
});

type FormData = z.infer<typeof formSchema>;

const CATEGORIES = [
  { value: "electronics", label_ar: "إلكترونيات", label_en: "Electronics" },
  { value: "furniture", label_ar: "أثاث", label_en: "Furniture" },
  { value: "clothing", label_ar: "ملابس", label_en: "Clothing" },
  { value: "toys", label_ar: "ألعاب", label_en: "Toys" },
  { value: "home_garden", label_ar: "منزل وحديقة", label_en: "Home & Garden" },
  { value: "vehicles", label_ar: "مركبات", label_en: "Vehicles" },
  { value: "services", label_ar: "خدمات", label_en: "Services" },
  { value: "books", label_ar: "كتب", label_en: "Books" },
  { value: "food_kitchen", label_ar: "طعام ومطبخ", label_en: "Food & Kitchen" },
  { value: "other", label_ar: "أخرى", label_en: "Other" },
];

const CONDITIONS = [
  { value: "new", label_ar: "جديد", label_en: "New" },
  { value: "like_new", label_ar: "شبه جديد", label_en: "Like New" },
  { value: "good", label_ar: "جيد", label_en: "Good" },
  { value: "fair", label_ar: "مقبول", label_en: "Fair" },
  { value: "for_parts", label_ar: "لقطع الغيار", label_en: "For Parts" },
];

export default function DelalaPost() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { language } = useLanguage();
  const [images, setImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);

  const { register, handleSubmit, formState: { errors }, setValue, watch } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      currency: "RWF",
      preferred_contact: "both",
      is_negotiable: false,
      is_delivery_available: false,
    },
  });

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    
    if (images.length + files.length > 5) {
      toast({
        title: language === 'ar' ? "حد أقصى 5 صور" : "Maximum 5 images",
        variant: "destructive",
      });
      return;
    }

    const validFiles = files.filter(file => {
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: language === 'ar' ? `${file.name} أكبر من 5MB` : `${file.name} exceeds 5MB`,
          variant: "destructive",
        });
        return false;
      }
      return true;
    });

    setImages([...images, ...validFiles]);
    
    validFiles.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreviews(prev => [...prev, reader.result as string]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
    setImagePreviews(imagePreviews.filter((_, i) => i !== index));
  };

  const moveImage = (index: number, direction: 'up' | 'down') => {
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= images.length) return;

    const newImages = [...images];
    const newPreviews = [...imagePreviews];
    
    [newImages[index], newImages[newIndex]] = [newImages[newIndex], newImages[index]];
    [newPreviews[index], newPreviews[newIndex]] = [newPreviews[newIndex], newPreviews[index]];
    
    setImages(newImages);
    setImagePreviews(newPreviews);
  };

  const uploadImages = async (): Promise<string[]> => {
    const uploadedUrls: string[] = [];

    for (const image of images) {
      const fileExt = image.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `delala/${fileName}`;

      const { error, data } = await supabase.storage
        .from('business-images')
        .upload(filePath, image);

      if (error) throw error;

      const { data: { publicUrl } } = supabase.storage
        .from('business-images')
        .getPublicUrl(filePath);

      uploadedUrls.push(publicUrl);
    }

    return uploadedUrls;
  };

  const onSubmit = async (data: FormData, status: 'draft' | 'active') => {
    if (images.length < 2) {
      toast({
        title: language === 'ar' ? "يجب تحميل صورتين على الأقل" : "At least 2 images required",
        variant: "destructive",
      });
      return;
    }

    try {
      setUploading(true);

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: language === 'ar' ? "يجب تسجيل الدخول أولاً" : "Please login first",
          variant: "destructive",
        });
        return;
      }

      const imageUrls = await uploadImages();

      const listingData = {
        ...data,
        user_id: user.id,
        images: imageUrls,
        status,
        is_approved: status === 'active',
        expires_at: status === 'active' ? new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString() : null,
      };

      const { error } = await (supabase as any)
        .from('delala_listings')
        .insert([listingData]);

      if (error) throw error;

      toast({
        title: status === 'active' 
          ? (language === 'ar' ? "تم نشر الإعلان بنجاح" : "Listing published successfully")
          : (language === 'ar' ? "تم حفظ المسودة" : "Draft saved"),
      });

      navigate('/delala');
    } catch (error: any) {
      toast({
        title: language === 'ar' ? "حدث خطأ" : "Error occurred",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="container max-w-3xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">
          {language === 'ar' ? 'إضافة إعلان جديد' : 'Post New Item'}
        </h1>

        <form className="space-y-6">
          {/* Title Arabic */}
          <div>
            <Label htmlFor="title_ar">العنوان بالعربية *</Label>
            <Input
              id="title_ar"
              {...register("title_ar")}
              placeholder="أدخل العنوان بالعربية"
              maxLength={200}
              dir="rtl"
            />
            {errors.title_ar && (
              <p className="text-sm text-destructive mt-1">{errors.title_ar.message}</p>
            )}
          </div>

          {/* Title English */}
          <div>
            <Label htmlFor="title_en">English Title *</Label>
            <Input
              id="title_en"
              {...register("title_en")}
              placeholder="Enter title in English"
              maxLength={200}
            />
            {errors.title_en && (
              <p className="text-sm text-destructive mt-1">{errors.title_en.message}</p>
            )}
          </div>

          {/* Description Arabic */}
          <div>
            <Label htmlFor="description_ar">الوصف بالعربية *</Label>
            <Textarea
              id="description_ar"
              {...register("description_ar")}
              placeholder="أدخل الوصف بالعربية"
              maxLength={1000}
              rows={4}
              dir="rtl"
            />
            {errors.description_ar && (
              <p className="text-sm text-destructive mt-1">{errors.description_ar.message}</p>
            )}
          </div>

          {/* Description English */}
          <div>
            <Label htmlFor="description_en">English Description *</Label>
            <Textarea
              id="description_en"
              {...register("description_en")}
              placeholder="Enter description in English"
              maxLength={1000}
              rows={4}
            />
            {errors.description_en && (
              <p className="text-sm text-destructive mt-1">{errors.description_en.message}</p>
            )}
          </div>

          {/* Price & Currency */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="price">{language === 'ar' ? 'السعر *' : 'Price *'}</Label>
              <Input
                id="price"
                type="number"
                {...register("price", { valueAsNumber: true })}
                placeholder="0"
                min={0}
              />
              {errors.price && (
                <p className="text-sm text-destructive mt-1">{errors.price.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="currency">{language === 'ar' ? 'العملة' : 'Currency'}</Label>
              <Select onValueChange={(value) => setValue("currency", value as any)} defaultValue="RWF">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="RWF">RWF</SelectItem>
                  <SelectItem value="USD">USD</SelectItem>
                  <SelectItem value="SAR">SAR</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Negotiable */}
          <div className="flex items-center space-x-2">
            <Checkbox
              id="is_negotiable"
              onCheckedChange={(checked) => setValue("is_negotiable", checked as boolean)}
            />
            <Label htmlFor="is_negotiable" className="cursor-pointer">
              {language === 'ar' ? 'قابل للتفاوض' : 'Negotiable'}
            </Label>
          </div>

          {/* Category */}
          <div>
            <Label htmlFor="category">{language === 'ar' ? 'الفئة *' : 'Category *'}</Label>
            <Select onValueChange={(value) => setValue("category", value)}>
              <SelectTrigger>
                <SelectValue placeholder={language === 'ar' ? 'اختر الفئة' : 'Select category'} />
              </SelectTrigger>
              <SelectContent>
                {CATEGORIES.map((cat) => (
                  <SelectItem key={cat.value} value={cat.value}>
                    {language === 'ar' ? cat.label_ar : cat.label_en}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.category && (
              <p className="text-sm text-destructive mt-1">{errors.category.message}</p>
            )}
          </div>

          {/* Condition */}
          <div>
            <Label htmlFor="condition">{language === 'ar' ? 'الحالة *' : 'Condition *'}</Label>
            <Select onValueChange={(value) => setValue("condition", value)}>
              <SelectTrigger>
                <SelectValue placeholder={language === 'ar' ? 'اختر الحالة' : 'Select condition'} />
              </SelectTrigger>
              <SelectContent>
                {CONDITIONS.map((cond) => (
                  <SelectItem key={cond.value} value={cond.value}>
                    {language === 'ar' ? cond.label_ar : cond.label_en}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.condition && (
              <p className="text-sm text-destructive mt-1">{errors.condition.message}</p>
            )}
          </div>

          {/* Images */}
          <div>
            <Label>{language === 'ar' ? 'الصور (2-5 صور) *' : 'Images (2-5 images) *'}</Label>
            <div className="mt-2">
              <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer hover:bg-accent">
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <Upload className="w-8 h-8 mb-2 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">
                    {language === 'ar' ? 'انقر لتحميل الصور' : 'Click to upload images'}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {language === 'ar' ? 'حد أقصى 5MB لكل صورة' : 'Max 5MB per image'}
                  </p>
                </div>
                <input
                  type="file"
                  className="hidden"
                  accept="image/*"
                  multiple
                  onChange={handleImageChange}
                  disabled={images.length >= 5}
                />
              </label>

              {imagePreviews.length > 0 && (
                <div className="grid grid-cols-3 gap-4 mt-4">
                  {imagePreviews.map((preview, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={preview}
                        alt={`Preview ${index + 1}`}
                        className="w-full h-32 object-cover rounded-lg"
                      />
                      <div className="absolute top-2 right-2 flex gap-1">
                        {index > 0 && (
                          <Button
                            type="button"
                            size="icon"
                            variant="secondary"
                            className="h-6 w-6"
                            onClick={() => moveImage(index, 'up')}
                          >
                            ←
                          </Button>
                        )}
                        {index < images.length - 1 && (
                          <Button
                            type="button"
                            size="icon"
                            variant="secondary"
                            className="h-6 w-6"
                            onClick={() => moveImage(index, 'down')}
                          >
                            →
                          </Button>
                        )}
                        <Button
                          type="button"
                          size="icon"
                          variant="destructive"
                          className="h-6 w-6"
                          onClick={() => removeImage(index)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                      {index === 0 && (
                        <div className="absolute bottom-2 left-2 bg-primary text-primary-foreground text-xs px-2 py-1 rounded">
                          {language === 'ar' ? 'رئيسية' : 'Main'}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Location */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="location_city">{language === 'ar' ? 'المدينة *' : 'City *'}</Label>
              <Input
                id="location_city"
                {...register("location_city")}
                placeholder={language === 'ar' ? 'المدينة' : 'City'}
              />
              {errors.location_city && (
                <p className="text-sm text-destructive mt-1">{errors.location_city.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="location_district">{language === 'ar' ? 'المنطقة' : 'District'}</Label>
              <Input
                id="location_district"
                {...register("location_district")}
                placeholder={language === 'ar' ? 'المنطقة' : 'District'}
              />
            </div>
          </div>

          {/* Contact */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="phone">{language === 'ar' ? 'رقم الهاتف *' : 'Phone Number *'}</Label>
              <Input
                id="phone"
                {...register("phone")}
                placeholder="+250"
                type="tel"
              />
              {errors.phone && (
                <p className="text-sm text-destructive mt-1">{errors.phone.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="whatsapp_number">{language === 'ar' ? 'رقم واتساب' : 'WhatsApp Number'}</Label>
              <Input
                id="whatsapp_number"
                {...register("whatsapp_number")}
                placeholder="+250"
                type="tel"
              />
            </div>
          </div>

          {/* Preferred Contact */}
          <div>
            <Label>{language === 'ar' ? 'طريقة الاتصال المفضلة' : 'Preferred Contact Method'}</Label>
            <RadioGroup
              defaultValue="both"
              onValueChange={(value) => setValue("preferred_contact", value as any)}
              className="flex gap-4 mt-2"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="call" id="call" />
                <Label htmlFor="call" className="cursor-pointer">
                  {language === 'ar' ? 'اتصال' : 'Call'}
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="whatsapp" id="whatsapp" />
                <Label htmlFor="whatsapp" className="cursor-pointer">
                  {language === 'ar' ? 'واتساب' : 'WhatsApp'}
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="both" id="both" />
                <Label htmlFor="both" className="cursor-pointer">
                  {language === 'ar' ? 'كلاهما' : 'Both'}
                </Label>
              </div>
            </RadioGroup>
          </div>

          {/* Available Hours */}
          <div>
            <Label htmlFor="available_hours">{language === 'ar' ? 'ساعات التوفر' : 'Available Hours'}</Label>
            <Input
              id="available_hours"
              {...register("available_hours")}
              placeholder={language === 'ar' ? 'مثال: 9 صباحاً - 5 مساءً' : 'e.g., 9 AM - 5 PM'}
            />
          </div>

          {/* Delivery Available */}
          <div className="flex items-center space-x-2">
            <Checkbox
              id="is_delivery_available"
              onCheckedChange={(checked) => setValue("is_delivery_available", checked as boolean)}
            />
            <Label htmlFor="is_delivery_available" className="cursor-pointer">
              {language === 'ar' ? 'التوصيل متاح' : 'Delivery Available'}
            </Label>
          </div>

          {/* Submit Buttons */}
          <div className="flex gap-4 pt-4">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={handleSubmit((data) => onSubmit(data, 'draft'))}
              disabled={uploading}
            >
              {language === 'ar' ? 'حفظ كمسودة' : 'Save as Draft'}
            </Button>
            <Button
              type="button"
              className="flex-1"
              onClick={handleSubmit((data) => onSubmit(data, 'active'))}
              disabled={uploading}
            >
              {uploading ? (language === 'ar' ? 'جاري النشر...' : 'Publishing...') : (language === 'ar' ? 'نشر الإعلان' : 'Publish')}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
