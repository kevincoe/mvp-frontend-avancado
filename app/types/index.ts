/**
 * Core domain types following DDD principles
 * Represents the business entities and value objects
 */

export type AccountType = 'SAVINGS' | 'CHECKING' | 'BUSINESS';
export type AccountStatus = 'ACTIVE' | 'INACTIVE' | 'BLOCKED';

export interface BankAccount {
    id: string;
    accountNumber: string;
    accountType: AccountType;
    balance: number;
    customerName: string;
    customerCpf: string;
    customerEmail: string;
    customerPhone: string;
    status: AccountStatus;
    createdAt: Date;
    updatedAt?: Date;
    // Business account specific fields
    businessName?: string;
    businessCnpj?: string;
}

// Command patterns for operations
export interface CreateAccountCommand {
    customerName: string;
    customerCpf: string;
    customerEmail: string;
    customerPhone: string;
    accountType: AccountType;
    balance: number;
    businessName: string;
    businessCnpj: string;
    isBusinessAccount: boolean;
}

// Result patterns for operations
export interface OperationResult<T = any> {
    success: boolean;
    data?: T;
    error?: string;
    validationErrors?: Record<string, string>;
}

// Investment types (maintaining existing structure)
export interface Investment {
    id: string;
    symbol: string;
    name: string;
    type: 'STOCK' | 'BOND' | 'FUND' | 'CRYPTO';
    quantity: number;
    purchasePrice: number;
    currentPrice: number;
    purchaseDate: Date;
    lastUpdate: Date;
}

export interface Portfolio {
    id: string;
    accountId: string;
    investments: Investment[];
    totalValue: number;
    totalCost: number;
    profitLoss: number;
    profitLossPercentage: number;
    lastUpdate: Date;
}