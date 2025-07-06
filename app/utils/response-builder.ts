import { DEFAULT_CORS_HEADERS } from './cors-headers';

export interface ApiResponse {
    statusCode: number;
    headers?: Record<string, string>;
    body: string;
}

export class ResponseBuilder {
    private statusCode: number = 200;
    private headers: Record<string, string> = { ...DEFAULT_CORS_HEADERS };
    private data: any = null;

    static success(data?: any, message?: string): ApiResponse {
        return new ResponseBuilder()
            .setStatusCode(200)
            .setData({ message: message || 'Success', data })
            .build();
    }

    static error(statusCode: number, message: string, errors?: any): ApiResponse {
        return new ResponseBuilder()
            .setStatusCode(statusCode)
            .setData({ message, errors })
            .build();
    }

    static validationError(errors: any): ApiResponse {
        return ResponseBuilder.error(400, 'Validation Error', errors);
    }

    static unauthorizedError(message: string = 'Unauthorized'): ApiResponse {
        return ResponseBuilder.error(401, message);
    }

    static notFoundError(message: string = 'Not Found'): ApiResponse {
        return ResponseBuilder.error(404, message);
    }

    static conflictError(message: string = 'Conflict'): ApiResponse {
        return ResponseBuilder.error(409, message);
    }

    static internalServerError(message: string = 'Internal Server Error'): ApiResponse {
        return ResponseBuilder.error(500, message);
    }

    setStatusCode(statusCode: number): ResponseBuilder {
        this.statusCode = statusCode;
        return this;
    }

    setHeaders(headers: Record<string, string>): ResponseBuilder {
        this.headers = { ...this.headers, ...headers };
        return this;
    }

    setData(data: any): ResponseBuilder {
        this.data = data;
        return this;
    }

    build(): ApiResponse {
        return {
            statusCode: this.statusCode,
            headers: this.headers,
            body: JSON.stringify(this.data),
        };
    }
}