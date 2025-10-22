import { useState, useEffect } from 'react';
import { useLanguage } from "@/lib/language";
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import useEmblaCarousel from 'embla-carousel-react';

interface Slide {
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
  slide_duration?: number;
  supplier_id?: string;
  is_active: boolean;
}

export const MobileSlideshow = () => {
  const { language } = useLanguage();
  const navigate = useNavigate();
  const [slides, setSlides] = useState<Slide[]>([]);
  const [loading, setLoading] = useState(true);
  const [emblaRef, emblaApi] = useEmblaCarousel({ 
    loop: true,
    direction: language === 'ar' ? 'rtl' : 'ltr'
  });

  useEffect(() => {
    fetchSlides();
  }, []);

  // Auto-advance slideshow with consistent timing
  useEffect(() => {
    if (!emblaApi || slides.length === 0) return;

    const autoplay = setInterval(() => {
      if (emblaApi.canScrollNext()) {
        emblaApi.scrollNext();
      } else {
        emblaApi.scrollTo(0);
      }
    }, 5000); // Consistent 5 seconds for all slides

    return () => clearInterval(autoplay);
  }, [emblaApi, slides]);


  const fetchSlides = async () => {
    try {
      const { data, error } = await supabase
        .from('active_slideshow' as any)
        .select('*');

      if (error) throw error;
      setSlides((data as any as Slide[]) || []);
    } catch (error) {
      console.error('Error fetching slides:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return null;
  if (slides.length === 0) return null;

  return (
    <div className="relative w-full">
      <div ref={emblaRef} className="overflow-hidden rounded-3xl shadow-medium">
        <div className="flex">
          {slides.map((slide) => {
            const title = language === 'ar' ? (slide.title_ar || slide.title) : slide.title;
            const description = language === 'ar' ? (slide.description_ar || slide.description) : slide.description;
            const discountText = language === 'ar' ? (slide.discount_text_ar || slide.discount_text) : slide.discount_text;
            
            return (
              <div
                key={slide.id}
                className="flex-[0_0_100%] min-w-0"
              >
                <div className="relative h-[280px] sm:h-[320px] md:h-[400px] w-full overflow-hidden">
                  <img 
                    src={slide.image_url} 
                    alt={title}
                    className="absolute inset-0 w-full h-full object-cover object-center"
                    onError={(e) => {
                      e.currentTarget.src = '/placeholder.svg';
                    }}
                  />
                  {/* Dark overlay for text readability */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/40 to-black/20 z-[1]" />
                  
                  {/* Content */}
                  <div className="absolute inset-0 p-6 sm:p-8 flex flex-col justify-end z-[2]">
                    <div className="flex flex-col gap-2 text-white">
                      <h3 className="text-2xl sm:text-3xl font-bold leading-tight drop-shadow-[2px_2px_4px_rgba(0,0,0,0.8)]">
                        {title}
                      </h3>
                      {discountText && (
                        <p className="text-yellow-300 text-xl sm:text-2xl font-bold drop-shadow-[2px_2px_4px_rgba(0,0,0,0.8)]">
                          {discountText}
                        </p>
                      )}
                      {description && (
                        <p className="text-white text-sm sm:text-base leading-relaxed drop-shadow-[2px_2px_4px_rgba(0,0,0,0.8)]">
                          {description}
                        </p>
                      )}
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          if (!slide.supplier_id) {
                            navigate(slide.button_url || '/customer-suppliers');
                            return;
                          }
                          navigate(`/customer-supplier-detail/${slide.supplier_id}`);
                        }}
                        className="bg-primary text-primary-foreground px-6 py-2.5 rounded-full w-fit mt-2 hover:bg-primary/90 transition-colors font-semibold shadow-lg"
                      >
                        {language === 'ar' ? 'اطلب الآن' : 'Order Now'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};