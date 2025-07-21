import React from "react"
import { cn } from "@/lib/utils"
import { ValidationRule, validateField } from "@/utils/validation"

interface FormFieldProps {
    label?: string
    name: string
    type?: "text" | "email" | "password" | "number" | "url" | "textarea"
    placeholder?: string
    value: string
    onChange: (value: string) => void
    onBlur?: () => void
    error?: string
    validationRules?: ValidationRule
    disabled?: boolean
    required?: boolean
    className?: string
    icon?: React.ReactNode
    helperText?: string
}

export const FormField: React.FC<FormFieldProps> = ({
    label,
    name,
    type = "text",
    placeholder,
    value,
    onChange,
    onBlur,
    error,
    validationRules,
    disabled = false,
    required = false,
    className = "",
    icon,
    helperText
}) => {
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        onChange(e.target.value)
    }

    const handleBlur = () => {
        if (validationRules) {
            const validation = validateField(value, validationRules)
            if (!validation.isValid) {
                // You can emit the error here if needed
                console.log(`${name} validation error:`, validation.errors[0])
            }
        }
        onBlur?.()
    }

    const inputClasses = cn(
        "flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-base shadow-sm transition-colors",
        "placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring",
        "disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
        icon && "pl-9",
        error && "border-red-500 focus-visible:ring-red-500",
        className
    )

    const renderInput = () => {
        if (type === "textarea") {
            return (
                <textarea
                    name={name}
                    value={value}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    placeholder={placeholder}
                    disabled={disabled}
                    required={required}
                    className={cn(inputClasses, "min-h-[100px] resize-vertical")}
                />
            )
        }

        return (
            <input
                type={type}
                name={name}
                value={value}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder={placeholder}
                disabled={disabled}
                required={required}
                className={inputClasses}
            />
        )
    }

    return (
        <div className="space-y-2">
            {label && (
                <label htmlFor={name} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                    {label}
                    {required && <span className="text-red-500 ml-1">*</span>}
                </label>
            )}

            <div className="relative">
                {icon && (
                    <div className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground">
                        {icon}
                    </div>
                )}
                {renderInput()}
            </div>

            {error && (
                <p className="text-sm text-red-500">{error}</p>
            )}

            {helperText && !error && (
                <p className="text-xs text-muted-foreground">{helperText}</p>
            )}
        </div>
    )
}

// Specialized form field components
export const TextField: React.FC<Omit<FormFieldProps, 'type'> & { icon?: React.ReactNode }> = (props) => (
    <FormField {...props} type="text" />
)

export const EmailField: React.FC<Omit<FormFieldProps, 'type'> & { icon?: React.ReactNode }> = (props) => (
    <FormField {...props} type="email" />
)

export const PasswordField: React.FC<Omit<FormFieldProps, 'type'> & { icon?: React.ReactNode }> = (props) => (
    <FormField {...props} type="password" />
)

export const NumberField: React.FC<Omit<FormFieldProps, 'type'> & { icon?: React.ReactNode }> = (props) => (
    <FormField {...props} type="number" />
)

export const UrlField: React.FC<Omit<FormFieldProps, 'type'> & { icon?: React.ReactNode }> = (props) => (
    <FormField {...props} type="url" />
)

export const TextAreaField: React.FC<Omit<FormFieldProps, 'type'> & { icon?: React.ReactNode }> = (props) => (
    <FormField {...props} type="textarea" />
) 