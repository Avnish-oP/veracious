"use client";

import { cn } from "@/utils/cn";
import React from "react";
import { motion, AnimatePresence } from "framer-motion";

// Button Component with Sunglasses Theme
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "gradient";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
  icon?: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = "primary",
      size = "md",
      loading,
      children,
      disabled,
      icon,
      ...props
    },
    ref
  ) => {
    const baseStyles =
      "relative inline-flex items-center justify-center font-semibold transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none overflow-hidden group";

    const variants = {
      primary: `
        bg-gradient-to-r from-slate-900 via-gray-900 to-slate-800 
        text-white shadow-lg hover:shadow-xl 
        hover:from-slate-800 hover:via-gray-800 hover:to-slate-700
        focus-visible:ring-slate-500 border border-slate-700
        before:absolute before:inset-0 before:bg-gradient-to-r 
        before:from-white/10 before:to-transparent before:opacity-0 
        hover:before:opacity-100 before:transition-opacity before:duration-300
      `,
      gradient: `
        bg-gradient-to-r from-amber-500 via-orange-500 to-red-500 
        text-white shadow-lg hover:shadow-xl 
        hover:from-amber-400 hover:via-orange-400 hover:to-red-400
        focus-visible:ring-orange-500 border border-orange-400/20
        before:absolute before:inset-0 before:bg-gradient-to-r 
        before:from-white/20 before:to-transparent before:opacity-0 
        hover:before:opacity-100 before:transition-opacity before:duration-300
      `,
      secondary: `
        bg-white/80 backdrop-blur-sm text-slate-800 shadow-md 
        hover:shadow-lg hover:bg-white border border-slate-200
        focus-visible:ring-slate-400
      `,
      outline: `
        border-2 border-slate-300 bg-transparent text-slate-700 
        hover:bg-slate-50 hover:border-slate-400 focus-visible:ring-slate-400
        backdrop-blur-sm
      `,
      ghost: `
        text-slate-600 hover:bg-slate-100/80 hover:text-slate-800 
        focus-visible:ring-slate-400 backdrop-blur-sm
      `,
    };

    const sizes = {
      sm: "h-9 px-4 text-sm rounded-lg",
      md: "h-11 px-6 text-base rounded-xl",
      lg: "h-14 px-8 text-lg rounded-xl",
    };

    const { onDrag, onDragEnd, onDragStart, ...buttonProps } = props;

    return (
      <button
        ref={ref}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        disabled={disabled || loading}
        {...buttonProps}
      >
        <AnimatePresence mode="wait">
          {loading ? (
            <motion.div
              key="loading"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="flex items-center"
            >
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                className="mr-2 h-4 w-4 border-2 border-current border-t-transparent rounded-full"
              />
              Loading...
            </motion.div>
          ) : (
            <motion.div
              key="content"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="flex items-center"
            >
              {icon && <span className="mr-2">{icon}</span>}
              {children}
            </motion.div>
          )}
        </AnimatePresence>
      </button>
    );
  }
);
Button.displayName = "Button";

