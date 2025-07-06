import { TranscriptionType } from "./transcription.type";

export interface PaginatedTranscriptions {
    items: TranscriptionType[];
    nextToken?: string;
    hasMore: boolean;
}
