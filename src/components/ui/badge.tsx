import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default: "border-transparent bg-primary text-primary-foreground hover:bg-primary/80",
        secondary: "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
        destructive: "border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80",
        outline: "text-foreground",
        success: "border-transparent bg-success text-success-foreground",
        warning: "border-transparent bg-warning text-warning-foreground",
        critical: "border-transparent bg-critical text-critical-foreground",
        high: "border-transparent bg-high text-high-foreground",
        medium: "border-transparent bg-medium text-medium-foreground",
        low: "border-transparent bg-low text-low-foreground",
        resolved: "border-transparent bg-success text-success-foreground",
        unresolved: "border-transparent bg-muted text-muted-foreground",
        verified: "border-transparent bg-success text-success-foreground",
        unverified: "border-transparent bg-muted text-muted-foreground",
        flagged: "border-transparent bg-warning text-warning-foreground",
        rejected: "border-transparent bg-destructive text-destructive-foreground",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