// Enhanced Input Component
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  icon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    { className, label, error, helperText, icon, rightIcon, id, ...props },
    ref
  ) => {
    const [isFocused, setIsFocused] = React.useState(false);
    const [hasValue, setHasValue] = React.useState(
      Boolean(props.value || props.defaultValue)
    );
    const inputId = id || label?.toLowerCase().replace(/\s+/g, "-");

    // Update hasValue when props.value changes
    React.useEffect(() => {
      setHasValue(Boolean(props.value || props.defaultValue));
    }, [props.value, props.defaultValue]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setHasValue(e.target.value.length > 0);
      if (props.onChange) {
        props.onChange(e);
      }
    };

    return (
      <motion.div
        className="space-y-2"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="relative">
          {/* Floating Label */}
          {label && (
            <motion.label
              htmlFor={inputId}
              className={cn(
                "absolute transition-all duration-200 pointer-events-none z-10",
                "text-slate-600 font-medium",
                isFocused || hasValue || props.value
                  ? "-top-2.5 text-xs bg-white px-2 text-slate-700 left-3"
                  : icon
                  ? "top-3 text-base text-slate-500 left-10"
                  : "top-3 text-base text-slate-500 left-4"
              )}
            >
              {label}
              {props.required && <span className="text-red-500 ml-1">*</span>}
            </motion.label>
          )}

          {/* Left Icon */}
          {icon && (
            <div className="absolute left-3 top-3.5 text-slate-400 z-10">
              {icon}
            </div>
          )}

          {/* Input Field */}
          <input
            ref={ref}
            id={inputId}
            className={cn(
              "w-full px-4 py-3.5 bg-white/70 backdrop-blur-sm border-2 rounded-xl",
              "font-medium text-slate-800 placeholder-transparent",
              "transition-all duration-300 focus:outline-none",
              "shadow-sm hover:shadow-md focus:shadow-lg",
              icon ? "pl-10" : "",
              rightIcon ? "pr-10" : "",
              error
                ? "border-red-300 focus:border-red-500 focus:ring-2 focus:ring-red-200"
                : "border-slate-200 focus:border-amber-400 focus:ring-2 focus:ring-amber-100",
              className
            )}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            onChange={handleInputChange}
            placeholder={label || props.placeholder}
            {...props}
          />

          {/* Right Icon */}
          {rightIcon && (
            <div className="absolute right-3 top-3.5 text-slate-400">
              {rightIcon}
            </div>
          )}

          {/* Focus Ring Effect */}
          <motion.div
            className="absolute inset-0 rounded-xl pointer-events-none"
            initial={false}
            animate={{
              boxShadow: isFocused
                ? "0 0 0 3px rgba(251, 191, 36, 0.1)"
                : "0 0 0 0px rgba(251, 191, 36, 0)",
            }}
            transition={{ duration: 0.2 }}
          />
        </div>

        {/* Error Message */}
        <AnimatePresence>
          {error && (
            <motion.p
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="text-sm text-red-600 flex items-center"
            >
              <svg
                className="w-4 h-4 mr-1"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
              {error}
            </motion.p>
          )}
        </AnimatePresence>

        {/* Helper Text */}
        {helperText && !error && (
          <p className="text-sm text-slate-500">{helperText}</p>
        )}
      </motion.div>
    );
  }
);
Input.displayName = "Input";

// Enhanced Phone Input Component with Country Code
interface PhoneInputProps {
  label?: string;
  error?: string;
  helperText?: string;
  value?: string;
  onChange?: (value: string) => void;
  onBlur?: () => void;
  name?: string;
  required?: boolean;
  className?: string;
}

const COUNTRY_CODES = [
  { code: "+91", country: "IN", flag: "🇮🇳", name: "India" },
  { code: "+1", country: "US", flag: "🇺🇸", name: "United States" },
  { code: "+44", country: "GB", flag: "🇬🇧", name: "United Kingdom" },
  { code: "+86", country: "CN", flag: "🇨🇳", name: "China" },
  { code: "+81", country: "JP", flag: "🇯🇵", name: "Japan" },
  { code: "+49", country: "DE", flag: "🇩🇪", name: "Germany" },
  { code: "+33", country: "FR", flag: "🇫🇷", name: "France" },
  { code: "+61", country: "AU", flag: "🇦🇺", name: "Australia" },
  { code: "+55", country: "BR", flag: "🇧🇷", name: "Brazil" },
  { code: "+7", country: "RU", flag: "🇷🇺", name: "Russia" },
];

