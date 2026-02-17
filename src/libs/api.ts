const getApiBaseUrl = (): string => {
    const environment = process.env.NEXT_PUBLIC_ENVIRONMENT;

    if (environment === 'TEST') {
        return process.env.NEXT_PUBLIC_API_BASE_URL_TEST || 'http://localhost:3002';
    }

    return process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3000';
};

export const API_BASE_URL = getApiBaseUrl();