import { Request, Response,NextFunction } from "express";
import { IStudent } from "../models/student.model";
import studentService
    from "../services/student.service";
import { HTTP_STATUS } from "../constants/httpStatus";
import ApiResponse from "../utils/ApiResponse";


class StudentController{

  async createStudent(req:Request, res:Response, next:NextFunction){
          try{
            const studentData = {
                name: req.body.name,
                dateOfBirth: new Date(req.body.dateOfBirth),
                gender: req.body.gender,
                admissionNumber: req.body.admissionNumber,
                rollNumber: req.body.rollNumber,
                address: req.body.address,
                phone: req.body.phone,
                class: req.body.class,
                section: req.body.section,
                parentUserId: req.body.parentUserId,
            } as Partial<IStudent> & { parentUserId: string };
             console.log(studentData,"controller")
           const student = await studentService.createStdent(studentData, req.file);

           res.status(HTTP_STATUS.OK).json(
            new ApiResponse(true, "Student Created Successfully", student)
           )

          }catch(err){
            next(err)
          }
  }


  async studentList(req:Request, res:Response, next:NextFunction){
    try{
      const{search, className, section,isActive, page, limit}= req.query;

      const currentPage = page? Number(page): 1;
      const currentLimit = limit? Number(limit):10;
        let activeFilter: boolean | undefined;

        if (isActive === "true") {
            activeFilter = true;
        } else if (isActive === "false") {
            activeFilter = false;
        } else {
            activeFilter = undefined;
        }
      const response = await studentService.getStudents(search as string | undefined,
        className as string|undefined,
        section  as string|undefined, 
        activeFilter,
        currentPage,
        currentLimit
        )

      res.status(HTTP_STATUS.OK).json(
        new ApiResponse(true, "studentListfetched successfully", response)
      )

    }catch(err){
        next(err)
    }
  }
}

export default new StudentController()