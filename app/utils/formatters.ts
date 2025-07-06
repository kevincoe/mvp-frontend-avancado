// Utilitários para formatação e validação

/**
 * Formatadores de valores
 */
export const formatters = {
    /**
     * Formata valor monetário em BRL
     */
    currency: (value: number): string => {
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL',
        }).format(value);
    },

    /**
     * Formata número com separadores de milhares
     */
    number: (value: number): string => {
        return new Intl.NumberFormat('pt-BR').format(value);
    },

    /**
     * Formata data no formato brasileiro
     */
    date: (date: Date | string): string => {
        const dateObj = typeof date === 'string' ? new Date(date) : date;
        return new Intl.DateTimeFormat('pt-BR').format(dateObj);
    },

    /**
     * Formata data e hora no formato brasileiro
     */
    dateTime: (date: Date | string): string => {
        const dateObj = typeof date === 'string' ? new Date(date) : date;
        return new Intl.DateTimeFormat('pt-BR', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
        }).format(dateObj);
    },

    /**
     * Formata CPF
     */
    cpf: (cpf: string): string => {
        const cleaned = cpf.replace(/\D/g, '');
        const match = cleaned.match(/(\d{3})(\d{3})(\d{3})(\d{2})/);
        if (match) {
            return `${match[1]}.${match[2]}.${match[3]}-${match[4]}`;
        }
        return cpf;
    },

    /**
     * Formata telefone brasileiro
     */
    phone: (phone: string): string => {
        const cleaned = phone.replace(/\D/g, '');
        if (cleaned.length === 11) {
            const match = cleaned.match(/(\d{2})(\d{5})(\d{4})/);
            if (match) {
                return `(${match[1]}) ${match[2]}-${match[3]}`;
            }
        } else if (cleaned.length === 10) {
            const match = cleaned.match(/(\d{2})(\d{4})(\d{4})/);
            if (match) {
                return `(${match[1]}) ${match[2]}-${match[3]}`;
            }
        }
        return phone;
    },

    /**
     * Formata porcentagem
     */
    percentage: (value: number): string => {
        return new Intl.NumberFormat('pt-BR', {
            style: 'percent',
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        }).format(value / 100);
    },

    /**
     * Formata número de conta bancária
     */
    accountNumber: (accountNumber: string): string => {
        const cleaned = accountNumber.replace(/\D/g, '');
        if (cleaned.length >= 6) {
            return cleaned.replace(/(\d{4})(\d{1})(\d+)/, '$1-$2-$3');
        }
        return accountNumber;
    },
};

/**
 * Validadores
 */
export const validators = {
    /**
     * Valida CPF
     */
    cpf: (cpf: string): boolean => {
        const cleaned = cpf.replace(/\D/g, '');

        if (cleaned.length !== 11) return false;

        // Verifica se todos os dígitos são iguais
        if (/^(\d)\1+$/.test(cleaned)) return false;

        // Validação do primeiro dígito verificador
        let sum = 0;
        for (let i = 0; i < 9; i++) {
            sum += parseInt(cleaned[i]) * (10 - i);
        }
        let remainder = sum % 11;
        const firstDigit = remainder < 2 ? 0 : 11 - remainder;

        if (parseInt(cleaned[9]) !== firstDigit) return false;

        // Validação do segundo dígito verificador
        sum = 0;
        for (let i = 0; i < 10; i++) {
            sum += parseInt(cleaned[i]) * (11 - i);
        }
        remainder = sum % 11;
        const secondDigit = remainder < 2 ? 0 : 11 - remainder;

        return parseInt(cleaned[10]) === secondDigit;
    },

    /**
     * Valida e-mail
     */
    email: (email: string): boolean => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    },

    /**
     * Valida telefone brasileiro
     */
    phone: (phone: string): boolean => {
        const cleaned = phone.replace(/\D/g, '');
        return cleaned.length === 10 || cleaned.length === 11;
    },

    /**
     * Valida se o valor é um número positivo
     */
    positiveNumber: (value: number | string): boolean => {
        const num = typeof value === 'string' ? parseFloat(value) : value;
        return !isNaN(num) && num > 0;
    },

    /**
     * Valida se o valor não é vazio
     */
    required: (value: any): boolean => {
        if (value === null || value === undefined) return false;
        if (typeof value === 'string') return value.trim().length > 0;
        if (Array.isArray(value)) return value.length > 0;
        return true;
    },

    /**
     * Valida comprimento mínimo
     */
    minLength: (value: string, length: number): boolean => {
        return value.length >= length;
    },

    /**
     * Valida comprimento máximo
     */
    maxLength: (value: string, length: number): boolean => {
        return value.length <= length;
    },
};

