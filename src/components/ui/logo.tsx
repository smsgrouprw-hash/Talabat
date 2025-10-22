import { cn } from "@/lib/utils";
import talabatLogo from "@/assets/talabat-logo.png";
import talabatIcon from "@/assets/talabat-icon.png";
import talabatVertical from "@/assets/talabat-vertical.png";

interface LogoProps {
  variant?: "full" | "icon" | "vertical";
  className?: string;
  size?: "sm" | "md" | "lg" | "xl";
}

const sizeClasses = {
  sm: "h-6",
  md: "h-8", 
  lg: "h-12",
  xl: "h-16"
};

export const Logo = ({ 
  variant = "full", 
  className,
  size = "md"
}: LogoProps) => {
  const logoSrc = {
    full: talabatLogo,
    icon: talabatIcon,
    vertical: talabatVertical
  }[variant];

  const alt = "Talabat Rwanda";
  
  return (
    <img 
      src={logoSrc}
      alt={alt}
      className={cn(
        sizeClasses[size],
        "w-auto object-contain",
        className
      )}
    />
  );
};