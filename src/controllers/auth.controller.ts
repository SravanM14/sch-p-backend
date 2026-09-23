import { Request, Response, NextFunction } from "express";
import authService from "../services/auth.service";
import { HTTP_STATUS } from "../constants/httpStatus";
import ApiResponse from "../utils/ApiResponse";
import ApiError from "../utils/ApiError";
import { validateAtLeastOneField, validateRequiredFields } from "../utils/validation";
import cloudinary from "../config/cloudinary.config";
import { uploadToCloudinary } from "../utils/uploadToCloudinary";
import { UserRole } from "../models/user.model";


class AuthController {

    async RegisterController(req: Request, res: Response, next: NextFunction): Promise<void> {
        validateRequiredFields(req.body, [
            "name",
            "email",
            "password",
            "confirmPassword",
            "dateOfBirth",
            "role"
        ]);
        try {
            const user = await authService.RegisterUser(req.body)

            res.status(HTTP_STATUS.CREATED).json(
                new ApiResponse(true, "User registered successfully", user)
            )

        }
        catch (error) {
            next(error)
        }
    }

    async loginController(req: Request, res: Response, next: NextFunction) {
        try {
            validateRequiredFields(req.body, [
                "email",
                "password"
            ]);
            const user = await authService.login(req.body.email, req.body.password);

            res.status(HTTP_STATUS.CREATED).json({
                success: true,
                message: "User Login successfully",
                data: user,
            })
        }
        catch (error) {
            next(error)
        }
    }

    async profile(
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> {
        try {


            const userId = req.user?.id;

            if (!userId) {
                throw new ApiError(
                    HTTP_STATUS.UNAUTHORIZED,
                    "Authentication required"
                );
            }
            const userDetials = await authService.getProfileDetails(userId)
            res.status(HTTP_STATUS.OK).json(
                new ApiResponse(
                    true,
                    "Authenticated user",
                    userDetials
                )
            );
        } catch (error) {
            next(error);
        }
    }

    async updateProfile(
        req: Request,
        res: Response,
        next: NextFunction) {
        try {

            const userId = req.user?.id;
            if (!userId) {
                throw new ApiError(
                    HTTP_STATUS.UNAUTHORIZED,
                    "Authentication required"
                );
            }

            let profileImage: string | undefined;

            if (req.file) {
                const result = await uploadToCloudinary(req.file.buffer, "school-management/profile-images")
                profileImage = result.secure_url;
            }
             
            const updateUser ={
                ...req.body,
                ...(profileImage && {profileImage})
            }

            const updatedUser = await authService.updateProfileDetails(userId, updateUser);
            res.status(HTTP_STATUS.OK).json(
                new ApiResponse(true, "Profile updated successfully", updatedUser)
            );
        } catch (error) {
            next(error);
        }
    }


    async adminProfile(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            res.status(HTTP_STATUS.OK).json(
                new ApiResponse(true, "Admin Access granted", {
                    userId: req.user?.id,
                    role: req.user?.role,
                })
            )
        }
        catch (err) {
            console.log(err)
            next(err)
        }
    }


