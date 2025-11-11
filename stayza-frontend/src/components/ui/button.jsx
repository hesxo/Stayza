import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva } from "class-variance-authority";

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full text-sm font-semibold tracking-tight transition-all duration-300 ease-out disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:ring-4 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
  {
    variants: {
      variant: {
        default:
          "bg-[linear-gradient(120deg,var(--primary),var(--brand-blue-dark))] text-primary-foreground shadow-[0_15px_35px_rgba(0,96,223,0.35)] hover:-translate-y-0.5 hover:shadow-[0_20px_45px_rgba(0,96,223,0.45)]",
        destructive:
          "bg-destructive text-white shadow-[0_12px_30px_rgba(255,90,95,0.35)] hover:-translate-y-0.5",
        outline:
          "border border-border bg-transparent text-foreground hover:bg-white/40 hover:-translate-y-0.5 hover:border-primary/40",
        secondary:
          "bg-secondary text-secondary-foreground shadow-[0_8px_25px_rgba(31,181,156,0.35)] hover:-translate-y-0.5",
        ghost:
          "text-foreground hover:bg-accent/60 hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline decoration-2",
      },
      size: {
        default: "h-11 px-6 has-[>svg]:px-4",
        sm: "h-9 rounded-full gap-1.5 px-4 has-[>svg]:px-3",
        lg: "h-12 rounded-full px-8 text-base has-[>svg]:px-5",
        icon: "size-11 rounded-full",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}) {
  const Comp = asChild ? Slot : "button"

  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props} />
  );
}

export { Button, buttonVariants }
