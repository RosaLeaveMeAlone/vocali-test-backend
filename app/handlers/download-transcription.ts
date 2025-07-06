import { createTranscriptionModel, Transcription } from '../models/transcription.model';
import { BaseHandler, ResponseBuilder } from '../utils';

class DownloadTranscriptionsHandler extends BaseHandler {

    constructor(
        private readonly transcriptionModel: Transcription
    ) {
        super();
    }

    async processEvent(event: any) {
        const transcriptionId = event.pathParameters?.transcriptionId;

        // Validar que existe el ID
        if (!transcriptionId) {
            return ResponseBuilder.error(400, "Transcription ID is required");
        }

        // Obtener la transcripción
        const transcription = await this.transcriptionModel.getTranscription(transcriptionId);

        // Verificar que existe
        if (!transcription) {
            return ResponseBuilder.notFoundError("Transcription not found");
        }

        // Generar contenido del archivo .txt
        const timestamp = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
        const filename = `transcription_${transcriptionId}_${timestamp}.txt`;
        
        const txtContent = `Transcripción
================

ID: ${transcriptionId}
Fecha: ${transcription.createdAt || new Date().toISOString()}
Exportado: ${new Date().toLocaleString('es-ES')}

Contenido:
----------
${transcription.content}

---
Generado por Sistema de Transcripciones`;

        // Retornar archivo para descarga
        return {
            statusCode: 200,
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Headers': 'Content-Type,Authorization',
                'Access-Control-Allow-Methods': 'OPTIONS,GET',
                'Content-Type': 'text/plain; charset=utf-8',
                'Content-Disposition': `attachment; filename="${filename}"`,
                'Cache-Control': 'no-cache'
            },
            body: txtContent,
        };
    }
}

export async function handler(event: any) {
    const transcriptionModel = createTranscriptionModel();
    const instance = new DownloadTranscriptionsHandler(transcriptionModel);
    return await instance.handle(event);
}