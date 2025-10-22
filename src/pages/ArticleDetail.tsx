import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useLanguage } from '@/lib/language';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Clock, Eye, ThumbsUp, ThumbsDown, Bookmark, Share2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { LoadingState } from '@/components/ui/loading-spinner';
import { useToast } from '@/hooks/use-toast';
import { formatDistanceToNow } from 'date-fns';

type Article = {
  id: string;
  title_ar: string;
  title_en: string;
  content_ar: string;
  content_en: string;
  excerpt_ar: string | null;
  excerpt_en: string | null;
  content_type: string;
  featured_image_url: string | null;
  published_at: string | null;
  reading_time_minutes: number | null;
  views_count: number;
  helpful_count: number;
  unhelpful_count: number;
  author_name: string | null;
  tags: any;
  is_featured: boolean | null;
  allow_comments: boolean | null;
};

export default function ArticleDetail() {
  const { language } = useLanguage();
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [article, setArticle] = useState<Article | null>(null);
  const [loading, setLoading] = useState(true);
  const [isBookmarked, setIsBookmarked] = useState(false);

  useEffect(() => {
    if (id) {
      fetchArticle();
      incrementViews();
    }
  }, [id]);

  const fetchArticle = async () => {
    try {
      setLoading(true);
      const { data, error } = await (supabase as any)
        .from('published_articles')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      setArticle(data as Article);
    } catch (err: any) {
      console.error('Error fetching article:', err);
      toast({
        title: language === 'ar' ? 'خطأ' : 'Error',
        description: language === 'ar' ? 'فشل تحميل المقالة' : 'Failed to load article',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const incrementViews = async () => {
    try {
      // Increment views directly on articles table
      const { error } = await (supabase as any)
        .from('articles')
        .update({ views_count: (article?.views_count || 0) + 1 })
        .eq('id', id);
      
      if (error) console.error('Error incrementing views:', error);
    } catch (err) {
      console.error('Error incrementing views:', err);
    }
  };

  const handleHelpful = async (isHelpful: boolean) => {
    try {
      const column = isHelpful ? 'helpful_count' : 'unhelpful_count';
      const currentValue = article?.[column as keyof Article] as number || 0;
      
      const { error } = await (supabase as any)
        .from('articles')
        .update({ [column]: currentValue + 1 })
        .eq('id', id);

      if (error) throw error;

      // Update local state
      setArticle(prev => prev ? { ...prev, [column]: currentValue + 1 } : null);

      toast({
        title: language === 'ar' ? 'شكراً!' : 'Thank you!',
        description: language === 'ar' ? 'تم تسجيل تقييمك' : 'Your feedback has been recorded'
      });
    } catch (err) {
      console.error('Error recording feedback:', err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background pb-24">
        <LoadingState message={language === 'ar' ? 'جاري التحميل...' : 'Loading...'} />
      </div>
    );
  }

  if (!article) {
    return (
      <div className="min-h-screen bg-background pb-24">
        <div className="container mx-auto px-4 py-6 max-w-4xl">
          <Button variant="ghost" onClick={() => navigate('/knowledge')} className="mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            {language === 'ar' ? 'العودة' : 'Back'}
          </Button>
          <div className="text-center py-12">
            <p className="text-lg text-muted-foreground">
              {language === 'ar' ? 'المقالة غير موجودة' : 'Article not found'}
            </p>
          </div>
        </div>
      </div>
    );
  }

  const content = language === 'ar' ? article.content_ar : article.content_en;
  const title = language === 'ar' ? article.title_ar : article.title_en;

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        <Button variant="ghost" onClick={() => navigate('/knowledge')} className="mb-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          {language === 'ar' ? 'العودة' : 'Back'}
        </Button>

        {article.featured_image_url && (
          <div className="aspect-video w-full overflow-hidden rounded-lg mb-6">
            <img 
              src={article.featured_image_url} 
              alt={title}
              className="w-full h-full object-cover"
            />
          </div>
        )}

        <div className="flex items-center gap-2 mb-4">
          <Badge>
            {article.content_type === 'news' ? (language === 'ar' ? 'أخبار' : 'News') :
             article.content_type === 'tips' ? (language === 'ar' ? 'نصائح' : 'Tips') :
             (language === 'ar' ? 'استشارات' : 'Consultations')}
          </Badge>
          {article.is_featured && (
            <Badge variant="secondary">
              {language === 'ar' ? 'مميز' : 'Featured'}
            </Badge>
          )}
        </div>

        <h1 className="text-4xl font-bold mb-4">{title}</h1>

        <div className="flex items-center gap-6 text-sm text-muted-foreground mb-6">
          {article.author_name && (
            <span>{language === 'ar' ? 'بقلم:' : 'By'} {article.author_name}</span>
          )}
          {article.published_at && (
            <span>{formatDistanceToNow(new Date(article.published_at), { addSuffix: true })}</span>
          )}
          <div className="flex items-center gap-1">
            <Clock className="h-4 w-4" />
            <span>{article.reading_time_minutes} {language === 'ar' ? 'دقيقة' : 'min'}</span>
          </div>
          <div className="flex items-center gap-1">
            <Eye className="h-4 w-4" />
            <span>{article.views_count}</span>
          </div>
        </div>

        <article 
          className="prose prose-lg max-w-none dark:prose-invert prose-headings:font-bold prose-h2:text-2xl prose-h2:mb-4 prose-h2:mt-6 prose-a:text-primary prose-a:no-underline hover:prose-a:underline prose-p:leading-relaxed prose-p:mb-4"
          dir={language === 'ar' ? 'rtl' : 'ltr'}
        >
          <div dangerouslySetInnerHTML={{ __html: content }} />
        </article>

        <div className="mt-8 pt-8 border-t">
          <p className="text-sm text-muted-foreground mb-4">
            {language === 'ar' ? 'هل كانت هذه المقالة مفيدة؟' : 'Was this article helpful?'}
          </p>
          <div className="flex gap-4">
            <Button variant="outline" onClick={() => handleHelpful(true)}>
              <ThumbsUp className="h-4 w-4 mr-2" />
              {language === 'ar' ? 'مفيد' : 'Helpful'} ({article.helpful_count})
            </Button>
            <Button variant="outline" onClick={() => handleHelpful(false)}>
              <ThumbsDown className="h-4 w-4 mr-2" />
              {language === 'ar' ? 'غير مفيد' : 'Not helpful'} ({article.unhelpful_count})
            </Button>
          </div>
        </div>

        <div className="flex gap-4 mt-6">
          <Button variant="outline">
            <Bookmark className="h-4 w-4 mr-2" />
            {language === 'ar' ? 'حفظ' : 'Save'}
          </Button>
          <Button variant="outline">
            <Share2 className="h-4 w-4 mr-2" />
            {language === 'ar' ? 'مشاركة' : 'Share'}
          </Button>
        </div>
      </div>
    </div>
  );
}