export const PhoneInput = React.forwardRef<HTMLInputElement, PhoneInputProps>(
  (
    {
      label,
      error,
      helperText,
      value = "",
      onChange,
      onBlur,
      name,
      required,
      className,
    },
    ref
  ) => {
    const [isFocused, setIsFocused] = React.useState(false);
    const [selectedCountry, setSelectedCountry] = React.useState(
      COUNTRY_CODES[0]
    ); // Default to India
    const [phoneNumber, setPhoneNumber] = React.useState("");
    const [isDropdownOpen, setIsDropdownOpen] = React.useState(false);
    const dropdownRef = React.useRef<HTMLDivElement>(null);

    // Close dropdown when clicking outside
    React.useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
        if (
          dropdownRef.current &&
          !dropdownRef.current.contains(event.target as Node)
        ) {
          setIsDropdownOpen(false);
        }
      };

      document.addEventListener("mousedown", handleClickOutside);
      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
      };
    }, []);

    // Parse initial value if provided
    React.useEffect(() => {
      if (value) {
        const matchedCountry = COUNTRY_CODES.find((country) =>
          value.startsWith(country.code)
        );
        if (matchedCountry) {
          setSelectedCountry(matchedCountry);
          setPhoneNumber(value.substring(matchedCountry.code.length).trim());
        } else {
          setPhoneNumber(value);
        }
      }
    }, [value]);

    const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const inputValue = e.target.value.replace(/[^\d]/g, ""); // Only allow numbers
      setPhoneNumber(inputValue);

      const fullNumber = `${selectedCountry.code} ${inputValue}`;
      if (onChange) {
        onChange(fullNumber);
      }
    };

    const handleCountrySelect = (country: (typeof COUNTRY_CODES)[0]) => {
      setSelectedCountry(country);
      setIsDropdownOpen(false);

      const fullNumber = `${country.code} ${phoneNumber}`;
      if (onChange) {
        onChange(fullNumber);
      }
    };

    const hasValue = phoneNumber.length > 0;

    return (
      <motion.div
        className="space-y-2"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="relative">
          {/* Floating Label - same style as regular Input */}
          {label && (
            <motion.label
              className={cn(
                "absolute transition-all duration-200 pointer-events-none z-10",
                "text-slate-600 font-medium",
                isFocused || hasValue
                  ? "-top-2.5 text-xs bg-white px-2 text-slate-700 left-4"
                  : "top-3.5 text-base text-slate-500 left-24"
              )}
            >
              {label}
              {required && <span className="text-red-500 ml-1">*</span>}
            </motion.label>
          )}

          <div className="flex">
            {/* Country Code Selector */}
            <div className="relative" ref={dropdownRef}>
              <button
                type="button"
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className={cn(
                  "flex items-center px-2 py-3.5 bg-white/70 backdrop-blur-sm border-2 border-r-0",
                  "rounded-l-xl transition-all duration-300 hover:bg-white/90 min-w-[85px]",
                  "focus:outline-none focus:ring-2 focus:ring-amber-100",
                  error
                    ? "border-red-300 focus:border-red-500"
                    : "border-slate-200 focus:border-amber-400"
                )}
              >
                <span className="text-lg text-slate-900 mr-2">
                  {selectedCountry.flag}
                </span>
                <span className="text-sm font-bold text-slate-900 mr-2">
                  {selectedCountry.code}
                </span>
                <svg
                  className={cn(
                    "w- h-4 text-slate-600 transition-transform",
                    isDropdownOpen && "rotate-180"
                  )}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>

              {/* Dropdown */}
              <AnimatePresence>
                {isDropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="absolute top-full left-0 mt-1 w-72 bg-white rounded-xl shadow-xl border border-slate-200 z-20 max-h-60 overflow-y-auto"
                  >
                    {COUNTRY_CODES.map((country) => (
                      <button
                        key={country.country}
                        type="button"
                        onClick={() => handleCountrySelect(country)}
                        className="w-full px-4 py-3 text-left hover:bg-amber-50 transition-colors flex items-center border-b border-slate-100 last:border-b-0"
                      >
                        <span className="text-lg mr-3">{country.flag}</span>
                        <div className="flex-1">
                          <span className="font-bold text-slate-900">
                            {country.code}
                          </span>
                          <span className="text-sm text-slate-800 ml-3 font-medium">
                            {country.name}
                          </span>
                        </div>
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Phone Number Input */}
            <input
              ref={ref}
              name={name}
              type="tel"
              value={phoneNumber}
              onChange={handlePhoneChange}
              onFocus={() => setIsFocused(true)}
              onBlur={() => {
                setIsFocused(false);
                if (onBlur) onBlur();
              }}
              placeholder={label || "Enter phone number"}
              className={cn(
                "flex-1 px-4 py-3.5 bg-white/70 backdrop-blur-sm border-2 rounded-r-xl",
                "font-medium text-slate-800 placeholder-transparent",
                "transition-all duration-300 focus:outline-none",
                "shadow-sm hover:shadow-md focus:shadow-lg",
                error
                  ? "border-red-300 focus:border-red-500 focus:ring-2 focus:ring-red-200"
                  : "border-slate-200 focus:border-amber-400 focus:ring-2 focus:ring-amber-100",
                className
              )}
            />
          </div>

          {/* Focus Ring Effect */}
          <motion.div
            className="absolute inset-0 rounded-xl pointer-events-none"
            initial={false}
            animate={{
              boxShadow: isFocused
                ? "0 0 0 3px rgba(251, 191, 36, 0.1)"
                : "0 0 0 0px rgba(251, 191, 36, 0)",
            }}
            transition={{ duration: 0.2 }}
          />
        </div>

        {/* Error Message */}
        <AnimatePresence>
          {error && (
            <motion.p
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="text-sm text-red-600 flex items-center"
            >
              <svg
                className="w-4 h-4 mr-1"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
              {error}
            </motion.p>
          )}
        </AnimatePresence>

        {/* Helper Text */}
        {helperText && !error && (
          <p className="text-sm text-slate-500">{helperText}</p>
        )}
      </motion.div>
    );
  }
);
PhoneInput.displayName = "PhoneInput";

// Enhanced Select Component
interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  helperText?: string;
  options: { value: string; label: string }[];
  placeholder?: string;
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  (
    { className, label, error, helperText, options, placeholder, id, ...props },
    ref
  ) => {
    const [isFocused, setIsFocused] = React.useState(false);
    const selectId = id || label?.toLowerCase().replace(/\s+/g, "-");

    return (
      <motion.div
        className="space-y-2"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        {label && (
          <label
            htmlFor={selectId}
            className="block text-sm font-medium text-slate-700"
          >
            {label}
            {props.required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}

        <div className="relative">
          <select
            ref={ref}
            id={selectId}
            className={cn(
              "w-full px-4 py-3 bg-white/70 backdrop-blur-sm border-2 rounded-xl",
              "font-medium text-slate-800 appearance-none cursor-pointer",
              "transition-all duration-300 focus:outline-none",
              "shadow-sm hover:shadow-md focus:shadow-lg",
              error
                ? "border-red-300 focus:border-red-500 focus:ring-2 focus:ring-red-200"
                : "border-slate-200 focus:border-amber-400 focus:ring-2 focus:ring-amber-100",
              className
            )}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            {...props}
          >
            {placeholder && (
              <option value="" disabled>
                {placeholder}
              </option>
            )}
            {options.map((option) => (
              <option
                key={option.value}
                value={option.value}
                className="bg-white"
              >
                {option.label}
              </option>
            ))}
          </select>

          {/* Custom Arrow */}
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
            <motion.svg
              className="w-5 h-5 text-slate-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              animate={{ rotate: isFocused ? 180 : 0 }}
              transition={{ duration: 0.2 }}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </motion.svg>
          </div>
        </div>

        {error && (
          <motion.p
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-sm text-red-600"
          >
            {error}
          </motion.p>
        )}
        {helperText && !error && (
          <p className="text-sm text-slate-500">{helperText}</p>
        )}
      </motion.div>
    );
  }
);
Select.displayName = "Select";

// Enhanced Checkbox Component
interface CheckboxProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  description?: string;
}

export const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, label, error, description, id, ...props }, ref) => {
    const [isChecked, setIsChecked] = React.useState(false);
    const checkboxId = id || label?.toLowerCase().replace(/\s+/g, "-");

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setIsChecked(e.target.checked);
      if (props.onChange) {
        props.onChange(e);
      }
    };

    return (
      <motion.div
        className="space-y-2"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="flex items-start space-x-3">
          <div className="relative">
            <input
              ref={ref}
              type="checkbox"
              id={checkboxId}
              className="sr-only"
              onChange={handleChange}
              {...props}
            />
            <motion.div
              className={cn(
                "w-5 h-5 border-2 rounded-md cursor-pointer flex items-center justify-center",
                "transition-all duration-200",
                isChecked || props.checked
                  ? "bg-amber-500 border-amber-500"
                  : "bg-white border-slate-300 hover:border-amber-400",
                error && "border-red-300",
                className
              )}
              onClick={() =>
                checkboxId && document.getElementById(checkboxId)?.click()
              }
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <AnimatePresence>
                {(isChecked || props.checked) && (
                  <motion.svg
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0, opacity: 0 }}
                    className="w-3 h-3 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <motion.path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={3}
                      d="M5 13l4 4L19 7"
                      initial={{ pathLength: 0 }}
                      animate={{ pathLength: 1 }}
                      transition={{ duration: 0.2 }}
                    />
                  </motion.svg>
                )}
              </AnimatePresence>
            </motion.div>
          </div>
          {(label || description) && (
            <div className="flex-1">
              {label && (
                <label
                  htmlFor={checkboxId}
                  className="text-sm font-medium text-slate-700 cursor-pointer"
                >
                  {label}
                </label>
              )}
              {description && (
                <p className="text-xs text-slate-500 mt-1">{description}</p>
              )}
            </div>
          )}
        </div>
        {error && (
          <motion.p
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-sm text-red-600"
          >
            {error}
          </motion.p>
        )}
      </motion.div>
    );
  }
);
Checkbox.displayName = "Checkbox";