/**
 * Utilitários gerais
 */
export const utils = {
    /**
     * Gera um ID único
     */
    generateId: (): string => {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    },

    /**
     * Calcula a diferença em porcentagem entre dois valores
     */
    calculatePercentageChange: (current: number, previous: number): number => {
        if (previous === 0) return 0;
        return ((current - previous) / previous) * 100;
    },

    /**
     * Debounce para otimizar chamadas de função
     */
    debounce: <T extends (...args: any[]) => void>(
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
     * Ordena array de objetos por uma propriedade
     */
    sortBy: <T>(array: T[], key: keyof T, direction: 'asc' | 'desc' = 'asc'): T[] => {
        return [...array].sort((a, b) => {
            const aValue = a[key];
            const bValue = b[key];

            if (aValue < bValue) return direction === 'asc' ? -1 : 1;
            if (aValue > bValue) return direction === 'asc' ? 1 : -1;
            return 0;
        });
    },

    /**
     * Filtra array por texto de busca
     */
    filterBySearch: <T>(
        array: T[],
        searchTerm: string,
        searchFields: (keyof T)[]
    ): T[] => {
        if (!searchTerm) return array;

        const lowerSearchTerm = searchTerm.toLowerCase();
        return array.filter(item =>
            searchFields.some(field => {
                const value = item[field];
                return value && value.toString().toLowerCase().includes(lowerSearchTerm);
            })
        );
    },

    /**
     * Converte string para formato de busca (sem acentos, minúsculo)
     */
    normalizeString: (str: string): string => {
        return str
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .toLowerCase();
    },

    /**
     * Copia texto para a área de transferência
     */
    copyToClipboard: async (text: string): Promise<boolean> => {
        try {
            await navigator.clipboard.writeText(text);
            return true;
        } catch (err) {
            console.error('Falha ao copiar texto:', err);
            return false;
        }
    },

    /**
     * Converte valor para número seguro
     */
    safeNumber: (value: any): number => {
        const num = typeof value === 'string' ? parseFloat(value) : value;
        return isNaN(num) ? 0 : num;
    },

    /**
     * Trunca texto com reticências
     */
    truncateText: (text: string, maxLength: number): string => {
        if (text.length <= maxLength) return text;
        return text.substring(0, maxLength) + '...';
    },

    /**
     * Converte objeto para query string
     */
    objectToQueryString: (obj: Record<string, any>): string => {
        const params = new URLSearchParams();
        Object.entries(obj).forEach(([key, value]) => {
            if (value !== null && value !== undefined && value !== '') {
                params.append(key, value.toString());
            }
        });
        return params.toString();
    },

    /**
     * Verifica se o dispositivo é mobile
     */
    isMobile: (): boolean => {
        return window.innerWidth < 768;
    },

    /**
     * Formata bytes para formato legível
     */
    formatBytes: (bytes: number): string => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    },
};

/**
 * Constantes do sistema
 */
export const constants = {
    ACCOUNT_TYPES: {
        SAVINGS: 'Poupança',
        CHECKING: 'Conta Corrente',
        BUSINESS: 'Conta Empresarial',
    },

    INVESTMENT_TYPES: {
        STOCK: 'Ações',
        FUND: 'Fundos',
        BOND: 'Títulos',
        CRYPTO: 'Criptomoedas',
    },

    ACCOUNT_STATUS: {
        ACTIVE: 'Ativa',
        INACTIVE: 'Inativa',
        BLOCKED: 'Bloqueada',
    },

    STORAGE_KEYS: {
        ACCOUNTS: 'banking_accounts',
        INVESTMENTS: 'banking_investments',
        SETTINGS: 'banking_settings',
    },

    API_ENDPOINTS: {
        YAHOO_FINANCE: 'https://query1.finance.yahoo.com/v8/finance/chart',
        ALPHA_VANTAGE: 'https://www.alphavantage.co/query',
    },

    REGEX_PATTERNS: {
        CPF: /^\d{3}\.\d{3}\.\d{3}-\d{2}$/,
        PHONE: /^\(\d{2}\) \d{4,5}-\d{4}$/,
        EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    },

    CHART_COLORS: {
        PRIMARY: '#1976d2',
        SECONDARY: '#dc004e',
        SUCCESS: '#2e7d32',
        ERROR: '#d32f2f',
        WARNING: '#ed6c02',
        INFO: '#0288d1',
    },

    DEFAULT_PAGINATION: {
        PAGE_SIZE: 10,
        PAGE_SIZE_OPTIONS: [5, 10, 25, 50],
    },
};
