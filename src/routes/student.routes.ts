import { Router } from "express";
import authorize from "../middleware/autorize.middleware";
import authenticate from "../middleware/auth.middleware";
import upload from "../config/multer.config";
import studentController from "../controllers/student.controller";

const router = Router();


router.post('/create', 
    authenticate, 
    authorize("ADMIN"), 
    upload.single("profileImage"),
    studentController.createStudent)


router.get('/list', authenticate, authorize("ADMIN"), studentController.studentList)

export default router;