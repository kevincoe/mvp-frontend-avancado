// Serviço para comunicação com APIs financeiras externas

import axios from 'axios';
import type { StockQuote, DollarQuote, YahooFinanceResponse, ApiResponse } from '../types';
import { constants } from '../utils/formatters';

/**
 * Serviço para obter cotações financeiras
 */
export class FinanceService {
    private static readonly BASE_URL = constants.API_ENDPOINTS.YAHOO_FINANCE;

    /**
     * Obtém cotação do dólar (USD/BRL)
     */
    static async getDollarQuote(): Promise<ApiResponse<DollarQuote>> {
        try {
            const response = await axios.get<YahooFinanceResponse>(
                `${this.BASE_URL}/USDBRL=X`
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
            return {
                success: false,
                error: 'Não foi possível obter a cotação do dólar. Tente novamente.',
            };
        }
    }

    /**
     * Obtém cotação de uma ação específica
     */
    static async getStockQuote(symbol: string): Promise<ApiResponse<StockQuote>> {
        try {
            // Adiciona .SA para ações brasileiras se não estiver presente
            const formattedSymbol = symbol.includes('.SA') ? symbol : `${symbol}.SA`;

            const response = await axios.get<YahooFinanceResponse>(
                `${this.BASE_URL}/${formattedSymbol}`
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
                    name: symbol, // Nome simplificado
                    price: currentPrice,
                    change,
                    changePercent,
                    currency: result.meta.currency,
                    marketTime: new Date(result.meta.regularMarketTime * 1000),
                },
            };
        } catch (error) {
            console.error(`Erro ao obter cotação de ${symbol}:`, error);
            return {
                success: false,
                error: `Não foi possível obter a cotação de ${symbol}. Verifique o símbolo e tente novamente.`,
            };
        }
    }

    /**
     * Obtém cotações de múltiplas ações
     */
    static async getMultipleStockQuotes(symbols: string[]): Promise<ApiResponse<StockQuote[]>> {
        try {
            const promises = symbols.map(symbol => this.getStockQuote(symbol));
            const results = await Promise.allSettled(promises);

            const quotes: StockQuote[] = [];
            const errors: string[] = [];

            results.forEach((result, index) => {
                if (result.status === 'fulfilled' && result.value.success && result.value.data) {
                    quotes.push(result.value.data);
                } else {
                    errors.push(`Erro ao obter cotação de ${symbols[index]}`);
                }
            });

            return {
                success: quotes.length > 0,
                data: quotes,
                error: errors.length > 0 ? errors.join(', ') : undefined,
            };
        } catch (error) {
            console.error('Erro ao obter cotações múltiplas:', error);
            return {
                success: false,
                error: 'Erro ao obter cotações. Tente novamente.',
            };
        }
    }

    /**
     * Busca ações por termo de pesquisa (simulado)
     */
    static async searchStocks(query: string): Promise<ApiResponse<Array<{ symbol: string; name: string }>>> {
        try {
            // Como a API do Yahoo Finance não tem endpoint de busca público,
            // vamos simular com uma lista de ações brasileiras populares
            const popularStocks = [
                { symbol: 'PETR4', name: 'Petrobras PN' },
                { symbol: 'VALE3', name: 'Vale ON' },
                { symbol: 'ITUB4', name: 'Itaú Unibanco PN' },
                { symbol: 'BBDC4', name: 'Bradesco PN' },
                { symbol: 'ABEV3', name: 'Ambev ON' },
                { symbol: 'WEGE3', name: 'Weg ON' },
                { symbol: 'MGLU3', name: 'Magazine Luiza ON' },
                { symbol: 'BBAS3', name: 'Banco do Brasil ON' },
                { symbol: 'RENT3', name: 'Localiza ON' },
                { symbol: 'LREN3', name: 'Lojas Renner ON' },
                { symbol: 'JBSS3', name: 'JBS ON' },
                { symbol: 'SUZB3', name: 'Suzano ON' },
                { symbol: 'TOTS3', name: 'Totvs ON' },
                { symbol: 'RADL3', name: 'Raia Drogasil ON' },
                { symbol: 'VIVT3', name: 'Vivo ON' },
                { symbol: 'ELET3', name: 'Eletrobras ON' },
                { symbol: 'SANB11', name: 'Santander Units' },
                { symbol: 'CVCB3', name: 'CVC Brasil ON' },
                { symbol: 'UGPA3', name: 'Ultrapar ON' },
                { symbol: 'CIEL3', name: 'Cielo ON' },
            ];

            const filteredStocks = popularStocks.filter(stock =>
                stock.symbol.toLowerCase().includes(query.toLowerCase()) ||
                stock.name.toLowerCase().includes(query.toLowerCase())
            );

            return {
                success: true,
                data: filteredStocks,
            };
        } catch (error) {
            console.error('Erro ao buscar ações:', error);
            return {
                success: false,
                error: 'Erro ao buscar ações. Tente novamente.',
            };
        }
    }

