import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { BatchClient } from '@speechmatics/batch-client';
import z from 'zod';
import { TranscriptionType } from '../interfaces/transcription.type';
import { createTranscriptionModel, Transcription } from '../models/transcription.model';
import { BaseHandler, ResponseBuilder } from '../utils';

const TranscribeFileSchema = z.object({
    fileData: z.string().min(1, "File data is required"),
    fileName: z.string().min(1, "File name is required"),
    language: z.string().optional().default('es'),
    format: z.string().optional().default('json-v2'),
});

class TranscribeFileHandler extends BaseHandler {
    
    constructor(
        private readonly transcriptionModel: Transcription,
    ) {
        super();
    }

    async processEvent(event: APIGatewayProxyEvent) {
        const validatedBody = this.parseBody(event, TranscribeFileSchema);

        const client = new BatchClient({
            apiKey: process.env.SPEECHMATICS_API_KEY!,
            appId: 'vocali-lambda-transcription'
        });

        console.log('Sending file for transcription...');
        // Convert base64 fileData to Buffer and create Blob
        const buffer = Buffer.from(validatedBody.fileData, 'base64');
        const blob = new Blob([buffer]);
        const file = new File([blob], validatedBody.fileName);

        const response = await client.transcribe(
            file,
            {
                transcription_config: { language: validatedBody.language }
            },
            validatedBody.format
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

        return ResponseBuilder.success({
            transcription: transcription,
        }, 'Transcription successful');
    }
}

export async function handler(event: APIGatewayProxyEvent) {
    const transcriptionModel = createTranscriptionModel();
    const instance = new TranscribeFileHandler(transcriptionModel);
    return await instance.handle(event);
}