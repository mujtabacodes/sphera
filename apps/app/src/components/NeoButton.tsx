import React, { ButtonHTMLAttributes, DetailedHTMLProps } from "react";
import { VariantProps, cva } from "class-variance-authority";
import { twMerge } from "tailwind-merge";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "relative neo_button px-4 py-3 flex items-center justify-center gap-5 w-fit h-[48px] rounded-sm font-ppReg text-white-100",
  {
    variants: {
     
      size: {
        sm: "text-sm py-2",
        md: "text-base py-3",
        lg: "text-lg py-4",
      },
    },
    defaultVariants: {
      size: "md",
    },
  }
);

export interface ButtonVariants
  extends DetailedHTMLProps<
      ButtonHTMLAttributes<HTMLButtonElement>,
      HTMLButtonElement
    >,
    VariantProps<typeof buttonVariants> {}

export interface ButtonProps extends ButtonVariants {
  children: React.ReactNode;
  className?: React.ComponentProps<"div">["className"];
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  isLoading?: boolean;
  disabled?: boolean;
  href?: string;
  spinnerColor?: string;
  spinnerSize?: string | number;
  childrenClass?: React.ComponentProps<"div">["className"];
  enableBounceEffect?: boolean;
}

const Button: React.FC<ButtonProps> = ({
  children,
  isLoading,
  disabled,
  className,
  href,
  spinnerColor,
  spinnerSize,
  childrenClass,
  enableBounceEffect,
  ...props
}) => {
  const classNames = twMerge(
    buttonVariants(props),
    className,
    enableBounceEffect
      ? "active:scale-[.95] target:scale-[.90] scale-1 transition-all"
      : ""
  );

  if (href) {
    return (
      // @ts-ignore
      <Link to={href} className={cn(classNames, childrenClass)} {...props}>
        {children}
       </Link>
    );
  }

  return (
    <button
      disabled={(isLoading ?? disabled) || disabled}
      className={classNames}
      {...props}
    >
      <div className="w-full h-full absolute top-0 flex flex-col items-center justify-center">
      </div>
      <div
        className={twMerge(
          "w-auto flex items-center justify-center gap-2",
          isLoading ? "opacity-0" : "opacity-1",
          childrenClass
        )}
      >
        {children}
       
      </div>
    </button>
  );
};

export default Button;
