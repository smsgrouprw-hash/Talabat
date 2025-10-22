// Dynamic Theme System for Talabat Rwanda
export type CategoryType = 'restaurant' | 'grocery' | 'business' | 'labor' | 'default';

export interface ThemeColors {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  surface: string;
  text: string;
  textSecondary: string;
  border: string;
  gradient: string;
  heroGradient: string;
}

export interface ThemeAssets {
  heroImage: string;
  heroVideo?: string;
  backgroundPattern?: string;
  categoryIcon: string;
}

export interface ThemeTypography {
  fontFamily: string;
  headingWeight: string;
  bodyWeight: string;
  buttonWeight: string;
}

export interface ThemeLayout {
  borderRadius: string;
  shadowStyle: string;
  buttonStyle: string;
  cardStyle: string;
}

export interface CategoryTheme {
  id: CategoryType;
  name: string;
  colors: ThemeColors;
  assets: ThemeAssets;
  typography: ThemeTypography;
  layout: ThemeLayout;
  ctaTexts: {
    primary: string;
    secondary: string;
    tertiary: string;
  };
  keywords: string[];
}

export const categoryThemes: Record<CategoryType, CategoryTheme> = {
  restaurant: {
    id: 'restaurant',
    name: 'Restaurants & Food Delivery',
    colors: {
      primary: 'hsl(16, 100%, 60%)', // #FF6B35
      secondary: 'hsl(5, 75%, 50%)', // #D73027
      accent: 'hsl(35, 100%, 65%)', // #FFB74D
      background: 'hsl(16, 10%, 98%)',
      surface: 'hsl(0, 0%, 100%)',
      text: 'hsl(16, 15%, 15%)',
      textSecondary: 'hsl(16, 10%, 40%)',
      border: 'hsl(16, 20%, 90%)',
      gradient: 'linear-gradient(135deg, hsl(16, 100%, 60%) 0%, hsl(35, 100%, 65%) 100%)',
      heroGradient: 'linear-gradient(135deg, hsl(16, 100%, 60%) 0%, hsl(5, 75%, 50%) 50%, hsl(35, 100%, 65%) 100%)'
    },
    assets: {
      heroImage: '/images/food-hero.jpg',
      backgroundPattern: '/images/food-pattern.svg',
      categoryIcon: 'UtensilsCrossed'
    },
    typography: {
      fontFamily: 'system-ui',
      headingWeight: 'font-bold',
      bodyWeight: 'font-medium',
      buttonWeight: 'font-semibold'
    },
    layout: {
      borderRadius: 'rounded-xl',
      shadowStyle: 'shadow-warm',
      buttonStyle: 'rounded-full',
      cardStyle: 'rounded-2xl shadow-warm border-0'
    },
    ctaTexts: {
      primary: 'Order Now',
      secondary: 'View Menu',
      tertiary: 'Add to Cart'
    },
    keywords: ['restaurant', 'food', 'delivery', 'dining', 'cuisine', 'meal', 'eat']
  },

  grocery: {
    id: 'grocery',
    name: 'Grocery & Organic',
    colors: {
      primary: 'hsl(122, 39%, 49%)', // #4CAF50
      secondary: 'hsl(15, 25%, 45%)', // #8D6E63
      accent: 'hsl(45, 100%, 51%)', // #FFC107
      background: 'hsl(122, 20%, 98%)',
      surface: 'hsl(0, 0%, 100%)',
      text: 'hsl(122, 25%, 15%)',
      textSecondary: 'hsl(122, 15%, 40%)',
      border: 'hsl(122, 30%, 90%)',
      gradient: 'linear-gradient(135deg, hsl(122, 39%, 49%) 0%, hsl(45, 100%, 51%) 100%)',
      heroGradient: 'linear-gradient(135deg, hsl(122, 39%, 49%) 0%, hsl(15, 25%, 45%) 50%, hsl(45, 100%, 51%) 100%)'
    },
    assets: {
      heroImage: '/images/grocery-hero.jpg',
      backgroundPattern: '/images/organic-pattern.svg',
      categoryIcon: 'ShoppingBasket'
    },
    typography: {
      fontFamily: 'system-ui',
      headingWeight: 'font-semibold',
      bodyWeight: 'font-normal',
      buttonWeight: 'font-medium'
    },
    layout: {
      borderRadius: 'rounded-lg',
      shadowStyle: 'shadow-natural',
      buttonStyle: 'rounded-lg',
      cardStyle: 'rounded-xl shadow-natural border border-natural'
    },
    ctaTexts: {
      primary: 'Shop Fresh',
      secondary: 'Add to Basket',
      tertiary: 'View Products'
    },
    keywords: ['grocery', 'organic', 'fresh', 'produce', 'healthy', 'natural', 'farm']
  },

  business: {
    id: 'business',
    name: 'Business Services',
    colors: {
      primary: 'hsl(207, 90%, 54%)', // #1976D2
      secondary: 'hsl(210, 11%, 33%)', // #455A64
      accent: 'hsl(51, 100%, 50%)', // #FFD700
      background: 'hsl(207, 20%, 98%)',
      surface: 'hsl(0, 0%, 100%)',
      text: 'hsl(207, 25%, 15%)',
      textSecondary: 'hsl(207, 15%, 40%)',
      border: 'hsl(207, 30%, 90%)',
      gradient: 'linear-gradient(135deg, hsl(207, 90%, 54%) 0%, hsl(51, 100%, 50%) 100%)',
      heroGradient: 'linear-gradient(135deg, hsl(207, 90%, 54%) 0%, hsl(210, 11%, 33%) 50%, hsl(51, 100%, 50%) 100%)'
    },
    assets: {
      heroImage: '/images/business-hero.jpg',
      backgroundPattern: '/images/business-pattern.svg',
      categoryIcon: 'Briefcase'
    },
    typography: {
      fontFamily: 'system-ui',
      headingWeight: 'font-semibold',
      bodyWeight: 'font-normal',
      buttonWeight: 'font-medium'
    },
    layout: {
      borderRadius: 'rounded-md',
      shadowStyle: 'shadow-professional',
      buttonStyle: 'rounded-md',
      cardStyle: 'rounded-lg shadow-professional border border-professional'
    },
    ctaTexts: {
      primary: 'Get Quote',
      secondary: 'Contact Us',
      tertiary: 'Learn More'
    },
    keywords: ['business', 'service', 'professional', 'consulting', 'corporate', 'office']
  },

  labor: {
    id: 'labor',
    name: 'Labor & Sourcing',
    colors: {
      primary: 'hsl(14, 100%, 64%)', // #FF7043
      secondary: 'hsl(200, 18%, 46%)', // #607D8B
      accent: 'hsl(56, 100%, 62%)', // #FFEB3B
      background: 'hsl(14, 15%, 98%)',
      surface: 'hsl(0, 0%, 100%)',
      text: 'hsl(14, 20%, 15%)',
      textSecondary: 'hsl(14, 15%, 40%)',
      border: 'hsl(14, 25%, 90%)',
      gradient: 'linear-gradient(135deg, hsl(14, 100%, 64%) 0%, hsl(56, 100%, 62%) 100%)',
      heroGradient: 'linear-gradient(135deg, hsl(14, 100%, 64%) 0%, hsl(200, 18%, 46%) 50%, hsl(56, 100%, 62%) 100%)'
    },
    assets: {
      heroImage: '/images/labor-hero.jpg',
      backgroundPattern: '/images/industrial-pattern.svg',
      categoryIcon: 'HardHat'
    },
    typography: {
      fontFamily: 'system-ui',
      headingWeight: 'font-bold',
      bodyWeight: 'font-medium',
      buttonWeight: 'font-semibold'
    },
    layout: {
      borderRadius: 'rounded-lg',
      shadowStyle: 'shadow-industrial',
      buttonStyle: 'rounded-lg',
      cardStyle: 'rounded-xl shadow-industrial border border-industrial'
    },
    ctaTexts: {
      primary: 'Hire Now',
      secondary: 'Get Workers',
      tertiary: 'View Skills'
    },
    keywords: ['labor', 'worker', 'sourcing', 'construction', 'industrial', 'skilled', 'hire']
  },

  default: {
    id: 'default',
    name: 'All Categories',
    colors: {
      primary: 'hsl(var(--primary))',
      secondary: 'hsl(var(--secondary))',
      accent: 'hsl(var(--accent))',
      background: 'hsl(var(--background))',
      surface: 'hsl(var(--card))',
      text: 'hsl(var(--foreground))',
      textSecondary: 'hsl(var(--muted-foreground))',
      border: 'hsl(var(--border))',
      gradient: 'linear-gradient(135deg, hsl(var(--primary)) 0%, hsl(var(--accent)) 100%)',
      heroGradient: 'linear-gradient(135deg, hsl(var(--primary)) 0%, hsl(var(--secondary)) 50%, hsl(var(--accent)) 100%)'
    },
    assets: {
      heroImage: '/images/default-hero.jpg',
      backgroundPattern: '/images/default-pattern.svg',
      categoryIcon: 'Store'
    },
    typography: {
      fontFamily: 'system-ui',
      headingWeight: 'font-semibold',
      bodyWeight: 'font-normal',
      buttonWeight: 'font-medium'
    },
    layout: {
      borderRadius: 'rounded-lg',
      shadowStyle: 'shadow-lg',
      buttonStyle: 'rounded-lg',
      cardStyle: 'rounded-lg shadow-lg border'
    },
    ctaTexts: {
      primary: 'Explore',
      secondary: 'View All',
      tertiary: 'Discover'
    },
    keywords: ['all', 'general', 'mixed', 'various', 'multiple']
  }
};

