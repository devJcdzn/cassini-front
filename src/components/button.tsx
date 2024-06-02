import { ButtonHTMLAttributes } from "react";

import { LucideIcon } from "lucide-react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  icon?: LucideIcon;
  children: React.ReactNode;
}

export function Button({ children, icon: Icon, ...props }: ButtonProps) {
  return (
    <button
      className="w-full flex text-sm font-medium 
        items-center cursor-default transition 
        rounded-default hover:bg-green/40 px-2 py-1 antialiased"
      {...props}
    >
      {Icon && <Icon className="size-4 mr-2" />}
      {children}
    </button>
  );
}
