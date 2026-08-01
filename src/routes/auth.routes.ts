import { Router } from "express";
import authController from "../controllers/auth.controller";
import { registerValidation } from "../validations/auth.validation"
import validate from "../middleware/validator";


const router = Router()

/**
 * Register api Router 'api/v1/auth/register
 */

router.post('/register', registerValidation, validate, authController.RegisterController);

export default router;