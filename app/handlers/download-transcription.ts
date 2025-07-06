import { createTranscriptionModel, Transcription } from '../models/transcription.model';

class DownloadTranscriptionsHandler {

    constructor(
        private readonly transcriptionModel: Transcription
    ) {}

    async processEvent(event: any) {
        console.log("Download handler invoked");

        const transcriptionId = event.pathParameters?.transcriptionId;

        // Validar que existe el ID
        if (!transcriptionId) {
            return {
                statusCode: 400,
                headers: {
                    'Access-Control-Allow-Origin': '*',
                    'Access-Control-Allow-Headers': 'Content-Type,Authorization',
                    'Access-Control-Allow-Methods': 'OPTIONS,GET'
                },
                body: JSON.stringify({
                    message: "Transcription ID is required",
                }),
            };
        }

        // Obtener la transcripción
        const transcription = await this.transcriptionModel.getTranscription(transcriptionId);

        // Verificar que existe
        if (!transcription) {
            return {
                statusCode: 404,
                headers: {
                    'Access-Control-Allow-Origin': '*',
                    'Access-Control-Allow-Headers': 'Content-Type,Authorization',
                    'Access-Control-Allow-Methods': 'OPTIONS,GET'
                },
                body: JSON.stringify({
                    message: "Transcription not found",
                }),
            };
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
    try {
        const transcriptionModel = createTranscriptionModel();
        const instance = new DownloadTranscriptionsHandler(transcriptionModel); // CORREGIDO: era ListTranscriptionsHandler
        return await instance.processEvent(event);
    } catch (error: any) {
        console.error("Error in Download transcription handler:", error);
        
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