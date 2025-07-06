// Serviços para gerenciamento de LocalStorage

import type { BankAccount, Investment, LocalStorageData } from '../types';
import { constants } from '../utils/formatters';

/**
 * Serviço para gerenciamento de dados no LocalStorage
 */
export class StorageService {
    /**
     * Salva contas no localStorage
     */
    static saveAccounts(accounts: BankAccount[]): void {
        try {
            const data = JSON.stringify(accounts);
            localStorage.setItem(constants.STORAGE_KEYS.ACCOUNTS, data);
        } catch (error) {
            console.error('Erro ao salvar contas:', error);
            throw new Error('Falha ao salvar dados das contas');
        }
    }

    /**
     * Carrega contas do localStorage
     */
    static getAccounts(): BankAccount[] {
        try {
            const data = localStorage.getItem(constants.STORAGE_KEYS.ACCOUNTS);
            if (!data) return [];

            const accounts = JSON.parse(data);
            // Converte strings de data de volta para objetos Date
            return accounts.map((account: any) => ({
                ...account,
                createdAt: new Date(account.createdAt),
                updatedAt: new Date(account.updatedAt),
            }));
        } catch (error) {
            console.error('Erro ao carregar contas:', error);
            return [];
        }
    }

    /**
     * Salva investimentos no localStorage
     */
    static saveInvestments(investments: Investment[]): void {
        try {
            const data = JSON.stringify(investments);
            localStorage.setItem(constants.STORAGE_KEYS.INVESTMENTS, data);
        } catch (error) {
            console.error('Erro ao salvar investimentos:', error);
            throw new Error('Falha ao salvar dados dos investimentos');
        }
    }

    /**
     * Carrega investimentos do localStorage
     */
    static getInvestments(): Investment[] {
        try {
            const data = localStorage.getItem(constants.STORAGE_KEYS.INVESTMENTS);
            if (!data) return [];

            const investments = JSON.parse(data);
            // Converte strings de data de volta para objetos Date
            return investments.map((investment: any) => ({
                ...investment,
                purchaseDate: new Date(investment.purchaseDate),
                lastUpdate: new Date(investment.lastUpdate),
            }));
        } catch (error) {
            console.error('Erro ao carregar investimentos:', error);
            return [];
        }
    }

    /**
     * Salva uma conta específica
     */
    static saveAccount(account: BankAccount): void {
        const accounts = this.getAccounts();
        const existingIndex = accounts.findIndex(acc => acc.id === account.id);

        if (existingIndex >= 0) {
            accounts[existingIndex] = account;
        } else {
            accounts.push(account);
        }

        this.saveAccounts(accounts);
    }

    /**
     * Remove uma conta específica
     */
    static removeAccount(accountId: string): void {
        const accounts = this.getAccounts();
        const filteredAccounts = accounts.filter(acc => acc.id !== accountId);
        this.saveAccounts(filteredAccounts);

        // Remove também os investimentos associados
        const investments = this.getInvestments();
        const filteredInvestments = investments.filter(inv => inv.accountId !== accountId);
        this.saveInvestments(filteredInvestments);
    }

    /**
     * Busca uma conta por ID
     */
    static getAccountById(accountId: string): BankAccount | null {
        const accounts = this.getAccounts();
        return accounts.find(acc => acc.id === accountId) || null;
    }

    /**
     * Salva um investimento específico
     */
    static saveInvestment(investment: Investment): void {
        const investments = this.getInvestments();
        const existingIndex = investments.findIndex(inv => inv.id === investment.id);

        if (existingIndex >= 0) {
            investments[existingIndex] = investment;
        } else {
            investments.push(investment);
        }

        this.saveInvestments(investments);
    }

    /**
     * Remove um investimento específico
     */
    static removeInvestment(investmentId: string): void {
        const investments = this.getInvestments();
        const filteredInvestments = investments.filter(inv => inv.id !== investmentId);
        this.saveInvestments(filteredInvestments);
    }

    /**
     * Busca investimentos por conta
     */
    static getInvestmentsByAccount(accountId: string): Investment[] {
        const investments = this.getInvestments();
        return investments.filter(inv => inv.accountId === accountId);
    }

    /**
     * Busca um investimento por ID
     */
    static getInvestmentById(investmentId: string): Investment | null {
        const investments = this.getInvestments();
        return investments.find(inv => inv.id === investmentId) || null;
    }

    /**
     * Limpa todos os dados do localStorage
     */
    static clearAll(): void {
        localStorage.removeItem(constants.STORAGE_KEYS.ACCOUNTS);
        localStorage.removeItem(constants.STORAGE_KEYS.INVESTMENTS);
        localStorage.removeItem(constants.STORAGE_KEYS.SETTINGS);
    }

    /**
     * Exporta todos os dados para backup
     */
    static exportData(): LocalStorageData {
        return {
            accounts: this.getAccounts(),
            investments: this.getInvestments(),
            lastUpdate: new Date(),
        };
    }

    /**
     * Importa dados de backup
     */
    static importData(data: LocalStorageData): void {
        try {
            this.saveAccounts(data.accounts);
            this.saveInvestments(data.investments);
        } catch (error) {
            console.error('Erro ao importar dados:', error);
            throw new Error('Falha ao importar dados');
        }
    }