// Helper function to detect category from supplier data
export function detectCategoryFromSupplier(supplier: any): CategoryType {
  const businessType = supplier.business_type?.toLowerCase() || '';
  const businessName = supplier.business_name?.toLowerCase() || '';
  const description = supplier.description?.toLowerCase() || '';
  const cuisineType = supplier.cuisine_type?.toLowerCase() || '';
  
  const text = `${businessType} ${businessName} ${description} ${cuisineType}`;
  
  // Check for restaurant/food keywords
  if (categoryThemes.restaurant.keywords.some(keyword => text.includes(keyword))) {
    return 'restaurant';
  }
  
  // Check for grocery keywords
  if (categoryThemes.grocery.keywords.some(keyword => text.includes(keyword))) {
    return 'grocery';
  }
  
  // Check for business service keywords
  if (categoryThemes.business.keywords.some(keyword => text.includes(keyword))) {
    return 'business';
  }
  
  // Check for labor keywords
  if (categoryThemes.labor.keywords.some(keyword => text.includes(keyword))) {
    return 'labor';
  }
  
  return 'default';
}

// Helper function to get theme by category
export function getThemeByCategory(category: CategoryType): CategoryTheme {
  return categoryThemes[category] || categoryThemes.default;
}

// Helper function to generate CSS custom properties for a theme
export function generateThemeCSS(theme: CategoryTheme): Record<string, string> {
  return {
    '--theme-primary': theme.colors.primary,
    '--theme-secondary': theme.colors.secondary,
    '--theme-accent': theme.colors.accent,
    '--theme-background': theme.colors.background,
    '--theme-surface': theme.colors.surface,
    '--theme-text': theme.colors.text,
    '--theme-text-secondary': theme.colors.textSecondary,
    '--theme-border': theme.colors.border,
    '--theme-gradient': theme.colors.gradient,
    '--theme-hero-gradient': theme.colors.heroGradient,
  };
}