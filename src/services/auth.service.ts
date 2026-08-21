import bcrypt from 'bcryptjs';
import userRepository from '../repositories/user.repository';
import { UserRole, IUser } from '../models/user.model';
import { HTTP_STATUS } from '../constants/httpStatus';
import ApiError from '../utils/ApiError';
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from '../utils/tokens';


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
            throw new ApiError(HTTP_STATUS.BAD_REQUEST, "password do not match")
        }

        // check wether user already exist

        const userExist = await userRepository.findUserByEmail(email);

        if (userExist) {
            throw new ApiError(HTTP_STATUS.CONFLICT, "Email already exists");
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

    async login(email: string, password: string) {

        const user = await userRepository.findUserByEmail(email);

        if (!user) {
            console.log("test")
            throw new ApiError(HTTP_STATUS.UNAUTHORIZED, "Invalid User or Password")
        }

        if (!user.isActive) {
            throw new ApiError(HTTP_STATUS.FORBIDDEN, "User account is not Active")
        }

        const isPasswordValid = await bcrypt.compare(
            password,
            user.password
        );

        if (!isPasswordValid) {
            console.log("test")
            throw new ApiError(HTTP_STATUS.UNAUTHORIZED, "Invalid User or Password");
        }

        const accessToken = generateAccessToken(user._id.toString(), user.role);

        const refreshToken = generateRefreshToken(user._id.toString())

        return {
            user: {
                _id: user._id,
                name: user.name,
                email: user.email,
                dateOfBirth: user.dateOfBirth,
                role: user.role,
                isActive: user.isActive
            },
            accessToken,
            refreshToken
        }
    }


    async refreshAcessToken(refreshToken: string) {
        try {
     const decoded = verifyRefreshToken(refreshToken);
    console.log("REFRESH TOKEN VERIFIED:", decoded);
            const user = await userRepository.findUserById(decoded.id);


            if (!user) {
                throw new ApiError(HTTP_STATUS.UNAUTHORIZED, "user not found")
            }

            if (!user.isActive) {
                throw new ApiError(
                    HTTP_STATUS.FORBIDDEN,
                    "Your account is inactive"
                );
            }
          const accessToken = generateAccessToken(
            user._id.toString(),
            user.role
          )

          return {accessToken};

        } catch (err) {

           if(err instanceof ApiError){
            throw err;
           }

           throw new ApiError(HTTP_STATUS.UNAUTHORIZED,
             "Invalid or expired refresh token"
            )
        }

    }
}

export default new AuthService();