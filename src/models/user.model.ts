import { Schema, Document, model } from "mongoose";
import { timeStamp } from "node:console";

export enum UserRole {
    ADMIN = "ADMIN",
    STUDENT = "STUDENT",
    TEACHER = "TEACHER",
    PARENT = "PARENT"
}


export interface IUser extends Document {
    name: string;
    email: string;
    password: string;
    dateOfBirth: Date;
    role: UserRole;
    isActive: boolean;
    resetPasswordToken: string | null;
    resetPasswordExpires: Date | null;
    refreshToken: string | null;
    createdAt: Date;
    updatedAt: Date;

}

const userSchema = new Schema<IUser>(
    {
        name: {
            required: true,
            trim: true,
            type: String,
            minLength: 3,
            maxLength: 30
        },
        email: {
            unique: true,
            type: String,
            required: true,
            trim: true,
            lowercase: true,
        },
        password: {
            type: String,
            required: true,
            minlength: 8
        },

        dateOfBirth: {
            type: Date,
            required: true
        },

        role: {
            type: String,
            enum: Object.values(UserRole),
            default: UserRole.PARENT
        },

        isActive: {
            type: Boolean,
            default: true
        },
        resetPasswordToken: {
            type: String,
            default: null
        },
        resetPasswordExpires: {
            type: Date,
            default: null,
        },
        refreshToken: {
            type: String,
            default: null
        },
    },
    {
        timestamps: true
    }
)

const User = model<IUser>("User", userSchema);

export default User;