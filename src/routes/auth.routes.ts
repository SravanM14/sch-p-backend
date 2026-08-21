import { Router } from "express";
import authController from "../controllers/auth.controller";
import { loginValidation, registerValidation } from "../validations/auth.validation"
import validate from "../middleware/validator";
import authenticate from "../middleware/auth.middleware";
import authService from "../services/auth.service";
import authorize from "../middleware/autorize.middleware";


const router = Router()

/**
 * Register api Router 'api/v1/auth/register
 */

router.post('/register', registerValidation, validate, authController.RegisterController);

router.post('/login', loginValidation, validate, authController.loginController)

router.get('/profile', authenticate, authController.profile)

router.get('/admin-profile',authenticate, authorize("ADMIN", "TEACHER") ,authController.adminProfile)

router.post('/refresh-token', authController.refreshToken)

export default router;