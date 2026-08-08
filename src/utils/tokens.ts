import jwt from "jsonwebtoken";


interface AccessTokenPayload {
    id: string;
    role: string;
}

export const generateAccessToken = (id: string, role: string): string => {

    return jwt.sign({
        id, role
    },
        process.env.JWT_SECRET as string,
        { expiresIn: '15m' }
    )

}


export const generateRefreshToken = (id: string): string => {
    return jwt.sign({ id }, process.env.REFRESH_TOKEN_SECRET as string, { expiresIn: '7d' })
}