import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { BatchClient } from '@speechmatics/batch-client';
import { TranscriptionType } from '../interfaces/transcription.type';
import { createTranscriptionModel, Transcription } from '../models/transcription.model';


class TranscribeFileHandler {
    
    private corsHeaders = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type,Authorization',
        'Access-Control-Allow-Methods': 'POST,OPTIONS'
    };
    
    constructor(
        private readonly transcriptionModel: Transcription,
    ) {}

    async processEvent(event: APIGatewayProxyEvent) {
        console.log("TranscribeFileHandler handler invoked ");

        try {
            const body = JSON.parse(event.body ? event.body : '{}');
    
            const { fileData, fileName, language = 'es', format = 'json-v2' } = body;
    
            if (!fileData || !fileName) {
                return {
                    statusCode: 400,
                    headers: this.corsHeaders,
                    body: JSON.stringify({ message: 'Missing fileData or fileName' })
                };
            }
    
            const client = new BatchClient({
                apiKey: process.env.SPEECHMATICS_API_KEY!,
                appId: 'vocali-lambda-transcription'
            });
    
            console.log('Sending file for transcription...');
            // Convert base64 fileData to Buffer and create Blob
            const buffer = Buffer.from(fileData, 'base64');
            const blob = new Blob([buffer]);
            const file = new File([blob], fileName);
    
            const response = await client.transcribe(
                file,
                {
                    transcription_config: { language }
                },
                format
            );
    
            console.log('Transcription finished!');
    
            const transcriptionContent =
                    typeof response === 'string'
                        ? response
                        : response.results.map((r: any) => r.alternatives?.[0].content).join(' ');

            const transcriptionToCreate: TranscriptionType = {
                content: transcriptionContent,
            };

            const transcription = await this.transcriptionModel.createTranscription(transcriptionToCreate);
    
            return {
                    statusCode: 200,
                    headers: this.corsHeaders,
                    body: JSON.stringify({
                        message: 'Transcription successful',
                        transcription: transcription,
                    })
                };
            
        } catch (error) {
            console.error('Transcription error:', error);
            return {
                statusCode: 500,
                headers: this.corsHeaders,
                body: JSON.stringify({ message: 'Internal Server Error' })
            };
        }

    }
}

export async function handler(event: APIGatewayProxyEvent) {
    const transcriptionModel = createTranscriptionModel();
    const instance = new TranscribeFileHandler(transcriptionModel);
    return await instance.processEvent(event);
}