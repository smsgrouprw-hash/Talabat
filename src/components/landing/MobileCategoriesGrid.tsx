import { Link } from 'react-router-dom';
import { Utensils, ShoppingBag, Users } from "lucide-react";
import { useLanguage } from "@/lib/language";

export const MobileCategoriesGrid = () => {
  const { language } = useLanguage();

  const categories = [
    {
      id: 1,
      title: language === 'ar' ? 'المطاعم' : 'Restaurants',
      icon: '🍕',
      gradient: 'linear-gradient(135deg, #FF6B35 0%, #F7931E 100%)',
      count: '120+',
      route: '/restaurants',
      iconComponent: Utensils
    },
    {
      id: 2,
      title: language === 'ar' ? 'الأسواق والمخابز' : 'Grocery & Bakery',
      icon: '🥖',
      gradient: 'linear-gradient(135deg, #00A651 0%, #4CAF50 100%)',
      count: '80+',
      route: '/grocery',
      iconComponent: ShoppingBag
    },
    {
      id: 3,
      title: language === 'ar' ? 'قعدات جبنه' : 'Community Services',
      icon: '🤝',
      gradient: 'linear-gradient(135deg, #9C27B0 0%, #E91E63 100%)',
      count: '50+',
      route: '/party',
      iconComponent: Users
    }
  ];

  return (
    <div className="px-4 py-8 bg-background" dir={language === 'ar' ? 'rtl' : 'ltr'}>
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-2 text-foreground">
          {language === 'ar' ? 'استكشف الفئات' : 'Explore Categories'}
        </h2>
        <p className="text-muted-foreground">
          {language === 'ar' ? 'اكتشف مجموعة متنوعة من الخيارات' : 'Discover a variety of options'}
        </p>
      </div>
      
      <div className="grid grid-cols-2 gap-4 max-w-md mx-auto mb-8">
        {categories.slice(0, 2).map((category) => {
          const IconComponent = category.iconComponent;
          return (
            <Link 
              key={category.id}
              to={category.route}
              className="bg-card rounded-3xl p-6 hover:shadow-medium transition-all duration-300 hover:scale-[1.02] cursor-pointer touch-target block border border-border shadow-soft"
              style={{
                background: category.gradient
              }}
            >
              <div className="flex flex-col items-center text-center">
                <div className="p-3 rounded-2xl mb-3 bg-white/90 backdrop-blur-sm shadow-soft">
                  <IconComponent className="h-8 w-8 text-gray-700" />
                </div>
                <span className="text-white font-bold text-lg mb-1">
                  {category.title}
                </span>
                <span className="text-white/90 text-sm">
                  {category.count} {language === 'ar' ? 'مطعم' : 'places'}
                </span>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Third category - full width */}
      <div className="max-w-md mx-auto">
        <Link 
          to={categories[2].route}
          className="bg-card rounded-3xl p-6 hover:shadow-medium transition-all duration-300 hover:scale-[1.02] cursor-pointer touch-target flex items-center justify-between border border-border shadow-soft"
          style={{
            background: categories[2].gradient
          }}
        >
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-2xl bg-white/90 backdrop-blur-sm shadow-soft">
              <Users className="h-8 w-8 text-gray-700" />
            </div>
            <div>
              <span className="text-white font-bold text-lg block">
                {categories[2].title}
              </span>
              <span className="text-white/90 text-sm">
                {categories[2].count} {language === 'ar' ? 'خدمة' : 'services'}
              </span>
            </div>
          </div>
          <div className="text-4xl">
            {categories[2].icon}
          </div>
        </Link>
      </div>
    </div>
  );
};