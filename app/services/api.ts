import axios, { type AxiosInstance, type AxiosError } from 'axios';

export interface ApiResponse<T> {
    success: boolean;
    data?: T;
    error?: string;
}

export interface ApiErrorDetails {
    code: string;
    message: string;
    details?: any;
}

export class ApiError extends Error {
    constructor(
        public code: string,
        message: string,
        public details?: any,
        public statusCode?: number
    ) {
        super(message);
        this.name = 'ApiError';
    }
}

export class ApiService {
    private static instance: AxiosInstance;

    static getInstance(): AxiosInstance {
        if (!this.instance) {
            this.instance = axios.create({
                timeout: 30000,
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            // Request interceptor
            this.instance.interceptors.request.use(
                (config) => {
                    console.log(`🚀 API Request: ${config.method?.toUpperCase()} ${config.url}`);
                    return config;
                },
                (error) => {
                    console.error('❌ Request Error:', error);
                    return Promise.reject(error);
                }
            );

            // Response interceptor
            this.instance.interceptors.response.use(
                (response) => {
                    console.log(`✅ API Response: ${response.status} ${response.config.url}`);
                    return response;
                },
                (error: AxiosError) => {
                    const apiError = this.handleError(error);
                    console.error('❌ API Error:', apiError);
                    return Promise.reject(apiError);
                }
            );
        }

        return this.instance;
    }

    private static handleError(error: AxiosError): ApiError {
        if (error.response) {
            // Server responded with error status
            const { status, data } = error.response;
            return new ApiError(
                `HTTP_${status}`,
                `Erro do servidor: ${status}`,
                data,
                status
            );
        } else if (error.request) {
            // Network error
            return new ApiError(
                'NETWORK_ERROR',
                'Erro de conexão. Verifique sua internet.',
                error.request
            );
        } else {
            // Request setup error
            return new ApiError(
                'REQUEST_ERROR',
                'Erro na configuração da requisição',
                error.message
            );
        }
    }

    static async handleApiCall<T>(
        apiCall: () => Promise<any>
    ): Promise<ApiResponse<T>> {
        try {
            const response = await apiCall();
            return {
                success: true,
                data: response.data
            };
        } catch (error) {
            if (error instanceof ApiError) {
                return {
                    success: false,
                    error: error.message
                };
            }

            return {
                success: false,
                error: 'Erro interno do sistema'
            };
        }
    }
}