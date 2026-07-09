"use client";

import * as React from "react";
import Link from "next/link";
import { type VariantProps } from "class-variance-authority";
import { buttonVariants } from "./button";
import { cn } from "@/lib/utils";

interface ButtonLinkProps extends VariantProps<typeof buttonVariants> {
  href: string;
  /** External links render a plain <a>; internal ones use next/link. */
  external?: boolean;
  className?: string;
  children: React.ReactNode;
}

/**
 * Anchor styled as a button. buttonVariants() can only run client-side
 * (button.tsx is "use client"), so server components render this instead
 * of calling buttonVariants() directly.
 */
export function ButtonLink({
  href,
  external,
  variant,
  size,
  className,
  children,
}: ButtonLinkProps) {
  const classes = cn(buttonVariants({ variant, size }), className);
  if (external) {
    return (
      <a href={href} className={classes}>
        {children}
      </a>
    );
  }
  return (
    <Link href={href} className={classes}>
      {children}
    </Link>
  );
}
