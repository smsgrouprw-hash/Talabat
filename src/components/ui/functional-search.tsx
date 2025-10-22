import { useState } from 'react';
import { Search, Mic, Filter } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/lib/language';

interface FunctionalSearchProps {
  onSearch?: (query: string) => void;
  placeholder?: string;
  className?: string;
}

export const FunctionalSearch = ({ 
  onSearch, 
  placeholder, 
  className = "" 
}: FunctionalSearchProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const { language } = useLanguage();

  const handleSearch = (value: string) => {
    setSearchQuery(value);
    onSearch?.(value);
  };

  const handleVoiceSearch = () => {
    // Voice search functionality would go here
    console.log('Voice search activated');
  };

  return (
    <div className={`relative ${className}`} dir={language === 'ar' ? 'rtl' : 'ltr'}>
      <div className="glass-card rounded-2xl p-1 flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            placeholder={placeholder || (language === 'ar' ? 'ابحث عن متجر، منتج أو خدمة...' : 'Search for stores, products or services...')}
            className={`${language === 'ar' ? 'pr-4 pl-10' : 'pl-10 pr-4'} py-3 bg-transparent border-0 focus:ring-0 placeholder:text-muted-foreground/70 font-arabic`}
            style={{ textAlign: language === 'ar' ? 'right' : 'left' }}
          />
        </div>
        
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleVoiceSearch}
            className="p-2 hover:bg-primary/10 rounded-xl"
          >
            <Mic className="h-5 w-5 text-primary" />
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            className="p-2 hover:bg-primary/10 rounded-xl"
          >
            <Filter className="h-5 w-5 text-primary" />
          </Button>
        </div>
      </div>
    </div>
  );
};