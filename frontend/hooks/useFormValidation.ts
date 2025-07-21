import { useState, useCallback } from "react"
import { ValidationRule, validateField as validateFieldUtil, validateForm as validateFormUtil, FieldValidation } from "@/utils/validation"

interface UseFormValidationOptions {
    initialData?: Record<string, any>
    validationRules: FieldValidation
    onSubmit?: (data: Record<string, any>) => void | Promise<void>
}

interface UseFormValidationResult {
    data: Record<string, any>
    errors: Record<string, string>
    isValid: boolean
    isSubmitting: boolean
    setFieldValue: (fieldName: string, value: any) => void
    setFieldError: (fieldName: string, error: string) => void
    validateField: (fieldName: string) => void
    validateForm: () => boolean
    handleSubmit: (e: React.FormEvent) => Promise<void>
    resetForm: () => void
    clearErrors: () => void
}

export function useFormValidation({
    initialData = {},
    validationRules,
    onSubmit
}: UseFormValidationOptions): UseFormValidationResult {
    const [data, setData] = useState<Record<string, any>>(initialData)
    const [errors, setErrors] = useState<Record<string, string>>({})
    const [isSubmitting, setIsSubmitting] = useState(false)

    // Set field value and optionally validate
    const setFieldValue = useCallback((fieldName: string, value: any) => {
        setData(prev => ({ ...prev, [fieldName]: value }))

        // Clear error when user starts typing
        if (errors[fieldName]) {
            setErrors(prev => {
                const newErrors = { ...prev }
                delete newErrors[fieldName]
                return newErrors
            })
        }
    }, [errors])

    // Set field error manually
    const setFieldError = useCallback((fieldName: string, error: string) => {
        setErrors(prev => ({ ...prev, [fieldName]: error }))
    }, [])

    // Validate a single field
    const validateField = useCallback((fieldName: string) => {
        const fieldRules = validationRules[fieldName]
        if (!fieldRules) return

        const fieldValue = data[fieldName]
        const validation = validateFieldUtil(fieldValue, fieldRules)

        setErrors(prev => ({
            ...prev,
            [fieldName]: validation.isValid ? '' : validation.errors[0]
        }))
    }, [data, validationRules])

    // Validate entire form
    const validateForm = useCallback(() => {
        const validation = validateFormUtil(data, validationRules)
        const newErrors: Record<string, string> = {}

        if (!validation.isValid) {
            validation.errors.forEach(error => {
                const [fieldName, ...errorParts] = error.split(': ')
                newErrors[fieldName] = errorParts.join(': ')
            })
        }

        setErrors(newErrors)
        return validation.isValid
    }, [data, validationRules])

    // Handle form submission
    const handleSubmit = useCallback(async (e: React.FormEvent) => {
        e.preventDefault()

        if (!validateForm()) {
            return
        }

        if (onSubmit) {
            setIsSubmitting(true)
            try {
                await onSubmit(data)
            } catch (error) {
                console.error('Form submission error:', error)
            } finally {
                setIsSubmitting(false)
            }
        }
    }, [data, validateForm, onSubmit])

    // Reset form to initial state
    const resetForm = useCallback(() => {
        setData(initialData)
        setErrors({})
        setIsSubmitting(false)
    }, [initialData])

    // Clear all errors
    const clearErrors = useCallback(() => {
        setErrors({})
    }, [])

    // Check if form is valid (no errors and all required fields filled)
    const isValid = Object.keys(errors).length === 0 &&
        Object.entries(validationRules).every(([fieldName, rules]) => {
            if (!rules.required) return true
            const value = data[fieldName]
            return value && value.toString().trim() !== ''
        })

    return {
        data,
        errors,
        isValid,
        isSubmitting,
        setFieldValue,
        setFieldError,
        validateField,
        validateForm,
        handleSubmit,
        resetForm,
        clearErrors
    }
}

// Specialized hooks for common forms
export function useLoginForm(onSubmit?: (data: Record<string, any>) => void | Promise<void>) {
    return useFormValidation({
        validationRules: {
            username: { required: true, minLength: 3, maxLength: 20 },
            password: { required: true, minLength: 8 }
        },
        onSubmit
    })
}

export function useRegisterForm(onSubmit?: (data: Record<string, any>) => void | Promise<void>) {
    return useFormValidation({
        validationRules: {
            firstName: { required: true, minLength: 2, maxLength: 50 },
            lastName: { required: true, minLength: 2, maxLength: 50 },
            email: { required: true, email: true },
            username: { required: true, minLength: 3, maxLength: 20 },
            password: { required: true, minLength: 8 }
        },
        onSubmit
    })
}

export function useProfileForm(initialData: any, onSubmit?: (data: Record<string, any>) => void | Promise<void>) {
    return useFormValidation({
        initialData,
        validationRules: {
            firstName: { required: true, minLength: 2, maxLength: 50 },
            lastName: { required: true, minLength: 2, maxLength: 50 },
            email: { required: true, email: true },
            username: { required: true, minLength: 3, maxLength: 20 }
        },
        onSubmit
    })
}

export function useCourseForm(onSubmit?: (data: Record<string, any>) => void | Promise<void>) {
    return useFormValidation({
        validationRules: {
            courseCode: { required: true, pattern: /^[A-Z]{2,4}\d{3,4}$/ },
            courseName: { required: true, minLength: 2, maxLength: 100 }
        },
        onSubmit
    })
}

export function useStrategyForm(onSubmit?: (data: Record<string, any>) => void | Promise<void>) {
    return useFormValidation({
        validationRules: {
            name: { required: true, minLength: 2, maxLength: 100 },
            description: { maxLength: 500 }
        },
        onSubmit
    })
} 