import axios from 'axios';
import type { StockQuote, DollarQuote, ApiResponse } from '../types';

/**
 * Serviço para obter cotações financeiras usando Financial Modeling Prep API
 */
export class FinanceService {
    private static readonly BASE_URL = 'https://financialmodelingprep.com/api/v3';
    private static readonly API_KEY = 'Apq1abtVcC78vp0yv2TtEkj47F4dKCig';

    // Cache para evitar muitas requisições seguidas
    private static readonly CACHE: { [key: string]: { data: any, timestamp: number } } = {};
    private static readonly CACHE_DURATION = 30000; // 30 segundos

    /**
     * Verifica se o cache é válido
     */
    private static isCacheValid(key: string): boolean {
        const cached = this.CACHE[key];
        if (!cached) return false;

        const now = Date.now();
        return (now - cached.timestamp) < this.CACHE_DURATION;
    }

    /**
     * Salva no cache
     */
    private static setCache(key: string, data: any): void {
        this.CACHE[key] = {
            data,
            timestamp: Date.now()
        };
    }

    /**
     * Obtém do cache
     */
    private static getCache(key: string): any {
        const cached = this.CACHE[key];
        return cached ? cached.data : null;
    }

    /**
     * Obtém cotação de uma ação específica
     */
    static async getStockQuote(symbol: string): Promise<ApiResponse<StockQuote>> {
        const upperSymbol = symbol.toUpperCase();
        const cacheKey = `quote_${upperSymbol}`;

        console.log(`🔍 FinanceService.getStockQuote: Buscando ${upperSymbol}`);

        try {
            // Verifica cache primeiro
            if (this.isCacheValid(cacheKey)) {
                console.log(`📋 Usando cache para ${upperSymbol}`);
                const cachedData = this.getCache(cacheKey);
                return {
                    success: true,
                    data: cachedData
                };
            }

            // Requisição para API real
            console.log(`🌐 Fazendo requisição para API: ${upperSymbol}`);

            const response = await axios.get(`${this.BASE_URL}/quote/${upperSymbol}`, {
                params: {
                    apikey: this.API_KEY,
                },
                timeout: 10000, // 10 segundos
            });

            console.log(`📡 Resposta da API para ${upperSymbol}:`, response.data);

            // Verificar se recebemos dados válidos
            if (!response.data || response.data.length === 0) {
                throw new Error(`Nenhum dado encontrado para o símbolo ${upperSymbol}`);
            }

            const quote = response.data[0];

            if (!quote || typeof quote.price !== 'number') {
                throw new Error(`Dados inválidos recebidos para ${upperSymbol}: ${JSON.stringify(quote)}`);
            }

            // Criar objeto StockQuote padronizado
            const stockQuote: StockQuote = {
                symbol: quote.symbol || upperSymbol,
                name: quote.name || upperSymbol,
                price: Number(quote.price.toFixed(2)),
                change: Number((quote.change || 0).toFixed(2)),
                changePercent: Number((quote.changesPercentage || 0).toFixed(2)),
                currency: upperSymbol.includes('.SA') ? 'BRL' : 'USD',
                marketTime: new Date(),
            };

            console.log(`✅ Cotação processada para ${upperSymbol}:`, stockQuote);

            // Salvar no cache
            this.setCache(cacheKey, stockQuote);

            return {
                success: true,
                data: stockQuote
            };

        } catch (error) {
            console.error(`❌ Erro ao obter cotação de ${upperSymbol}:`, error);

            let errorMessage = 'Erro desconhecido';

            if (axios.isAxiosError(error)) {
                if (error.response) {
                    // Erro de resposta da API
                    const { status, data } = error.response;
                    console.error(`📡 Erro da API - Status: ${status}, Data:`, data);

                    switch (status) {
                        case 401:
                            errorMessage = 'API Key inválida ou expirada';
                            break;
                        case 403:
                            errorMessage = 'Acesso negado à API';
                            break;
                        case 404:
                            errorMessage = `Símbolo ${upperSymbol} não encontrado`;
                            break;
                        case 429:
                            errorMessage = 'Limite de requisições da API excedido';
                            break;
                        case 500:
                            errorMessage = 'Erro interno da API';
                            break;
                        default:
                            errorMessage = `Erro da API: ${status} - ${data?.message || 'Erro desconhecido'}`;
                    }
                } else if (error.request) {
                    // Erro de rede
                    console.error(`🌐 Erro de rede:`, error.request);
                    errorMessage = 'Erro de conexão com a API. Verifique sua internet.';
                } else {
                    // Erro de configuração
                    console.error(`⚙️ Erro de configuração:`, error.message);
                    errorMessage = `Erro de configuração: ${error.message}`;
                }
            } else if (error instanceof Error) {
                errorMessage = error.message;
            }

            return {
                success: false,
                error: errorMessage
            };
        }
    }

