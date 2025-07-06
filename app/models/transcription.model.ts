import { PaginatedTranscriptions } from "../interfaces/paginated-transcription.type";
import { TranscriptionType } from "../interfaces/transcription.type";
import { createTranscriptionRepository, TranscriptionRepository } from "../repositories/transcription.repository";


export class Transcription {
    constructor(
        private readonly transcriptionRepository: TranscriptionRepository
    ) {}

    //! Coloco este nombre como DTO para verlo como si estuviera trabajando con NestJS
    async createTranscription(transcriptionDto: TranscriptionType): Promise<TranscriptionType> {
        return this.transcriptionRepository.createTranscription(transcriptionDto);
    }

    async getTranscriptions(limit: number = 10, nextToken?: string): Promise<PaginatedTranscriptions> {
        return this.transcriptionRepository.getTranscriptions(limit, nextToken);
    }

    async getTranscription(id: string): Promise<TranscriptionType | null> {
        return this.transcriptionRepository.getTranscription(id);
    }

}


export function createTranscriptionModel(): Transcription {
    const transcriptionRepository = createTranscriptionRepository();
    return new Transcription(transcriptionRepository);
}