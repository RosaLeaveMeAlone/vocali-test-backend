import z from "zod";
import { createUserModel, User } from "../models/user.model";
import { CognitoService, createCognitoService } from "../services/cognito.service";
import { BaseHandler, ResponseBuilder } from "../utils";

const LoginUserSchema = z.object({
    email: z.string().email("Invalid email address"),
    password: z.string().min(1, "Password is required"),
});

export type LoginSchemaType = z.infer<typeof LoginUserSchema>;

class LoginHandler extends BaseHandler {
    constructor(
        private readonly userModel: User,
        private readonly cognitoService: CognitoService
    ) {
        super();
    }

    async processEvent(event: any) {
        const validatedBody = this.parseBody(event, LoginUserSchema);
        
        // Authenticate with Cognito
        const authResult = await this.cognitoService.loginUser(validatedBody.email, validatedBody.password);
        console.log(authResult);
        // Optionally fetch additional user data from DynamoDB
        const user = await this.userModel.getUserByEmail(validatedBody.email);

        return ResponseBuilder.success({
            token: authResult.AuthenticationResult?.IdToken,
            refreshToken: authResult.AuthenticationResult?.RefreshToken,
            userData: user,
        }, "Login successful");
    }
}

export async function handler(event: any) {
    const user = createUserModel();
    const cognitoService = createCognitoService();
    const instance = new LoginHandler(user, cognitoService);
    return await instance.handle(event);
}