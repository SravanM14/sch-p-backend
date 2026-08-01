import { Request, Response, NextFunction } from "express";
import authService from "../services/auth.service";


class AuthController {

    async RegisterController(req: Request, res: Response, next: NextFunction): Promise<void> {

        try {
            const user = await authService.RegisterUser(req.body)

            res.status(200).json({
                success: true,
                message: "User registered successfully",
                data: user,
            })
        }
        catch (error) {
            next(error)
        }
    }
}

export default new AuthController();