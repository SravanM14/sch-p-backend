import { HTTP_STATUS } from "../constants/httpStatus";
import ApiError from "./ApiError";

export const validateRequiredFields = (data: Record<string, unknown>, requiredFields: string[]): void => {
    const missingFields = requiredFields.filter(field => data[field] === undefined || data[field] === null || data[field] === '');
    if (missingFields.length > 0) {
        throw new ApiError(
            HTTP_STATUS.BAD_REQUEST,
            `Missing required fields: ${missingFields.join(', ')}`
        );
    }
}


export const validateAtLeastOneField = (
    data: Record<string, unknown>,
    fields: string[]
): void => {
    const hasField = fields.some(
        (field) =>
            data[field] !== undefined &&
            data[field] !== null
    );

    if (!hasField) {
        throw new ApiError(
            HTTP_STATUS.BAD_REQUEST,
            `At least one of these fields is required: ${fields.join(", ")}`
        );
    }
};