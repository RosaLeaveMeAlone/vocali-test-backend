import z from "zod";
import { createTranscriptionModel, Transcription } from "../models/transcription.model";
import { BaseHandler, ResponseBuilder } from "../utils";

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

class ListTranscriptionsHandler extends BaseHandler {

    constructor(
        private readonly transcriptionModel: Transcription
    ) {
        super();
    }

    async processEvent(event: any) {
        // Obtener parámetros de query string
        const queryParams = event.queryStringParameters || {};

        const validatedParams = ListTranscriptionsSchema.parse(queryParams);

        const result = await this.transcriptionModel.getTranscriptions(
            validatedParams.limit, 
            validatedParams.nextToken
        );

        return ResponseBuilder.success(result, "Transcriptions retrieved successfully");
    }
}

export async function handler(event: any) {
    const transcriptionModel = createTranscriptionModel();
    const instance = new ListTranscriptionsHandler(transcriptionModel);
    return await instance.handle(event);
}