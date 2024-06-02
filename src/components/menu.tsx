import { LucideIcon } from "lucide-react";
import { ComponentProps, ElementRef, useRef } from "react";
import { useHotkeys } from "react-hotkeys-hook";

interface Props extends ComponentProps<"button"> {
  hotkey?: string;
  icon?: LucideIcon;
}

const getSymbolCombination = (hotkey: string): string => {
  const modifierMap: Record<string, string> = {
    shift: "⇧",
    meta: "⌘",
    ctrl: "ctrl",
    alt: "⌥",
    mod: isMac() ? "⌘" : "ctrl",
  };

  const keys = hotkey.split("+");

  const symbolModifiers = keys
    .map((key) => {
      return key in modifierMap ? modifierMap[key] : key.toLocaleLowerCase();
    })
    .join(" ");

  return symbolModifiers;
};

const isMac = () => {
  return navigator.userAgent.toUpperCase().includes("MAC");
};

export function Menu({
  hotkey = "",
  children,
  className,
  icon: Icon,
  ...props
}: Props) {
  const buttonRef = useRef<ElementRef<"button">>(null);

  useHotkeys(
    hotkey,
    () => {
      const clickEvent = new MouseEvent("click", {
        view: window,
        bubbles: true,
      });

      buttonRef?.current?.dispatchEvent(clickEvent);
    },
    {
      enabled: hotkey !== "",
      preventDefault: true,
    }
  );

  return (
    <button
      ref={buttonRef}
      className="w-full flex text-sm font-medium 
        items-center cursor-default transition 
        rounded-default hover:bg-green/40 px-2 py-1 
        antialiased relative"
      {...props}
    >
      {Icon && <Icon className="size-4 mr-2" />}
      {children}
      <p className="text-gray/60 text-xs capitalize font-bold ml-auto mr-2">
        {getSymbolCombination(hotkey)}
      </p>
    </button>
  );
}
