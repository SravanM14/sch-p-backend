import { HTTP_STATUS } from "../constants/httpStatus";
import { IStudent } from "../models/student.model";
import { UserRole } from "../models/user.model";
import studentRepository from "../repositories/student.repository";
import userRepository from "../repositories/user.repository";
import ApiError from "../utils/ApiError";
import { generateId } from "../utils/generateUserId";
import { uploadToCloudinary } from "../utils/uploadToCloudinary";

export class StudentService {

    async createStdent(
        studentData: Partial<IStudent> & {
            parentUserId: string;
        },
        profileImage?: Express.Multer.File
    ) {
   // console.log(studentData,"data")
        // 1. Validate parent ID
        if (!studentData.parentUserId) {
            throw new ApiError(
                HTTP_STATUS.BAD_REQUEST,
                "Parent Id is Required"
            );
        }

        // 2. Find parent
        const parent = await userRepository.findUserByUserId(
            studentData.parentUserId
        );

        if (!parent) {
            throw new ApiError(
                HTTP_STATUS.NOT_FOUND,
                "Parent Id is Not Found"
            );
        }

        // 3. Check parent role
        if (parent.role !== UserRole.PARENT) {
            throw new ApiError(
                HTTP_STATUS.BAD_REQUEST,
                "Selected user is not a parent"
            );
        }

        // 4. Check parent active status
        if (!parent.isActive) {
            throw new ApiError(
                HTTP_STATUS.BAD_REQUEST,
                "Parent account is inactive"
            );
        }

        // 5. Check admission number
        if (!studentData.admissionNumber) {
            throw new ApiError(
                HTTP_STATUS.BAD_REQUEST,
                "Admission number is required"
            );
        }

        const existingStudent =
            await studentRepository.findByAdmissionNumber(
                studentData.admissionNumber
            );

        if (existingStudent) {
            throw new ApiError(
                HTTP_STATUS.CONFLICT,
                "Admission number already exists"
            );
        }

        // 6. Generate Student ID
        const studentId = await generateId(UserRole.STUDENT);

        // 7. Upload profile image
        let profileImageUrl: string | undefined;

        if (profileImage) {
            const uploadResult = await uploadToCloudinary(
                profileImage.buffer,
                "school-management/students"
            );

            profileImageUrl = uploadResult.secure_url;
        }

        // 8. Create student
        const student = await studentRepository.createStudent({
            studentId,
            name: studentData.name!,
            dateOfBirth: studentData.dateOfBirth!,
            gender: studentData.gender!,
            class: studentData.class!,
            section: studentData.section!,
            admissionNumber: studentData.admissionNumber!,
            rollNumber: studentData.rollNumber,
            address: studentData.address,
            phone: parent.phoneNumber,
            profileImage: profileImageUrl,
            parentId: parent._id,
            isActive: true,
        } as IStudent);

        return student;
    }

    async getStudents(
    search?: string,
    className?: string,
    section?: string,
    isActive?: boolean,
    page: number = 1,
    limit: number = 10
) {
    return await studentRepository.findStudents(
        search,
        className,
        section,
        isActive,
        page,
        limit
    );
}
}


export default new StudentService();