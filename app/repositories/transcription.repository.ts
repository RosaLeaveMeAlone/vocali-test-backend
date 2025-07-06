import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, GetCommand, PutCommand, QueryCommand  } from "@aws-sdk/lib-dynamodb";
import createDynamoDBClient from "../clients/createDynamoDBClient";
import { TranscriptionType } from "../interfaces/transcription.type";
import { v4 as uuid } from 'uuid';
import { PaginatedTranscriptions } from "../interfaces/paginated-transcription.type";



export class TranscriptionRepository {

    private readonly tableName = 'TranscriptionTable';

    constructor(
        private readonly dbClient: DynamoDBDocumentClient
    ) {}

    //! Coloco este nombre como DTO para verlo como si estuviera trabajando con NestJS
    async createTranscription(transcriptionDto: TranscriptionType): Promise<TranscriptionType> {
        const { content } = transcriptionDto;

        const transcriptionItem = {
            PK: `TRANSCRIPTION`,
            SK: `TRANSCRIPTION#${uuid()}`,
            content: content,
            createdAt: new Date().toISOString(),
        };

        const command = new PutCommand({
            TableName: this.tableName,
            Item: transcriptionItem,
        });

        await this.dbClient.send(command);

        return {
            content,
        };
    }

    async getTranscriptions(limit: number = 10, nextToken?: string): Promise<PaginatedTranscriptions> {
        const command = new QueryCommand({
            TableName: this.tableName,
            KeyConditionExpression: 'PK = :pk',
            ExpressionAttributeValues: {
                ':pk': 'TRANSCRIPTION',
            },
            Limit: limit,
            ScanIndexForward: false, // Ordenar por SK descendente (más recientes primero)
            ExclusiveStartKey: nextToken ? JSON.parse(Buffer.from(nextToken, 'base64').toString()) : undefined,
        });

        const result = await this.dbClient.send(command);

        const items: TranscriptionType[] = result.Items?.map(item => ({
            id: this.extractIdFromSK(item.SK), // Usar función helper
            content: item.content,
            createdAt: item.createdAt,
        })) || [];

        // Crear el nextToken para la siguiente página
        const nextTokenValue = result.LastEvaluatedKey 
            ? Buffer.from(JSON.stringify(result.LastEvaluatedKey)).toString('base64')
            : undefined;

        return {
            items,
            nextToken: nextTokenValue,
            hasMore: !!result.LastEvaluatedKey,
        };
    }

    async getTranscription(id: string): Promise<TranscriptionType | null> {
        const command = new GetCommand({
            TableName: this.tableName,
            Key: {
                PK: 'TRANSCRIPTION',
                SK: `TRANSCRIPTION#${id}`,
            },
        });

        const result = await this.dbClient.send(command);

        return result.Item
        ? {
            id: this.extractIdFromSK(result.Item.SK), // Usar función helper
            content: result.Item.content,
            createdAt: result.Item.createdAt,
        } : null;
    }

    private extractIdFromSK(sk: string): string {
        // Formato esperado: TRANSCRIPTION#uuid
        const parts = sk.split('#');
        return parts.length > 1 ? parts[1] : sk;
    }

}

export function createTranscriptionRepository(): TranscriptionRepository {
    const dbClient = createDynamoDBClient();
    return new TranscriptionRepository(dbClient);
}