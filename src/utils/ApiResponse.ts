class ApiResponse<T>{
    sucess:boolean;
    message:string;
    data:T | null;

    constructor(sucess:boolean, message:string, data:T | null=null){
        this.sucess = sucess;
        this.message= message;
        this.data= data;
    }
}

export default ApiResponse;