
import { DynamoDBClient } from "@aws-sdk/client-dynamodb"
import { DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";

export default function createDynamoDBClient(): DynamoDBDocumentClient {
    const client =  new DynamoDBClient({});

    const dbDocumentClient = DynamoDBDocumentClient.from(client);

    return dbDocumentClient;
}