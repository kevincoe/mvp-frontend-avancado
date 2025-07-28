export interface BankAccount {
    id: string;
    accountNumber: string;
    accountType: 'SAVINGS' | 'CHECKING' | 'BUSINESS';
    balance: number;
    customerName: string;
    customerCpf: string;
    customerEmail: string;
    customerPhone: string;
    status: 'ACTIVE' | 'INACTIVE' | 'BLOCKED';
    createdAt: Date;
    updatedAt?: Date;
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

export interface YahooFinanceResponse {
    chart: {
        result: [{
            meta: {
                regularMarketPrice: number;
                previousClose: number;
                regularMarketTime: number;
                currency: string;
            };
        }];
    };
}
export interface ApiResponse<T> {
    success: boolean;
    data?: T;
    error?: string;
}

export interface ApiErrorDetails {
    code: string;
    message: string;
    details?: any;
}
export interface BankAccount {
    id: string;
    accountNumber: string;
    accountType: 'SAVINGS' | 'CHECKING' | 'BUSINESS';
    balance: number;
    customerName: string;
    customerCpf: string;
    customerEmail: string;
    customerPhone: string;
    status: 'ACTIVE' | 'INACTIVE' | 'BLOCKED';
    createdAt: Date;
    updatedAt?: Date;
    // Add business account fields
    businessName?: string;
    businessCnpj?: string;
}