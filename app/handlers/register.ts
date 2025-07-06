import z from "zod";
import { createUserModel, User } from "../models/user.model";
import { CognitoService, createCognitoService } from "../services/cognito.service";
import { UserType } from "../interfaces/user.type";
import { BaseHandler, ResponseBuilder } from "../utils";

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

class RegisterHandler extends BaseHandler {
    constructor(
        private readonly userModel: User,
        private readonly cognitoService: CognitoService
    ) {
        super();
    }

    async processEvent(event: any) {
        const validatedBody = this.parseBody(event, RegisterUserSchema);

        const cognitoResponse = await this.cognitoService.registerUser(validatedBody.email, validatedBody.password);

        const userToCreate: UserType = {
            email: validatedBody.email,
            sub: cognitoResponse.UserSub,
        };

        const user = await this.userModel.createUser(userToCreate);

        return ResponseBuilder.success(user, "Registration successful");
    }
}

export async function handler(event: any) {
    const user = createUserModel();
    const cognitoService = createCognitoService();
    const instance = new RegisterHandler(user, cognitoService);
    return await instance.handle(event);
}