import axios from 'axios';
import type { StockQuote, DollarQuote, YahooFinanceResponse, ApiResponse } from '../types';
import { constants } from '../utils/formatters';

/**
 * Serviço para obter cotações financeiras
 */
export class FinanceService {
    private static readonly BASE_URL = constants.API_ENDPOINTS.YAHOO_FINANCE;
    private static readonly IS_DEV = import.meta.env.DEV;

    /**
     * Obtém cotação do dólar (USD/BRL)
     */
    static async getDollarQuote(): Promise<ApiResponse<DollarQuote>> {
        // Use mock data in development to avoid CORS issues
        if (this.IS_DEV) {
            return this.getMockDollarQuote();
        }

        try {
            const response = await axios.get<YahooFinanceResponse>(
                `${this.BASE_URL}/USDBRL=X`,
                {
                    timeout: 10000,
                    headers: {
                        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
                    }
                }
            );

            const result = response.data.chart.result[0];
            const currentPrice = result.meta.regularMarketPrice;
            const previousClose = result.meta.previousClose;
            const change = currentPrice - previousClose;
            const changePercent = (change / previousClose) * 100;

            return {
                success: true,
                data: {
                    price: currentPrice,
                    change,
                    changePercent,
                    lastUpdate: new Date(result.meta.regularMarketTime * 1000),
                },
            };
        } catch (error) {
            console.error('Erro ao obter cotação do dólar:', error);
            // Fallback to mock data on error
            return this.getMockDollarQuote();
        }
    }

    /**
     * Mock data for development
     */
    private static getMockDollarQuote(): Promise<ApiResponse<DollarQuote>> {
        const basePrice = 5.20;
        const variation = (Math.random() - 0.5) * 0.1; // -5% to +5%
        const currentPrice = basePrice + (basePrice * variation);
        const change = currentPrice - basePrice;
        const changePercent = (change / basePrice) * 100;

        return Promise.resolve({
            success: true,
            data: {
                price: parseFloat(currentPrice.toFixed(4)),
                change: parseFloat(change.toFixed(4)),
                changePercent: parseFloat(changePercent.toFixed(2)),
                lastUpdate: new Date(),
            },
        });
    }

    /**
     * Obtém cotação de uma ação específica
     */
    static async getStockQuote(symbol: string): Promise<ApiResponse<StockQuote>> {
        // Use mock data in development
        if (this.IS_DEV) {
            return this.getMockStockQuote(symbol);
        }

        try {
            const formattedSymbol = symbol.includes('.SA') ? symbol : `${symbol}.SA`;

            const response = await axios.get<YahooFinanceResponse>(
                `${this.BASE_URL}/${formattedSymbol}`,
                {
                    timeout: 10000,
                    headers: {
                        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
                    }
                }
            );

            const result = response.data.chart.result[0];
            const currentPrice = result.meta.regularMarketPrice;
            const previousClose = result.meta.previousClose;
            const change = currentPrice - previousClose;
            const changePercent = (change / previousClose) * 100;

            return {
                success: true,
                data: {
                    symbol: formattedSymbol,
                    name: symbol,
                    price: currentPrice,
                    change,
                    changePercent,
                    currency: result.meta.currency,
                    marketTime: new Date(result.meta.regularMarketTime * 1000),
                },
            };
        } catch (error) {
            console.error(`Erro ao obter cotação de ${symbol}:`, error);
            // Fallback to mock data on error
            return this.getMockStockQuote(symbol);
        }
    }

    /**
     * Mock stock quote for development
     */
    private static getMockStockQuote(symbol: string): Promise<ApiResponse<StockQuote>> {
        const basePrice = Math.random() * 100 + 10; // Random price between 10-110
        const variation = (Math.random() - 0.5) * 0.1; // -5% to +5%
        const currentPrice = basePrice + (basePrice * variation);
        const previousClose = basePrice;
        const change = currentPrice - previousClose;
        const changePercent = (change / previousClose) * 100;

        return Promise.resolve({
            success: true,
            data: {
                symbol: symbol.includes('.SA') ? symbol : `${symbol}.SA`,
                name: symbol,
                price: parseFloat(currentPrice.toFixed(2)),
                change: parseFloat(change.toFixed(2)),
                changePercent: parseFloat(changePercent.toFixed(2)),
                currency: 'BRL',
                marketTime: new Date(),
            },
        });
    }

    /**
     * Obtém múltiplas cotações
     */
    static async getMultipleQuotes(symbols: string[]): Promise<ApiResponse<StockQuote[]>> {
        try {
            const promises = symbols.map(symbol => this.getStockQuote(symbol));
            const results = await Promise.allSettled(promises);

            const successfulQuotes: StockQuote[] = [];
            results.forEach((result, index) => {
                if (result.status === 'fulfilled' && result.value.success && result.value.data) {
                    successfulQuotes.push(result.value.data);
                }
            });

            return {
                success: true,
                data: successfulQuotes,
            };
        } catch (error) {
            console.error('Erro ao obter múltiplas cotações:', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Erro desconhecido',
            };
        }
    }

    /**
     * Atualiza preços de investimentos
     */
    static async updateInvestmentPrices(investments: any[]): Promise<any[]> {
        try {
            const symbols = [...new Set(investments.map(inv => inv.symbol))];
            const quotesResponse = await this.getMultipleQuotes(symbols);

            if (!quotesResponse.success || !quotesResponse.data) {
                return investments;
            }

            const quotes = quotesResponse.data;
            const updatedInvestments = investments.map(investment => {
                const quote = quotes.find(q => q.symbol === investment.symbol);
                if (quote) {
                    return {
                        ...investment,
                        currentPrice: quote.price,
                        lastUpdate: new Date(),
                    };
                }
                return investment;
            });

            return updatedInvestments;
        } catch (error) {
            console.error('Erro ao atualizar preços:', error);
            return investments;
        }
    }

    /**
     * Obtém símbolos sugeridos
     */
    static getPopularSymbols(): string[] {
        return [
            'PETR4',
            'VALE3',
            'ITUB4',
            'ABEV3',
            'BBDC4',
            'WEGE3',
            'MGLU3',
            'VIIA3',
            'USIM5',
            'GOAU4',
            'CSNA3',
            'BRFS3',
            'BPAC11',
            'RENT3',
            'LREN3',
            'HAPV3',
            'BOVA11',
            'SMAL11',
            'IVVB11',
            'MXRF11',
        ];
    }

    /**
     * Busca símbolo por nome
     */
    static async searchSymbol(query: string): Promise<string[]> {
        // Em desenvolvimento, retorna sugestões baseadas na query
        if (this.IS_DEV) {
            const popularSymbols = this.getPopularSymbols();
            return popularSymbols.filter(symbol =>
                symbol.toLowerCase().includes(query.toLowerCase())
            );
        }

        // Em produção, implementaria busca real
        return [];
    }
}