import { Request, Response, NextFunction } from "express";
import authService from "../services/auth.service";
import { HTTP_STATUS } from "../constants/httpStatus";
import ApiResponse from "../utils/ApiResponse";
import { Http2ServerRequest } from "node:http2";
import ApiError from "../utils/ApiError";


class AuthController {

    async RegisterController(req: Request, res: Response, next: NextFunction): Promise<void> {

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
            res.status(HTTP_STATUS.OK).json(
                new ApiResponse(
                    true,
                    "Authenticated user",
                    {
                        userId: req.user?.id,
                        role: req.user?.role,
                    }
                )
            );
        } catch (error) {
            next(error);
        }
    }


    async adminProfile(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            console.log("ADMIN PROFILE CONTROLLER START");
            res.status(HTTP_STATUS.OK).json(
                new ApiResponse(true, "Admin Access granted", {
                    userId: req.user?.id,
                    role: req.user?.role,
                })
            )

            console.log("ADMIN PROFILE RESPONSE SENT");
        }
        catch (err) {
            console.log(err)
            next(err)
        }
    }


    async refreshToken(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { refreshToken } = req.body;

            if (!refreshToken) {
                throw new ApiError(HTTP_STATUS.UNAUTHORIZED, "Refresh token is required")
            }

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
            const { email } = req.body;

            if (!email) {
                throw new ApiError(HTTP_STATUS.BAD_REQUEST, "Email Required")
            }

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
            const token = req.params.token;
            const { password, confirmPassword } = req.body;

            if (!token) {
                throw new ApiError(
                    HTTP_STATUS.BAD_REQUEST,
                    "Reset token is required"
                );
            }

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
        const { refreshToken } = req.body;

        if (!refreshToken) {
            throw new ApiError(
                HTTP_STATUS.BAD_REQUEST,
                "Refresh token is required"
            );
        }

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
}

export default new AuthController();


