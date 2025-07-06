import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, PutCommand, QueryCommand  } from "@aws-sdk/lib-dynamodb";
import createDynamoDBClient from "../clients/createDynamoDBClient";
import { UserType } from "../interfaces/user.type";
import { v4 as uuid } from 'uuid';


export class UserRepository {

    private readonly tableName = 'UsersTable';

    constructor(
        private readonly dbClient: DynamoDBDocumentClient
    ) {}

    //! Coloco este nombre como DTO para verlo como si estuviera trabajando con NestJS
    async createUser(userDto: UserType): Promise<UserType> {
        const { email, sub } = userDto;

        const userItem = {
            PK: `USER#${email}`, // Partition key
            SK: `USER#${uuid()}`, // Sort key
            email: email,
            sub: sub
        };

        const command = new PutCommand({
            TableName: this.tableName,
            Item: userItem,
        });

        await this.dbClient.send(command);

        return {
            email,
            sub,
        };
    }

    async getUserByEmail(email: string) {
        const params = {
            TableName: this.tableName,
            KeyConditionExpression: "PK = :pk",
            ExpressionAttributeValues: {
                ":pk": `USER#${email}`,
            },
        };
        
        try {
            const command = new QueryCommand(params);
            const result = await this.dbClient.send(command);
            return result.Items?.[0] || null;
        } catch (error) {
            console.error("Error getting user by email:", error);
            throw error;
        }
    }

}

export function createUserRepository(): UserRepository {
    const dbClient = createDynamoDBClient();
    return new UserRepository(dbClient);
}