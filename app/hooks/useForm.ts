import { useState, useCallback, useRef, useEffect } from 'react';
import { ValidationService, type ValidationSchema } from '../services/validation';

interface UseFormOptions<T> {
    initialValues: T;
    validationSchema?: ValidationSchema;
    onSubmit?: (values: T) => Promise<void> | void;
    validateOnChange?: boolean;
    validateOnBlur?: boolean;
}

interface UseFormReturn<T> {
    values: T;
    errors: Partial<Record<keyof T, string>>;
    touched: Partial<Record<keyof T, boolean>>;
    isSubmitting: boolean;
    isValid: boolean;
    isDirty: boolean;
    handleChange: <K extends keyof T>(field: K, value: T[K]) => void;
    handleBlur: (field: keyof T) => void;
    handleSubmit: (e: React.FormEvent) => Promise<void>;
    setFieldValue: <K extends keyof T>(field: K, value: T[K]) => void;
    setFieldError: (field: keyof T, error: string) => void;
    setFieldTouched: (field: keyof T, touched?: boolean) => void;
    clearErrors: () => void;
    clearField: (field: keyof T) => void;
    resetForm: (newValues?: Partial<T>) => void;
    validateField: (field: keyof T) => boolean;
    validateForm: () => boolean;
    getFieldProps: (field: keyof T) => {
        value: T[keyof T];
        onChange: (value: any) => void;
        onBlur: () => void;
        error: boolean;
        helperText?: string;
    };
}

/**
 * Enhanced useForm hook with comprehensive validation and error handling
 * Follows best practices for form state management
 */
