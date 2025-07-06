// Tipos para o sistema bancário
export interface BankAccount {
    id: string;
    accountNumber: string;
    customerName: string;
    customerCpf: string;
    customerEmail: string;
    customerPhone: string;
    accountType: 'SAVINGS' | 'CHECKING' | 'BUSINESS';
    balance: number;
    createdAt: Date;
    updatedAt: Date;
    status: 'ACTIVE' | 'INACTIVE' | 'BLOCKED';
}

export interface Investment {
    id: string;
    accountId: string;
    symbol: string;
    name: string;
    type: 'STOCK' | 'FUND' | 'BOND' | 'CRYPTO';
    quantity: number;
    purchasePrice: number;
    currentPrice: number;
    purchaseDate: Date;
    lastUpdate: Date;
}

export interface StockQuote {
    symbol: string;
    name: string;
    price: number;
    change: number;
    changePercent: number;
    currency: string;
    marketTime: Date;
}

export interface DollarQuote {
    price: number;
    change: number;
    changePercent: number;
    lastUpdate: Date;
}

export interface ApiResponse<T> {
    success: boolean;
    data?: T;
    error?: string;
}

export interface FormErrors {
    [key: string]: string;
}

export interface NavigationItem {
    label: string;
    path: string;
    icon: string;
}

export interface DashboardData {
    totalAccounts: number;
    totalBalance: number;
    totalInvestments: number;
    totalInvestmentValue: number;
    recentAccounts: BankAccount[];
    topInvestments: Investment[];
    dollarQuote: DollarQuote;
}

export interface AlertState {
    open: boolean;
    message: string;
    severity: 'success' | 'error' | 'warning' | 'info';
}

export interface LoadingState {
    [key: string]: boolean;
}

export interface SearchFilters {
    query: string;
    accountType?: string;
    status?: string;
    investmentType?: string;
}

// Tipos para as APIs externas
export interface YahooFinanceResponse {
    chart: {
        result: Array<{
            meta: {
                symbol: string;
                regularMarketPrice: number;
                currency: string;
                previousClose: number;
                regularMarketTime: number;
            };
            timestamp: number[];
            indicators: {
                quote: Array<{
                    close: number[];
                    high: number[];
                    low: number[];
                    open: number[];
                    volume: number[];
                }>;
            };
        }>;
    };
}

export interface AlphaVantageResponse {
    'Global Quote': {
        '01. symbol': string;
        '02. open': string;
        '03. high': string;
        '04. low': string;
        '05. price': string;
        '06. volume': string;
        '07. latest trading day': string;
        '08. previous close': string;
        '09. change': string;
        '10. change percent': string;
    };
}

// Tipos para local storage
export interface LocalStorageData {
    accounts: BankAccount[];
    investments: Investment[];
    lastUpdate: Date;
}

// Tipos para validação
export interface ValidationRule {
    required?: boolean;
    minLength?: number;
    maxLength?: number;
    pattern?: RegExp;
    min?: number;
    max?: number;
    custom?: (value: any) => boolean;
}

export interface ValidationRules {
    [key: string]: ValidationRule;
}

// Tipos para componentes
export interface TableColumn {
    id: string;
    label: string;
    minWidth?: number;
    align?: 'left' | 'right' | 'center';
    format?: (value: any) => string;
    sortable?: boolean;
}

export interface ChartData {
    labels: string[];
    datasets: Array<{
        label: string;
        data: number[];
        backgroundColor?: string;
        borderColor?: string;
        borderWidth?: number;
    }>;
}

export interface MenuItem {
    id: string;
    label: string;
    icon: string;
    path: string;
    disabled?: boolean;
}

export interface BreadcrumbItem {
    label: string;
    path?: string;
    active?: boolean;
}

export interface TabItem {
    label: string;
    value: string;
    icon?: string;
    disabled?: boolean;
}

export interface FormField {
    name: string;
    label: string;
    type: 'text' | 'email' | 'tel' | 'number' | 'select' | 'date' | 'textarea';
    required?: boolean;
    placeholder?: string;
    options?: Array<{ value: string; label: string }>;
    validation?: ValidationRule;
}
