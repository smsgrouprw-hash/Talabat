import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/hooks/use-toast';
import { Upload, X, MapPin } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useLanguage, translations } from '@/lib/language';

const supplierProfileSchema = z.object({
  business_name: z.string().min(1, 'Business name is required').max(100),
  business_name_ar: z.string().optional(),
  business_type: z.string().min(1, 'Business type is required'),
  cuisine_type: z.string().optional(),
  description: z.string().max(500).optional(),
  address: z.string().min(1, 'Address is required'),
  city: z.string().min(1, 'City is required'),
  postal_code: z.string().optional(),
  phone: z.string().min(1, 'Phone number is required'),
  email: z.string().email().optional(),
  website_url: z.string().url().optional().or(z.literal('')),
  google_business_url: z.string().url().optional().or(z.literal('')),
  youtube_url: z.string().url().optional().or(z.literal('')),
  facebook_url: z.string().url().optional().or(z.literal('')),
  instagram_url: z.string().url().optional().or(z.literal('')),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  delivery_radius_km: z.number().min(0).max(50),
  minimum_order: z.number().min(0),
  delivery_fee: z.number().min(0),
  delivery_time_min: z.number().min(5).max(120),
  delivery_time_max: z.number().min(5).max(180),
  business_hours: z.record(z.object({
    open: z.string(),
    close: z.string(),
    isOpen: z.boolean()
  }))
});

type SupplierProfileFormData = z.infer<typeof supplierProfileSchema>;

interface SupplierProfileFormProps {
  supplier?: any;
  onSuccess?: () => void;
}

// We'll fetch business types from categories table now

const cuisineTypes = [
  'African',
  'American',
  'Chinese',
  'Indian',
  'Italian',
  'Lebanese',
  'Mexican',
  'Pizza',
  'Burgers',
  'Healthy',
  'Vegetarian',
  'Desserts',
  'Coffee & Tea'
];

const daysOfWeek = [
  'monday',
  'tuesday', 
  'wednesday',
  'thursday',
  'friday',
  'saturday',
  'sunday'
];

const serviceAreas = [
  'Kigali City',
  'Gasabo',
  'Kicukiro', 
  'Nyarugenge',
  'Kimisagara',
  'Gikondo',
  'Remera',
  'Nyamirambo',
  'Kimironko',
  'Kibagabaga'
];

