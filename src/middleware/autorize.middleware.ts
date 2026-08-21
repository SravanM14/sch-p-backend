import { Request, Response, NextFunction } from "express";
import { HTTP_STATUS } from "../constants/httpStatus";
import ApiError from "../utils/ApiError";


const authorize = (...allowedRoles: string[]) => {
  return (
    req: Request,
    res: Response,
    next: NextFunction
  ): void => {
    try {
      if (!req.user) {

        throw new ApiError(
          HTTP_STATUS.UNAUTHORIZED,
          "User is not authenticated"
        );
      }

      const hasPermission = allowedRoles.includes(req.user.role);

      if (!hasPermission) {

        throw new ApiError(
          HTTP_STATUS.FORBIDDEN,
          "You do not have permission to access this resource"
        );
      }

      next();

    } catch (error) {
      next(error);
    }
  };
};

export default authorize;