import * as React from "react";
import { cn } from "@/lib/utils";

const Avatar = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    src?: string;
    alt?: string;
    fallback?: string;
  }
>(({ className, src, alt, fallback, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full",
      className
    )}
    {...props}
  >
    {src ? (
      /* eslint-disable-next-line @next/next/no-img-element */
      <img className="aspect-square h-full w-full object-cover" src={src} alt={alt} />
    ) : (
      <div className="flex h-full w-full items-center justify-center bg-muted text-muted-foreground font-medium text-sm">
        {fallback || "?"}
      </div>
    )}
  </div>
));
Avatar.displayName = "Avatar";

export { Avatar };
