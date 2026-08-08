import { body } from 'express-validator';
import { UserRole } from '../models/user.model';


export const registerValidation = [
    //name validation
    body('name')
        .trim()
        .notEmpty()
        .withMessage('Name is required')
        .isLength({ min: 3, max: 50 })
        .withMessage('name length should be in between 3 to 50 charactors'),

    // email Validation
    body('email')
        .trim()
        .notEmpty()
        .withMessage('Email is required')
        .isEmail()
        .withMessage('Please enter valid email')
        .normalizeEmail(),

    // passwod validation

    body('password')
        .notEmpty()
        .withMessage('Password is required')
        .isLength({ min: 8 })
        .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/)
        .withMessage("Password must contain uppercase, lowercase, number and special character"),

    //confirm Password

    body('confirmPassword')
        .notEmpty()
        .withMessage('Password is required')
        .custom((value, { req }) => {
            if (value !== req.body.password) {
                console.log(value, req.password)
                throw new Error("Passwords do not match");
            }
            return true;
        }),

    // Date of Birth
    body("dateOfBirth")
        .notEmpty()
        .withMessage("Date of Birth is required")
        .isISO8601()
        .withMessage("Invalid date format"),

    // Role
    body("role")
        .optional()
        .isIn(Object.values(UserRole))
        .withMessage("Invalid user role"),
]

export const loginValidation =[

    body("email")
    .trim()
    .notEmpty()
    .withMessage("Email is Required")
    .isEmail()
    .withMessage("Email is Invalid")
    .normalizeEmail(),

    body("password")
    .notEmpty()
    .withMessage("Password is Required")
]