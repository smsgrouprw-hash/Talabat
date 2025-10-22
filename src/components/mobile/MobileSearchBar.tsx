import { useLanguage } from "@/lib/language";
import { VoiceSearch } from "@/components/search/VoiceSearch";

export const MobileSearchBar = () => {
  const { language } = useLanguage();

  return (
    <div className="px-4 py-4 bg-background" dir={language === 'ar' ? 'rtl' : 'ltr'}>
      <VoiceSearch />
    </div>
  );
};