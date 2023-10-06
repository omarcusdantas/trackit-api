import jwt from "jsonwebtoken";

export default async function validateAuth(req, res, next) {
    const { authorization } = req.headers;
    const token = authorization?.replace("Bearer ", "");

    if (!token) {
        throw { type: "unauthorized", message: "No token provided" };
    }

    try {
        const data = jwt.verify(token, process.env.JWT_SECRET);
        res.locals.user = {
            userId: data.userId,
            utcOffset: data.utcOffset,
        };
        next();
    } catch (error) {
        throw { type: "unauthorized", message: "Invalid token" };
    }
}