    /**
     * Obtém cotação do dólar (USD/BRL)
     */
    static async getDollarQuote(): Promise<ApiResponse<DollarQuote>> {
        const cacheKey = 'dollar_quote';

        console.log(`💵 FinanceService.getDollarQuote: Buscando cotação USD/BRL`);

        try {
            // Verifica cache primeiro
            if (this.isCacheValid(cacheKey)) {
                console.log(`📋 Usando cache para cotação do dólar`);
                const cachedData = this.getCache(cacheKey);
                return {
                    success: true,
                    data: cachedData
                };
            }

            // Requisição para API real
            console.log(`🌐 Fazendo requisição para cotação do dólar`);

            const response = await axios.get(`${this.BASE_URL}/fx/USDBRL`, {
                params: {
                    apikey: this.API_KEY,
                },
                timeout: 10000,
            });

            console.log(`📡 Resposta da API para USD/BRL:`, response.data);

            if (!response.data || response.data.length === 0) {
                throw new Error('Nenhum dado de câmbio encontrado');
            }

            const quote = response.data[0];

            if (!quote || typeof quote.bid !== 'number') {
                throw new Error(`Dados de câmbio inválidos: ${JSON.stringify(quote)}`);
            }

            const dollarQuote: DollarQuote = {
                price: Number(quote.bid.toFixed(4)),
                change: Number((quote.changes || 0).toFixed(4)),
                changePercent: Number((quote.changesPercentage || 0).toFixed(2)),
                lastUpdate: new Date(),
            };

            console.log(`✅ Cotação do dólar processada:`, dollarQuote);

            // Salvar no cache
            this.setCache(cacheKey, dollarQuote);

            return {
                success: true,
                data: dollarQuote,
            };

        } catch (error) {
            console.error(`❌ Erro ao obter cotação do dólar:`, error);

            let errorMessage = 'Erro desconhecido';

            if (axios.isAxiosError(error)) {
                if (error.response) {
                    const { status, data } = error.response;
                    console.error(`📡 Erro da API - Status: ${status}, Data:`, data);

                    switch (status) {
                        case 401:
                            errorMessage = 'API Key inválida para cotação de câmbio';
                            break;
                        case 403:
                            errorMessage = 'Acesso negado para cotação de câmbio';
                            break;
                        case 429:
                            errorMessage = 'Limite de requisições excedido para câmbio';
                            break;
                        default:
                            errorMessage = `Erro da API de câmbio: ${status}`;
                    }
                } else if (error.request) {
                    errorMessage = 'Erro de conexão com API de câmbio';
                } else {
                    errorMessage = `Erro de configuração na API de câmbio: ${error.message}`;
                }
            } else if (error instanceof Error) {
                errorMessage = error.message;
            }

            return {
                success: false,
                error: errorMessage
            };
        }
    }

    /**
     * Busca ações por símbolo ou nome
     */
    static async searchStocks(query: string): Promise<Array<{ symbol: string; name: string }>> {
        if (!query || query.length < 2) {
            return [];
        }

        const cacheKey = `search_${query.toLowerCase()}`;

        console.log(`🔍 FinanceService.searchStocks: Buscando "${query}"`);

        try {
            // Verifica cache primeiro
            if (this.isCacheValid(cacheKey)) {
                console.log(`📋 Usando cache para busca: ${query}`);
                return this.getCache(cacheKey);
            }

            // Requisição para API real
            console.log(`🌐 Fazendo busca na API: ${query}`);

            const response = await axios.get(`${this.BASE_URL}/search`, {
                params: {
                    query,
                    limit: 10,
                    apikey: this.API_KEY,
                },
                timeout: 10000,
            });

            console.log(`📡 Resultados da busca para "${query}":`, response.data);

            if (!response.data || !Array.isArray(response.data)) {
                console.warn(`⚠️ Resposta de busca inválida para "${query}":`, response.data);
                return [];
            }

            const results = response.data
                .filter((item: any) => item && item.symbol && item.name)
                .map((item: any) => ({
                    symbol: item.symbol,
                    name: item.name,
                }))
                .slice(0, 10);

            console.log(`✅ Busca processada para "${query}":`, results);

            // Salvar no cache
            this.setCache(cacheKey, results);

            return results;

        } catch (error) {
            console.error(`❌ Erro na busca de ações para "${query}":`, error);

            if (axios.isAxiosError(error)) {
                if (error.response) {
                    const { status, data } = error.response;
                    console.error(`📡 Erro da API de busca - Status: ${status}, Data:`, data);
                } else if (error.request) {
                    console.error(`🌐 Erro de rede na busca:`, error.request);
                } else {
                    console.error(`⚙️ Erro de configuração na busca:`, error.message);
                }
            }

            // Retorna array vazio em caso de erro
            return [];
        }
    }

