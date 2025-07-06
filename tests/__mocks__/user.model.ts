import { UserType } from '../../app/interfaces/user.type';

export const mockUserModel = {
  createUser: jest.fn(),
  getUserByEmail: jest.fn(),
};

export const createUserModel = jest.fn(() => mockUserModel);