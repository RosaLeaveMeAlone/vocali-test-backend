import z from "zod";
import { createTranscriptionModel, Transcription } from "../models/transcription.model";

const ListTranscriptionsSchema = z.object({
    limit: z.string()
        .optional()
        .transform(val => val ? parseInt(val) : 10)
        .refine(val => val > 0 && val <= 100, {
            message: "Limit must be between 1 and 100"
        }),
    nextToken: z.string().optional(),
});

export type ListTranscriptionsSchemaType = z.infer<typeof ListTranscriptionsSchema>;

class ListTranscriptionsHandler {

    constructor(
        private readonly transcriptionModel: Transcription
    ) {}

    async processEvent(event: any) {
        console.log("List transcriptions handler invoked");

        // Obtener parámetros de query string
        const queryParams = event.queryStringParameters || {};

        const validatedParams = ListTranscriptionsSchema.parse(queryParams);

        const result = await this.transcriptionModel.getTranscriptions(
            validatedParams.limit, 
            validatedParams.nextToken
        );

        return {
            statusCode: 200,
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Headers': 'Content-Type,Authorization',
                'Access-Control-Allow-Methods': 'OPTIONS,GET'
            },
            body: JSON.stringify({
                message: "Transcriptions retrieved successfully",
                data: result,
            }),
        };
    }
}

export async function handler(event: any) {
    try {
        const transcriptionModel = createTranscriptionModel();
        const instance = new ListTranscriptionsHandler(transcriptionModel);
        return await instance.processEvent(event);
    } catch (error: any) {
        console.error("Error in List transcriptions handler:", error);
        
        if (error instanceof z.ZodError) {
            return {
                statusCode: 400,
                headers: {
                    'Access-Control-Allow-Origin': '*',
                    'Access-Control-Allow-Headers': 'Content-Type,Authorization',
                    'Access-Control-Allow-Methods': 'OPTIONS,GET'
                },
                body: JSON.stringify({
                    message: "Validation Error",
                    errors: error.errors,
                }),
            };
        }
        
        return {
            statusCode: 500,
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Headers': 'Content-Type,Authorization',
                'Access-Control-Allow-Methods': 'OPTIONS,GET'
            },
            body: JSON.stringify({
                message: "Internal Server Error",
            }),
        };
    }
}