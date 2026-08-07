import * as React from "react";
import { cn } from "@/lib/utils";

const Avatar = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & { src?: string; alt?: string; fallback?: string }
>(({ className, src, alt, fallback = "US", ...props }, ref) => {
  const [hasError, setHasError] = React.useState(false);

  return (
    <div
      ref={ref}
      className={cn(
        "relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full border border-border/40 bg-muted text-muted-foreground",
        className
      )}
      {...props}
    >
      {src && !hasError ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={src}
          alt={alt || "Avatar"}
          loading="lazy"
          decoding="async"
          onError={() => setHasError(true)}
          className="aspect-square h-full w-full object-cover"
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center font-medium uppercase text-xs">
          {fallback}
        </div>
      )}
    </div>
  );
});
Avatar.displayName = "Avatar";

export { Avatar };