    async refreshToken(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            validateRequiredFields(req.body, [
                "refreshToken"
            ]);
            const { refreshToken } = req.body;

            const result = await authService.refreshAcessToken(refreshToken)

            res.status(HTTP_STATUS.OK).json(
                new ApiResponse(true, "Refresh token generated successfully", result)
            )
        } catch (err) {
            next(err)
        }
    }

    async forgotPassword(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            validateRequiredFields(req.body, [
                "email"
            ]);
            const { email } = req.body;

            // if (!email) {
            //     throw new ApiError(HTTP_STATUS.BAD_REQUEST, "Email Required")
            // }

            await authService.forgotPassword(email);


            res.status(HTTP_STATUS.OK).json(
                new ApiResponse(true, " If an account exists with this email, a password reset link has been sent.")
            )
        } catch (err) {
            next(err);
        }
    }

    async resetPassword(
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> {
        try {

            validateRequiredFields(req.body, [
                "newPassword",
                "confirmPassword"
            ]);
            const token = req.params.token;
            const { password, confirmPassword } = req.body;

            if (typeof token !== "string") {
                throw new ApiError(
                    HTTP_STATUS.BAD_REQUEST,
                    "Invalid reset token"
                );
            }

            if (!password || !confirmPassword) {
                throw new ApiError(
                    HTTP_STATUS.BAD_REQUEST,
                    "Password and confirm password are required"
                );
            }

            if (password !== confirmPassword) {
                throw new ApiError(
                    HTTP_STATUS.BAD_REQUEST,
                    "Passwords do not match"
                );
            }

            await authService.resetPassword(
                token,
                password
            );

            res.status(HTTP_STATUS.OK).json(
                new ApiResponse(
                    true,
                    "Password reset successfully"
                )
            );

        } catch (error) {
            next(error);
        }
    }

    async logout(
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> {
        try {
            validateRequiredFields(req.body, [
                "refreshToken"
            ]);
            const { refreshToken } = req.body;



            await authService.logout(refreshToken);

            res.status(HTTP_STATUS.OK).json(
                new ApiResponse(
                    true,
                    "Logout successful"
                )
            );

        } catch (error) {
            next(error);
        }
    }

    async changePasswordController(req: Request, res: Response, next: NextFunction) {
        try {
            const { currentPassword, newPassword, confirmPassword } = req.body;

            if (!currentPassword || !newPassword || !confirmPassword) {
                throw new ApiError(HTTP_STATUS.BAD_REQUEST, "Current password, new password and confirm password are required");
            }
            const userId = req.user?.id;

            if (!userId) {
                throw new ApiError(HTTP_STATUS.UNAUTHORIZED, "User should be Authorised");
            }

            await authService.changePassword(userId, currentPassword, newPassword, confirmPassword);

            res.json(
                new ApiResponse(
                    true,
                    "Password Changed Successfully"
                )
            )


        } catch (err) {
            next(err);
        }
    }

    async getAllUsers(req: Request, res: Response, next: NextFunction) {
        try {
            const listOfUsers = await authService.getAllUsersList();

            res.json(
                new ApiResponse(
                    true,
                    "Users List fetches successfully",
                    listOfUsers
                )
            )
        } catch (err) {
            next(err)
        }
    }


    async getUsers(
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> {
    try {
        const { search, role, isActive , page, limit} = req.query;

        const currentPage = page ? Number(page) : 1;
        const currentLimit = limit ? Number(limit): 10;

        const users = await authService.getUsers(
            search as string | undefined,
            role as UserRole | undefined,
            isActive !== undefined
                ? isActive === "true"
                : undefined,
            currentPage,
            currentLimit
        );

        res.status(HTTP_STATUS.OK).json(
            new ApiResponse(
                true,
                "Users fetched successfully",
                users
            )
        );
    } catch (error) {
        next(error);
    }
}
    async getUserById(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const id = req.params.id as string;

            if (!id) {
                throw new ApiError(
                    HTTP_STATUS.BAD_REQUEST,
                    "User ID is required"
                );
            }

            const user = await authService.getUserById(id);

            res
                .status(HTTP_STATUS.OK)
                .json(
                    new ApiResponse(
                        true,
                        "User fetched successfully",
                        user
                    )
                );
        } catch (error) {
            next(error);
        }
    }

    async updateUserById(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            validateAtLeastOneField(req.body, [
                "name",
                "email",
                "dateOfBirth",
                "role",
                "isActive"
            ]);
            const id = req.params.id as string;
            const updateData = req.body;

            if (!id) {
                throw new ApiError(
                    HTTP_STATUS.BAD_REQUEST,
                    "User ID is required"
                );
            }
            const updatedUser = await authService.updateUserById(id, updateData);

            res
                .status(HTTP_STATUS.OK)
                .json(
                    new ApiResponse(
                        true,
                        "User updated successfully",
                        updatedUser
                    )
                );

        } catch (error) {
            next(error);
        }
    }

    async deleteUserById(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const id = req.params.id as string;

            if (!id) {
                throw new ApiError(
                    HTTP_STATUS.BAD_REQUEST,
                    "User ID is required"
                );
            }

            await authService.deleteUserById(id);

            res
                .status(HTTP_STATUS.OK)
                .json(
                    new ApiResponse(
                        true,
                        "User deleted successfully"
                    )
                );


        }
        catch (error) {
            next(error);
        }
    }
}

export default new AuthController();


