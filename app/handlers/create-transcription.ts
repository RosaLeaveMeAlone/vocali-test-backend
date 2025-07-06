import z from "zod";
import { createTranscriptionModel, Transcription } from "../models/transcription.model";
import { TranscriptionType } from "../interfaces/transcription.type";
import { BaseHandler, DEFAULT_CORS_HEADERS } from "../utils";

const CreateTranscriptionSchema = z.object({
    content: z.string()
        .min(1, "Content cannot be empty")
        .max(50000, "Content is too long"),
    type: z.string()
        .optional()
        .default("real-time"),
});

export type CreateTranscriptionSchemaType = z.infer<typeof CreateTranscriptionSchema>;

class CreateTranscriptionHandler extends BaseHandler {

    constructor(
        private readonly transcriptionModel: Transcription
    ) {
        super();
    }

    async processEvent(event: any) {
        const validatedBody = this.parseBody(event, CreateTranscriptionSchema);

        const transcriptionToCreate: TranscriptionType = {
            content: validatedBody.content,
        };

        const transcription = await this.transcriptionModel.createTranscription(transcriptionToCreate);

        return {
            statusCode: 201,
            headers: { ...DEFAULT_CORS_HEADERS },
            body: JSON.stringify({
                message: "Transcription created successfully",
                data: transcription
            })
        };
    }
}

export async function handler(event: any) {
    const transcriptionModel = createTranscriptionModel();
    const instance = new CreateTranscriptionHandler(transcriptionModel);
    return await instance.handle(event);
}