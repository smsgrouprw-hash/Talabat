import { useState, useEffect } from 'react';
import { useLanguage } from '@/lib/language';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { BookOpen, Clock, Eye } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { LoadingState } from '@/components/ui/loading-spinner';
import { EmptyState } from '@/components/ui/empty-state';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';

type Article = {
  id: string;
  title_ar: string;
  title_en: string;
  excerpt_ar: string | null;
  excerpt_en: string | null;
  content_type: string;
  featured_image_url: string | null;
  published_at: string | null;
  reading_time_minutes: number | null;
  views_count: number;
  is_featured: boolean | null;
};

export default function Knowledge() {
  const { language } = useLanguage();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchArticles();
  }, [selectedTab]);

  const fetchArticles = async () => {
    try {
      setLoading(true);
      console.log('🔍 Fetching articles from database...');
      console.log('Selected tab:', selectedTab);

      // Query published_articles view (using type assertion for view)
      let query = (supabase as any)
        .from('published_articles')
        .select('*')
        .order('published_at', { ascending: false });

      // Filter by content type if not 'all'
      if (selectedTab !== 'all') {
        query = query.eq('content_type', selectedTab);
      }

      const { data, error } = await query;

      if (error) {
        throw error;
      }

      console.log('📊 Query result:', data);
      console.log('📝 Number of articles found:', data?.length || 0);

      setArticles((data || []) as Article[]);
      console.log('✅ Articles loaded successfully');
    } catch (err: any) {
      console.error('❌ Error:', err);
      toast({
        title: language === 'ar' ? 'خطأ' : 'Error',
        description: err?.message || (language === 'ar' ? 'فشل تحميل المقالات' : 'Failed to load articles'),
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const getContentTypeBadge = (type: string) => {
    const types = {
      news: { label: language === 'ar' ? 'أخبار' : 'News', color: 'bg-blue-500' },
      tips: { label: language === 'ar' ? 'نصائح' : 'Tips', color: 'bg-green-500' },
      consultations: { label: language === 'ar' ? 'استشارات' : 'Consultations', color: 'bg-purple-500' }
    };
    return types[type as keyof typeof types] || types.news;
  };

  const filteredArticles = articles.filter(article => {
    if (!searchQuery) return true;
    const title = language === 'ar' ? article.title_ar : article.title_en;
    const excerpt = language === 'ar' ? article.excerpt_ar : article.excerpt_en;
    return title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
           excerpt?.toLowerCase().includes(searchQuery.toLowerCase());
  });

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center gap-2 mb-6">
          <BookOpen className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold">
            {language === 'ar' ? 'مركز المعرفة' : 'Knowledge Hub'}
          </h1>
        </div>

        <div className="flex gap-2 mb-6">
          <Input
            placeholder={language === 'ar' ? 'ابحث في المقالات...' : 'Search articles...'}
            className="flex-1"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <Tabs defaultValue="all" value={selectedTab} onValueChange={setSelectedTab} className="mb-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="all">
              {language === 'ar' ? 'الكل' : 'All'}
            </TabsTrigger>
            <TabsTrigger value="news">
              {language === 'ar' ? 'أخبار' : 'News'}
            </TabsTrigger>
            <TabsTrigger value="tips">
              {language === 'ar' ? 'نصائح' : 'Tips'}
            </TabsTrigger>
            <TabsTrigger value="consultations">
              {language === 'ar' ? 'استشارات' : 'Consultations'}
            </TabsTrigger>
          </TabsList>
        </Tabs>

        {loading ? (
          <LoadingState message={language === 'ar' ? 'جاري التحميل...' : 'Loading...'} />
        ) : filteredArticles.length === 0 ? (
          <EmptyState
            icon={BookOpen}
            title={language === 'ar' ? 'لا توجد مقالات' : 'No articles yet'}
            description={language === 'ar' ? 'لم يتم نشر أي مقالات بعد' : 'No articles have been published yet'}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredArticles.map((article) => {
              const badgeInfo = getContentTypeBadge(article.content_type);
              const title = language === 'ar' ? article.title_ar : article.title_en;
              const excerpt = language === 'ar' ? article.excerpt_ar : article.excerpt_en;

              return (
                <Card 
                  key={article.id} 
                  className="cursor-pointer hover:shadow-lg transition-shadow"
                  onClick={() => navigate(`/knowledge/${article.id}`)}
                >
                  {article.featured_image_url && (
                    <div className="aspect-video w-full overflow-hidden rounded-t-lg">
                      <img 
                        src={article.featured_image_url} 
                        alt={title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  <CardHeader>
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <Badge className={badgeInfo.color}>
                        {badgeInfo.label}
                      </Badge>
                      {article.is_featured && (
                        <Badge variant="secondary">
                          {language === 'ar' ? 'مميز' : 'Featured'}
                        </Badge>
                      )}
                    </div>
                    <CardTitle className="line-clamp-2">{title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground line-clamp-3 mb-4">
                      {excerpt}
                    </p>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        <span>{article.reading_time_minutes} {language === 'ar' ? 'د' : 'min'}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Eye className="h-3 w-3" />
                        <span>{article.views_count}</span>
                      </div>
                      {article.published_at && (
                        <span className="mr-auto">
                          {formatDistanceToNow(new Date(article.published_at), { addSuffix: true })}
                        </span>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
