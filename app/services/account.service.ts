import { ValidationService } from './validation';
import { StorageService } from './storage';
import type { BankAccount } from '../types';

export interface CreateAccountCommand {
    customerName: string;
    customerCpf: string;
    customerEmail: string;
    customerPhone: string;
    accountType: 'SAVINGS' | 'CHECKING' | 'BUSINESS';
    balance: number;
    businessName?: string;
    businessCnpj?: string;
    isBusinessAccount: boolean;
}

export interface AccountCreationResult {
    success: boolean;
    account?: BankAccount;
    error?: string;
    validationErrors?: Record<string, string>;
}

export class AccountService {
    /**
     * Creates a new bank account following business rules
     */
    static async createAccount(command: CreateAccountCommand): Promise<AccountCreationResult> {
        try {
            // Domain validation
            const validationResult = this.validateAccountCreation(command);
            if (!validationResult.isValid) {
                return {
                    success: false,
                    validationErrors: validationResult.errors
                };
            }

            // Business rules validation
            const businessValidation = await this.validateBusinessRules(command);
            if (!businessValidation.isValid) {
                return {
                    success: false,
                    error: businessValidation.error
                };
            }

            // Generate account number using domain logic
            const accountNumber = this.generateAccountNumber(command.accountType);

            // Create domain entity
            const newAccount: BankAccount = {
                id: crypto.randomUUID(),
                customerName: command.customerName.trim(),
                customerCpf: command.customerCpf.replace(/\D/g, ''),
                customerEmail: command.customerEmail.trim().toLowerCase(),
                customerPhone: command.customerPhone.replace(/\D/g, ''),
                accountNumber,
                accountType: command.accountType,
                balance: command.balance,
                status: 'ACTIVE',
                createdAt: new Date(),
                ...(command.isBusinessAccount && {
                    businessName: command.businessName?.trim(),
                    businessCnpj: command.businessCnpj?.replace(/\D/g, ''),
                })
            };

            // Persist using repository pattern
            const existingAccounts = StorageService.getAccounts();
            const updatedAccounts = [...existingAccounts, newAccount];
            StorageService.saveAccounts(updatedAccounts);

            return {
                success: true,
                account: newAccount
            };

        } catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Erro interno do sistema'
            };
        }
    }

    /**
     * Domain validation using validation service
     */
    private static validateAccountCreation(command: CreateAccountCommand): {
        isValid: boolean;
        errors?: Record<string, string>;
    } {
        const schema = command.isBusinessAccount
            ? ValidationService.businessAccountSchema
            : ValidationService.accountSchema;

        const errors = ValidationService.validateSchema(command, schema);

        return {
            isValid: Object.keys(errors).length === 0,
            errors: Object.keys(errors).length > 0 ? errors : undefined
        };
    }

    /**
     * Business rules validation (duplicate documents, etc.)
     */
    private static async validateBusinessRules(command: CreateAccountCommand): Promise<{
        isValid: boolean;
        error?: string;
    }> {
        const existingAccounts = StorageService.getAccounts();

        // Check for duplicate CPF
        const duplicateCpf = existingAccounts.find(acc =>
            acc.customerCpf === command.customerCpf.replace(/\D/g, '')
        );

        if (duplicateCpf) {
            return {
                isValid: false,
                error: 'CPF já cadastrado no sistema'
            };
        }

        // Check for duplicate CNPJ (business accounts)
        if (command.isBusinessAccount && command.businessCnpj) {
            const duplicateCnpj = existingAccounts.find(acc =>
                acc.businessCnpj === command.businessCnpj?.replace(/\D/g, '')
            );

            if (duplicateCnpj) {
                return {
                    isValid: false,
                    error: 'CNPJ já cadastrado no sistema'
                };
            }
        }

        return { isValid: true };
    }

    /**
     * Generate account number following business logic
     */
    private static generateAccountNumber(accountType: string): string {
        const timestamp = Date.now().toString().slice(-6);
        const random = Math.floor(Math.random() * 10);
        const prefix = accountType === 'BUSINESS' ? '99' : '88';

        return `${prefix}${timestamp}-${random}`;
    }

    /**
     * Get accounts with filtering and pagination
     */
    static getAccounts(filters?: {
        searchTerm?: string;
        accountType?: string;
        status?: string;
        limit?: number;
        offset?: number;
    }): BankAccount[] {
        let accounts = StorageService.getAccounts();

        if (filters?.searchTerm) {
            const term = filters.searchTerm.toLowerCase();
            accounts = accounts.filter(account =>
                account.customerName.toLowerCase().includes(term) ||
                account.accountNumber.includes(term) ||
                account.customerCpf.includes(term) ||
                account.customerEmail.toLowerCase().includes(term)
            );
        }

        if (filters?.accountType) {
            accounts = accounts.filter(account => account.accountType === filters.accountType);
        }

        if (filters?.status) {
            accounts = accounts.filter(account => account.status === filters.status);
        }

        // Pagination
        if (filters?.limit || filters?.offset) {
            const offset = filters.offset || 0;
            const limit = filters.limit || 10;
            accounts = accounts.slice(offset, offset + limit);
        }

        return accounts;
    }

    /**
     * Get account statistics for dashboard
     */
    static getAccountStatistics(): {
        totalAccounts: number;
        activeAccounts: number;
        businessAccounts: number;
        totalBalance: number;
        avgBalance: number;
    } {
        const accounts = StorageService.getAccounts();

        return {
            totalAccounts: accounts.length,
            activeAccounts: accounts.filter(acc => acc.status === 'ACTIVE').length,
            businessAccounts: accounts.filter(acc => acc.accountType === 'BUSINESS').length,
            totalBalance: accounts.reduce((sum, acc) => sum + acc.balance, 0),
            avgBalance: accounts.length > 0
                ? accounts.reduce((sum, acc) => sum + acc.balance, 0) / accounts.length
                : 0
        };
    }
}