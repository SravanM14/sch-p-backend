import bcrypt from 'bcryptjs';
import userRepository from '../repositories/user.repository';
import { UserRole, IUser } from '../models/user.model';
import { HTTP_STATUS } from '../constants/httpStatus';
import ApiError from '../utils/ApiError';
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from '../utils/tokens';
import { generateResetToken, hashResetToken } from '../utils/reset-token';
import transport from '../config/email.config';


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

        user.refreshToken = refreshToken;

        await user.save();

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

            if (user.refreshToken !== refreshToken) {
                throw new ApiError(
                    HTTP_STATUS.UNAUTHORIZED,
                    "Invalid refresh token"
                );
            }
            const accessToken = generateAccessToken(
                user._id.toString(),
                user.role
            )

            return { accessToken };

        } catch (err) {

            if (err instanceof ApiError) {
                throw err;
            }

            throw new ApiError(HTTP_STATUS.UNAUTHORIZED,
                "Invalid or expired refresh token"
            )
        }

    }


    async forgotPassword(email: string) {
        try {
            const user = await userRepository.findUserByEmail(email);

            if (!user) {
                return;
            }

            const { resetToken, hashedToken } = generateResetToken();

            // Token Expiry in 30 mins

            const resetExpiryToken = new Date(
                Date.now() + 30 * 60 * 1000
            )

            user.resetPasswordToken = hashedToken;
            user.resetPasswordExpires = resetExpiryToken;

            await user.save();

            const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`
console.log("BEFORE SEND EMAIL");
            // Send email
            await transport.sendMail({
                from: process.env.EMAIL_USER,
                to: user.email,
                subject: "School Management - Password Reset",
                html: `
            <h2>Password Reset Request</h2>

            <p>Hello ${user.name},</p>

            <p>
                We received a request to reset your password.
            </p>

            <p>
                Click the button below to reset your password:
            </p>

            <p>
                <a
                    href="${resetUrl}"
                    style="
                        display: inline-block;
                        padding: 10px 20px;
                        background-color: #2563eb;
                        color: white;
                        text-decoration: none;
                        border-radius: 5px;
                    "
                >
                    Reset Password
                </a>
            </p>

            <p>
                This link will expire in 30 minutes.
            </p>

            <p>
                If you did not request a password reset,
                you can safely ignore this email.
            </p>

            <p>
                Thanks,<br>
                School Management Team
            </p>
        `
            });

console.log("AFTER SEND EMAIL");
        }
        catch (err) {
          console.log(err)
        }
    }

    async resetPassword(token: string, newPassword: string) {

        const hashedToken = hashResetToken(token);

        // Find user with matching token
        const user = await userRepository.findUserByResetToken(
            hashedToken
        );
        if (!user) {
            throw new ApiError(
                HTTP_STATUS.BAD_REQUEST,
                "Invalid or expired reset token"
            );
        }

        // Check token expiry
        if (
            !user.resetPasswordExpires ||
            user.resetPasswordExpires < new Date()
        ) {
            throw new ApiError(
                HTTP_STATUS.BAD_REQUEST,
                "Invalid or expired reset token"
            );
        }
        // Hash the new password
        const hashedPassword = await bcrypt.hash(
            newPassword,
            10
        );

        // Update password
        user.password = hashedPassword;

        // Invalidate reset token
        user.resetPasswordToken = null;
        user.resetPasswordExpires = null;

        await user.save();

        return true;
    }

    async logout(refreshToken: string) {
    const decoded = verifyRefreshToken(refreshToken);

    const user = await userRepository.findUserById(
        decoded.id
    );

    if (!user) {
        throw new ApiError(
            HTTP_STATUS.UNAUTHORIZED,
            "User not found"
        );
    }

    // Invalidate refresh token
    user.refreshToken = null;

    await user.save();

    return true;
}
}

export default new AuthService();