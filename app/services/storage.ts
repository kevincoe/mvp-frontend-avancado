import type { BankAccount, Investment } from '../types';

/**
 * Serviço para gerenciar armazenamento local
 */
export class StorageService {
    private static readonly STORAGE_KEYS = {
        ACCOUNTS: 'banking_accounts',
        INVESTMENTS: 'banking_investments',
        SETTINGS: 'banking_settings',
    };

    /**
     * Verifica se está no ambiente do cliente
     */
    private static isClient(): boolean {
        return typeof window !== 'undefined' && typeof localStorage !== 'undefined';
    }

    /**
     * Obtém dados do localStorage de forma segura
     */
    private static getFromStorage<T>(key: string, defaultValue: T): T {
        if (!this.isClient()) {
            return defaultValue;
        }

        try {
            const item = localStorage.getItem(key);
            if (!item) return defaultValue;

            const parsed = JSON.parse(item);
            return parsed || defaultValue;
        } catch (error) {
            console.error(`Erro ao ler ${key} do localStorage:`, error);
            return defaultValue;
        }
    }

    /**
     * Salva dados no localStorage de forma segura
     */
    private static saveToStorage<T>(key: string, data: T): void {
        if (!this.isClient()) {
            return;
        }

        try {
            localStorage.setItem(key, JSON.stringify(data));
        } catch (error) {
            console.error(`Erro ao salvar ${key} no localStorage:`, error);
        }
    }

    // Contas
    static getAccounts(): BankAccount[] {
        return this.getFromStorage(this.STORAGE_KEYS.ACCOUNTS, []);
    }

    static saveAccounts(accounts: BankAccount[]): void {
        this.saveToStorage(this.STORAGE_KEYS.ACCOUNTS, accounts);
    }

    static getAccountById(id: string): BankAccount | null {
        const accounts = this.getAccounts();
        return accounts.find(account => account.id === id) || null;
    }

    static addAccount(account: BankAccount): void {
        const accounts = this.getAccounts();
        accounts.push(account);
        this.saveAccounts(accounts);
    }

    static updateAccount(updatedAccount: BankAccount): void {
        const accounts = this.getAccounts();
        const index = accounts.findIndex(account => account.id === updatedAccount.id);
        if (index !== -1) {
            accounts[index] = updatedAccount;
            this.saveAccounts(accounts);
        }
    }

    static deleteAccount(id: string): void {
        const accounts = this.getAccounts();
        const filteredAccounts = accounts.filter(account => account.id !== id);
        this.saveAccounts(filteredAccounts);
    }

    // Investimentos
    static getInvestments(): Investment[] {
        return this.getFromStorage(this.STORAGE_KEYS.INVESTMENTS, []);
    }

    static saveInvestments(investments: Investment[]): void {
        this.saveToStorage(this.STORAGE_KEYS.INVESTMENTS, investments);
    }

    static getInvestmentById(id: string): Investment | null {
        const investments = this.getInvestments();
        return investments.find(investment => investment.id === id) || null;
    }

    static getInvestmentsByAccount(accountId: string): Investment[] {
        const investments = this.getInvestments();
        return investments.filter(investment => investment.accountId === accountId);
    }

    static addInvestment(investment: Investment): void {
        const investments = this.getInvestments();
        investments.push(investment);
        this.saveInvestments(investments);
    }

    static updateInvestment(updatedInvestment: Investment): void {
        const investments = this.getInvestments();
        const index = investments.findIndex(investment => investment.id === updatedInvestment.id);
        if (index !== -1) {
            investments[index] = updatedInvestment;
            this.saveInvestments(investments);
        }
    }

    static deleteInvestment(id: string): void {
        const investments = this.getInvestments();
        const filteredInvestments = investments.filter(investment => investment.id !== id);
        this.saveInvestments(filteredInvestments);
    }

    // Utilitários
    static clearAll(): void {
        if (!this.isClient()) {
            return;
        }

        try {
            Object.values(this.STORAGE_KEYS).forEach(key => {
                localStorage.removeItem(key);
            });
        } catch (error) {
            console.error('Erro ao limpar localStorage:', error);
        }
    }

    static exportData(): string {
        const data = {
            accounts: this.getAccounts(),
            investments: this.getInvestments(),
            exportDate: new Date().toISOString(),
        };
        return JSON.stringify(data, null, 2);
    }

    static importData(jsonData: string): boolean {
        try {
            const data = JSON.parse(jsonData);

            if (data.accounts && Array.isArray(data.accounts)) {
                this.saveAccounts(data.accounts);
            }

            if (data.investments && Array.isArray(data.investments)) {
                this.saveInvestments(data.investments);
            }

            return true;
        } catch (error) {
            console.error('Erro ao importar dados:', error);
            return false;
        }
    }
}