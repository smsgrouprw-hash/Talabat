import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { useLanguage } from "@/lib/language";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

interface FilterState {
  categories: string[];
  priceRange: [number, number];
  conditions: string[];
  cities: string[];
  postedWithin: string;
  deliveryAvailable: boolean;
  negotiableOnly: boolean;
}

interface ListingFiltersProps {
  filters: FilterState;
  onFilterChange: (filters: FilterState) => void;
  maxPrice: number;
}

const categories = [
  { value: 'electronics', ar: 'إلكترونيات', en: 'Electronics' },
  { value: 'furniture', ar: 'أثاث', en: 'Furniture' },
  { value: 'clothing', ar: 'ملابس', en: 'Clothing' },
  { value: 'toys', ar: 'ألعاب', en: 'Toys' },
  { value: 'home_garden', ar: 'منزل وحديقة', en: 'Home & Garden' },
  { value: 'vehicles', ar: 'مركبات', en: 'Vehicles' },
  { value: 'services', ar: 'خدمات', en: 'Services' },
  { value: 'books', ar: 'كتب', en: 'Books' },
  { value: 'food_kitchen', ar: 'طعام ومطبخ', en: 'Food & Kitchen' },
  { value: 'other', ar: 'أخرى', en: 'Other' }
];

const conditions = [
  { value: 'new', ar: 'جديد', en: 'New' },
  { value: 'like_new', ar: 'كالجديد', en: 'Like New' },
  { value: 'good', ar: 'جيد', en: 'Good' },
  { value: 'fair', ar: 'مقبول', en: 'Fair' },
  { value: 'poor', ar: 'سيئ', en: 'Poor' }
];

const cities = [
  { value: 'kigali', ar: 'كيغالي', en: 'Kigali' },
  { value: 'huye', ar: 'هوي', en: 'Huye' },
  { value: 'musanze', ar: 'موسانزي', en: 'Musanze' },
  { value: 'rubavu', ar: 'روبافو', en: 'Rubavu' },
  { value: 'rwamagana', ar: 'رواماغانا', en: 'Rwamagana' }
];

const postedWithinOptions = [
  { value: 'all', ar: 'الكل', en: 'All' },
  { value: 'today', ar: 'اليوم', en: 'Today' },
  { value: 'week', ar: 'هذا الأسبوع', en: 'This Week' },
  { value: 'month', ar: 'هذا الشهر', en: 'This Month' }
];

