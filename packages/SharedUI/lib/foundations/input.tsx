import * as React from "react"
import { cn } from "../utils/cn"

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> { }

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, style, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          `flex text-label-tertiary h-fit px-1 py-0.5 relative rounded-md 
           border border-border-input bg-input text-xs ring-offset-background 
           file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground 
           focus-visible:outline-hidden disabled:cursor-not-allowed disabled:opacity-50`,
          className
        )}
        ref={ref}
        style={{ boxShadow: "1px 1px 5px 1px rgba(1,1,1,0.2)", ...style}}
        {...props}
      />
    )
  }
)
Input.displayName = "Input"

export { Input }