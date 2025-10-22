import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/lib/language";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface ReportModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  listingId: string;
}

const reportReasons = [
  { value: 'spam', ar: 'إزعاج', en: 'Spam' },
  { value: 'scam', ar: 'احتيال', en: 'Scam/Fraud' },
  { value: 'inappropriate', ar: 'غير لائق', en: 'Inappropriate' },
  { value: 'wrong_category', ar: 'فئة خاطئة', en: 'Wrong Category' },
  { value: 'already_sold', ar: 'تم البيع', en: 'Already Sold' },
  { value: 'prohibited', ar: 'عنصر محظور', en: 'Prohibited Item' },
  { value: 'other', ar: 'أخرى', en: 'Other' }
];

export function ReportModal({ open, onOpenChange, listingId }: ReportModalProps) {
  const { language } = useLanguage();
  const { toast } = useToast();
  const [reason, setReason] = useState('');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!reason) {
      toast({
        title: language === 'ar' ? 'خطأ' : 'Error',
        description: language === 'ar' ? 'يرجى اختيار سبب البلاغ' : 'Please select a reason',
        variant: "destructive"
      });
      return;
    }

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast({
        title: language === 'ar' ? 'تسجيل الدخول مطلوب' : 'Login Required',
        description: language === 'ar' ? 'يرجى تسجيل الدخول للإبلاغ' : 'Please login to report',
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const { error } = await supabase
        .from('delala_reports' as any)
        .insert({
          listing_id: listingId,
          reported_by: user.id,
          reason,
          description: description || null
        });

      if (error) throw error;

      toast({
        title: language === 'ar' ? 'تم الإبلاغ' : 'Report Submitted',
        description: language === 'ar' ? 'شكراً لك، سنراجع البلاغ قريباً' : 'Thank you, we will review your report soon'
      });

      setReason('');
      setDescription('');
      onOpenChange(false);
    } catch (error) {
      toast({
        title: language === 'ar' ? 'خطأ' : 'Error',
        description: language === 'ar' ? 'فشل في إرسال البلاغ' : 'Failed to submit report',
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {language === 'ar' ? 'الإبلاغ عن إعلان' : 'Report Listing'}
          </DialogTitle>
          <DialogDescription>
            {language === 'ar' 
              ? 'ساعدنا في الحفاظ على مجتمع آمن من خلال الإبلاغ عن الإعلانات المشبوهة'
              : 'Help us maintain a safe community by reporting suspicious listings'}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="reason">
              {language === 'ar' ? 'السبب' : 'Reason'}
            </Label>
            <Select value={reason} onValueChange={setReason}>
              <SelectTrigger id="reason">
                <SelectValue placeholder={language === 'ar' ? 'اختر السبب' : 'Select a reason'} />
              </SelectTrigger>
              <SelectContent>
                {reportReasons.map((r) => (
                  <SelectItem key={r.value} value={r.value}>
                    {language === 'ar' ? r.ar : r.en}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">
              {language === 'ar' ? 'الوصف (اختياري)' : 'Description (Optional)'}
            </Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={language === 'ar' ? 'أضف تفاصيل إضافية...' : 'Add additional details...'}
              rows={4}
            />
          </div>
          <div className="flex gap-2 justify-end">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              {language === 'ar' ? 'إلغاء' : 'Cancel'}
            </Button>
            <Button onClick={handleSubmit} disabled={isSubmitting}>
              {isSubmitting 
                ? (language === 'ar' ? 'جاري الإرسال...' : 'Submitting...') 
                : (language === 'ar' ? 'إرسال البلاغ' : 'Submit Report')}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
