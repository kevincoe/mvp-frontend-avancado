// Configuração geral da API

import axios from 'axios';
import type { ApiResponse } from '../types';

/**
 * Configuração do cliente HTTP
 */
const apiClient = axios.create({
    timeout: 10000, // 10 segundos
    headers: {
        'Content-Type': 'application/json',
    },
});

/**
 * Interceptador para requests
 */
apiClient.interceptors.request.use(
    (config) => {
        // Aqui você pode adicionar tokens, logs, etc.
        console.log(`API Request: ${config.method?.toUpperCase()} ${config.url}`);
        return config;
    },
    (error) => {
        console.error('Request error:', error);
        return Promise.reject(error);
    }
);

/**
 * Interceptador para responses
 */
apiClient.interceptors.response.use(
    (response) => {
        console.log(`API Response: ${response.status} ${response.config.url}`);
        return response;
    },
    (error) => {
        console.error('Response error:', error);

        // Tratamento de erros específicos
        if (error.response) {
            // Erro de resposta do servidor
            const { status, data } = error.response;

            switch (status) {
                case 400:
                    error.message = 'Requisição inválida. Verifique os dados enviados.';
                    break;
                case 401:
                    error.message = 'Não autorizado. Verifique suas credenciais.';
                    break;
                case 403:
                    error.message = 'Acesso negado. Você não tem permissão para esta operação.';
                    break;
                case 404:
                    error.message = 'Recurso não encontrado.';
                    break;
                case 429:
                    error.message = 'Muitas requisições. Tente novamente em alguns minutos.';
                    break;
                case 500:
                    error.message = 'Erro interno do servidor. Tente novamente mais tarde.';
                    break;
                default:
                    error.message = data?.message || 'Erro desconhecido no servidor.';
            }
        } else if (error.request) {
            // Erro de rede
            error.message = 'Erro de conexão. Verifique sua internet e tente novamente.';
        } else {
            // Outro tipo de erro
            error.message = 'Erro inesperado. Tente novamente.';
        }

        return Promise.reject(error);
    }
);

/**
 * Serviço principal da API
 */
export class ApiService {
    /**
     * Método GET genérico
     */
    static async get<T>(url: string, params?: Record<string, any>): Promise<ApiResponse<T>> {
        try {
            const response = await apiClient.get<T>(url, { params });
            return {
                success: true,
                data: response.data,
            };
        } catch (error: any) {
            return {
                success: false,
                error: error.message || 'Erro na requisição GET',
            };
        }
    }

    /**
     * Método POST genérico
     */
    static async post<T>(url: string, data?: any): Promise<ApiResponse<T>> {
        try {
            const response = await apiClient.post<T>(url, data);
            return {
                success: true,
                data: response.data,
            };
        } catch (error: any) {
            return {
                success: false,
                error: error.message || 'Erro na requisição POST',
            };
        }
    }

    /**
     * Método PUT genérico
     */
    static async put<T>(url: string, data?: any): Promise<ApiResponse<T>> {
        try {
            const response = await apiClient.put<T>(url, data);
            return {
                success: true,
                data: response.data,
            };
        } catch (error: any) {
            return {
                success: false,
                error: error.message || 'Erro na requisição PUT',
            };
        }
    }

    /**
     * Método DELETE genérico
     */
    static async delete<T>(url: string): Promise<ApiResponse<T>> {
        try {
            const response = await apiClient.delete<T>(url);
            return {
                success: true,
                data: response.data,
            };
        } catch (error: any) {
            return {
                success: false,
                error: error.message || 'Erro na requisição DELETE',
            };
        }
    }

    /**
     * Método PATCH genérico
     */
    static async patch<T>(url: string, data?: any): Promise<ApiResponse<T>> {
        try {
            const response = await apiClient.patch<T>(url, data);
            return {
                success: true,
                data: response.data,
            };
        } catch (error: any) {
            return {
                success: false,
                error: error.message || 'Erro na requisição PATCH',
            };
        }
    }

    /**
     * Método para upload de arquivos
     */
    static async uploadFile<T>(
        url: string,
        file: File,
        onProgress?: (progress: number) => void
    ): Promise<ApiResponse<T>> {
        try {
            const formData = new FormData();
            formData.append('file', file);

            const response = await apiClient.post<T>(url, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
                onUploadProgress: (progressEvent) => {
                    if (onProgress && progressEvent.total) {
                        const progress = (progressEvent.loaded / progressEvent.total) * 100;
                        onProgress(Math.round(progress));
                    }
                },
            });

            return {
                success: true,
                data: response.data,
            };
        } catch (error: any) {
            return {
                success: false,
                error: error.message || 'Erro no upload do arquivo',
            };
        }
    }

    /**
     * Método para download de arquivos
     */
    static async downloadFile(url: string, filename: string): Promise<ApiResponse<void>> {
        try {
            const response = await apiClient.get(url, {
                responseType: 'blob',
            });

            // Criar link para download
            const blob = new Blob([response.data]);
            const downloadUrl = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = downloadUrl;
            link.download = filename;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(downloadUrl);

            return {
                success: true,
            };
        } catch (error: any) {
            return {
                success: false,
                error: error.message || 'Erro no download do arquivo',
            };
        }
    }

    /**
     * Cancela todas as requisições pendentes
     */
    static cancelAllRequests(): void {
        // Implementar cancelamento de requisições se necessário
        console.log('Cancelando todas as requisições pendentes...');
    }

    /**
     * Verifica se há conexão com a internet
     */
    static async checkConnection(): Promise<boolean> {
        try {
            await apiClient.get('/ping', { timeout: 5000 });
            return true;
        } catch {
            return false;
        }
    }

    /**
     * Testa a conectividade com um serviço específico
     */
    static async testService(url: string): Promise<ApiResponse<void>> {
        try {
            await apiClient.get(url, { timeout: 5000 });
            return {
                success: true,
            };
        } catch (error: any) {
            return {
                success: false,
                error: error.message || 'Serviço indisponível',
            };
        }
    }

    /**
     * Configura o token de autenticação
     */
    static setAuthToken(token: string): void {
        apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    }

    /**
     * Remove o token de autenticação
     */
    static removeAuthToken(): void {
        delete apiClient.defaults.headers.common['Authorization'];
    }

    /**
     * Configura headers personalizados
     */
    static setHeaders(headers: Record<string, string>): void {
        Object.assign(apiClient.defaults.headers.common, headers);
    }

    /**
     * Obtém estatísticas de uso da API
     */
    static getStats(): {
        totalRequests: number;
        successfulRequests: number;
        failedRequests: number;
        averageResponseTime: number;
    } {
        // Implementar tracking de estatísticas se necessário
        return {
            totalRequests: 0,
            successfulRequests: 0,
            failedRequests: 0,
            averageResponseTime: 0,
        };
    }
}

export default apiClient;
