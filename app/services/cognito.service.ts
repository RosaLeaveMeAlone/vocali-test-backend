// app/services/cognito.service.ts
import { 
  CognitoIdentityProviderClient, 
  SignUpCommand, 
  ConfirmSignUpCommand,
  InitiateAuthCommand,
  AdminConfirmSignUpCommand,
  AuthFlowType,
} from "@aws-sdk/client-cognito-identity-provider";

export class CognitoService {
  private client: CognitoIdentityProviderClient;
  private userPoolId: string;
  private clientId: string;

  constructor() {
    this.client = new CognitoIdentityProviderClient({ region: process.env.AWS_REGION });
    this.userPoolId = process.env.USER_POOL_ID || '';
    this.clientId = process.env.CLIENT_ID || '';
  }

  async registerUser(email: string, password: string) {
    const params = {
      ClientId: this.clientId,
      Username: email,
      Password: password,
      UserAttributes: [
        {
          Name: 'email',
          Value: email,
        },
      ],
    };

    try {
      const command = new SignUpCommand(params);
      const response = await this.client.send(command);
      
      // Auto confirm user for simplicity (in production, you might want to send a verification email)
      await this.confirmUser(email);
      
      return response;
    } catch (error) {
      console.error('Error registering user with Cognito:', error);
      throw error;
    }
  }

  async confirmUser(username: string) {
    const params = {
      UserPoolId: this.userPoolId,
      Username: username,
    };

    try {
      const command = new AdminConfirmSignUpCommand(params);
      return await this.client.send(command);
    } catch (error) {
      console.error('Error confirming user:', error);
      throw error;
    }
  }

  async loginUser(email: string, password: string) {
    const params = {
      AuthFlow: 'USER_PASSWORD_AUTH' as AuthFlowType,
      ClientId: this.clientId,
      AuthParameters: {
        USERNAME: email,
        PASSWORD: password,
      },
    };

    try {
      const command = new InitiateAuthCommand(params);
      const response = await this.client.send(command);
      return response;
    } catch (error) {
      console.error('Error logging in user with Cognito:', error);
      throw error;
    }
  }
}

export const createCognitoService = () => new CognitoService();