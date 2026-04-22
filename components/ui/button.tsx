"use client";

import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex touch-manipulation items-center justify-center gap-2 whitespace-nowrap rounded-md font-semibold tracking-[0.02em] transition-all duration-200 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-40",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground border border-primary hover:bg-gold-500 hover:border-gold-500 active:translate-y-px",
        outline:
          "bg-transparent text-foreground border border-ink-500 hover:bg-ink-700 active:translate-y-px",
        secondary:
          "bg-ink-750 text-foreground border border-ink-600 hover:bg-ink-700 active:translate-y-px",
        ghost:
          "bg-transparent text-muted-foreground hover:text-foreground",
      },
      size: {
        default: "h-11 px-7 py-2 text-sm",
        sm: "h-9 rounded px-4 text-xs",
        lg: "h-12 px-8 text-base",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
