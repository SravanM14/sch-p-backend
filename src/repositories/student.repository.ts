import Student, {IStudent} from "../models/student.model"

 class studentRepository{

    async createStudent(student:IStudent):Promise<IStudent>{
        return await Student.create(student);
    }


    async findById(id:string):Promise<IStudent | null>{
        return await Student.findById(id);
    }

    async findOne(studentId:string):Promise<IStudent | null>{
        return await Student.findOne({studentId});
    }


      async findByAdmissionNumber(
        admissionNumber: string
    ): Promise<IStudent | null> {
        return await Student.findOne({ admissionNumber });
    }

     async findAll(): Promise<IStudent[]> {
        return await Student.find();
    }

    async findStudents(
       search?:string,
       className?:string,
       section?:string,
       isActive?:boolean,
       page:number = 1,
       limit:number=10
    ){
      const filters:Record<string,unknown>={};

      if(search){
        filters.$or=[
            {
                studentId:{
                $regex:search,
                $options:"i"
            }
        },{
            name:{
                $regex:search,
                $options:"i"
            }
        },
        {
            admissionNumber:{
                $regex:search,
                $options:"i"
            }
        },

        ]
      }
      if(className){
        filters.className = className;
      }
      if(section){
        filters.section = section;
      }
      if(isActive !== undefined){
        filters.isActive = isActive;
      }

      const skip =(page-1)* limit;

      const [students, totalStudents] = await Promise.all([
        Student.find(filters)
         .populate("parentId", "userId name phone")
        .skip(skip)
        .limit(limit)
        .sort({createdAt:-1}),
        Student.countDocuments()
      ])

      return{
        students,
        totalStudents
      }

    }

      async update(
        id: string,
        data: Partial<IStudent>
    ): Promise<IStudent | null> {
        return await Student.findByIdAndUpdate(
            id,
            data,
            { new: true }
        );
    }


    async delete(
        id: string
    ): Promise<IStudent | null> {
        return await Student.findByIdAndDelete(id);
    }
}

export default new studentRepository();