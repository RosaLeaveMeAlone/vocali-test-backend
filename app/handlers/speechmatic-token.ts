import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';

interface TokenResponse {
    key_value: string;
    expires_at: string;
}

class SpeechmaticsTokenHandler {
    
    private corsHeaders = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type,Authorization',
        'Access-Control-Allow-Methods': 'POST,OPTIONS'
    };

    async processEvent(event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> {
        console.log("SpeechmaticsTokenHandler invoked");

        try {
            // Manejar preflight CORS
            if (event.httpMethod === 'OPTIONS') {
                return {
                    statusCode: 200,
                    headers: this.corsHeaders,
                    body: ''
                };
            }

            const body = JSON.parse(event.body ? event.body : '{}');
            const { ttl = 3600 } = body; // TTL por defecto: 1 hora

            // Validar que tenemos la API key
            if (!process.env.SPEECHMATICS_API_KEY) {
                return {
                    statusCode: 500,
                    headers: this.corsHeaders,
                    body: JSON.stringify({ 
                        message: 'SPEECHMATICS_API_KEY not configured' 
                    })
                };
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
                    ttl: ttl
                })
            });

            if (!response.ok) {
                const errorText = await response.text();
                console.error('Speechmatics API error:', response.status, errorText);
                
                return {
                    statusCode: response.status,
                    headers: this.corsHeaders,
                    body: JSON.stringify({ 
                        message: 'Error getting token from Speechmatics',
                        error: errorText
                    })
                };
            }

            const tokenData: TokenResponse = await response.json();
            console.log('JWT token obtained successfully');

            return {
                statusCode: 200,
                headers: this.corsHeaders,
                body: JSON.stringify({
                    message: 'Token generated successfully',
                    token: tokenData.key_value,
                    expiresAt: tokenData.expires_at,
                    ttl: ttl
                })
            };

        } catch (error) {
            console.error('Token generation error:', error);
            
            return {
                statusCode: 500,
                headers: this.corsHeaders,
                body: JSON.stringify({ 
                    message: 'Internal Server Error',
                    error: error instanceof Error ? error.message : 'Unknown error'
                })
            };
        }
    }
}

export async function handler(event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> {
    const instance = new SpeechmaticsTokenHandler();
    return await instance.processEvent(event);
}