export function useForm<T extends Record<string, any>>({
    initialValues,
    validationSchema,
    onSubmit,
    validateOnChange = false,
    validateOnBlur = true
}: UseFormOptions<T>): UseFormReturn<T> {
    const [values, setValues] = useState<T>(initialValues);
    const [errors, setErrors] = useState<Partial<Record<keyof T, string>>>({});
    const [touched, setTouched] = useState<Partial<Record<keyof T, boolean>>>({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    const initialValuesRef = useRef(initialValues);
    const debounceTimersRef = useRef<Record<string, NodeJS.Timeout>>({});

    // Update initial values reference when prop changes
    useEffect(() => {
        initialValuesRef.current = initialValues;
    }, [initialValues]);

    // Computed properties
    const isDirty = Object.keys(values).some(
        key => values[key as keyof T] !== initialValuesRef.current[key as keyof T]
    );

    const isValid = Object.keys(errors).length === 0;

    /**
     * Handles field value changes
     */
    const handleChange = useCallback(<K extends keyof T>(field: K, value: T[K]) => {
        setValues(prev => ({ ...prev, [field]: value }));

        // Clear field error when value changes
        if (errors[field]) {
            setErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors[field];
                return newErrors;
            });
        }

        // Validate on change if enabled
        if (validateOnChange && validationSchema && validationSchema[field as string]) {
            // Clear existing debounce timer
            if (debounceTimersRef.current[field as string]) {
                clearTimeout(debounceTimersRef.current[field as string]);
            }

            // Set new debounce timer for validation
            debounceTimersRef.current[field as string] = setTimeout(() => {
                validateField(field);
            }, 300);
        }
    }, [errors, validateOnChange, validationSchema]);

    /**
     * Handles field blur events
     */
    const handleBlur = useCallback((field: keyof T) => {
        setTouched(prev => ({ ...prev, [field]: true }));

        if (validateOnBlur) {
            validateField(field);
        }
    }, [validateOnBlur]);

    /**
     * Validates a single field
     */
    const validateField = useCallback((field: keyof T): boolean => {
        if (!validationSchema || !validationSchema[field as string]) return true;

        const rule = validationSchema[field as string];
        const error = ValidationService.validateField(values[field], field as string, rule);

        if (error) {
            setErrors(prev => ({ ...prev, [field]: error }));
            return false;
        } else {
            setErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors[field];
                return newErrors;
            });
            return true;
        }
    }, [values, validationSchema]);

    /**
     * Validates entire form
     */
    const validateForm = useCallback((): boolean => {
        if (!validationSchema) return true;

        const validationErrors = ValidationService.validateSchema(values, validationSchema);
        setErrors(validationErrors);

        return Object.keys(validationErrors).length === 0;
    }, [values, validationSchema]);

    /**
     * Handles form submission
     */
    const handleSubmit = useCallback(async (e: React.FormEvent) => {
        e.preventDefault();

        // Mark all fields as touched
        const allTouched = Object.keys(values).reduce((acc, key) => {
            acc[key as keyof T] = true;
            return acc;
        }, {} as Partial<Record<keyof T, boolean>>);
        setTouched(allTouched);

        if (!validateForm()) {
            console.warn('Form validation failed:', errors);
            return;
        }

        if (onSubmit) {
            try {
                setIsSubmitting(true);
                await onSubmit(values);
            } catch (error) {
                console.error('Form submission error:', error);
                throw error; // Re-throw to allow component to handle
            } finally {
                setIsSubmitting(false);
            }
        }
    }, [values, validateForm, onSubmit, errors]);

    /**
     * Sets field value directly
     */
    const setFieldValue = useCallback(<K extends keyof T>(field: K, value: T[K]) => {
        setValues(prev => ({ ...prev, [field]: value }));
    }, []);

    /**
     * Sets field error directly
     */
    const setFieldError = useCallback((field: keyof T, error: string) => {
        setErrors(prev => ({ ...prev, [field]: error }));
    }, []);

    /**
     * Sets field touched state
     */
    const setFieldTouched = useCallback((field: keyof T, touchedValue: boolean = true) => {
        setTouched(prev => ({ ...prev, [field]: touchedValue }));
    }, []);

    /**
     * Clears all errors
     */
    const clearErrors = useCallback(() => {
        setErrors({});
    }, []);

    /**
     * Clears specific field
     */
    const clearField = useCallback((field: keyof T) => {
        setValues(prev => ({ ...prev, [field]: initialValuesRef.current[field] }));
        setErrors(prev => {
            const newErrors = { ...prev };
            delete newErrors[field];
            return newErrors;
        });
        setTouched(prev => {
            const newTouched = { ...prev };
            delete newTouched[field];
            return newTouched;
        });
    }, []);

    /**
     * Resets form to initial state
     */
    const resetForm = useCallback((newValues?: Partial<T>) => {
        const resetValues = newValues ? { ...initialValuesRef.current, ...newValues } : initialValuesRef.current;
        setValues(resetValues as T);
        setErrors({});
        setTouched({});
        setIsSubmitting(false);

        // Clear debounce timers
        Object.values(debounceTimersRef.current).forEach(clearTimeout);
        debounceTimersRef.current = {};
    }, []);

    /**
     * Gets field props for easy integration with form libraries
     */
    const getFieldProps = useCallback((field: keyof T) => ({
        value: values[field],
        onChange: (value: any) => handleChange(field, value),
        onBlur: () => handleBlur(field),
        error: !!(touched[field] && errors[field]),
        helperText: touched[field] ? errors[field] : undefined
    }), [values, touched, errors, handleChange, handleBlur]);

    // Cleanup debounce timers on unmount
    useEffect(() => {
        return () => {
            Object.values(debounceTimersRef.current).forEach(clearTimeout);
        };
    }, []);

    return {
        values,
        errors,
        touched,
        isSubmitting,
        isValid,
        isDirty,
        handleChange,
        handleBlur,
        handleSubmit,
        setFieldValue,
        setFieldError,
        setFieldTouched,
        clearErrors,
        clearField,
        resetForm,
        validateField,
        validateForm,
        getFieldProps
    };
}