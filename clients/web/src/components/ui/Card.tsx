import { forwardRef } from "react";

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  padding?: "sm" | "md" | "lg";
}

export const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ children, padding = "lg", className = "", ...props }, ref) => {
    const paddingClasses = {
      sm: "p-4",
      md: "p-6",
      lg: "p-8",
    };

    const baseClasses = "rounded-lg border bg-neutral-800";
    const mergedClasses =
      `${baseClasses} ${paddingClasses[padding]} ${className}`.trim();

    return (
      <div ref={ref} className={mergedClasses} {...props}>
        {children}
      </div>
    );
  },
);

Card.displayName = "Card";
