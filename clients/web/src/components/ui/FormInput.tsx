import { forwardRef } from "react";

export interface FormInputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  id: string;
  error?: string;
}

export const FormInput = forwardRef<HTMLInputElement, FormInputProps>(
  ({ label, id, error, className = "", ...props }, ref) => {
    return (
      <div>
        <label htmlFor={id} className="mb-1 block text-sm font-medium">
          {label}
        </label>
        <input
          ref={ref}
          id={id}
          className={`w-full rounded border px-3 py-2 text-base ${className}`.trim()}
          {...props}
        />
        {error && <p className="mt-1 text-sm text-red-400">{error}</p>}
      </div>
    );
  },
);

FormInput.displayName = "FormInput";
