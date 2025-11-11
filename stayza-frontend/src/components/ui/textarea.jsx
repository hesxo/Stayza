import * as React from "react"

import { cn } from "@/lib/utils"

function Textarea({
  className,
  ...props
}) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "border-input placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive dark:bg-input/30 flex field-sizing-content min-h-24 w-full rounded-2xl border bg-white/70 px-4 py-3 text-base shadow-[0_10px_30px_rgba(15,23,42,0.08)] transition-all duration-300 outline-none focus-visible:ring-4 disabled:cursor-not-allowed disabled:opacity-60 md:text-sm",
        className
      )}
      {...props}
    />
  );
}

export { Textarea }
