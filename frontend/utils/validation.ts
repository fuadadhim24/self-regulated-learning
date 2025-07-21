// Form validation utility with common validation rules

export interface ValidationRule {
    required?: boolean
    minLength?: number
    maxLength?: number
    pattern?: RegExp
    custom?: (value: any) => string | null
    email?: boolean
    url?: boolean
    numeric?: boolean
    password?: boolean
}

export interface ValidationResult {
    isValid: boolean
    errors: string[]
}

export interface FieldValidation {
    [fieldName: string]: ValidationRule
}

// Common validation patterns
export const PATTERNS = {
    EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    URL: /^https?:\/\/.+/,
    USERNAME: /^[a-zA-Z0-9_]{3,20}$/,
    PASSWORD: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/,
    COURSE_CODE: /^[A-Z]{2,4}\d{3,4}$/,
    GRADE: /^(100|[1-9]?\d(\.\d{1,2})?)$/,
    PHONE: /^\+?[\d\s\-\(\)]{10,}$/
}

// Common validation rules
export const RULES = {
    REQUIRED: { required: true },
    EMAIL: { email: true },
    URL: { url: true },
    USERNAME: {
        required: true,
        minLength: 3,
        maxLength: 20,
        pattern: PATTERNS.USERNAME
    },
    PASSWORD: {
        required: true,
        minLength: 8,
        pattern: PATTERNS.PASSWORD
    },
    COURSE_CODE: {
        required: true,
        pattern: PATTERNS.COURSE_CODE
    },
    COURSE_NAME: {
        required: true,
        minLength: 2,
        maxLength: 100
    },
    STRATEGY_NAME: {
        required: true,
        minLength: 2,
        maxLength: 100
    },
    DESCRIPTION: {
        maxLength: 500
    },
    GRADE: {
        pattern: PATTERNS.GRADE
    }
}

// Error messages
export const ERROR_MESSAGES = {
    REQUIRED: "This field is required",
    EMAIL: "Please enter a valid email address",
    URL: "Please enter a valid URL",
    USERNAME: "Username must be 3-20 characters and contain only letters, numbers, and underscores",
    PASSWORD: "Password must be at least 8 characters with uppercase, lowercase, and number",
    COURSE_CODE: "Course code must be 2-4 letters followed by 3-4 numbers (e.g., CS101)",
    COURSE_NAME: "Course name must be 2-100 characters",
    STRATEGY_NAME: "Strategy name must be 2-100 characters",
    DESCRIPTION: "Description must be less than 500 characters",
    GRADE: "Grade must be a number between 0 and 100",
    MIN_LENGTH: (min: number) => `Must be at least ${min} characters`,
    MAX_LENGTH: (max: number) => `Must be less than ${max} characters`,
    PATTERN: "Invalid format"
}

// Validate a single field
export function validateField(value: any, rules: ValidationRule): ValidationResult {
    const errors: string[] = []

    // Required validation
    if (rules.required && (!value || value.toString().trim() === '')) {
        errors.push(ERROR_MESSAGES.REQUIRED)
        return { isValid: false, errors }
    }

    // Skip other validations if value is empty and not required
    if (!value || value.toString().trim() === '') {
        return { isValid: true, errors: [] }
    }

    const stringValue = value.toString().trim()

    // Length validations
    if (rules.minLength && stringValue.length < rules.minLength) {
        errors.push(ERROR_MESSAGES.MIN_LENGTH(rules.minLength))
    }

    if (rules.maxLength && stringValue.length > rules.maxLength) {
        errors.push(ERROR_MESSAGES.MAX_LENGTH(rules.maxLength))
    }

    // Pattern validations
    if (rules.pattern && !rules.pattern.test(stringValue)) {
        errors.push(ERROR_MESSAGES.PATTERN)
    }

    // Email validation
    if (rules.email && !PATTERNS.EMAIL.test(stringValue)) {
        errors.push(ERROR_MESSAGES.EMAIL)
    }

    // URL validation
    if (rules.url && !PATTERNS.URL.test(stringValue)) {
        errors.push(ERROR_MESSAGES.URL)
    }

    // Numeric validation
    if (rules.numeric && isNaN(Number(stringValue))) {
        errors.push("Must be a valid number")
    }

    // Custom validation
    if (rules.custom) {
        const customError = rules.custom(value)
        if (customError) {
            errors.push(customError)
        }
    }

    return {
        isValid: errors.length === 0,
        errors
    }
}

// Validate an entire form
export function validateForm(data: Record<string, any>, rules: FieldValidation): ValidationResult {
    const errors: string[] = []
    let isValid = true

    for (const [fieldName, fieldRules] of Object.entries(rules)) {
        const fieldValue = data[fieldName]
        const fieldValidation = validateField(fieldValue, fieldRules)

        if (!fieldValidation.isValid) {
            isValid = false
            errors.push(`${fieldName}: ${fieldValidation.errors.join(', ')}`)
        }
    }

    return { isValid, errors }
}

// Specific form validation schemas
export const FORM_SCHEMAS = {
    LOGIN: {
        username: RULES.USERNAME,
        password: RULES.PASSWORD
    },

    REGISTER: {
        firstName: { required: true, minLength: 2, maxLength: 50 },
        lastName: { required: true, minLength: 2, maxLength: 50 },
        email: RULES.EMAIL,
        username: RULES.USERNAME,
        password: RULES.PASSWORD
    },

    PROFILE: {
        firstName: { required: true, minLength: 2, maxLength: 50 },
        lastName: { required: true, minLength: 2, maxLength: 50 },
        email: RULES.EMAIL,
        username: RULES.USERNAME
    },

    PASSWORD_CHANGE: {
        currentPassword: RULES.PASSWORD,
        newPassword: RULES.PASSWORD,
        confirmPassword: {
            required: true,
            custom: (value: string, formData?: any) => {
                if (formData && value !== formData.newPassword) {
                    return "Passwords do not match"
                }
                return null
            }
        }
    },

    COURSE: {
        courseCode: RULES.COURSE_CODE,
        courseName: RULES.COURSE_NAME
    },

    LEARNING_STRATEGY: {
        name: RULES.STRATEGY_NAME,
        description: RULES.DESCRIPTION
    },

    CARD: {
        courseCode: RULES.COURSE_CODE,
        courseName: RULES.COURSE_NAME,
        material: { required: true, minLength: 2, maxLength: 200 }
    },

    GRADE: {
        grade: RULES.GRADE
    },

    LINK: {
        url: RULES.URL
    }
}

// Utility function to get field error
export function getFieldError(fieldName: string, errors: string[]): string | null {
    const fieldError = errors.find(error => error.startsWith(`${fieldName}:`))
    return fieldError ? fieldError.replace(`${fieldName}: `, '') : null
}

// Utility function to validate on blur
export function validateOnBlur(value: any, rules: ValidationRule): string | null {
    const validation = validateField(value, rules)
    return validation.isValid ? null : validation.errors[0]
}

// Utility function to validate on change (for real-time validation)
export function validateOnChange(value: any, rules: ValidationRule): string | null {
    // Skip required validation on change for better UX
    const changeRules = { ...rules, required: false }
    const validation = validateField(value, changeRules)
    return validation.isValid ? null : validation.errors[0]
} 