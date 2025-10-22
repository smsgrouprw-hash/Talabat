import { Button } from '@/components/ui/button';
import { useLanguage } from '@/lib/language';
import { RwandaFlag } from './rwanda-flag';

export const LanguageToggle = () => {
  const { language, setLanguage } = useLanguage();

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={() => setLanguage(language === 'en' ? 'ar' : 'en')}
      className="flex items-center gap-2 bg-card border-border hover:bg-accent font-arabic"
      dir={language === 'ar' ? 'rtl' : 'ltr'}
    >
      <RwandaFlag className="w-4 h-3" />
      <span className={language === 'ar' ? 'text-right' : 'text-left'}>
        {language === 'en' ? 'العربية' : 'English'}
      </span>
    </Button>
  );
};