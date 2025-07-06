import { z } from 'zod';
import { ResponseBuilder } from './response-builder';

export abstract class BaseHandler {
    protected abstract processEvent(event: any): Promise<any>;

    async handle(event: any) {
        try {
            console.log(`${this.constructor.name} handler invoked`);
            return await this.processEvent(event);
        } catch (error: any) {
            console.error(`Error in ${this.constructor.name}:`, error);
            return this.handleError(error);
        }
    }

    protected parseBody<T>(event: any, schema: z.ZodSchema<T>): T {
        const body = JSON.parse(event.body);
        return schema.parse(body);
    }

    protected handleError(error: any) {
        if (error instanceof z.ZodError) {
            return ResponseBuilder.validationError(error.errors);
        }

        // Handle Cognito specific errors
        if (error.name === 'NotAuthorizedException') {
            return ResponseBuilder.unauthorizedError('Invalid credentials');
        }

        if (error.name === 'UserNotFoundException') {
            return ResponseBuilder.notFoundError('User not found');
        }

        if (error.name === 'UsernameExistsException') {
            return ResponseBuilder.conflictError('User already exists');
        }

        return ResponseBuilder.internalServerError();
    }
}