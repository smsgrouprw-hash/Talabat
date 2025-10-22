/**
 * RTL (Right-to-Left) Utility Functions
 * Helper functions for consistent RTL support across the application
 */

import { useLanguage } from './language';

/**
 * Hook to get RTL-aware classes
 */
export const useRTL = () => {
  const { language } = useLanguage();
  const isRTL = language === 'ar';

  return {
    isRTL,
    language,
    
    // Direction utilities
    dir: isRTL ? 'rtl' as const : 'ltr' as const,
    textAlign: isRTL ? 'text-right' : 'text-left',
    textAlignClass: isRTL ? 'text-right' : 'text-left',
    
    // Flex utilities
    flexRow: isRTL ? 'flex-row-reverse' : 'flex-row',
    flexRowReverse: isRTL ? 'flex-row' : 'flex-row-reverse',
    
    // Spacing utilities (margins)
    ml: (size: string) => isRTL ? `mr-${size}` : `ml-${size}`,
    mr: (size: string) => isRTL ? `ml-${size}` : `mr-${size}`,
    marginStart: (size: string) => isRTL ? `mr-${size}` : `ml-${size}`,
    marginEnd: (size: string) => isRTL ? `ml-${size}` : `mr-${size}`,
    
    // Spacing utilities (padding)
    pl: (size: string) => isRTL ? `pr-${size}` : `pl-${size}`,
    pr: (size: string) => isRTL ? `pl-${size}` : `pr-${size}`,
    paddingStart: (size: string) => isRTL ? `pr-${size}` : `pl-${size}`,
    paddingEnd: (size: string) => isRTL ? `pl-${size}` : `pr-${size}`,
    
    // Border utilities
    borderLeft: isRTL ? 'border-r' : 'border-l',
    borderRight: isRTL ? 'border-l' : 'border-r',
    borderStart: isRTL ? 'border-r' : 'border-l',
    borderEnd: isRTL ? 'border-l' : 'border-r',
    
    // Rounded corners
    roundedLeft: isRTL ? 'rounded-r' : 'rounded-l',
    roundedRight: isRTL ? 'rounded-l' : 'rounded-r',
    roundedStart: isRTL ? 'rounded-r' : 'rounded-l',
    roundedEnd: isRTL ? 'rounded-l' : 'rounded-r',
    
    // Position utilities
    left: isRTL ? 'right' : 'left',
    right: isRTL ? 'left' : 'right',
    start: isRTL ? 'right' : 'left',
    end: isRTL ? 'left' : 'right',
  };
};

/**
 * Get RTL-aware class names
 */
export const rtlClass = (ltrClass: string, rtlClass: string, isRTL: boolean): string => {
  return isRTL ? rtlClass : ltrClass;
};

/**
 * Combine conditional RTL classes
 */
export const cn = (...classes: (string | boolean | undefined)[]): string => {
  return classes.filter(Boolean).join(' ');
};
