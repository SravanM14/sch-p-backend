import { Request, Response, NextFunction } from "express";
import authService from "../services/auth.service";
import { HTTP_STATUS } from "../constants/httpStatus";
import ApiResponse from "../utils/ApiResponse";
import { Http2ServerRequest } from "node:http2";


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
}

export default new AuthController();


