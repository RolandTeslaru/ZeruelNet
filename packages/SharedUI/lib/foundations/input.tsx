import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../utils/cn"

export const inputVariants = cva(
  `flex h-fit relative rounded-md border border-border-input bg-input
   ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium
   placeholder:text-muted-foreground focus-visible:outline-hidden
   disabled:cursor-not-allowed disabled:opacity-50 text-label-tertiary`,
  {
    variants: {
      size: {
        sm:      "px-1 py-0.5 text-xs",
        xs:      "px-1 py-0.25 text-[11px]",

      },
    },
    defaultVariants: {
      size: "sm",
    },
  }
)

export interface InputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'>,
    VariantProps<typeof inputVariants> {
    htmlSize?: number
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, style, type, size, htmlSize, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(inputVariants({ size, className }))}
        ref={ref}
        size={htmlSize}
        style={{ boxShadow: "1px 1px 5px 1px rgba(1,1,1,0.2)", ...style }}
        {...props}
      />
    )
  }
)
Input.displayName = "Input"

export { Input }