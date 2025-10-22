import { useState, useEffect, useRef } from 'react';
import { Search, Mic, MicOff, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/lib/language";
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';

// TypeScript interfaces for Speech Recognition
interface VoiceSearchProps {
  onSearch?: (query: string) => void;
  className?: string;
}

export const VoiceSearch = ({ onSearch, className = "" }: VoiceSearchProps) => {
  const { language } = useLanguage();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [searchQuery, setSearchQuery] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    // Check if Speech Recognition is supported
    if (typeof window !== 'undefined') {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        setIsSupported(true);
        const recognition = new SpeechRecognition();
        
        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.lang = language === 'ar' ? 'ar-SA' : 'en-US';
        
        recognition.onstart = () => {
          setIsListening(true);
        };
        
        recognition.onresult = (event: any) => {
          const transcript = event.results[0][0].transcript;
          setSearchQuery(transcript);
          handleSearch(transcript);
        };
        
        recognition.onerror = (event: any) => {
          console.error('Speech recognition error:', event.error);
          setIsListening(false);
          
          let errorMessage = language === 'ar' ? 'حدث خطأ في التعرف على الصوت' : 'Speech recognition error';
          
          switch (event.error) {
            case 'no-speech':
              errorMessage = language === 'ar' ? 'لم يتم سماع أي صوت' : 'No speech detected';
              break;
            case 'network':
              errorMessage = language === 'ar' ? 'خطأ في الشبكة' : 'Network error';
              break;
            case 'not-allowed':
              errorMessage = language === 'ar' ? 'الرجاء السماح بالوصول للميكروفون' : 'Microphone access denied';
              break;
          }
          
          toast({
            title: language === 'ar' ? 'خطأ' : 'Error',
            description: errorMessage,
            variant: 'destructive'
          });
        };
        
        recognition.onend = () => {
          setIsListening(false);
        };
        
        recognitionRef.current = recognition;
      }
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
    };
  }, [language]);

  const handleSearch = (query: string = searchQuery) => {
    if (query.trim()) {
      if (onSearch) {
        onSearch(query.trim());
      } else {
        navigate(`/search?q=${encodeURIComponent(query.trim())}`);
      }
    }
  };

  const startVoiceSearch = () => {
    if (!isSupported) {
      toast({
        title: language === 'ar' ? 'غير مدعوم' : 'Not Supported',
        description: language === 'ar' ? 'البحث الصوتي غير مدعوم في هذا المتصفح' : 'Voice search is not supported in this browser',
        variant: 'destructive'
      });
      return;
    }

    if (isListening) {
      recognitionRef.current?.stop();
    } else {
      try {
        recognitionRef.current?.start();
        toast({
          title: language === 'ar' ? 'استمع...' : 'Listening...',
          description: language === 'ar' ? 'تحدث الآن للبحث' : 'Speak now to search',
        });
      } catch (error) {
        console.error('Error starting voice recognition:', error);
        toast({
          title: language === 'ar' ? 'خطأ' : 'Error',
          description: language === 'ar' ? 'لا يمكن بدء البحث الصوتي' : 'Could not start voice search',
          variant: 'destructive'
        });
      }
    }
  };

  return (
    <div className={`bg-card rounded-2xl p-1 shadow-medium border border-border ${className}`} dir={language === 'ar' ? 'rtl' : 'ltr'}>
      <div className="flex items-center">
        <div className="relative flex-1">
          <Search className={`absolute ${language === 'ar' ? 'left-4' : 'left-4'} top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5 z-10`} />
          <Input 
            placeholder={language === 'ar' ? 'ابحث عن متجر، منتج أو خدمة...' : 'Search for stores, products or services...'}
            className={`${language === 'ar' ? 'pr-4 pl-14' : 'pl-14 pr-4'} h-14 text-base bg-transparent border-0 focus:ring-0 rounded-2xl placeholder:text-muted-foreground/70 font-arabic`}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            style={{ textAlign: language === 'ar' ? 'right' : 'left' }}
          />
        </div>
        <div className={`flex gap-2 ${language === 'ar' ? 'ml-2' : 'mr-2'}`}>
          <Button 
            size="lg" 
            className={`rounded-xl h-12 px-4 transition-all duration-300 ${
              isListening 
                ? 'bg-red-500 hover:bg-red-600 animate-pulse' 
                : 'bg-primary hover:bg-primary/90'
            }`}
            onClick={startVoiceSearch}
            disabled={!isSupported}
          >
            {isListening ? (
              <>
                <MicOff className="h-5 w-5" />
              </>
            ) : (
              <Mic className="h-5 w-5" />
            )}
          </Button>
        </div>
      </div>
      
      {isListening && (
        <div className="flex items-center justify-center mt-2 p-2">
          <div className="flex items-center gap-2 text-sm text-primary">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>{language === 'ar' ? 'الاستماع...' : 'Listening...'}</span>
          </div>
        </div>
      )}
    </div>
  );
};