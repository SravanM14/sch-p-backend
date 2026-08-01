import bcrypt from 'bcryptjs';
import userRepository from '../repositories/user.repository';
import { UserRole, IUser } from '../models/user.model';


export interface registerUserDto {
    name: string;
    email: string;
    password: string;
    confirmPassword: string;
    dateOfBirth: Date;
    role?: UserRole;
}

class AuthService {


    async RegisterUser(UserData: registerUserDto): Promise<Partial<IUser>> {

        const {
            name,
            email,
            password,
            confirmPassword,
            dateOfBirth,
            role
        } = UserData;

        // check if password match

        if (password !== confirmPassword) {
            throw new Error("password do not match")
        }

        // check wether user already exist

        const userExist = await userRepository.findUserByEmail(email);

        if (userExist) {
            throw new Error("Email already exists");
        }


        // hash password

        const hashPassword = await bcrypt.hash(password, 10)


        // save User
        const user = await userRepository.create({
            name,
            email,
            password: hashPassword,
            dateOfBirth,
            role,
        });


        //return without password

        return {
            _id: user._id,
            name: user.name,
            email: user.email,
            dateOfBirth: user.dateOfBirth,
            role: user.role,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt
        }

    }
}

export default new AuthService();