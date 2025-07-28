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
    static validateField<T>(
        value: T,
        fieldName: string,
        rules: ValidationRule<T>
    ): string | null {
        if (rules.required && (!value || (typeof value === 'string' && !value.trim()))) {
            return `${fieldName} é obrigatório`;
        }

        if (typeof value === 'string' && value && rules.pattern && !rules.pattern.test(value)) {
            return `${fieldName} possui formato inválido`;
        }

        if (typeof value === 'number' && rules.min && value < rules.min) {
            return `${fieldName} deve ser maior que ${rules.min}`;
        }

        if (typeof value === 'number' && rules.max && value > rules.max) {
            return `${fieldName} deve ser menor que ${rules.max}`;
        }

        if (rules.custom) {
            return rules.custom(value);
        }

        return null;
    }

    static validateSchema<T extends Record<string, any>>(
        data: T,
        schema: ValidationSchema
    ): Partial<Record<keyof T, string>> {
        const errors: Partial<Record<keyof T, string>> = {};

        Object.keys(schema).forEach((fieldName) => {
            const rule = schema[fieldName];
            const value = data[fieldName];
            const error = this.validateField(value, fieldName, rule);

            if (error) {
                (errors as any)[fieldName] = error;
            }
        });

        return errors;
    }

    // Enhanced CPF validation following Brazilian standards
    static validateCPF(cpf: string): boolean {
        if (!cpf) return false;

        // Remove all non-digits
        const cleanCpf = cpf.replace(/\D/g, '');

        // Check if it has 11 digits
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

    // Investment-specific validations
    static investmentSchema: ValidationSchema = {
        symbol: {
            required: true,
            pattern: /^[A-Z]{1,5}$/,
            custom: (value: string) => {
                if (value && value.length > 5) {
                    return 'Símbolo deve ter no máximo 5 caracteres';
                }
                return null;
            }
        },
        name: { required: true },
        type: { required: true },
        quantity: {
            required: true,
            min: 0.001,
            custom: (value: number) => {
                if (value && value <= 0) {
                    return 'Quantidade deve ser maior que zero';
                }
                return null;
            }
        },
        purchasePrice: {
            required: true,
            min: 0.01,
            custom: (value: number) => {
                if (value && value <= 0) {
                    return 'Preço deve ser maior que zero';
                }
                return null;
            }
        }
    };

    // Account-specific validations with enhanced CPF/CNPJ support
    static accountSchema: ValidationSchema = {
        customerName: {
            required: true,
            custom: (value: string) => {
                if (value && value.trim().length < 2) {
                    return 'Nome deve ter pelo menos 2 caracteres';
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
            pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
            custom: (value: string) => {
                if (value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
                    return 'E-mail deve ter um formato válido (exemplo@dominio.com)';
                }
                return null;
            }
        },
        customerPhone: {
            required: true,
            custom: (value: string) => {
                if (!value) return null;
                const cleanPhone = value.replace(/\D/g, '');
                if (cleanPhone.length < 10 || cleanPhone.length > 11) {
                    return 'Telefone deve ter 10 ou 11 dígitos';
                }
                return null;
            }
        },
        accountType: { required: true },
        balance: {
            required: true,
            min: 0,
            custom: (value: number) => {
                if (value < 0) {
                    return 'Saldo não pode ser negativo';
                }
                return null;
            }
        }
    };

    // Business account schema with CNPJ validation
    static businessAccountSchema: ValidationSchema = {
        ...ValidationService.accountSchema,
        businessCnpj: {
            required: true,
            custom: (value: string) => {
                if (!value) return null;

                if (!ValidationService.validateCNPJ(value)) {
                    return 'CNPJ inválido. Verifique os números digitados.';
                }
                return null;
            }
        },
        businessName: {
            required: true,
            custom: (value: string) => {
                if (value && value.trim().length < 3) {
                    return 'Razão social deve ter pelo menos 3 caracteres';
                }
                return null;
            }
        }
    };
    // Business account schema with enhanced validation
    static businessAccountSchema: ValidationSchema = {
        ...ValidationService.accountSchema,
        businessName: {
            required: true,
            custom: (value: string) => {
                if (!value || value.trim().length < 3) {
                    return 'Razão social deve ter pelo menos 3 caracteres';
                }
                if (value.trim().length > 100) {
                    return 'Razão social deve ter no máximo 100 caracteres';
                }
                return null;
            }
        },
        businessCnpj: {
            required: true,
            custom: (value: string) => {
                if (!value) return 'CNPJ é obrigatório';

                if (!ValidationService.validateCNPJ(value)) {
                    return 'CNPJ inválido. Verifique os números digitados.';
                }
                return null;
            }
        }
    };

    // Complete the CNPJ validation method
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
}