export const SupplierProfileForm: React.FC<SupplierProfileFormProps> = ({ 
  supplier, 
  onSuccess 
}) => {
  const { user } = useAuth();
  const { language } = useLanguage();
  const t = translations[language];
  const isRTL = language === 'ar';
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string>('');
  const [coverPreview, setCoverPreview] = useState<string>('');
  const [categories, setCategories] = useState<any[]>([]);
  const [loadingLocation, setLoadingLocation] = useState(false);

  const defaultBusinessHours = {
    monday: { open: '09:00', close: '18:00', isOpen: true },
    tuesday: { open: '09:00', close: '18:00', isOpen: true },
    wednesday: { open: '09:00', close: '18:00', isOpen: true },
    thursday: { open: '09:00', close: '18:00', isOpen: true },
    friday: { open: '09:00', close: '18:00', isOpen: true },
    saturday: { open: '09:00', close: '18:00', isOpen: true },
    sunday: { open: '10:00', close: '16:00', isOpen: false }
  };

  // Fetch categories on component mount
  useEffect(() => {
    const fetchCategories = async () => {
      const { data: categoriesData, error } = await supabase
        .from('categories')
        .select('id, name_en, name_ar')
        .eq('is_active', true)
        .order('name_en');
      
      if (error) {
        console.error('Error fetching categories:', error);
      } else {
        setCategories(categoriesData || []);
      }
    };
    
    fetchCategories();
  }, []);

  const form = useForm<SupplierProfileFormData>({
    resolver: zodResolver(supplierProfileSchema),
    defaultValues: {
      business_name: supplier?.business_name || '',
      business_name_ar: supplier?.business_name_ar || '',
      business_type: supplier?.business_type || '',
      cuisine_type: supplier?.cuisine_type || '',
      description: supplier?.description || '',
      address: supplier?.address || '',
      city: supplier?.city || 'Kigali',
      postal_code: supplier?.postal_code || '',
      phone: supplier?.phone || '',
      email: supplier?.email || '',
      website_url: supplier?.website_url || '',
      google_business_url: supplier?.google_business_url || '',
      youtube_url: supplier?.youtube_url || '',
      facebook_url: supplier?.facebook_url || '',
      instagram_url: supplier?.instagram_url || '',
      latitude: supplier?.latitude || -1.9441,
      longitude: supplier?.longitude || 30.0619,
      delivery_radius_km: supplier?.delivery_radius_km || 5,
      minimum_order: supplier?.minimum_order || 0,
      delivery_fee: supplier?.delivery_fee || 0,
      delivery_time_min: supplier?.delivery_time_min || 30,
      delivery_time_max: supplier?.delivery_time_max || 60,
      business_hours: supplier?.business_hours || defaultBusinessHours
    }
  });

  useEffect(() => {
    if (supplier?.logo_url) {
      setLogoPreview(supplier.logo_url);
    }
    if (supplier?.cover_image_url) {
      setCoverPreview(supplier.cover_image_url);
    }
  }, [supplier]);

  const handleImageUpload = async (file: File, type: 'logo' | 'cover'): Promise<string> => {
    if (!user) throw new Error('User not authenticated');

    const fileExt = file.name.split('.').pop();
    const fileName = `${user.id}/${type}-${Date.now()}.${fileExt}`;

    const { data, error } = await supabase.storage
      .from('business-images')
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (error) throw error;

    const { data: { publicUrl } } = supabase.storage
      .from('business-images')
      .getPublicUrl(data.path);

    return publicUrl;
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'logo' | 'cover') => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: 'Error',
        description: 'File size must be less than 5MB',
        variant: 'destructive'
      });
      return;
    }

    if (!file.type.startsWith('image/')) {
      toast({
        title: 'Error', 
        description: 'Please select an image file',
        variant: 'destructive'
      });
      return;
    }

    if (type === 'logo') {
      setLogoFile(file);
      setLogoPreview(URL.createObjectURL(file));
    } else {
      setCoverFile(file);
      setCoverPreview(URL.createObjectURL(file));
    }
  };

  const getCurrentLocation = () => {
    setLoadingLocation(true);
    
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          form.setValue('latitude', latitude);
          form.setValue('longitude', longitude);
          setLoadingLocation(false);
          toast({
            title: 'Location updated',
            description: `Lat: ${latitude.toFixed(6)}, Lng: ${longitude.toFixed(6)}`,
          });
        },
        (error) => {
          setLoadingLocation(false);
          console.error('Error getting location:', error);
          toast({
            title: 'Error',
            description: 'Unable to get your location. Please check permissions.',
            variant: 'destructive'
          });
        }
      );
    } else {
      setLoadingLocation(false);
      toast({
        title: 'Error',
        description: 'Geolocation is not supported by this browser.',
        variant: 'destructive'
      });
    }
  };

  const onSubmit = async (data: SupplierProfileFormData) => {
    setIsSubmitting(true);

    try {
      let logoUrl = supplier?.logo_url;
      let coverUrl = supplier?.cover_image_url;

      // Upload images if new files selected
      if (logoFile) {
        logoUrl = await handleImageUpload(logoFile, 'logo');
      }
      if (coverFile) {
        coverUrl = await handleImageUpload(coverFile, 'cover');
      }

      const updateData = {
        ...data,
        logo_url: logoUrl,
        cover_image_url: coverUrl,
        updated_at: new Date().toISOString()
      };

      let error;
      if (supplier) {
        ({ error } = await supabase
          .from('suppliers')
          .update(updateData)
          .eq('user_id', user?.id));
      } else {
        ({ error } = await supabase
          .from('suppliers')
          .insert([{
            address: data.address,
            business_name: data.business_name,
            business_name_ar: data.business_name_ar,
            city: data.city,
            phone: data.phone,
            latitude: data.latitude,
            longitude: data.longitude,
            business_type: data.business_type,
            cuisine_type: data.cuisine_type,
            description: data.description,
            postal_code: data.postal_code,
            email: data.email,
            website_url: data.website_url,
            google_business_url: data.google_business_url,
            youtube_url: data.youtube_url,
            facebook_url: data.facebook_url,
            instagram_url: data.instagram_url,
            delivery_radius_km: data.delivery_radius_km,
            minimum_order: data.minimum_order,
            delivery_fee: data.delivery_fee,
            delivery_time_min: data.delivery_time_min,
            delivery_time_max: data.delivery_time_max,
            business_hours: data.business_hours,
            logo_url: logoUrl,
            cover_image_url: coverUrl,
            user_id: user?.id
          }]));
      }

      if (error) throw error;

      if (error) throw error;

      toast({
        title: 'Success',
        description: supplier ? 'Profile updated successfully' : 'Profile created successfully'
      });

      onSuccess?.();
    } catch (error: any) {
      console.error('Error saving profile:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to save profile',
        variant: 'destructive'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 pb-32">
        {/* Business Information */}
        <Card className="border-2">
          <CardHeader className={`pb-4 ${isRTL ? 'text-right' : ''}`}>
            <CardTitle className={`font-arabic text-xl ${isRTL ? 'text-right' : ''}`}>
              {isRTL ? 'معلومات العمل' : 'Business Information'}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6 pt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="business_name"
                render={({ field }) => (
                  <FormItem className={isRTL ? 'text-right' : ''}>
                    <FormLabel className={`font-arabic ${isRTL ? 'text-right' : ''}`}>
                      {isRTL ? 'اسم العمل (بالإنجليزية) *' : 'Business Name (English) *'}
                    </FormLabel>
                    <FormControl>
                      <Input {...field} placeholder={isRTL ? 'أدخل اسم العمل' : 'Enter business name'} dir={isRTL ? 'rtl' : 'ltr'} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="business_name_ar"
                render={({ field }) => (
                  <FormItem className={isRTL ? 'text-right' : ''}>
                    <FormLabel className={`font-arabic ${isRTL ? 'text-right' : ''}`}>
                      {isRTL ? 'اسم العمل (بالعربية)' : 'Business Name (Arabic)'}
                    </FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="اسم المتجر بالعربية" dir="rtl" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="business_type"
                render={({ field }) => (
                  <FormItem className={isRTL ? 'text-right' : ''}>
                    <FormLabel className={`font-arabic ${isRTL ? 'text-right' : ''}`}>
                      {isRTL ? 'نوع العمل *' : 'Business Type *'}
                    </FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger dir={isRTL ? 'rtl' : 'ltr'}>
                          <SelectValue placeholder={isRTL ? 'اختر نوع العمل' : 'Select business type'} />
                        </SelectTrigger>
                       </FormControl>
                       <SelectContent>
                         {categories.map((category) => (
                           <SelectItem key={category.id} value={category.id}>
                             {isRTL ? category.name_ar || category.name_en : category.name_en}
                           </SelectItem>
                         ))}
                       </SelectContent>
                     </Select>
                     <FormMessage />
                   </FormItem>
                 )}
               />

              <FormField
                control={form.control}
                name="cuisine_type"
                render={({ field }) => (
                  <FormItem className={isRTL ? 'text-right' : ''}>
                    <FormLabel className={`font-arabic ${isRTL ? 'text-right' : ''}`}>
                      {isRTL ? 'نوع المطبخ' : 'Cuisine Type'}
                    </FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger dir={isRTL ? 'rtl' : 'ltr'}>
                          <SelectValue placeholder={isRTL ? 'اختر نوع المطبخ' : 'Select cuisine type'} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {cuisineTypes.map((type) => (
                          <SelectItem key={type} value={type}>
                            {type}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem className={isRTL ? 'text-right' : ''}>
                  <FormLabel className={`font-arabic ${isRTL ? 'text-right' : ''}`}>
                    {isRTL ? 'الوصف' : 'Description'}
                  </FormLabel>
                  <FormControl>
                    <Textarea 
                      {...field} 
                      placeholder={isRTL ? 'صف عملك...' : 'Describe your business...'} 
                      rows={3}
                      maxLength={500}
                      dir={isRTL ? 'rtl' : 'ltr'}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        {/* Business Images */}
        <Card className="border-2">
          <CardHeader className={`pb-4 ${isRTL ? 'text-right' : ''}`}>
            <CardTitle className={`font-arabic text-xl ${isRTL ? 'text-right' : ''}`}>
              {isRTL ? 'صور العمل' : 'Business Images'}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6 pt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Logo Upload */}
              <div className={isRTL ? 'text-right' : ''}>
                <Label className={`font-arabic ${isRTL ? 'text-right' : ''}`}>
                  {isRTL ? 'شعار العمل' : 'Business Logo'}
                </Label>
                <div className="mt-2">
                  {logoPreview ? (
                    <div className="relative">
                      <img 
                        src={logoPreview} 
                        alt="Logo preview" 
                        className="w-32 h-32 object-cover rounded-lg border"
                      />
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        className="absolute -top-2 -right-2"
                        onClick={() => {
                          setLogoFile(null);
                          setLogoPreview('');
                        }}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : (
                    <div className="w-32 h-32 border-2 border-dashed border-muted-foreground rounded-lg flex items-center justify-center">
                      <Upload className="h-8 w-8 text-muted-foreground" />
                    </div>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileChange(e, 'logo')}
                    className="mt-2 text-sm"
                  />
                </div>
              </div>

              {/* Cover Image Upload */}
              <div className={isRTL ? 'text-right' : ''}>
                <Label className={`font-arabic ${isRTL ? 'text-right' : ''}`}>
                  {isRTL ? 'صورة الغلاف' : 'Cover Image'}
                </Label>
                <div className="mt-2">
                  {coverPreview ? (
                    <div className="relative">
                      <img 
                        src={coverPreview} 
                        alt="Cover preview" 
                        className="w-full h-32 object-cover rounded-lg border"
                      />
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        className="absolute -top-2 -right-2"
                        onClick={() => {
                          setCoverFile(null);
                          setCoverPreview('');
                        }}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : (
                    <div className="w-full h-32 border-2 border-dashed border-muted-foreground rounded-lg flex items-center justify-center">
                      <Upload className="h-8 w-8 text-muted-foreground" />
                    </div>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileChange(e, 'cover')}
                    className="mt-2 text-sm"
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Contact Information */}
        <Card className="border-2">
          <CardHeader className={`pb-4 ${isRTL ? 'text-right' : ''}`}>
            <CardTitle className={`font-arabic text-xl ${isRTL ? 'text-right' : ''}`}>
              {isRTL ? 'معلومات الاتصال' : 'Contact Information'}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6 pt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone Number *</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="+250 XXX XXX XXX" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input {...field} type="email" placeholder="business@example.com" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="website_url"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Website URL</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="https://your-website.com" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        {/* Location */}
        <Card className="border-2">
          <CardHeader className={`pb-4 ${isRTL ? 'text-right' : ''}`}>
            <CardTitle className={`font-arabic text-xl ${isRTL ? 'text-right' : ''}`}>
              {isRTL ? 'الموقع والعنوان' : 'Location & Address'}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6 pt-6">
            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Address *</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Street address" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="city"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>City *</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="City" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="postal_code"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Postal Code</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Postal code" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                <Label>GPS Coordinates</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={getCurrentLocation}
                  disabled={loadingLocation}
                >
                  {loadingLocation ? 'Getting...' : 'Get Location'}
                </Button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="latitude"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Latitude *</FormLabel>
                      <FormControl>
                        <Input 
                          {...field} 
                          type="number" 
                          step="any"
                          onChange={(e) => field.onChange(parseFloat(e.target.value))}
                          placeholder="-1.9441" 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="longitude"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Longitude *</FormLabel>
                      <FormControl>
                        <Input 
                          {...field} 
                          type="number" 
                          step="any"
                          onChange={(e) => field.onChange(parseFloat(e.target.value))}
                          placeholder="30.0619" 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Social Media & Business Links */}
            <div className="space-y-4">
              <h4 className="text-md font-medium">Social Media & Business Links</h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="google_business_url"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Google My Business URL</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="https://business.google.com/..." />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="youtube_url"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>YouTube Channel URL</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="https://youtube.com/@yourchannel" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="facebook_url"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Facebook Page URL</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="https://facebook.com/yourpage" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="instagram_url"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Instagram Profile URL</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="https://instagram.com/yourprofile" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Operating Hours */}
        <Card className="border-2">
          <CardHeader className={`pb-4 ${isRTL ? 'text-right' : ''}`}>
            <CardTitle className={`font-arabic text-xl ${isRTL ? 'text-right' : ''}`}>
              {isRTL ? 'ساعات العمل' : 'Operating Hours'}
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="space-y-4">
              {daysOfWeek.map((day) => {
                const dayTranslations: Record<string, string> = {
                  monday: isRTL ? 'الاثنين' : 'Monday',
                  tuesday: isRTL ? 'الثلاثاء' : 'Tuesday',
                  wednesday: isRTL ? 'الأربعاء' : 'Wednesday',
                  thursday: isRTL ? 'الخميس' : 'Thursday',
                  friday: isRTL ? 'الجمعة' : 'Friday',
                  saturday: isRTL ? 'السبت' : 'Saturday',
                  sunday: isRTL ? 'الأحد' : 'Sunday'
                };
                const dayName = dayTranslations[day] || day.charAt(0).toUpperCase() + day.slice(1);
                
                return (
                  <div key={day} className={`flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 p-4 rounded-lg border bg-card/50 ${isRTL ? 'text-right' : ''}`}>
                    <div className={`w-full sm:w-28 capitalize font-medium text-base ${isRTL ? 'font-arabic' : ''}`}>
                      {dayName}
                    </div>
                    
                    <div className="flex items-center gap-3 min-h-[48px]">
                      <Checkbox
                        checked={form.watch(`business_hours.${day}.isOpen`)}
                        onCheckedChange={(checked) => {
                          form.setValue(`business_hours.${day}.isOpen`, !!checked);
                        }}
                        className="h-6 w-6"
                      />
                      
                      {form.watch(`business_hours.${day}.isOpen`) ? (
                        <div className="flex items-center gap-2 flex-wrap">
                          <Input
                            type="time"
                            value={form.watch(`business_hours.${day}.open`)}
                            onChange={(e) => form.setValue(`business_hours.${day}.open`, e.target.value)}
                            className="w-32 h-12 text-base"
                          />
                          <span className={`text-sm ${isRTL ? 'font-arabic' : ''}`}>
                            {isRTL ? 'إلى' : 'to'}
                          </span>
                          <Input
                            type="time"
                            value={form.watch(`business_hours.${day}.close`)}
                            onChange={(e) => form.setValue(`business_hours.${day}.close`, e.target.value)}
                            className="w-32 h-12 text-base"
                          />
                        </div>
                      ) : (
                        <Badge variant="secondary" className={`h-10 px-4 text-base ${isRTL ? 'font-arabic' : ''}`}>
                          {isRTL ? 'مغلق' : 'Closed'}
                        </Badge>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Delivery Settings */}
        <Card className="border-2">
          <CardHeader className={`pb-4 ${isRTL ? 'text-right' : ''}`}>
            <CardTitle className={`font-arabic text-xl ${isRTL ? 'text-right' : ''}`}>
              {isRTL ? 'إعدادات التوصيل' : 'Delivery Settings'}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6 pt-6">
            <FormField
              control={form.control}
              name="delivery_radius_km"
              render={({ field }) => (
                <FormItem className={isRTL ? 'text-right' : ''}>
                  <FormLabel className={`font-arabic text-base ${isRTL ? 'text-right' : ''}`}>
                    {isRTL ? '* نطاق التوصيل (كم)' : 'Delivery Radius (km) *'}
                  </FormLabel>
                  <FormControl>
                    <Input 
                      {...field} 
                      type="number" 
                      min="0" 
                      max="50"
                      onChange={(e) => field.onChange(parseFloat(e.target.value))}
                      placeholder="5"
                      className="h-12 text-base"
                      dir={isRTL ? 'rtl' : 'ltr'}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="delivery_fee"
              render={({ field }) => (
                <FormItem className={isRTL ? 'text-right' : ''}>
                  <FormLabel className={`font-arabic text-base ${isRTL ? 'text-right' : ''}`}>
                    {isRTL ? '* رسوم التوصيل (RWF)' : 'Delivery Fee (RWF) *'}
                  </FormLabel>
                  <FormControl>
                    <Input 
                      {...field} 
                      type="number" 
                      min="0"
                      onChange={(e) => field.onChange(parseFloat(e.target.value))}
                      placeholder="1000"
                      className="h-12 text-base"
                      dir={isRTL ? 'rtl' : 'ltr'}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="minimum_order"
              render={({ field }) => (
                <FormItem className={isRTL ? 'text-right' : ''}>
                  <FormLabel className={`font-arabic text-base ${isRTL ? 'text-right' : ''}`}>
                    {isRTL ? '* الحد الأدنى للطلب (RWF)' : 'Minimum Order Amount (RWF) *'}
                  </FormLabel>
                  <FormControl>
                    <Input 
                      {...field} 
                      type="number" 
                      min="0"
                      onChange={(e) => field.onChange(parseFloat(e.target.value))}
                      placeholder="5000"
                      className="h-12 text-base"
                      dir={isRTL ? 'rtl' : 'ltr'}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="delivery_time_min"
                render={({ field }) => (
                  <FormItem className={isRTL ? 'text-right' : ''}>
                    <FormLabel className={`font-arabic text-base ${isRTL ? 'text-right' : ''}`}>
                      {isRTL ? '* الحد الأدنى لوقت التوصيل (دقائق)' : 'Min Delivery Time (minutes) *'}
                    </FormLabel>
                    <FormControl>
                      <Input 
                        {...field} 
                        type="number" 
                        min="5" 
                        max="120"
                        onChange={(e) => field.onChange(parseFloat(e.target.value))}
                        placeholder="30"
                        className="h-12 text-base"
                        dir={isRTL ? 'rtl' : 'ltr'}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="delivery_time_max"
                render={({ field }) => (
                  <FormItem className={isRTL ? 'text-right' : ''}>
                    <FormLabel className={`font-arabic text-base ${isRTL ? 'text-right' : ''}`}>
                      {isRTL ? '* الحد الأقصى لوقت التوصيل (دقائق)' : 'Max Delivery Time (minutes) *'}
                    </FormLabel>
                    <FormControl>
                      <Input 
                        {...field} 
                        type="number" 
                        min="5" 
                        max="180"
                        onChange={(e) => field.onChange(parseFloat(e.target.value))}
                        placeholder="60"
                        className="h-12 text-base"
                        dir={isRTL ? 'rtl' : 'ltr'}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
        </Card>

        <div className="sticky bottom-0 left-0 right-0 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 p-4 border-t shadow-lg -mx-4 sm:-mx-6 mt-8">
          <Button 
            type="submit" 
            disabled={isSubmitting} 
            className={`w-full h-14 text-base font-medium ${isRTL ? 'font-arabic' : ''}`}
          >
            {isSubmitting 
              ? (isRTL ? 'جاري الحفظ...' : 'Saving...') 
              : supplier 
                ? (isRTL ? 'تحديث الملف الشخصي' : 'Update Profile')
                : (isRTL ? 'إنشاء الملف الشخصي' : 'Create Profile')
            }
          </Button>
        </div>
      </form>
    </Form>
  );
};