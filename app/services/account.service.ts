import { ValidationService } from './validation';
import { StorageService } from './storage';
import type { BankAccount, CreateAccountCommand, OperationResult, AccountType } from '../types';

/**
 * Account Service - Domain Service Layer
 * Implements business logic and domain rules following DDD principles
 */
export class AccountService {
    private static readonly ACCOUNT_NUMBER_PREFIX = {
        SAVINGS: '10',
        CHECKING: '20',
        BUSINESS: '30'
    } as const;

    /**
     * Creates a new bank account following domain business rules
     * @param command - Account creation command
     * @returns Promise with operation result
     */
    static async createAccount(command: CreateAccountCommand): Promise<OperationResult<BankAccount>> {
        try {
            // 1. Domain validation
            const validationResult = await this.validateAccountCreation(command);
            if (!validationResult.success) {
                return validationResult;
            }

            // 2. Business rules validation
            const businessValidation = await this.validateBusinessRules(command);
            if (!businessValidation.success) {
                return businessValidation;
            }

            // 3. Generate account number using domain logic
            const accountNumber = this.generateAccountNumber(command.accountType);

            // 4. Create domain entity
            const newAccount: BankAccount = {
                id: crypto.randomUUID(),
                customerName: this.sanitizeString(command.customerName),
                customerCpf: this.sanitizeDocument(command.customerCpf),
                customerEmail: this.sanitizeEmail(command.customerEmail),
                customerPhone: this.sanitizeDocument(command.customerPhone),
                accountNumber,
                accountType: command.accountType,
                balance: Math.max(0, command.balance), // Ensure non-negative
                status: 'ACTIVE',
                createdAt: new Date(),
                ...(command.isBusinessAccount && {
                    businessName: this.sanitizeString(command.businessName),
                    businessCnpj: this.sanitizeDocument(command.businessCnpj),
                })
            };

            // 5. Persist using repository pattern
            await this.saveAccount(newAccount);

            return {
                success: true,
                data: newAccount
            };

        } catch (error) {
            console.error('Account creation error:', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Erro interno do sistema'
            };
        }
    }

    /**
     * Validates account creation command
     */
    private static async validateAccountCreation(
        command: CreateAccountCommand
    ): Promise<OperationResult> {
        const schema = command.isBusinessAccount
            ? ValidationService.businessAccountSchema
            : ValidationService.accountSchema;

        const errors = ValidationService.validateSchema(command, schema);

        if (Object.keys(errors).length > 0) {
            return {
                success: false,
                validationErrors: errors
            };
        }

        return { success: true };
    }

    /**
     * Validates business rules (duplicates, constraints)
     */
    private static async validateBusinessRules(
        command: CreateAccountCommand
    ): Promise<OperationResult> {
        const existingAccounts = await StorageService.getAccounts();

        // Check for duplicate CPF
        const duplicateCpf = existingAccounts.find(acc =>
            acc.customerCpf === this.sanitizeDocument(command.customerCpf)
        );

        if (duplicateCpf) {
            return {
                success: false,
                error: 'CPF já cadastrado no sistema. Cada CPF pode ter apenas uma conta.'
            };
        }

        // Check for duplicate CNPJ (business accounts)
        if (command.isBusinessAccount && command.businessCnpj) {
            const duplicateCnpj = existingAccounts.find(acc =>
                acc.businessCnpj === this.sanitizeDocument(command.businessCnpj)
            );

            if (duplicateCnpj) {
                return {
                    success: false,
                    error: 'CNPJ já cadastrado no sistema. Cada CNPJ pode ter apenas uma conta.'
                };
            }
        }

        // Validate minimum balance for account type
        const minBalance = this.getMinimumBalance(command.accountType);
        if (command.balance < minBalance) {
            return {
                success: false,
                error: `Saldo mínimo para ${command.accountType === 'BUSINESS' ? 'conta empresarial' : 'esta conta'} é R$ ${minBalance.toFixed(2)}`
            };
        }

        return { success: true };
    }

    /**
     * Generates account number following business logic
     */
    private static generateAccountNumber(accountType: AccountType): string {
        const prefix = this.ACCOUNT_NUMBER_PREFIX[accountType];
        const timestamp = Date.now().toString().slice(-6);
        const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
        const checkDigit = this.calculateCheckDigit(`${prefix}${timestamp}${random}`);

        return `${prefix}${timestamp}${random}-${checkDigit}`;
    }