    /**
     * Obtém dados históricos de uma ação (simulado)
     */
    static async getHistoricalData(symbol: string, period: string = '1mo'): Promise<ApiResponse<any>> {
        try {
            // Simulando dados históricos
            const days = period === '1mo' ? 30 : period === '3mo' ? 90 : 365;
            const basePrice = 100;
            const data = [];

            for (let i = days; i >= 0; i--) {
                const date = new Date();
                date.setDate(date.getDate() - i);

                const variation = (Math.random() - 0.5) * 0.1; // Variação de -5% a +5%
                const price = basePrice + (basePrice * variation);

                data.push({
                    date: date.toISOString().split('T')[0],
                    price: parseFloat(price.toFixed(2)),
                    volume: Math.floor(Math.random() * 1000000),
                });
            }

            return {
                success: true,
                data,
            };
        } catch (error) {
            console.error('Erro ao obter dados históricos:', error);
            return {
                success: false,
                error: 'Erro ao obter dados históricos. Tente novamente.',
            };
        }
    }

    /**
     * Obtém índices do mercado brasileiro
     */
    static async getMarketIndices(): Promise<ApiResponse<StockQuote[]>> {
        try {
            const indices = ['^BVSP', '^SMALL', '^IBOV'];
            return await this.getMultipleStockQuotes(indices);
        } catch (error) {
            console.error('Erro ao obter índices do mercado:', error);
            return {
                success: false,
                error: 'Erro ao obter índices do mercado. Tente novamente.',
            };
        }
    }

    /**
     * Verifica se o mercado está aberto
     */
    static isMarketOpen(): boolean {
        const now = new Date();
        const hour = now.getHours();
        const day = now.getDay();

        // Mercado brasileiro: Segunda a Sexta, 10h às 17h
        return day >= 1 && day <= 5 && hour >= 10 && hour < 17;
    }

    /**
     * Obtém informações sobre horário do mercado
     */
    static getMarketStatus(): {
        isOpen: boolean;
        nextOpen?: Date;
        nextClose?: Date;
    } {
        const now = new Date();
        const isOpen = this.isMarketOpen();

        if (isOpen) {
            const nextClose = new Date(now);
            nextClose.setHours(17, 0, 0, 0);
            return {
                isOpen: true,
                nextClose,
            };
        } else {
            const nextOpen = new Date(now);

            // Se é fim de semana, próxima abertura é segunda-feira
            if (now.getDay() === 0) { // Domingo
                nextOpen.setDate(now.getDate() + 1);
            } else if (now.getDay() === 6) { // Sábado
                nextOpen.setDate(now.getDate() + 2);
            } else if (now.getHours() >= 17) { // Depois do fechamento
                nextOpen.setDate(now.getDate() + 1);
            }

            nextOpen.setHours(10, 0, 0, 0);

            return {
                isOpen: false,
                nextOpen,
            };
        }
    }

    /**
     * Formata dados para exibição em gráficos
     */
    static formatChartData(data: any[]): {
        labels: string[];
        datasets: Array<{
            label: string;
            data: number[];
            borderColor: string;
            backgroundColor: string;
        }>;
    } {
        const labels = data.map(item => item.date);
        const prices = data.map(item => item.price);

        return {
            labels,
            datasets: [
                {
                    label: 'Preço',
                    data: prices,
                    borderColor: constants.CHART_COLORS.PRIMARY,
                    backgroundColor: constants.CHART_COLORS.PRIMARY + '20',
                },
            ],
        };
    }

    /**
     * Calcula estatísticas de performance
     */
    static calculatePerformance(purchasePrice: number, currentPrice: number, quantity: number): {
        totalInvested: number;
        currentValue: number;
        absoluteGain: number;
        percentageGain: number;
    } {
        const totalInvested = purchasePrice * quantity;
        const currentValue = currentPrice * quantity;
        const absoluteGain = currentValue - totalInvested;
        const percentageGain = (absoluteGain / totalInvested) * 100;

        return {
            totalInvested,
            currentValue,
            absoluteGain,
            percentageGain,
        };
    }
}
