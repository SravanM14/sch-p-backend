import Counter from "../models/counter.model";
import  { UserRole } from '../models/user.model';

const ROLE_PREFIX: Record<UserRole, string> = {
    [UserRole.ADMIN]: "ADM",
    [UserRole.TEACHER]: "TEA",
    [UserRole.PARENT]: "PAR",
    [UserRole.STUDENT]: "STUD",
};


export const generateId = async (
    role:UserRole
):Promise<string>=>{

    const prefix = ROLE_PREFIX[role];

    if(!role){
           throw new Error(
            `User ID prefix not configured for role: ${role}`
        );
    }

    const counter = await Counter.findByIdAndUpdate(
        {
            _id:role
        },
        {
            $inc:{
                sequence:1
            }
        },
        {
            new:true,
            upsert:true,
            setDefaultsOnInsert:true
        }
    )

    if (!counter) {
        throw new Error("Failed to generate user ID");
    }


    const sequenceNumber = counter.sequence
        .toString()
        .padStart(4, "0");

        return `${prefix}${sequenceNumber}`

}