    /**
     * Calculates check digit for account number
     */
    private static calculateCheckDigit(baseNumber: string): string {
        const weights = [2, 3, 4, 5, 6, 7, 8, 9];
        let sum = 0;

        for (let i = 0; i < baseNumber.length; i++) {
            sum += parseInt(baseNumber[i]) * weights[i % weights.length];
        }

        const remainder = sum % 11;
        return remainder < 2 ? '0' : (11 - remainder).toString();
    }

    /**
     * Gets minimum balance for account type
     */
    private static getMinimumBalance(accountType: AccountType): number {
        const minimums = {
            SAVINGS: 0,
            CHECKING: 0,
            BUSINESS: 100
        };
        return minimums[accountType];
    }

    /**
     * Data sanitization methods for security
     */
    private static sanitizeString(value: string): string {
        return value.trim().replace(/[<>\"']/g, '');
    }

    private static sanitizeDocument(value: string): string {
        return value.replace(/\D/g, '');
    }

    private static sanitizeEmail(value: string): string {
        return value.trim().toLowerCase();
    }

    /**
     * Saves account using repository pattern
     */
    private static async saveAccount(account: BankAccount): Promise<void> {
        const existingAccounts = await StorageService.getAccounts();
        const updatedAccounts = [...existingAccounts, account];
        await StorageService.saveAccounts(updatedAccounts);
    }

    /**
     * Retrieves accounts with filtering and pagination
     */
    static async getAccounts(filters?: {
        searchTerm?: string;
        accountType?: AccountType;
        status?: string;
        limit?: number;
        offset?: number;
    }): Promise<BankAccount[]> {
        let accounts = await StorageService.getAccounts();

        // Apply filters
        if (filters?.searchTerm) {
            const term = filters.searchTerm.toLowerCase();
            accounts = accounts.filter(account =>
                account.customerName.toLowerCase().includes(term) ||
                account.accountNumber.includes(term) ||
                account.customerCpf.includes(term) ||
                account.customerEmail.toLowerCase().includes(term) ||
                (account.businessName && account.businessName.toLowerCase().includes(term))
            );
        }

        if (filters?.accountType) {
            accounts = accounts.filter(account => account.accountType === filters.accountType);
        }

        if (filters?.status) {
            accounts = accounts.filter(account => account.status === filters.status);
        }

        // Apply pagination
        if (filters?.offset !== undefined || filters?.limit !== undefined) {
            const offset = filters.offset || 0;
            const limit = filters.limit || 10;
            accounts = accounts.slice(offset, offset + limit);
        }

        return accounts;
    }

    /**
     * Gets account statistics for dashboard
     */
    static async getAccountStatistics() {
        const accounts = await StorageService.getAccounts();

        return {
            totalAccounts: accounts.length,
            activeAccounts: accounts.filter(acc => acc.status === 'ACTIVE').length,
            businessAccounts: accounts.filter(acc => acc.accountType === 'BUSINESS').length,
            personalAccounts: accounts.filter(acc => acc.accountType !== 'BUSINESS').length,
            totalBalance: accounts.reduce((sum, acc) => sum + acc.balance, 0),
            avgBalance: accounts.length > 0
                ? accounts.reduce((sum, acc) => sum + acc.balance, 0) / accounts.length
                : 0,
            accountsByType: {
                SAVINGS: accounts.filter(acc => acc.accountType === 'SAVINGS').length,
                CHECKING: accounts.filter(acc => acc.accountType === 'CHECKING').length,
                BUSINESS: accounts.filter(acc => acc.accountType === 'BUSINESS').length,
            }
        };
    }

    /**
     * Finds account by ID
     */
    static async findAccountById(id: string): Promise<BankAccount | null> {
        const accounts = await StorageService.getAccounts();
        return accounts.find(account => account.id === id) || null;
    }

    /**
     * Updates account balance (for future transactions)
     */
    static async updateBalance(accountId: string, newBalance: number): Promise<OperationResult<BankAccount>> {
        try {
            const accounts = await StorageService.getAccounts();
            const accountIndex = accounts.findIndex(acc => acc.id === accountId);

            if (accountIndex === -1) {
                return {
                    success: false,
                    error: 'Conta não encontrada'
                };
            }

            if (newBalance < 0) {
                return {
                    success: false,
                    error: 'Saldo não pode ser negativo'
                };
            }

            accounts[accountIndex].balance = newBalance;
            accounts[accountIndex].updatedAt = new Date();

            await StorageService.saveAccounts(accounts);

            return {
                success: true,
                data: accounts[accountIndex]
            };
        } catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Erro ao atualizar saldo'
            };
        }
    }
}

// Export interfaces for component usage
export type { CreateAccountCommand };
export type AccountCreationResult = OperationResult<BankAccount>;