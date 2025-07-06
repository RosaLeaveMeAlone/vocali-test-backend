import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import z from 'zod';
import { BaseHandler, ResponseBuilder } from '../utils';

interface TokenResponse {
    key_value: string;
    expires_at: string;
}

const SpeechmaticsTokenSchema = z.object({
    ttl: z.number().optional().default(3600),
});

class SpeechmaticsTokenHandler extends BaseHandler {
    
    constructor() {
        super();
    }

    async processEvent(event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> {
        // Manejar preflight CORS
        if (event.httpMethod === 'OPTIONS') {
            return {
                statusCode: 200,
                headers: {
                    'Access-Control-Allow-Origin': '*',
                    'Access-Control-Allow-Headers': 'Content-Type,Authorization',
                    'Access-Control-Allow-Methods': 'POST,OPTIONS'
                },
                body: ''
            };
        }

        const validatedBody = this.parseBody(event, SpeechmaticsTokenSchema);

        // Validar que tenemos la API key
        if (!process.env.SPEECHMATICS_API_KEY) {
            return ResponseBuilder.internalServerError('SPEECHMATICS_API_KEY not configured');
        }

        console.log('Requesting JWT token from Speechmatics...');

        // Hacer la petición a Speechmatics para obtener el JWT
        const response = await fetch('https://mp.speechmatics.com/v1/api_keys?type=rt', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${process.env.SPEECHMATICS_API_KEY}`
            },
            body: JSON.stringify({
                ttl: validatedBody.ttl
            })
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('Speechmatics API error:', response.status, errorText);
            
            return ResponseBuilder.error(response.status, 'Error getting token from Speechmatics', errorText);
        }

        const tokenData: TokenResponse = await response.json();
        console.log('JWT token obtained successfully');

        return ResponseBuilder.success({
            token: tokenData.key_value,
            expiresAt: tokenData.expires_at,
            ttl: validatedBody.ttl
        }, 'Token generated successfully');
    }
}

export async function handler(event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> {
    const instance = new SpeechmaticsTokenHandler();
    return await instance.handle(event);
}