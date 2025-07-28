/**
 * Validation Service - Domain Validation Layer
 * Implements comprehensive validation following Brazilian standards
 */

export interface ValidationRule<T = any> {
    required?: boolean;
    min?: number;
    max?: number;
    pattern?: RegExp;
    custom?: (value: T) => string | null;
}

export interface ValidationSchema {
    [key: string]: ValidationRule;
}

export class ValidationService {
    /**
     * Validates a single field against its rule
     */
    static validateField<T>(
        value: T,
        fieldName: string,
        rules: ValidationRule<T>
    ): string | null {
        // Required validation
        if (rules.required && (!value || (typeof value === 'string' && !value.trim()))) {
            return `${fieldName} é obrigatório`;
        }

        // Skip other validations if value is empty and not required
        if (!value && !rules.required) {
            return null;
        }

        // Pattern validation
        if (typeof value === 'string' && value && rules.pattern && !rules.pattern.test(value)) {
            return `${fieldName} possui formato inválido`;
        }

        // Numeric validations
        if (typeof value === 'number') {
            if (rules.min !== undefined && value < rules.min) {
                return `${fieldName} deve ser maior ou igual a ${rules.min}`;
            }
            if (rules.max !== undefined && value > rules.max) {
                return `${fieldName} deve ser menor ou igual a ${rules.max}`;
            }
        }

        // String length validations
        if (typeof value === 'string' && value) {
            if (rules.min !== undefined && value.length < rules.min) {
                return `${fieldName} deve ter pelo menos ${rules.min} caracteres`;
            }
            if (rules.max !== undefined && value.length > rules.max) {
                return `${fieldName} deve ter no máximo ${rules.max} caracteres`;
            }
        }

        // Custom validation
        if (rules.custom) {
            return rules.custom(value);
        }

        return null;
    }

    /**
     * Validates an object against a schema
     */
    static validateSchema<T extends Record<string, any>>(
        data: T,
        schema: ValidationSchema
    ): Partial<Record<keyof T, string>> {
        const errors: Partial<Record<keyof T, string>> = {};

        Object.keys(schema).forEach((fieldName) => {
            const rule = schema[fieldName];
            const value = data[fieldName as keyof T];
            const error = this.validateField(value, fieldName, rule);

            if (error) {
                (errors as any)[fieldName] = error;
            }
        });

        return errors;
    }

    /**
     * Brazilian CPF validation algorithm
     */
    static validateCPF(cpf: string): boolean {
        if (!cpf) return false;

        const cleanCpf = cpf.replace(/\D/g, '');

        // Check length
        if (cleanCpf.length !== 11) return false;

        // Check for known invalid patterns
        if (/^(\d)\1{10}$/.test(cleanCpf)) return false;

        // Validate using CPF algorithm
        let sum = 0;
        let remainder;

        // First digit verification
        for (let i = 1; i <= 9; i++) {
            sum += parseInt(cleanCpf.substring(i - 1, i)) * (11 - i);
        }

        remainder = (sum * 10) % 11;
        if (remainder === 10 || remainder === 11) remainder = 0;
        if (remainder !== parseInt(cleanCpf.substring(9, 10))) return false;

        // Second digit verification
        sum = 0;
        for (let i = 1; i <= 10; i++) {
            sum += parseInt(cleanCpf.substring(i - 1, i)) * (12 - i);
        }

        remainder = (sum * 10) % 11;
        if (remainder === 10 || remainder === 11) remainder = 0;
        if (remainder !== parseInt(cleanCpf.substring(10, 11))) return false;

        return true;
    }

    /**
     * Brazilian CNPJ validation algorithm
     */
    static validateCNPJ(cnpj: string): boolean {
        if (!cnpj) return false;

        const cleanCnpj = cnpj.replace(/\D/g, '');

        if (cleanCnpj.length !== 14) return false;
        if (/^(\d)\1{13}$/.test(cleanCnpj)) return false;

        // CNPJ validation algorithm
        let sum = 0;
        let remainder;
        const weights1 = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
        const weights2 = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];

        // First digit
        for (let i = 0; i < 12; i++) {
            sum += parseInt(cleanCnpj[i]) * weights1[i];
        }
        remainder = sum % 11;
        const digit1 = remainder < 2 ? 0 : 11 - remainder;

        if (digit1 !== parseInt(cleanCnpj[12])) return false;

        // Second digit
        sum = 0;
        for (let i = 0; i < 13; i++) {
            sum += parseInt(cleanCnpj[i]) * weights2[i];
        }
        remainder = sum % 11;
        const digit2 = remainder < 2 ? 0 : 11 - remainder;

