import * as React from "react";
import { Slot, Slottable } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../utils/cn"


export const buttonVariants = cva(
  `cursor-pointer inline-flex items-center justify-center whitespace-nowrap text-sm font-medium ring-offset-background transition-colors shadow-[1px_1px_5px_1px_rgba(1,1,1,0.2)]
   focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50`,
  {
    variants: {
      variant: {
        default: `cursor-pointer border border-transparent hover:border-primary-thin bg-secondary-thin text-white text-xs font-roboto-mono gap-2
                  hover:bg-secondary-opaque text-label-secondary`,
        primary:
          "bg-blue-600 hover:bg-blue-700 border border-blue-500",
        destructive:
          "bg-destructive border border-red-700 text-red-100 hover:bg-destructive/90",
        outline:
          "border border-primary-opaque bg-secondary-opaque hover:bg-tertiary-opaque hover:text-accent-foreground",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        dashed1:
          "bg-gray-400/10 border border-dashed !rounded-none outline-offset-2 border-white/20 hover:bg-white/10",
        ghost: "text-neutral-200 hover:bg-accent hover:text-neutral-300 shadow-none",
        link: "text-primary underline-offset-4 hover:underline",
        expandIcon:
          "group relative text-primary-foreground bg-neutral-950 hover:bg-neutral-950/90",
        ringHover:
          "bg-neutral-950 text-primary-foreground transition-all duration-300 hover:bg-neutral-950/90 hover:ring-2 hover:ring-primary/90 hover:ring-offset-2",
        shine:
          "text-primary-foreground animate-shine bg-linear-to-r from-primary via-primary/75 to-primary bg-[length:400%_100%] ",
        gooeyRight:
          "text-primary-foreground relative bg-neutral-950 z-0 overflow-hidden transition-all duration-500 before:absolute before:inset-0 before:-z-10 before:translate-x-[150%] before:translate-y-[150%] before:scale-[2.5] before:rounded-[100%] before:bg-linear-to-r from-zinc-400 before:transition-transform before:duration-1000  hover:before:translate-x-[0%] hover:before:translate-y-[0%] ",
        gooeyLeft:
          "text-primary-foreground relative bg-neutral-950 z-0 overflow-hidden transition-all duration-500 after:absolute after:inset-0 after:-z-10 after:translate-x-[-150%] after:translate-y-[150%] after:scale-[2.5] after:rounded-[100%] after:bg-linear-to-l from-zinc-400 after:transition-transform after:duration-1000  hover:after:translate-x-[0%] hover:after:translate-y-[0%] ",
        linkHover1:
          "relative after:absolute after:bg-neutral-950 after:bottom-2 after:h-[1px] after:w-2/3 after:origin-bottom-left after:scale-x-100 hover:after:origin-bottom-right hover:after:scale-x-0 after:transition-transform after:ease-in-out after:duration-300",
        linkHover2:
          "relative after:absolute after:bg-neutral-950 after:bottom-2 after:h-[1px] after:w-2/3 after:origin-bottom-right after:scale-x-0 hover:after:origin-bottom-left hover:after:scale-x-100 after:transition-transform after:ease-in-out after:duration-300",
        warning:
          "border border-yellow-400 bg-yellow-500 hover:bg-yellow-600 hover:text-accent-foreground ",
        error:
          "border border-red-600 bg-red-700 hover:bg-red-800 hover:text-accent-foreground ",
        success:
          "border border-green-600 "
      },
      size: {
        default: "rounded-sm h-8 px-4 py-0",
        sm: " rounded-lg px-1",
        xs: " rounded-lg px-2 py-0.5 text-xs",
        md: "rounded-lg px-3 py-1",
        lg: "h-9 rounded-lg px-8",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);


// shadow-[0px_0px_8px_0.7px_oklch(0.58_0.2152_27.33)]
// shadow-[0px_0px_8px_0.7px_oklch(0.860_0.1731_91.94)]

interface IconProps {
  Icon: React.ElementType;
  iconPlacement: "left" | "right";
}

interface IconRefProps {
  Icon?: never;
  iconPlacement?: undefined;
}

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

export type ButtonIconProps = IconProps | IconRefProps;

const Button = React.forwardRef<
  HTMLButtonElement,
  ButtonProps & ButtonIconProps
>(
  (
    {
      className,
      variant,
      size,
      asChild = false,
      Icon,
      iconPlacement,
      style,
      ...props
    },
    ref
  ) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className })) + " "}
        ref={ref}
        // style={{ boxShadow: "1px 1px 5px 1px rgba(1,1,1,0.2)", ...style}}
        {...props}
      >
        <Slottable>{props.children}</Slottable>
      </Comp>
    );
  }
);
Button.displayName = "Button";

export { Button };
        