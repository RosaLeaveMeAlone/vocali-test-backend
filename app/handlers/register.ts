import z from "zod";
import { createUserModel, User } from "../models/user.model";
import { CognitoService, createCognitoService } from "../services/cognito.service";
import { UserType } from "../interfaces/user.type";

const RegisterUserSchema = z.object({
    password: z.string()
        .min(8, "Password must be at least 8 characters long")
        .regex(/^(?=.*[a-z])/, "Password must contain at least one lowercase letter")
        .regex(/^(?=.*[A-Z])/, "Password must contain at least one uppercase letter")
        .regex(/^(?=.*\d)/, "Password must contain at least one number")
        .regex(/^(?=.*[@$!%*?&])/, "Password must contain at least one special character (@$!%*?&)"),
    email: z.string().email("Invalid email address"),
    confirmPassword: z.string(),
}).refine(data => data.password === data.confirmPassword, {
    message: "Passwords do not match",
});

export type RegisterSchemaType = z.infer<typeof RegisterUserSchema>;

class RegisterHandler {

    constructor(
        private readonly userModerl: User,
        private readonly cognitoService: CognitoService
    ) {}

    async processEvent(event: any) {
        console.log("Register handler invoked ");

        const body = JSON.parse(event.body);

        const validatedBody = RegisterUserSchema.parse(body);

        const cognitoResponse = await this.cognitoService.registerUser(validatedBody.email, validatedBody.password);

        // const user = await this.userModerl.createUser(validatedBody);

        const userToCreate: UserType = {
            email: validatedBody.email,
            sub: cognitoResponse.UserSub,
        };

        console.log(userToCreate);

        const user = await this.userModerl.createUser(userToCreate);


        return {
            statusCode: 200,
            headers: {
                'Access-Control-Allow-Origin': '*', // or '*'
                'Access-Control-Allow-Headers': 'Content-Type,Authorization',
                'Access-Control-Allow-Methods': 'OPTIONS,POST'
            },
            body: JSON.stringify({
                message: "Registration successful",
                data: user,
            }),
        };
    }

}

export async function handler(event: any) {
    try {
        const user = createUserModel();
        const cognitoService = createCognitoService();
        const instance = new RegisterHandler(user,cognitoService);
        return await instance.processEvent(event);
    } catch (error:any) {
        console.error("Error in Register handler:", error);
        
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
        if (error.name === 'UsernameExistsException') {
            return {
                statusCode: 409,
                body: JSON.stringify({
                    message: "User already exists",
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