// Enhanced Card Component
interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  variant?: "default" | "glass" | "elevated";
}

export const Card = ({
  className,
  children,
  variant = "default",
  ...props
}: CardProps) => {
  const variants = {
    default: "bg-white border border-slate-200 shadow-sm",
    glass: "bg-white/70 backdrop-blur-md border border-white/20 shadow-xl",
    elevated: "bg-white border border-slate-200 shadow-2xl",
  };

  // Filter out conflicting event handlers
  const {
    onDrag,
    onDragEnd,
    onDragStart,
    draggable,
    onAnimationStart,
    onAnimationEnd,
    onAnimationIteration,
    onTransitionEnd,
    ...safeProps
  } = props;

  return (
    <motion.div
      className={cn(
        "rounded-2xl p-6 transition-all duration-300",
        variants[variant],
        className
      )}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      whileHover={{ y: -2 }}
      {...safeProps}
    >
      {children}
    </motion.div>
  );
};

// Enhanced Progress Component
interface ProgressProps {
  currentStep: number;
  totalSteps: number;
  labels?: string[];
}

export const Progress = ({
  currentStep,
  totalSteps,
  labels,
}: ProgressProps) => {
  return (
    <motion.div
      className="w-full"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Step Labels */}
      {labels && (
        <div className="flex items-center justify-between mb-4">
          {labels.map((label, index) => (
            <motion.div
              key={index}
              className="flex flex-col items-center"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
            >
              <motion.div
                className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold mb-2",
                  "transition-all duration-300",
                  index + 1 <= currentStep
                    ? "bg-amber-500 text-white shadow-lg"
                    : index + 1 === currentStep + 1
                    ? "bg-amber-100 text-amber-600 border-2 border-amber-300"
                    : "bg-slate-100 text-slate-400"
                )}
                whileHover={{ scale: 1.1 }}
                animate={{
                  scale: index + 1 === currentStep ? 1.1 : 1,
                }}
              >
                {index + 1 < currentStep ? (
                  <motion.svg
                    className="w-4 h-4"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.2 }}
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </motion.svg>
                ) : (
                  index + 1
                )}
              </motion.div>
              <span
                className={cn(
                  "text-xs font-medium text-center transition-colors duration-300",
                  index + 1 <= currentStep ? "text-amber-600" : "text-slate-400"
                )}
              >
                {label}
              </span>
            </motion.div>
          ))}
        </div>
      )}

      {/* Progress Bar */}
      <div className="relative h-2 bg-slate-200 rounded-full overflow-hidden">
        <motion.div
          className="h-full bg-gradient-to-r from-amber-400 to-orange-500 rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${(currentStep / totalSteps) * 100}%` }}
          transition={{ duration: 0.6, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute top-0 left-0 h-full w-full bg-gradient-to-r from-white/30 to-transparent"
          animate={{ x: ["0%", "100%"] }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
        />
      </div>
    </motion.div>
  );
};
