import { Badge } from "@/components/ui/badge";
import { useLanguage, translations } from "@/lib/language";
import arabicCuisine from "@/assets/arabic-cuisine.jpg";
import pizzaCategory from "@/assets/pizza-category.jpg";
import sushiCategory from "@/assets/sushi-category.jpg";
import vegetarianCategory from "@/assets/vegetarian-category.jpg";
import bakeryCategory from "@/assets/bakery-category.jpg";

export const CategoriesSection = () => {
  const { language } = useLanguage();
  const t = translations[language];

  const categories = [
    {
      name: language === 'ar' ? "المأكولات العربية" : "Arabic Cuisine",
      avgPrice: "8,500 RWF",
      restaurants: 88,
      image: arabicCuisine
    },
    {
      name: language === 'ar' ? "بيتزا" : "Pizza",
      avgPrice: "12,000 RWF", 
      restaurants: 65,
      image: pizzaCategory
    },
    {
      name: language === 'ar' ? "المأكولات اليابانية" : "Japanese",
      avgPrice: "15,000 RWF",
      restaurants: 87,
      image: sushiCategory
    },
    {
      name: language === 'ar' ? "نباتي" : "Vegetarian", 
      avgPrice: "6,500 RWF",
      restaurants: 55,
      image: vegetarianCategory
    },
    {
      name: language === 'ar' ? "مخبز" : "Bakery",
      avgPrice: "4,500 RWF",
      restaurants: 65,
      image: bakeryCategory
    }
  ];

  return (
    <section className="py-12 px-4" dir={language === 'ar' ? 'rtl' : 'ltr'}>
      <div className="container-responsive">
        <div className="text-center mb-8">
          <h2 className="text-2xl md:text-3xl font-bold mb-4 text-foreground">
            {language === 'ar' ? "الفئات الشائعة" : "Popular Categories"}
          </h2>
          <p className="text-base text-muted-foreground max-w-lg mx-auto">
            {language === 'ar' ? "اكتشف أطباق لذيذة من مختلف المأكولات" : "Discover delicious dishes from various cuisines"}
          </p>
        </div>

        {/* Horizontally scrollable with smooth animation */}
        <div className="overflow-x-auto scrollbar-hide scroll-smooth snap-x snap-mandatory">
          <div className="flex gap-4 sm:gap-6 max-w-6xl mx-auto pb-2">
          {categories.map((category, index) => (
            <div 
              key={index}
              className="group relative overflow-hidden rounded-2xl cursor-pointer transition-all duration-300 hover:scale-105 bg-card shadow-md hover:shadow-xl touch-target min-w-[160px] sm:min-w-[200px] flex-shrink-0 snap-start"
            >
              <div className="aspect-square relative">
                <img 
                  src={category.image}
                  alt={category.name}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent"></div>
                
                {/* Restaurant count badge */}
                <Badge 
                  className="absolute top-3 right-3 bg-white/95 text-gray-900 font-semibold text-xs px-2 py-1"
                >
                  {category.restaurants}
                </Badge>
                
                {/* Category info overlay */}
                <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
                  <h3 className="text-lg font-bold mb-1 leading-tight">{category.name}</h3>
                  <p className="text-white/90 text-sm">
                    {language === 'ar' ? `متوسط السعر ${category.avgPrice}` : `Avg price ${category.avgPrice}`}
                  </p>
                </div>
              </div>
            </div>
          ))}
          </div>
        </div>
      </div>
    </section>
  );
};