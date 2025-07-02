import z from "zod";
import { createUserModel, User } from "../models/user.model";
import { CognitoService, createCognitoService } from "../services/cognito.service";

const LoginUserSchema = z.object({
    email: z.string().email("Invalid email address"),
    password: z.string().min(1, "Password is required"),
});

export type LoginSchemaType = z.infer<typeof LoginUserSchema>;

class LoginHandler {
    constructor(
        private readonly userModel: User,
        private readonly cognitoService: CognitoService
    ) {}

    async processEvent(event: any) {
        console.log("Login handler invoked ");

        const body = JSON.parse(event.body);
        const validatedBody = LoginUserSchema.parse(body);
        
        // Authenticate with Cognito
        const authResult = await this.cognitoService.loginUser(validatedBody.email, validatedBody.password);
        
        // Optionally fetch additional user data from DynamoDB
        const user = await this.userModel.getUserByEmail(validatedBody.email);

        return {
            statusCode: 200,
            headers: {
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Headers": "Content-Type,Authorization",
                "Access-Control-Allow-Methods": "POST,OPTIONS"
            },
            body: JSON.stringify({
                message: "Login successful",
                token: authResult.AuthenticationResult?.IdToken,
                refreshToken: authResult.AuthenticationResult?.RefreshToken,
                userData: user,
            }),
        };
    }
}

export async function handler(event: any) {
    try {
        const user = createUserModel();
        const cognitoService = createCognitoService();
        const instance = new LoginHandler(user, cognitoService);
        return await instance.processEvent(event);
    } catch (error: any) {
        console.error("Error in Login handler:", error);
        
        if (error instanceof z.ZodError) {
            return {
                statusCode: 400,
                body: JSON.stringify({
                    message: "Validation Error",
                    errors: error.errors,
                }),
            };
        }
        
        // Handle Cognito specific errors
        if (error.name === 'NotAuthorizedException') {
            return {
                statusCode: 401,
                body: JSON.stringify({
                    message: "Invalid credentials",
                }),
            };
        }
        
        if (error.name === 'UserNotFoundException') {
            return {
                statusCode: 404,
                body: JSON.stringify({
                    message: "User not found",
                }),
            };
        }
        
        return {
            statusCode: 500,
            body: JSON.stringify({
                message: "Internal Server Error",
            }),
        };
    }
}