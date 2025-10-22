import { forwardRef } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";
import { useLanguage } from "@/lib/language";

interface FormInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  icon?: LucideIcon;
  error?: string;
  success?: string;
  required?: boolean;
}

export const FormInput = forwardRef<HTMLInputElement, FormInputProps>(
  ({ label, icon: Icon, error, success, required, className, ...props }, ref) => {
    const { language } = useLanguage();
    
    return (
      <div className="form-group" dir={language === 'ar' ? 'rtl' : 'ltr'}>
        <Label htmlFor={props.id} className={`flex items-center gap-2 font-medium font-arabic ${language === 'ar' ? 'flex-row-reverse text-right' : ''}`}>
          {Icon && <Icon className="h-4 w-4" />}
          {label}
          {required && <span className="text-destructive">*</span>}
        </Label>
        <Input
          ref={ref}
          className={cn(
            "touch-target focus-ring transition-colors font-arabic",
            error && "border-destructive focus:ring-destructive",
            success && "border-success focus:ring-success",
            className
          )}
          style={{ textAlign: language === 'ar' ? 'right' : 'left' }}
          {...props}
        />
        {error && (
          <p className={`form-error font-arabic ${language === 'ar' ? 'text-right' : 'text-left'}`}>
            {error}
          </p>
        )}
        {success && (
          <p className={`form-success font-arabic ${language === 'ar' ? 'text-right' : 'text-left'}`}>
            {success}
          </p>
        )}
      </div>
    );
  }
);

FormInput.displayName = "FormInput";