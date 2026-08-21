import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';
import { HTTP_STATUS } from '../constants/httpStatus';
import ApiError from '../utils/ApiError';


interface JwtPayload {
  id: string;
  role: string;
  iat?: number;
  exp?: number;
}


 const authenticate = (req:Request, res:Response, next:NextFunction):void=>{

    try{
         const authHeader = req.headers.authorization;
         console.log("AUTH HEADER: starts");
         if(!authHeader){
            throw new ApiError(HTTP_STATUS.UNAUTHORIZED, "Authorization header is required");
         }
          console.log("AUTH HEADER:", authHeader);

         if(!authHeader.startsWith("Bearer ")){
            throw new ApiError(HTTP_STATUS.UNAUTHORIZED, "Invalid authorization format");
         }
          const token = authHeader.split(" ")[1];
         if(!token){
             throw new ApiError(HTTP_STATUS.UNAUTHORIZED, "Token Required");
         }

         const decode = jwt.verify(token, process.env.JWT_SECRET as string) as JwtPayload;

         req.user = decode;

         next();
    }catch(err){
        next(err);
    }
 }

 export default authenticate;