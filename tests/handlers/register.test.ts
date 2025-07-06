import { handler } from '../../app/handlers/register';
import { mockUserModel, createUserModel } from '../__mocks__/user.model';
import { mockCognitoService, createCognitoService } from '../__mocks__/cognito.service';

// Mock the modules
jest.mock('../../app/models/user.model', () => require('../__mocks__/user.model'));
jest.mock('../../app/services/cognito.service', () => require('../__mocks__/cognito.service'));

describe('Register Handler', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('should register user successfully', async () => {
    // Arrange
    const mockEvent = {
      body: JSON.stringify({
        email: 'test@example.com',
        password: 'TestPassword123!',
        confirmPassword: 'TestPassword123!'
      })
    };

    const mockCognitoResponse = {
      UserSub: 'user-sub-123'
    };

    const mockCreatedUser = {
      email: 'test@example.com',
      sub: 'user-sub-123'
    };

    mockCognitoService.registerUser.mockResolvedValue(mockCognitoResponse);
    mockUserModel.createUser.mockResolvedValue(mockCreatedUser);

    // Act
    const result = await handler(mockEvent);

    // Assert
    expect(result.statusCode).toBe(200);
    expect(JSON.parse(result.body)).toEqual({
      message: 'Registration successful',
      data: mockCreatedUser
    });
    expect(mockCognitoService.registerUser).toHaveBeenCalledWith('test@example.com', 'TestPassword123!');
    expect(mockUserModel.createUser).toHaveBeenCalledWith({
      email: 'test@example.com',
      sub: 'user-sub-123'
    });
  });

  test('should reject invalid email', async () => {
    // Arrange
    const mockEvent = {
      body: JSON.stringify({
        email: 'invalid-email',
        password: 'TestPassword123!',
        confirmPassword: 'TestPassword123!'
      })
    };

    // Act
    const result = await handler(mockEvent);

    // Assert
    expect(result.statusCode).toBe(400);
    const body = JSON.parse(result.body);
    expect(body.message).toBe('Validation Error');
    expect(body.errors).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          message: 'Invalid email address',
          path: ['email']
        })
      ])
    );
    expect(mockCognitoService.registerUser).not.toHaveBeenCalled();
    expect(mockUserModel.createUser).not.toHaveBeenCalled();
  });

  test('should reject weak password', async () => {
    // Arrange
    const mockEvent = {
      body: JSON.stringify({
        email: 'test@example.com',
        password: 'weak',
        confirmPassword: 'weak'
      })
    };

    // Act
    const result = await handler(mockEvent);

    // Assert
    expect(result.statusCode).toBe(400);
    const body = JSON.parse(result.body);
    expect(body.message).toBe('Validation Error');
    expect(body.errors).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          message: 'Password must be at least 8 characters long',
          path: ['password']
        })
      ])
    );
    expect(mockCognitoService.registerUser).not.toHaveBeenCalled();
    expect(mockUserModel.createUser).not.toHaveBeenCalled();
  });

  test('should reject mismatched passwords', async () => {
    // Arrange
    const mockEvent = {
      body: JSON.stringify({
        email: 'test@example.com',
        password: 'TestPassword123!',
        confirmPassword: 'DifferentPassword123!'
      })
    };

    // Act
    const result = await handler(mockEvent);

    // Assert
    expect(result.statusCode).toBe(400);
    const body = JSON.parse(result.body);
    expect(body.message).toBe('Validation Error');
    expect(body.errors).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          message: 'Passwords do not match'
        })
      ])
    );
    expect(mockCognitoService.registerUser).not.toHaveBeenCalled();
    expect(mockUserModel.createUser).not.toHaveBeenCalled();
  });
});