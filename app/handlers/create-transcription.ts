import z from "zod";
import { createTranscriptionModel, Transcription } from "../models/transcription.model";
import { TranscriptionType } from "../interfaces/transcription.type";

const CreateTranscriptionSchema = z.object({
    content: z.string()
        .min(1, "Content cannot be empty")
        .max(50000, "Content is too long"),
    type: z.string()
        .optional()
        .default("real-time"),
});

export type CreateTranscriptionSchemaType = z.infer<typeof CreateTranscriptionSchema>;

class CreateTranscriptionHandler {

    constructor(
        private readonly transcriptionModel: Transcription
    ) {}

    async processEvent(event: any) {
        console.log("Create transcription handler invoked");

        const body = JSON.parse(event.body);

        const validatedBody = CreateTranscriptionSchema.parse(body);

        const transcriptionToCreate: TranscriptionType = {
            content: validatedBody.content,
        };

        const transcription = await this.transcriptionModel.createTranscription(transcriptionToCreate);

        return {
            statusCode: 201,
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Headers': 'Content-Type,Authorization',
                'Access-Control-Allow-Methods': 'OPTIONS,POST'
            },
            body: JSON.stringify({
                message: "Transcription created successfully",
                data: transcription,
            }),
        };
    }
}

export async function handler(event: any) {
    try {
        const transcriptionModel = createTranscriptionModel();
        const instance = new CreateTranscriptionHandler(transcriptionModel);
        return await instance.processEvent(event);
    } catch (error: any) {
        console.error("Error in Create transcription handler:", error);
        
        if (error instanceof z.ZodError) {
            return {
                statusCode: 400,
                headers: {
                    'Access-Control-Allow-Origin': '*',
                    'Access-Control-Allow-Headers': 'Content-Type,Authorization',
                    'Access-Control-Allow-Methods': 'OPTIONS,POST'
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
                'Access-Control-Allow-Methods': 'OPTIONS,POST'
            },
            body: JSON.stringify({
                message: "Internal Server Error",
            }),
        };
    }
}