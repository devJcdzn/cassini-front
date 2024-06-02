import React, { ComponentProps } from "react";

interface Props extends ComponentProps<"div"> {}

export function UploadArea({ className, children, ...props }: Props) {
  return (
    <div
      {...props}
      className="w-full h-[45%] border flex items-center 
      justify-center border-gray/30 
      hover:bg-white/10 rounded-default transition"
    >
      {children}
    </div>
  );
}
