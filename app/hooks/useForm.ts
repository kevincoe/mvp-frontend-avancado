import { useState, useCallback } from 'react';
import { ValidationService, type ValidationSchema } from '../services/validation';

interface UseFormOptions<T> {
    initialValues: T;
    validationSchema?: ValidationSchema;
    onSubmit?: (values: T) => Promise<void> | void;
}

interface UseFormReturn<T> {
    values: T;
    errors: Partial<Record<keyof T, string>>;
    isSubmitting: boolean;
    handleChange: (field: keyof T, value: any) => void;
    handleSubmit: (e: React.FormEvent) => Promise<void>;
    setFieldError: (field: keyof T, error: string) => void;
    clearErrors: () => void;
    resetForm: () => void;
    validateField: (field: keyof T) => boolean;
    validateForm: () => boolean;
}

export function useForm<T extends Record<string, any>>({
    initialValues,
    validationSchema,
    onSubmit
}: UseFormOptions<T>): UseFormReturn<T> {
    const [values, setValues] = useState<T>(initialValues);
    const [errors, setErrors] = useState<Partial<Record<keyof T, string>>>({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleChange = useCallback((field: keyof T, value: any) => {
        setValues(prev => ({ ...prev, [field]: value }));

        // Clear field error on change
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: undefined }));
        }
    }, [errors]);

    const validateField = useCallback((field: keyof T): boolean => {
        if (!validationSchema || !validationSchema[field as string]) return true;

        const rule = validationSchema[field as string];
        const error = ValidationService.validateField(values[field], field as string, rule);

        if (error) {
            setErrors(prev => ({ ...prev, [field]: error }));
            return false;
        }

        setErrors(prev => ({ ...prev, [field]: undefined }));
        return true;
    }, [values, validationSchema]);

    const validateForm = useCallback((): boolean => {
        if (!validationSchema) return true;

        const validationErrors = ValidationService.validateSchema(values, validationSchema);
        setErrors(validationErrors);

        return Object.keys(validationErrors).length === 0;
    }, [values, validationSchema]);

    const handleSubmit = useCallback(async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) return;

        if (onSubmit) {
            try {
                setIsSubmitting(true);
                await onSubmit(values);
            } catch (error) {
                console.error('Form submission error:', error);
            } finally {
                setIsSubmitting(false);
            }
        }
    }, [values, validateForm, onSubmit]);

    const setFieldError = useCallback((field: keyof T, error: string) => {
        setErrors(prev => ({ ...prev, [field]: error }));
    }, []);

    const clearErrors = useCallback(() => {
        setErrors({});
    }, []);

    const resetForm = useCallback(() => {
        setValues(initialValues);
        setErrors({});
    }, [initialValues]);

    return {
        values,
        errors,
        isSubmitting,
        handleChange,
        handleSubmit,
        setFieldError,
        clearErrors,
        resetForm,
        validateField,
        validateForm
    };
}