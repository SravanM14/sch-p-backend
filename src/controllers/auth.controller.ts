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
}

export default new AuthController();