        return digit2 === parseInt(cleanCnpj[13]);
    }

    /**
     * Email validation
     */
    static validateEmail(email: string): boolean {
        const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        return emailRegex.test(email);
    }

    /**
     * Phone validation (Brazilian format)
     */
    static validatePhone(phone: string): boolean {
        const cleanPhone = phone.replace(/\D/g, '');
        return cleanPhone.length >= 10 && cleanPhone.length <= 11;
    }

    /**
     * Password strength validation
     */
    static validatePassword(password: string): { isValid: boolean; messages: string[] } {
        const messages: string[] = [];

        if (password.length < 8) {
            messages.push('Senha deve ter pelo menos 8 caracteres');
        }

        if (!/[A-Z]/.test(password)) {
            messages.push('Senha deve conter pelo menos uma letra maiúscula');
        }

        if (!/[a-z]/.test(password)) {
            messages.push('Senha deve conter pelo menos uma letra minúscula');
        }

        if (!/\d/.test(password)) {
            messages.push('Senha deve conter pelo menos um número');
        }

        if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
            messages.push('Senha deve conter pelo menos um caractere especial');
        }

        return {
            isValid: messages.length === 0,
            messages
        };
    }

    /**
     * Account validation schema
     */
    static accountSchema: ValidationSchema = {
        customerName: {
            required: true,
            min: 2,
            max: 100,
            custom: (value: string) => {
                if (value && !/^[a-zA-ZÀ-ÿ\s]+$/.test(value.trim())) {
                    return 'Nome deve conter apenas letras e espaços';
                }
                return null;
            }
        },
        customerCpf: {
            required: true,
            custom: (value: string) => {
                if (!value) return null;

                if (!ValidationService.validateCPF(value)) {
                    return 'CPF inválido. Verifique os números digitados.';
                }
                return null;
            }
        },
        customerEmail: {
            required: true,
            custom: (value: string) => {
                if (!value) return null;

                if (!ValidationService.validateEmail(value)) {
                    return 'E-mail deve ter um formato válido (exemplo@dominio.com)';
                }
                return null;
            }
        },
        customerPhone: {
            required: true,
            custom: (value: string) => {
                if (!value) return null;

                if (!ValidationService.validatePhone(value)) {
                    return 'Telefone deve ter 10 ou 11 dígitos';
                }
                return null;
            }
        },
        accountType: {
            required: true,
            custom: (value: string) => {
                const validTypes = ['SAVINGS', 'CHECKING', 'BUSINESS'];
                if (value && !validTypes.includes(value)) {
                    return 'Tipo de conta inválido';
                }
                return null;
            }
        },
        balance: {
            required: true,
            min: 0,
            custom: (value: number) => {
                if (typeof value !== 'number' || isNaN(value)) {
                    return 'Saldo deve ser um número válido';
                }
                if (value < 0) {
                    return 'Saldo não pode ser negativo';
                }
                return null;
            }
        }
    };

    /**
     * Business account validation schema
     */
    static businessAccountSchema: ValidationSchema = {
        ...ValidationService.accountSchema,
        businessName: {
            required: true,
            min: 3,
            max: 100,
            custom: (value: string) => {
                if (!value || value.trim().length < 3) {
                    return 'Razão social deve ter pelo menos 3 caracteres';
                }
                if (value.trim().length > 100) {
                    return 'Razão social deve ter no máximo 100 caracteres';
                }
                if (!/^[a-zA-ZÀ-ÿ0-9\s&.-]+$/.test(value.trim())) {
                    return 'Razão social contém caracteres inválidos';
                }
                return null;
            }
        },
        businessCnpj: {
            required: true,
            custom: (value: string) => {
                if (!value) return 'CNPJ é obrigatório para contas empresariais';

                if (!ValidationService.validateCNPJ(value)) {
                    return 'CNPJ inválido. Verifique os números digitados.';
                }
                return null;
            }
        }
    };

    /**
     * Investment validation schema
     */
    static investmentSchema: ValidationSchema = {
        symbol: {
            required: true,
            min: 1,
            max: 10,
            custom: (value: string) => {
                if (value && !/^[A-Z0-9]+$/.test(value)) {
                    return 'Símbolo deve conter apenas letras maiúsculas e números';
                }
                return null;
            }
        },
        name: {
            required: true,
            min: 2,
            max: 100
        },
        type: {
            required: true,
            custom: (value: string) => {
                const validTypes = ['STOCK', 'BOND', 'FUND', 'CRYPTO'];
                if (value && !validTypes.includes(value)) {
                    return 'Tipo de investimento inválido';
                }
                return null;
            }
        },
        quantity: {
            required: true,
            min: 0.001,
            custom: (value: number) => {
                if (typeof value !== 'number' || isNaN(value)) {
                    return 'Quantidade deve ser um número válido';
                }
                if (value <= 0) {
                    return 'Quantidade deve ser maior que zero';
                }
                return null;
            }
        },
        purchasePrice: {
            required: true,
            min: 0.01,
            custom: (value: number) => {
                if (typeof value !== 'number' || isNaN(value)) {
                    return 'Preço deve ser um número válido';
                }
                if (value <= 0) {
                    return 'Preço deve ser maior que zero';
                }
                return null;
            }
        }
    };
}