import { forwardRef } from "react";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "blue" | "outline" | "red" | "green" | "yellow" | "purple";
  size?: "sm" | "md" | "lg" | "xl";
  loading?: boolean;
  loadingText?: string;
  fullWidth?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = "blue",
      size = "md",
      loading = false,
      loadingText,
      fullWidth = false,
      className = "",
      children,
      disabled,
      ...props
    },
    ref,
  ) => {
    const variantClasses = {
      blue: "bg-blue-600 hover:bg-blue-400 text-white",
      outline: "border border-neutral-300 hover:bg-gray-50",
      red: "bg-red-400 hover:bg-red-300 text-white",
      green: "bg-green-400 hover:bg-green-300",
      yellow: "bg-yellow-400 hover:bg-yellow-300",
      purple: "bg-purple-400 hover:bg-purple-300",
    };

    const sizeClasses = {
      sm: "px-3 py-1.5 text-sm",
      md: "px-4 py-2 text-base",
      lg: "px-6 py-3 text-base",
      xl: "px-4 py-3 text-xl",
    };

    const baseClasses =
      "rounded-lg transition-colors cursor-pointer disabled:bg-neutral-400 disabled:cursor-not-allowed";
    const widthClass = fullWidth ? "w-full" : "";

    const mergedClasses = `${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${widthClass} ${className}`.trim();

    return (
      <button
        ref={ref}
        className={mergedClasses}
        disabled={disabled || loading}
        {...props}
      >
        {loading && loadingText ? loadingText : children}
      </button>
    );
  },
);

Button.displayName = "Button";