    /**
     * Verifica se existem dados salvos
     */
    static hasData(): boolean {
        const accounts = this.getAccounts();
        const investments = this.getInvestments();
        return accounts.length > 0 || investments.length > 0;
    }

    /**
     * Obtém estatísticas dos dados
     */
    static getStats() {
        const accounts = this.getAccounts();
        const investments = this.getInvestments();

        const totalBalance = accounts.reduce((sum, acc) => sum + acc.balance, 0);
        const totalInvestmentValue = investments.reduce((sum, inv) => sum + (inv.quantity * inv.currentPrice), 0);

        return {
            totalAccounts: accounts.length,
            totalInvestments: investments.length,
            totalBalance,
            totalInvestmentValue,
            activeAccounts: accounts.filter(acc => acc.status === 'ACTIVE').length,
            inactiveAccounts: accounts.filter(acc => acc.status === 'INACTIVE').length,
            blockedAccounts: accounts.filter(acc => acc.status === 'BLOCKED').length,
        };
    }

    /**
     * Busca contas por filtros
     */
    static searchAccounts(filters: {
        query?: string;
        accountType?: string;
        status?: string;
    }): BankAccount[] {
        let accounts = this.getAccounts();

        if (filters.query) {
            const query = filters.query.toLowerCase();
            accounts = accounts.filter(acc =>
                acc.customerName.toLowerCase().includes(query) ||
                acc.accountNumber.includes(query) ||
                acc.customerEmail.toLowerCase().includes(query) ||
                acc.customerCpf.includes(query)
            );
        }

        if (filters.accountType) {
            accounts = accounts.filter(acc => acc.accountType === filters.accountType);
        }

        if (filters.status) {
            accounts = accounts.filter(acc => acc.status === filters.status);
        }

        return accounts;
    }

    /**
     * Busca investimentos por filtros
     */
    static searchInvestments(filters: {
        query?: string;
        type?: string;
        accountId?: string;
    }): Investment[] {
        let investments = this.getInvestments();

        if (filters.query) {
            const query = filters.query.toLowerCase();
            investments = investments.filter(inv =>
                inv.symbol.toLowerCase().includes(query) ||
                inv.name.toLowerCase().includes(query)
            );
        }

        if (filters.type) {
            investments = investments.filter(inv => inv.type === filters.type);
        }

        if (filters.accountId) {
            investments = investments.filter(inv => inv.accountId === filters.accountId);
        }

        return investments;
    }

    /**
     * Gera dados demo para teste
     */
    static generateDemoData(): void {
        const demoAccounts: BankAccount[] = [
            {
                id: '1',
                accountNumber: '12345-6',
                customerName: 'João Silva',
                customerCpf: '123.456.789-00',
                customerEmail: 'joao@email.com',
                customerPhone: '(11) 99999-9999',
                accountType: 'CHECKING',
                balance: 15000.50,
                createdAt: new Date('2024-01-15'),
                updatedAt: new Date('2024-12-01'),
                status: 'ACTIVE',
            },
            {
                id: '2',
                accountNumber: '67890-1',
                customerName: 'Maria Santos',
                customerCpf: '987.654.321-00',
                customerEmail: 'maria@email.com',
                customerPhone: '(11) 88888-8888',
                accountType: 'SAVINGS',
                balance: 8500.00,
                createdAt: new Date('2024-02-10'),
                updatedAt: new Date('2024-12-01'),
                status: 'ACTIVE',
            },
            {
                id: '3',
                accountNumber: '11111-2',
                customerName: 'Pedro Oliveira',
                customerCpf: '111.222.333-44',
                customerEmail: 'pedro@email.com',
                customerPhone: '(11) 77777-7777',
                accountType: 'BUSINESS',
                balance: 50000.00,
                createdAt: new Date('2024-03-05'),
                updatedAt: new Date('2024-12-01'),
                status: 'ACTIVE',
            },
        ];

        const demoInvestments: Investment[] = [
            {
                id: '1',
                accountId: '1',
                symbol: 'PETR4',
                name: 'Petrobras PN',
                type: 'STOCK',
                quantity: 100,
                purchasePrice: 30.50,
                currentPrice: 32.75,
                purchaseDate: new Date('2024-06-15'),
                lastUpdate: new Date(),
            },
            {
                id: '2',
                accountId: '1',
                symbol: 'VALE3',
                name: 'Vale ON',
                type: 'STOCK',
                quantity: 50,
                purchasePrice: 65.20,
                currentPrice: 70.15,
                purchaseDate: new Date('2024-07-20'),
                lastUpdate: new Date(),
            },
            {
                id: '3',
                accountId: '2',
                symbol: 'ITUB4',
                name: 'Itaú Unibanco PN',
                type: 'STOCK',
                quantity: 200,
                purchasePrice: 25.80,
                currentPrice: 27.90,
                purchaseDate: new Date('2024-08-10'),
                lastUpdate: new Date(),
            },
        ];

        this.saveAccounts(demoAccounts);
        this.saveInvestments(demoInvestments);
    }
}
