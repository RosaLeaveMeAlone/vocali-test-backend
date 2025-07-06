import { UserType } from "../interfaces/user.type";
import { createUserRepository, UserRepository } from "../repositories/user.repository";


export class User {
    constructor(
        private readonly userRepository: UserRepository
    ) {}

    //! Coloco este nombre como DTO para verlo como si estuviera trabajando con NestJS
    async createUser(userDto: UserType): Promise<UserType> {
        return this.userRepository.createUser(userDto);
    }

    async getUserByEmail(email: string) {
        return this.userRepository.getUserByEmail(email);
    };

}


export function createUserModel(): User {
    const userRepository = createUserRepository();
    return new User(userRepository);
}