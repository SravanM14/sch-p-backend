import { Schema, Document, model, Types } from 'mongoose';
import { Gender } from './user.model';


export interface IStudent extends Document {

    studentId: string;

    name: string;
    dateOfBirth: Date;
    gender: Gender;

    class: string;
    section: string;
    profileImage?: string;
    admissionNumber: string;
    rollNumber?: string;

    address?: string;
    phone?: string;

    parentId: Types.ObjectId;

    isActive: boolean;

    createdAt: Date;
    updatedAt: Date;

}


const StundentSchema = new Schema<IStudent>(
    {

        studentId: {
            type: String,
            required: true,
            unique: true,
            trim: true,
        },
        name: {
            type: String,
            require: true,
            minLength: 3,
            maxLength: 50,
        },
        dateOfBirth: {
            type: Date,
            required: true,
        },

        gender: {
            type: String,
            enum: Object.values(Gender),
            required: true,
        },
        admissionNumber: {
            type: String,
            required: true,
            unique: true,
            trim: true,
        },
        rollNumber: {
            type: String,
            trim: true,
            default: null,
        },
         class:{
            type:String,
            trim:true,
            required:true
         },
           section:{
            type:String,
            trim:true,
            required:true
         },
        address: {
            type: String,
            trim: true,
            default: null,
        },

        phone: {
            type: String,
            trim: true,
            default: null,
        },
        parentId: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },

        isActive: {
            type: Boolean,
            default: true,
        },
        profileImage: {
            type: String,
            default: null,
        },
    },
    {
        timestamps: true
    }
)

const Student = model<IStudent>(
    "Student", StundentSchema
);

export default Student;