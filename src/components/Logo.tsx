import logoIcon from "@/assets/logo-icon.png";
import logoFull from "@/assets/logo-full.jpeg";

interface LogoProps {
  variant?: "icon" | "full";
  className?: string;
  iconClassName?: string;
}

const Logo = ({ variant = "icon", className = "", iconClassName = "w-8 h-8" }: LogoProps) => {
  if (variant === "full") {
    return <img src={logoFull} alt="Swacchata" className={`h-8 object-contain ${className}`} />;
  }
  return <img src={logoIcon} alt="Swacchata" className={`${iconClassName} object-contain ${className}`} />;
};

export default Logo;
