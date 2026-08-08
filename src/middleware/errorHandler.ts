import { Request, Response, NextFunction } from "express";
import ApiError from "../utils/ApiError";

const errorHandler = (
    err:Error | ApiError,
    req:Request,
    res:Response,
    next:NextFunction
):void=>{
const statusCode = err instanceof ApiError ? err.statusCode : 500;

  res.status(statusCode).json({
    sucess:false,
    message: err.message || "Internal Server Error"
  })

};

export default errorHandler;