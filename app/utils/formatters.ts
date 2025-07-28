/**
 * Comprehensive formatters utility following Brazilian standards
 * Provides secure and consistent data formatting
 */

export const formatters = {
    /**
     * Currency formatting (Brazilian Real)
     */
    currency: (value: number): string => {
        if (typeof value !== 'number' || isNaN(value)) return 'R$ 0,00';

        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL',
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }).format(value);
    },

    /**
     * Percentage formatting
     */
    percentage: (value: number, decimals: number = 2): string => {
        if (typeof value !== 'number' || isNaN(value)) return '0,00%';

        return new Intl.NumberFormat('pt-BR', {
            style: 'percent',
            minimumFractionDigits: decimals,
            maximumFractionDigits: decimals
        }).format(value / 100);
    },

    /**
     * Number formatting
     */
    number: (value: number, decimals?: number): string => {
        if (typeof value !== 'number' || isNaN(value)) return '0';

        return new Intl.NumberFormat('pt-BR', {
            minimumFractionDigits: decimals,
            maximumFractionDigits: decimals
        }).format(value);
    },

    /**
     * CPF formatting (000.000.000-00)
     */
    cpf: (value: string): string => {
        if (!value) return '';
        const digits = value.replace(/\D/g, '');

        if (digits.length <= 11) {
            return digits.replace(/^(\d{3})(\d{3})(\d{3})(\d{2}).*/, '$1.$2.$3-$4');
        }

        return value; // Return original if too long
    },

    /**
     * CNPJ formatting (00.000.000/0000-00)
     */
    cnpj: (value: string): string => {
        if (!value) return '';
        const digits = value.replace(/\D/g, '');

        if (digits.length <= 14) {
            return digits.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2}).*/, '$1.$2.$3/$4-$5');
        }

        return value; // Return original if too long
    },

    /**
     * Phone formatting (Brazilian format)
     */
    phone: (value: string): string => {
        if (!value) return '';
        const digits = value.replace(/\D/g, '');

        if (digits.length <= 10) {
            // Fixed line: (11) 1234-5678
            return digits.replace(/^(\d{2})(\d{4})(\d{4}).*/, '($1) $2-$3');
        } else if (digits.length <= 11) {
            // Mobile: (11) 91234-5678
            return digits.replace(/^(\d{2})(\d{5})(\d{4}).*/, '($1) $2-$3');
        }

        return value; // Return original if too long
    },

    /**
     * Date formatting (Brazilian format)
     */
    date: (date: Date | string | null): string => {
        if (!date) return '';

        try {
            const dateObj = typeof date === 'string' ? new Date(date) : date;

            if (isNaN(dateObj.getTime())) return '';

            return new Intl.DateTimeFormat('pt-BR', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit'
            }).format(dateObj);
        } catch {
            return '';
        }
    },

    /**
     * DateTime formatting (Brazilian format)
     */
    dateTime: (date: Date | string | null): string => {
        if (!date) return '';

        try {
            const dateObj = typeof date === 'string' ? new Date(date) : date;

            if (isNaN(dateObj.getTime())) return '';

            return new Intl.DateTimeFormat('pt-BR', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit',
                hour12: false
            }).format(dateObj);
        } catch {
            return '';
        }
    },

    /**
     * Time formatting
     */
    time: (date: Date | string | null): string => {
        if (!date) return '';

        try {
            const dateObj = typeof date === 'string' ? new Date(date) : date;

            if (isNaN(dateObj.getTime())) return '';

            return new Intl.DateTimeFormat('pt-BR', {
                hour: '2-digit',
                minute: '2-digit',
                hour12: false
            }).format(dateObj);
        } catch {
            return '';
        }
    },

    /**
     * Relative time formatting (e.g., "2 hours ago")
     */
    relativeTime: (date: Date | string): string => {
        if (!date) return '';

        try {
            const dateObj = typeof date === 'string' ? new Date(date) : date;
            const now = new Date();
            const diffInSeconds = Math.floor((now.getTime() - dateObj.getTime()) / 1000);

            if (diffInSeconds < 60) return 'agora mesmo';
            if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} min atrás`;
            if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} h atrás`;
            if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)} dias atrás`;

            return formatters.date(dateObj);
        } catch {
            return '';
        }
    },

    /**
     * Account number formatting
     */
    accountNumber: (value: string): string => {
        if (!value) return '';
        // Format: 12345678-9
        const clean = value.replace(/\D/g, '');
        return clean.replace(/^(\d{8})(\d{1}).*/, '$1-$2');
    },

    /**
     * File size formatting
     */
    fileSize: (bytes: number): string => {
        if (bytes === 0) return '0 Bytes';

        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));

        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }
};

/**
 * Utility functions for data manipulation
 */
export const utils = {
    /**
     * Debounce function for performance optimization
     */
    debounce: <T extends (...args: any[]) => any>(
        func: T,
        delay: number
    ): ((...args: Parameters<T>) => void) => {
        let timeoutId: NodeJS.Timeout;
        return (...args: Parameters<T>) => {
            clearTimeout(timeoutId);
            timeoutId = setTimeout(() => func(...args), delay);
        };
    },

    /**
     * Throttle function for rate limiting
     */
    throttle: <T extends (...args: any[]) => any>(
        func: T,
        delay: number
    ): ((...args: Parameters<T>) => void) => {
        let lastCall = 0;
        return (...args: Parameters<T>) => {
            const now = Date.now();
            if (now - lastCall >= delay) {
                lastCall = now;
                func(...args);
            }
        };
    },

    /**
     * Document cleaners (remove formatting)
     */
    cleanCPF: (cpf: string): string => cpf.replace(/\D/g, ''),
    cleanCNPJ: (cnpj: string): string => cnpj.replace(/\D/g, ''),
    cleanPhone: (phone: string): string => phone.replace(/\D/g, ''),
    cleanCurrency: (currency: string): number => {
        const cleaned = currency.replace(/[^\d,]/g, '').replace(',', '.');
        return parseFloat(cleaned) || 0;
    },

    /**
     * String utilities
     */
    capitalize: (str: string): string => {
        if (!str) return '';
        return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
    },

    capitalizeWords: (str: string): string => {
        if (!str) return '';
        return str.replace(/\w\S*/g, (txt) =>
            txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
        );
    },

    truncate: (str: string, length: number, suffix: string = '...'): string => {
        if (!str || str.length <= length) return str;
        return str.substring(0, length) + suffix;
    },

    removeAccents: (str: string): string => {
        return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    },

    /**
     * Array utilities
     */
    groupBy: <T>(array: T[], key: keyof T): Record<string, T[]> => {
        return array.reduce((groups, item) => {
            const group = String(item[key]);
            groups[group] = groups[group] || [];
            groups[group].push(item);
            return groups;
        }, {} as Record<string, T[]>);
    },

    /**
     * Object utilities
     */
    deepClone: <T>(obj: T): T => {
        if (obj === null || typeof obj !== 'object') return obj;
        if (obj instanceof Date) return new Date(obj.getTime()) as any;
        if (obj instanceof Array) return obj.map(item => utils.deepClone(item)) as any;

        const cloned = {} as T;
        for (const key in obj) {
            if (obj.hasOwnProperty(key)) {
                cloned[key] = utils.deepClone(obj[key]);
            }
        }
        return cloned;
    },

    /**
     * Validation helpers
     */
    isValidEmail: (email: string): boolean => {
        const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        return emailRegex.test(email);
    },

    isValidURL: (url: string): boolean => {
        try {
            new URL(url);
            return true;
        } catch {
            return false;
        }
    },

    /**
     * Security utilities
     */
    sanitizeHtml: (str: string): string => {
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    },

    escapeRegExp: (str: string): string => {
        return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }
};

/**
 * Validators for direct use
 */
export const validators = {
    cpf: (value: string): boolean => {
        const clean = utils.cleanCPF(value);
        if (clean.length !== 11) return false;
        if (/^(\d)\1{10}$/.test(clean)) return false;

        // CPF validation algorithm
        let sum = 0;
        for (let i = 1; i <= 9; i++) {
            sum += parseInt(clean.substring(i - 1, i)) * (11 - i);
        }

        let remainder = (sum * 10) % 11;
        if (remainder === 10 || remainder === 11) remainder = 0;
        if (remainder !== parseInt(clean.substring(9, 10))) return false;

        sum = 0;
        for (let i = 1; i <= 10; i++) {
            sum += parseInt(clean.substring(i - 1, i)) * (12 - i);
        }

        remainder = (sum * 10) % 11;
        if (remainder === 10 || remainder === 11) remainder = 0;

        return remainder === parseInt(clean.substring(10, 11));
    },

    cnpj: (value: string): boolean => {
        const clean = utils.cleanCNPJ(value);
        if (clean.length !== 14) return false;
        if (/^(\d)\1{13}$/.test(clean)) return false;

        // CNPJ validation algorithm
        let sum = 0;
        const weights1 = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
        const weights2 = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];

        for (let i = 0; i < 12; i++) {
            sum += parseInt(clean[i]) * weights1[i];
        }
        let remainder = sum % 11;
        const digit1 = remainder < 2 ? 0 : 11 - remainder;

        if (digit1 !== parseInt(clean[12])) return false;

        sum = 0;
        for (let i = 0; i < 13; i++) {
            sum += parseInt(clean[i]) * weights2[i];
        }
        remainder = sum % 11;
        const digit2 = remainder < 2 ? 0 : 11 - remainder;

        return digit2 === parseInt(clean[13]);
    },

    phone: (value: string): boolean => {
        const clean = utils.cleanPhone(value);
        return clean.length >= 10 && clean.length <= 11;
    },

    email: (value: string): boolean => utils.isValidEmail(value)
};