export function ListingFilters({ filters, onFilterChange, maxPrice }: ListingFiltersProps) {
  const { language } = useLanguage();

  const handleCategoryToggle = (category: string) => {
    const newCategories = filters.categories.includes(category)
      ? filters.categories.filter(c => c !== category)
      : [...filters.categories, category];
    onFilterChange({ ...filters, categories: newCategories });
  };

  const handleConditionToggle = (condition: string) => {
    const newConditions = filters.conditions.includes(condition)
      ? filters.conditions.filter(c => c !== condition)
      : [...filters.conditions, condition];
    onFilterChange({ ...filters, conditions: newConditions });
  };

  const handleCityToggle = (city: string) => {
    const newCities = filters.cities.includes(city)
      ? filters.cities.filter(c => c !== city)
      : [...filters.cities, city];
    onFilterChange({ ...filters, cities: newCities });
  };

  const handleReset = () => {
    onFilterChange({
      categories: [],
      priceRange: [0, maxPrice],
      conditions: [],
      cities: [],
      postedWithin: 'all',
      deliveryAvailable: false,
      negotiableOnly: false
    });
  };

  return (
    <Card className="dir-rtl">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg text-right">
            {language === 'ar' ? 'تصفية النتائج' : 'Filters'}
          </CardTitle>
          <Button variant="ghost" size="sm" onClick={handleReset}>
            <X className="h-4 w-4 ml-1" />
            {language === 'ar' ? 'إعادة تعيين' : 'Reset'}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Categories */}
        <div className="space-y-3">
          <Label className="text-sm font-semibold block text-right">
            {language === 'ar' ? 'الفئة' : 'Category'}
          </Label>
          <div className="space-y-2">
            {categories.map((category) => (
              <div key={category.value} className="flex items-center justify-end gap-2">
                <label
                  htmlFor={`cat-${category.value}`}
                  className="text-sm cursor-pointer flex-1 text-right"
                >
                  {language === 'ar' ? category.ar : category.en}
                </label>
                <Checkbox
                  id={`cat-${category.value}`}
                  checked={filters.categories.includes(category.value)}
                  onCheckedChange={() => handleCategoryToggle(category.value)}
                  className="shrink-0"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Price Range */}
        <div className="space-y-3">
          <Label className="text-sm font-semibold block text-right">
            {language === 'ar' ? 'نطاق السعر' : 'Price Range'}
          </Label>
          <div className="space-y-2">
            <Slider
              min={0}
              max={maxPrice}
              step={1000}
              value={filters.priceRange}
              onValueChange={(value) => onFilterChange({ ...filters, priceRange: value as [number, number] })}
              dir="rtl"
              className="rtl-slider"
            />
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>{filters.priceRange[1].toLocaleString()} RWF</span>
              <span>{filters.priceRange[0].toLocaleString()} RWF</span>
            </div>
          </div>
        </div>

        {/* Condition */}
        <div className="space-y-3">
          <Label className="text-sm font-semibold block text-right">
            {language === 'ar' ? 'الحالة' : 'Condition'}
          </Label>
          <div className="space-y-2">
            {conditions.map((condition) => (
              <div key={condition.value} className="flex items-center justify-end gap-2">
                <label
                  htmlFor={`cond-${condition.value}`}
                  className="text-sm cursor-pointer flex-1 text-right"
                >
                  {language === 'ar' ? condition.ar : condition.en}
                </label>
                <Checkbox
                  id={`cond-${condition.value}`}
                  checked={filters.conditions.includes(condition.value)}
                  onCheckedChange={() => handleConditionToggle(condition.value)}
                  className="shrink-0"
                />
              </div>
            ))}
          </div>
        </div>

        {/* City */}
        <div className="space-y-3">
          <Label className="text-sm font-semibold block text-right">
            {language === 'ar' ? 'المدينة' : 'City'}
          </Label>
          <div className="space-y-2">
            {cities.map((city) => (
              <div key={city.value} className="flex items-center justify-end gap-2">
                <label
                  htmlFor={`city-${city.value}`}
                  className="text-sm cursor-pointer flex-1 text-right"
                >
                  {language === 'ar' ? city.ar : city.en}
                </label>
                <Checkbox
                  id={`city-${city.value}`}
                  checked={filters.cities.includes(city.value)}
                  onCheckedChange={() => handleCityToggle(city.value)}
                  className="shrink-0"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Posted Within */}
        <div className="space-y-3">
          <Label className="text-sm font-semibold block text-right">
            {language === 'ar' ? 'منشور منذ' : 'Posted Within'}
          </Label>
          <Select
            value={filters.postedWithin}
            onValueChange={(value) => onFilterChange({ ...filters, postedWithin: value })}
          >
            <SelectTrigger className="text-right">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-background z-50">
              {postedWithinOptions.map((option) => (
                <SelectItem key={option.value} value={option.value} className="text-right">
                  {language === 'ar' ? option.ar : option.en}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Quick Filters */}
        <div className="space-y-3">
          <Label className="text-sm font-semibold block text-right">
            {language === 'ar' ? 'خيارات سريعة' : 'Quick Filters'}
          </Label>
          <div className="space-y-2">
            <div className="flex items-center justify-end gap-2">
              <label htmlFor="delivery" className="text-sm cursor-pointer flex-1 text-right">
                {language === 'ar' ? 'التوصيل متاح' : 'Delivery Available'}
              </label>
              <Checkbox
                id="delivery"
                checked={filters.deliveryAvailable}
                onCheckedChange={(checked) => 
                  onFilterChange({ ...filters, deliveryAvailable: checked as boolean })
                }
                className="shrink-0"
              />
            </div>
            <div className="flex items-center justify-end gap-2">
              <label htmlFor="negotiable" className="text-sm cursor-pointer flex-1 text-right">
                {language === 'ar' ? 'قابل للتفاوض فقط' : 'Negotiable Only'}
              </label>
              <Checkbox
                id="negotiable"
                checked={filters.negotiableOnly}
                onCheckedChange={(checked) => 
                  onFilterChange({ ...filters, negotiableOnly: checked as boolean })
                }
                className="shrink-0"
              />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
