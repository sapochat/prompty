import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-full border-2 px-3 py-1 text-sm font-bold shadow-sm transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 select-none",
  {
    variants: {
      variant: {
        default:
          "border-primary bg-primary/10 text-primary hover:bg-primary/90 hover:text-primary-foreground active:bg-primary/80 shadow-md",
        secondary:
          "border-secondary bg-secondary/20 text-secondary-foreground hover:bg-secondary/80",
        destructive:
          "border-destructive bg-destructive/10 text-destructive hover:bg-destructive/80",
        outline: "border-muted bg-background text-foreground",
        selected:
          "border-primary bg-primary text-primary-foreground shadow-lg",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants }
