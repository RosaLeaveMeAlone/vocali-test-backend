export const mockCognitoService = {
  registerUser: jest.fn(),
  loginUser: jest.fn(),
};

export const createCognitoService = jest.fn(() => mockCognitoService);