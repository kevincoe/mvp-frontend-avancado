import type { BankAccount, Investment, Portfolio } from '../types';

/**
 * Storage Service - Infrastructure Layer
 * Handles data persistence using localStorage with error handling and type safety
 */
export class StorageService {
    private static readonly STORAGE_KEYS = {
        ACCOUNTS: 'bankAccounts',
        INVESTMENTS: 'investments',
        PORTFOLIOS: 'portfolios',
        APP_SETTINGS: 'appSettings'
    } as const;

    /**
     * Generic storage methods with error handling
     */
    private static setItem<T>(key: string, data: T): void {
        try {
            const serializedData = JSON.stringify(data);
            localStorage.setItem(key, serializedData);
        } catch (error) {
            console.error(`Error saving data to localStorage (${key}):`, error);
            throw new Error(`Falha ao salvar dados: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
        }
    }

    private static getItem<T>(key: string, defaultValue: T): T {
        try {
            const item = localStorage.getItem(key);
            if (!item) return defaultValue;

            const parsed = JSON.parse(item);

            // Handle date deserialization for accounts
            if (key === this.STORAGE_KEYS.ACCOUNTS && Array.isArray(parsed)) {
                return parsed.map(account => ({
                    ...account,
                    createdAt: new Date(account.createdAt),
                    updatedAt: account.updatedAt ? new Date(account.updatedAt) : undefined
                })) as T;
            }

            return parsed;
        } catch (error) {
            console.error(`Error reading data from localStorage (${key}):`, error);
            return defaultValue;
        }
    }

    /**
     * Account-specific methods
     */
    static getAccounts(): BankAccount[] {
        return this.getItem(this.STORAGE_KEYS.ACCOUNTS, []);
    }

    static async saveAccounts(accounts: BankAccount[]): Promise<void> {
        // Validate accounts before saving
        const validatedAccounts = accounts.map(account => ({
            ...account,
            balance: Math.max(0, account.balance), // Ensure non-negative balance
            createdAt: account.createdAt instanceof Date ? account.createdAt : new Date(account.createdAt),
            updatedAt: account.updatedAt ? (account.updatedAt instanceof Date ? account.updatedAt : new Date(account.updatedAt)) : undefined
        }));

        this.setItem(this.STORAGE_KEYS.ACCOUNTS, validatedAccounts);
    }

    static async addAccount(account: BankAccount): Promise<void> {
        const accounts = this.getAccounts();
        accounts.push(account);
        await this.saveAccounts(accounts);
    }

    static async updateAccount(accountId: string, updates: Partial<BankAccount>): Promise<BankAccount | null> {
        const accounts = this.getAccounts();
        const accountIndex = accounts.findIndex(acc => acc.id === accountId);

        if (accountIndex === -1) {
            return null;
        }

        accounts[accountIndex] = {
            ...accounts[accountIndex],
            ...updates,
            updatedAt: new Date()
        };

        await this.saveAccounts(accounts);
        return accounts[accountIndex];
    }

    static async deleteAccount(accountId: string): Promise<boolean> {
        const accounts = this.getAccounts();
        const initialLength = accounts.length;
        const filteredAccounts = accounts.filter(acc => acc.id !== accountId);

        if (filteredAccounts.length === initialLength) {
            return false; // Account not found
        }

        await this.saveAccounts(filteredAccounts);
        return true;
    }

    /**
     * Investment-specific methods
     */
    static getInvestments(): Investment[] {
        return this.getItem(this.STORAGE_KEYS.INVESTMENTS, []);
    }

    static async saveInvestments(investments: Investment[]): Promise<void> {
        const validatedInvestments = investments.map(investment => ({
            ...investment,
            quantity: Math.max(0, investment.quantity),
            purchasePrice: Math.max(0, investment.purchasePrice),
            currentPrice: Math.max(0, investment.currentPrice),
            purchaseDate: investment.purchaseDate instanceof Date ? investment.purchaseDate : new Date(investment.purchaseDate),
            lastUpdate: investment.lastUpdate instanceof Date ? investment.lastUpdate : new Date(investment.lastUpdate)
        }));

        this.setItem(this.STORAGE_KEYS.INVESTMENTS, validatedInvestments);
    }

    /**
     * Portfolio-specific methods
     */
    static getPortfolios(): Portfolio[] {
        return this.getItem(this.STORAGE_KEYS.PORTFOLIOS, []);
    }

    static async savePortfolios(portfolios: Portfolio[]): Promise<void> {
        this.setItem(this.STORAGE_KEYS.PORTFOLIOS, portfolios);
    }

    /**
     * Utility methods
     */
    static clearAllData(): void {
        try {
            Object.values(this.STORAGE_KEYS).forEach(key => {
                localStorage.removeItem(key);
            });
        } catch (error) {
            console.error('Error clearing localStorage:', error);
            throw new Error('Falha ao limpar dados do armazenamento');
        }
    }

    static exportData(): string {
        try {
            const data = {
                accounts: this.getAccounts(),
                investments: this.getInvestments(),
                portfolios: this.getPortfolios(),
                exportDate: new Date().toISOString()
            };

            return JSON.stringify(data, null, 2);
        } catch (error) {
            console.error('Error exporting data:', error);
            throw new Error('Falha ao exportar dados');
        }
    }

    static async importData(jsonString: string): Promise<void> {
        try {
            const data = JSON.parse(jsonString);

            if (data.accounts && Array.isArray(data.accounts)) {
                await this.saveAccounts(data.accounts);
            }

            if (data.investments && Array.isArray(data.investments)) {
                await this.saveInvestments(data.investments);
            }

            if (data.portfolios && Array.isArray(data.portfolios)) {
                await this.savePortfolios(data.portfolios);
            }
        } catch (error) {
            console.error('Error importing data:', error);
            throw new Error('Falha ao importar dados: formato inválido');
        }
    }

    /**
     * Storage health check
     */
    static checkStorageAvailability(): boolean {
        try {
            const testKey = '__storage_test__';
            localStorage.setItem(testKey, 'test');
            localStorage.removeItem(testKey);
            return true;
        } catch {
            return false;
        }
    }

    static getStorageUsage(): { used: number; available: number; percentage: number } {
        try {
            let used = 0;
            for (let key in localStorage) {
                if (localStorage.hasOwnProperty(key)) {
                    used += localStorage[key].length + key.length;
                }
            }

            // Estimate available space (5MB typical limit)
            const available = 5 * 1024 * 1024; // 5MB in bytes
            const percentage = (used / available) * 100;

            return { used, available, percentage };
        } catch {
            return { used: 0, available: 0, percentage: 0 };
        }
    }
}