    /**
     * Obtém múltiplas cotações
     */
    static async getMultipleQuotes(symbols: string[]): Promise<ApiResponse<StockQuote[]>> {
        console.log(`📊 FinanceService.getMultipleQuotes: Buscando ${symbols.length} símbolos:`, symbols);

        try {
            const promises = symbols.map(symbol => this.getStockQuote(symbol));
            const results = await Promise.allSettled(promises);

            const successfulQuotes: StockQuote[] = [];
            const errors: string[] = [];

            results.forEach((result, index) => {
                const symbol = symbols[index];

                if (result.status === 'fulfilled') {
                    if (result.value.success && result.value.data) {
                        successfulQuotes.push(result.value.data);
                        console.log(`✅ Sucesso para ${symbol}`);
                    } else {
                        const errorMsg = `${symbol}: ${result.value.error}`;
                        errors.push(errorMsg);
                        console.log(`❌ Erro para ${symbol}: ${result.value.error}`);
                    }
                } else {
                    const errorMsg = `${symbol}: ${result.reason}`;
                    errors.push(errorMsg);
                    console.log(`❌ Promise rejeitada para ${symbol}: ${result.reason}`);
                }
            });

            console.log(`📊 Resultado múltiplas cotações: ${successfulQuotes.length} sucessos, ${errors.length} erros`);

            if (successfulQuotes.length === 0) {
                return {
                    success: false,
                    error: `Nenhuma cotação obtida com sucesso. Erros: ${errors.join('; ')}`
                };
            }

            return {
                success: true,
                data: successfulQuotes,
            };

        } catch (error) {
            console.error(`❌ Erro crítico em múltiplas cotações:`, error);
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Erro desconhecido em múltiplas cotações',
            };
        }
    }

    /**
     * Atualiza preços de investimentos
     */
    static async updateInvestmentPrices(investments: any[]): Promise<any[]> {
        if (!investments || investments.length === 0) {
            console.log(`📊 Nenhum investimento para atualizar`);
            return investments;
        }

        try {
            const symbols = [...new Set(investments.map(inv => inv.symbol))];
            console.log(`🔄 Atualizando preços para símbolos:`, symbols);

            const quotesResponse = await this.getMultipleQuotes(symbols);

            if (!quotesResponse.success || !quotesResponse.data) {
                console.warn(`⚠️ Falha ao obter cotações: ${quotesResponse.error}`);
                return investments;
            }

            const quotes = quotesResponse.data;
            console.log(`📈 Cotações obtidas para atualização:`, quotes.map(q => `${q.symbol}: ${q.price}`));

            const updatedInvestments = investments.map(investment => {
                const quote = quotes.find(q => q.symbol === investment.symbol);
                if (quote) {
                    console.log(`🔄 Atualizando ${investment.symbol}: ${investment.currentPrice} → ${quote.price}`);
                    return {
                        ...investment,
                        currentPrice: quote.price,
                        lastUpdate: new Date(),
                    };
                } else {
                    console.log(`⚠️ Cotação não encontrada para ${investment.symbol}, mantendo preço atual`);
                }
                return investment;
            });

            console.log(`✅ Preços atualizados para ${updatedInvestments.length} investimentos`);
            return updatedInvestments;

        } catch (error) {
            console.error(`❌ Erro ao atualizar preços dos investimentos:`, error);
            return investments;
        }
    }

    /**
     * Testa conectividade com a API
     */
    static async testApiConnection(): Promise<ApiResponse<{ status: string; timestamp: Date }>> {
        console.log(`🔍 Testando conectividade com API...`);

        try {
            // Testa com um símbolo simples
            const testResponse = await axios.get(`${this.BASE_URL}/quote/AAPL`, {
                params: {
                    apikey: this.API_KEY,
                },
                timeout: 5000,
            });

            console.log(`✅ API respondeu com status:`, testResponse.status);

            return {
                success: true,
                data: {
                    status: 'Conectado',
                    timestamp: new Date()
                }
            };

        } catch (error) {
            console.error(`❌ Teste de conectividade falhou:`, error);

            let errorMessage = 'Falha no teste de conectividade';

            if (axios.isAxiosError(error)) {
                if (error.response) {
                    errorMessage = `API respondeu com erro: ${error.response.status}`;
                } else if (error.request) {
                    errorMessage = 'Sem resposta da API - verifique a conexão';
                } else {
                    errorMessage = `Erro de configuração: ${error.message}`;
                }
            }

            return {
                success: false,
                error: errorMessage
            };
        }
    }

    /**
     * Limpa todo o cache
     */
    static clearCache(): void {
        console.log(`🗑️ Limpando cache da API...`);
        Object.keys(this.CACHE).forEach(key => {
            delete this.CACHE[key];
        });
        console.log(`✅ Cache limpo`);
    }

    /**
     * Obtém estatísticas do cache
     */
    static getCacheStats(): { totalEntries: number; validEntries: number; expiredEntries: number } {
        const totalEntries = Object.keys(this.CACHE).length;
        let validEntries = 0;
        let expiredEntries = 0;

        Object.keys(this.CACHE).forEach(key => {
            if (this.isCacheValid(key)) {
                validEntries++;
            } else {
                expiredEntries++;
            }
        });

        return { totalEntries, validEntries, expiredEntries };
    }
}