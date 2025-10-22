import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useLanguage, translations } from '@/lib/language';
import { 
  Edit, 
  MapPin, 
  Phone, 
  Mail, 
  Globe, 
  Clock, 
  Truck,
  Star,
  Building
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { SupplierProfileForm } from '@/components/supplier/SupplierProfileForm';

const SupplierProfileView: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { language } = useLanguage();
  const t = translations[language];
  const isRTL = language === 'ar';
  const [supplier, setSupplier] = useState<any>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSupplierProfile();
  }, [user]);

  const fetchSupplierProfile = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('suppliers')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) throw error;
      
      setSupplier(data);
      
      // If no profile exists, show edit form immediately
      if (!data) {
        setIsEditing(true);
      }
    } catch (error) {
      console.error('Error fetching supplier profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEditSuccess = () => {
    setIsEditing(false);
    fetchSupplierProfile();
  };

  const formatTime = (time: string) => {
    if (!time) return '';
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  const formatBusinessHours = (businessHours: any) => {
    if (!businessHours) return [];
    
    return Object.entries(businessHours).map(([day, hours]: [string, any]) => ({
      day: day.charAt(0).toUpperCase() + day.slice(1),
      isOpen: hours.isOpen,
      open: hours.open,
      close: hours.close
    }));
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-1/3"></div>
          <div className="h-32 bg-muted rounded"></div>
          <div className="h-64 bg-muted rounded"></div>
        </div>
      </div>
    );
  }

  if (isEditing || !supplier) {
    return (
      <div className="p-6">
        <div className="max-w-4xl mx-auto">
          <div className={`flex items-center justify-between mb-6 ${isRTL ? 'flex-row-reverse' : ''}`}>
            <h1 className={`text-2xl font-bold font-arabic ${isRTL ? 'text-right' : ''}`}>
              {supplier 
                ? (isRTL ? 'تعديل الملف التجاري' : 'Edit Business Profile')
                : (isRTL ? 'إنشاء الملف التجاري' : 'Create Business Profile')
              }
            </h1>
            {supplier && (
              <Button 
                variant="outline" 
                onClick={() => setIsEditing(false)}
              >
                <span className="font-arabic">{isRTL ? 'إلغاء' : 'Cancel'}</span>
              </Button>
            )}
          </div>

          <SupplierProfileForm 
            supplier={supplier}
            onSuccess={handleEditSuccess}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className={`flex items-center justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
          <h1 className={`text-2xl font-bold font-arabic ${isRTL ? 'text-right' : ''}`}>{isRTL ? 'الملف التجاري' : 'Business Profile'}</h1>
          <Button onClick={() => setIsEditing(true)} className={isRTL ? 'flex-row-reverse' : ''}>
            <Edit className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
            <span className="font-arabic">{isRTL ? 'تعديل الملف' : 'Edit Profile'}</span>
          </Button>
        </div>

        {/* Business Overview */}
        <Card>
          <CardContent className={`p-6 ${isRTL ? 'text-right' : ''}`}>
            <div className={`flex items-start gap-6 ${isRTL ? 'flex-row-reverse' : ''}`}>
              {/* Logo */}
              {supplier.logo_url && (
                <img 
                  src={supplier.logo_url} 
                  alt="Business logo"
                  className="w-24 h-24 object-cover rounded-lg border"
                />
              )}
              
              <div className="flex-1">
                <div className={`flex items-center gap-3 mb-2 ${isRTL ? 'flex-row-reverse justify-end' : ''}`}>
                  <h2 className={`text-xl font-semibold ${isRTL ? 'text-right' : ''}`}>{supplier.business_name}</h2>
                  {supplier.is_verified && (
                    <Badge variant="secondary" className={`${isRTL ? 'flex-row-reverse' : ''}`}>
                      <Star className={`h-3 w-3 ${isRTL ? 'ml-1' : 'mr-1'}`} />
                      <span className="font-arabic">{isRTL ? 'موثق' : 'Verified'}</span>
                    </Badge>
                  )}
                  {supplier.is_featured && (
                    <Badge className="bg-primary">{isRTL ? 'مميز' : 'Featured'}</Badge>
                  )}
                </div>
                
                {supplier.business_name_ar && (
                  <p className="text-muted-foreground mb-2" dir="rtl">
                    {supplier.business_name_ar}
                  </p>
                )}
                
                <div className={`flex items-center gap-4 text-sm text-muted-foreground mb-3 ${isRTL ? 'flex-row-reverse justify-start' : ''}`}>
                  <span className={`flex items-center gap-1 ${isRTL ? 'flex-row-reverse' : ''}`}>
                    <Building className="h-4 w-4" />
                    <span className="font-arabic">{isRTL ? 'أخرى' : supplier.business_type}</span>
                  </span>
                  {supplier.cuisine_type && (
                    <span className="font-arabic">{supplier.cuisine_type}</span>
                  )}
                  {supplier.rating > 0 && (
                    <span className={`flex items-center gap-1 ${isRTL ? 'flex-row-reverse' : ''}`}>
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      {supplier.rating.toFixed(1)} ({supplier.total_reviews} {isRTL ? 'مراجعات' : 'reviews'})
                    </span>
                  )}
                </div>
                
                {supplier.description && (
                  <p className={`text-muted-foreground ${isRTL ? 'text-right' : ''}`}>
                    {isRTL && supplier.description === 'your go trends news agency' 
                      ? 'وكالة الأخبار والاتجاهات الخاصة بك' 
                      : supplier.description}
                  </p>
                )}
              </div>
            </div>

            {/* Cover Image */}
            {supplier.cover_image_url && (
              <div className="mt-6">
                <img 
                  src={supplier.cover_image_url} 
                  alt="Business cover"
                  className="w-full h-48 object-cover rounded-lg"
                />
              </div>
            )}
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Contact Information */}
          <Card>
            <CardHeader className={isRTL ? 'text-right' : ''}>
              <CardTitle className={`font-arabic ${isRTL ? 'text-right' : ''}`}>{isRTL ? 'معلومات الاتصال' : 'Contact Information'}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className={`flex items-center gap-3 ${isRTL ? 'justify-end' : ''}`}>
                {isRTL ? (
                  <>
                    <span className="text-right">{supplier.phone}</span>
                    <Phone className="h-4 w-4 text-muted-foreground" />
                  </>
                ) : (
                  <>
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span>{supplier.phone}</span>
                  </>
                )}
              </div>
              
              {supplier.email && (
                <div className={`flex items-center gap-3 ${isRTL ? 'justify-end' : ''}`}>
                  {isRTL ? (
                    <>
                      <span className="text-right">{supplier.email}</span>
                      <Mail className="h-4 w-4 text-muted-foreground" />
                    </>
                  ) : (
                    <>
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <span>{supplier.email}</span>
                    </>
                  )}
                </div>
              )}
              
              {supplier.website_url && (
                <div className={`flex items-center gap-3 ${isRTL ? 'flex-row-reverse justify-end' : ''}`}>
                  <Globe className="h-4 w-4 text-muted-foreground" />
                  <a 
                    href={supplier.website_url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className={`text-primary hover:underline ${isRTL ? 'text-right' : ''}`}
                  >
                    {isRTL ? 'زيارة الموقع' : 'Visit Website'}
                  </a>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Location */}
          <Card>
            <CardHeader className={isRTL ? 'text-right' : ''}>
              <CardTitle className={`font-arabic ${isRTL ? 'text-right' : ''}`}>{isRTL ? 'الموقع' : 'Location'}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className={`flex items-start gap-3 ${isRTL ? 'text-right justify-end' : ''}`}>
                {isRTL ? (
                  <>
                    <div className="text-right">
                      <p>{supplier.address}</p>
                      <p className="text-sm text-muted-foreground">
                        {supplier.city}
                        {supplier.postal_code && `, ${supplier.postal_code}`}
                      </p>
                    </div>
                    <MapPin className="h-4 w-4 text-muted-foreground mt-1" />
                  </>
                ) : (
                  <>
                    <MapPin className="h-4 w-4 text-muted-foreground mt-1" />
                    <div>
                      <p>{supplier.address}</p>
                      <p className="text-sm text-muted-foreground">
                        {supplier.city}
                        {supplier.postal_code && `, ${supplier.postal_code}`}
                      </p>
                    </div>
                  </>
                )}
              </div>
              
              <div className={`flex items-center gap-3 text-sm text-muted-foreground ${isRTL ? 'justify-end' : ''}`}>
                {isRTL ? (
                  <>
                    <span className="font-arabic">{`التوصيل ضمن ${supplier.delivery_radius_km} كم`}</span>
                    <Truck className="h-4 w-4" />
                  </>
                ) : (
                  <>
                    <Truck className="h-4 w-4" />
                    <span className="font-arabic">{`Delivers within ${supplier.delivery_radius_km}km`}</span>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Operating Hours */}
        <Card>
          <CardHeader className={isRTL ? 'text-right' : ''}>
            <CardTitle className={`font-arabic ${isRTL ? 'text-right' : ''}`}>{isRTL ? 'ساعات العمل' : 'Operating Hours'}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {formatBusinessHours(supplier.business_hours).map((dayInfo) => (
                <div key={dayInfo.day} className={`flex items-center justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
                  <span className={`font-medium font-arabic ${isRTL ? 'text-right' : ''}`}>{dayInfo.day}</span>
                  {dayInfo.isOpen ? (
                    <span className={`text-sm text-muted-foreground ${isRTL ? 'text-left' : ''}`}>
                      {formatTime(dayInfo.open)} - {formatTime(dayInfo.close)}
                    </span>
                  ) : (
                    <Badge variant="secondary" className="font-arabic">{isRTL ? 'مغلق' : 'Closed'}</Badge>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Delivery Settings */}
        <Card>
          <CardHeader className={isRTL ? 'text-right' : ''}>
            <CardTitle className={`font-arabic ${isRTL ? 'text-right' : ''}`}>{isRTL ? 'معلومات التوصيل' : 'Delivery Information'}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className={`text-center ${isRTL ? 'text-center' : ''}`}>
                <div className={`text-2xl font-bold text-primary ${isRTL ? 'text-center' : ''}`}>
                  RWF {supplier.minimum_order.toLocaleString()}
                </div>
                <div className={`text-sm text-muted-foreground font-arabic ${isRTL ? 'text-center' : ''}`}>{isRTL ? 'الحد الأدنى للطلب' : 'Minimum Order'}</div>
              </div>
              
              <div className={`text-center ${isRTL ? 'text-center' : ''}`}>
                <div className={`text-2xl font-bold text-primary ${isRTL ? 'text-center' : ''}`}>
                  RWF {supplier.delivery_fee.toLocaleString()}
                </div>
                <div className={`text-sm text-muted-foreground font-arabic ${isRTL ? 'text-center' : ''}`}>{isRTL ? 'رسوم التوصيل' : 'Delivery Fee'}</div>
              </div>
              
              <div className={`text-center ${isRTL ? 'text-center' : ''}`}>
                <div className={`text-2xl font-bold text-primary ${isRTL ? 'text-center' : ''}`}>
                  {supplier.delivery_time_min}-{supplier.delivery_time_max} {isRTL ? 'دقيقة' : 'min'}
                </div>
                <div className={`text-sm text-muted-foreground font-arabic ${isRTL ? 'text-center' : ''}`}>{isRTL ? 'وقت التوصيل' : 'Delivery Time'}</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SupplierProfileView;