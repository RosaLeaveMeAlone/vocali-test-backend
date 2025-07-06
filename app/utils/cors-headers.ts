export const getCorsHeaders = (methods: string[] = ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']) => ({
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type,Authorization',
    'Access-Control-Allow-Methods': methods.join(','),
});

export const DEFAULT_CORS_HEADERS = getCorsHeaders();